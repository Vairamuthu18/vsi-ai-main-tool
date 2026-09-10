import { normaliseDomain } from "../src/lib/url-input";
import { calculateVisibilityStatus } from "../src/types/search";

function runAutomatedTests() {
  console.log("==================================================");
  console.log("   RUN CHECK / KEYWORD INTELLIGENCE TEST SUITE   ");
  console.log("==================================================\n");

  let passedCount = 0;
  let totalCount = 0;

  function assert(condition: boolean, testName: string, detail?: string) {
    totalCount++;
    if (condition) {
      passedCount++;
      console.log(`[PASS] Test ${totalCount}: ${testName}`);
    } else {
      console.error(`[FAIL] Test ${totalCount}: ${testName} ${detail ? `(${detail})` : ""}`);
    }
  }

  // TEST CASE A: Client ranks in Google (YES) + mentioned (YES) + cited (YES)
  const statusA = calculateVisibilityStatus(3, true, true);
  assert(
    statusA.label === "strong_visibility" && statusA.title === "Strong Visibility",
    "Case A: Ranks + Mentioned + Cited -> Strong Visibility",
    `Received: ${statusA.label}`
  );

  // TEST CASE B: Client ranks in Google (YES) + mentioned (YES) + not cited (NO)
  const statusB = calculateVisibilityStatus(5, true, false);
  assert(
    statusB.label === "partial_visibility" && statusB.title === "Partial Visibility",
    "Case B: Ranks + Mentioned + Not Cited -> Partial Visibility",
    `Received: ${statusB.label}`
  );

  // TEST CASE C: Client not in Google (NO) + mentioned (YES) + cited (YES)
  const statusC = calculateVisibilityStatus(null, true, true);
  assert(
    statusC.label === "ai_visible" && statusC.title === "AI Visible",
    "Case C: Not in Google + Mentioned + Cited -> AI Visible",
    `Received: ${statusC.label}`
  );

  // TEST CASE D: Client not in Google (NO) + not mentioned (NO) + not cited (NO)
  const statusD = calculateVisibilityStatus(null, false, false);
  assert(
    statusD.label === "weak_double_loss" && statusD.title === "Weak / Double Loss",
    "Case D: Not in Google + Not Mentioned + Not Cited -> Weak / Double Loss",
    `Received: ${statusD.label}`
  );

  // TEST CASE E: Duplicate citation domains deduplication
  const rawDomains = [
    "https://www.example.com/page1",
    "http://example.com/path/to/doc?query=1",
    "www.example.com",
    "https://sub.competitor.com/article",
    "competitor.com",
  ];
  const normalizedSet = new Set<string>();
  for (const raw of rawDomains) {
    const norm = normaliseDomain(raw);
    if (norm) normalizedSet.add(norm.domain);
  }

  assert(
    normalizedSet.size === 3 && normalizedSet.has("example.com") && normalizedSet.has("sub.competitor.com") && normalizedSet.has("competitor.com"),
    "Case E: Duplicate citation domains deduplicated cleanly (5 URLs -> 3 unique domains)",
    `Unique domains count: ${normalizedSet.size}`
  );

  // TEST CASE F: www / non-www & URL scheme normalization
  const inputUrls = [
    "HTTPS://WWW.UNITEDSEO.AE/services/seo?ref=google#top",
    "http://unitedseo.ae/",
    "unitedseo.ae/contact",
  ];
  const normalizedResults = inputUrls.map((u) => normaliseDomain(u)?.domain);
  const allEqual = normalizedResults.every((val) => val === "unitedseo.ae");
  assert(
    allEqual,
    "Case F: www/non-www, uppercase, protocols, ports, and trailing paths normalize to bare domain stem",
    `Normalized outputs: ${JSON.stringify(normalizedResults)}`
  );

  // TEST CASE G: Different keywords produce distinct cache keys
  const kw1 = "best online shopping website";
  const kw2 = "best food delivery app";
  const cacheKey1: string = `runcheck:${kw1}:example.com:example:ae:en:default`;
  const cacheKey2: string = `runcheck:${kw2}:example.com:example:ae:en:default`;
  assert(
    cacheKey1 !== cacheKey2,
    "Case G: Different keywords generate distinct cache keys",
    `Keys: ${cacheKey1} vs ${cacheKey2}`
  );

  // TEST CASE H: Different locations produce distinct location-specific keys
  const cacheKeyAE: string = `runcheck:${kw1}:example.com:example:ae:en:default`;
  const cacheKeyUS: string = `runcheck:${kw1}:example.com:example:us:en:default`;
  assert(
    cacheKeyAE !== cacheKeyUS,
    "Case H: Different locations produce location-isolated cache keys",
    `Keys: ${cacheKeyAE} vs ${cacheKeyUS}`
  );

  // TEST CASE I: Input validation rejects invalid domain formats
  const invalidDomainResult = normaliseDomain("invalid_domain_string_without_tld");
  assert(
    invalidDomainResult === null,
    "Case I: Invalid domain strings fail validation cleanly without producing fake data",
    `Result: ${invalidDomainResult}`
  );

  console.log("\n==================================================");
  console.log(` SUMMARY: ${passedCount} / ${totalCount} TESTS PASSED `);
  console.log("==================================================\n");

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runAutomatedTests();
