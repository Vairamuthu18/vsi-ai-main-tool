"use client";

import React, { useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";

function ResearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const params = searchParams.toString();
    router.replace(`/dashboard${params ? `?${params}` : ""}`);
  }, [searchParams, router]);

  return (
    <div className="p-8 text-center text-sm font-semibold text-muted-foreground flex items-center justify-center min-h-[400px]">
      Redirecting to Overview...
    </div>
  );
}

export default function ResearchPage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center text-sm font-semibold text-muted-foreground flex items-center justify-center min-h-[400px]">
        Loading...
      </div>
    }>
      <ResearchContent />
    </Suspense>
  );
}
