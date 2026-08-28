import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { isAuthorizedEmail } from "@/lib/auth-config";

// Routes that do not require authentication
const PUBLIC_PATHS = [
  "/",
  "/login",
  "/privacy",
  "/r",
  "/qa",
  "/api/qa",
  "/api/cron",
  "/api/auth",
  "/auth/callback",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  let supabaseResponse = NextResponse.next({
    request,
  });

  // Legacy auth links redirect to /login
  if (pathname === "/auth/login" || pathname === "/auth/register") {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://dummy.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_key_for_local_development";

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Get user from Supabase Auth
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let cookieEmail = request.cookies.get("vsi_user_email")?.value
    ? decodeURIComponent(request.cookies.get("vsi_user_email")!.value)
    : null;

  if (cookieEmail) {
    cookieEmail = cookieEmail.trim();
    if (cookieEmail.startsWith('"') && cookieEmail.endsWith('"')) {
      cookieEmail = cookieEmail.slice(1, -1);
    }
    if (cookieEmail.startsWith("'") && cookieEmail.endsWith("'")) {
      cookieEmail = cookieEmail.slice(1, -1);
    }
    cookieEmail = cookieEmail.trim();
  }

  const resolvedEmail = user?.email || cookieEmail;
  const hasAuthToken = !!user || request.cookies.has("vsi_session") || request.cookies.has("sb-access-token");
  const isAuthorized = hasAuthToken && isAuthorizedEmail(resolvedEmail);

  // If user is logged in with ANY other email (unauthorized user), sign out & redirect to login
  if (hasAuthToken && resolvedEmail && !isAuthorizedEmail(resolvedEmail)) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    const redirectUrl = new URL("/login", request.url);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    const expired = "path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    redirectResponse.headers.append("Set-Cookie", `vsi_session=; ${expired}`);
    redirectResponse.headers.append("Set-Cookie", `vsi_user_email=; ${expired}`);
    redirectResponse.headers.append("Set-Cookie", `vsi_user_name=; ${expired}`);
    return redirectResponse;
  }

  // Check if current route is public
  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || (p !== "/" && pathname.startsWith(p + "/"))
  );

  // Protect all non-public routes (e.g. /dashboard, /clients, /tasks, /prompts, /settings, /feedback, etc.)
  if (!isPublicPath && !isAuthorized) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
