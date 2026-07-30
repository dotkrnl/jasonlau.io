const test = require("node:test");
const assert = require("node:assert/strict");
const {
  buildCvData,
  buildLocalizedSite,
  buildSitemapEntries,
  getPageUrl,
  getPermalink,
  loadRawSite,
  localizeValue,
} = require("../src/_data/site-utils");

const rawSite = loadRawSite();

test("localizeValue falls back to English for untranslated CN content", () => {
  assert.equal(localizeValue({ en: "Researcher", cn: "Researcher" }, "cn"), "Researcher");
  assert.equal(localizeValue("Scalar text", "cn"), "Scalar text");
});

test("locale URLs preserve shared page templates", () => {
  assert.equal(getPageUrl("researcher", "en"), "/");
  assert.equal(getPageUrl("researcher", "cn"), "/cn/");
  assert.equal(getPageUrl("developer", "en"), "/developer");
  assert.equal(getPageUrl("developer", "cn"), "/cn/developer");
  assert.equal(getPermalink("designer", "cn"), "cn/designer.html");
});

test("buildLocalizedSite rewrites role and CV links for CN pages", () => {
  const site = buildLocalizedSite(rawSite, "cn", "developer");
  const cvLink = site.navLinks.find((link) => link.cv);

  assert.equal(site.currentUrl, "/cn/developer");
  assert.equal(site.roles[0].url, "/cn/");
  assert.equal(cvLink.url, "/jason-lau-cv-cn.pdf");
  assert.equal(site.locales.find((locale) => locale.code === "en").url, "/developer");
});

test("buildSitemapEntries exposes every canonical localized page with alternates", () => {
  const entries = buildSitemapEntries(rawSite);
  const urls = entries.map((entry) => entry.url);

  assert.deepEqual(urls, [
    "https://jasonlau.io/",
    "https://jasonlau.io/cn/",
    "https://jasonlau.io/developer",
    "https://jasonlau.io/cn/developer",
    "https://jasonlau.io/designer",
    "https://jasonlau.io/cn/designer",
  ]);
  assert.equal(entries[0].priority, "1.0");
  assert.equal(entries[2].priority, "0.8");
  assert.deepEqual(entries[3].alternates, [
    { htmlLang: "en", url: "https://jasonlau.io/developer" },
    { htmlLang: "zh-Hans", url: "https://jasonlau.io/cn/developer" },
  ]);
});

test("buildCvData reuses localized site data", () => {
  const cv = buildCvData(rawSite, "cn");

  assert.equal(cv.meta.documentTitle, "Jason Lau - 中文简历");
  assert.equal(cv.education[0].degree, "计算机科学博士");
  assert.equal(cv.labels.reviewedPapers, `评审过 ${rawSite.reviews.count} 篇论文`);
  assert.equal(cv.publications[0].title, "面向高层次物理综合的自动化设计空间探索");
});

test("buildCvData strips website HTML markup from publication text for CV output", () => {
  const cv = buildCvData(rawSite, "en");
  const publicationWithMarkup = cv.publications.find((publication) =>
    publication.authors.includes("Jason Lau"),
  );

  assert.ok(publicationWithMarkup);
  assert.doesNotMatch(publicationWithMarkup.authors, /<[^>]+>/);
  assert.doesNotMatch(publicationWithMarkup.venue, /<[^>]+>/);
});

test("buildCvData localizes award organizations for English CV output", () => {
  const cv = buildCvData(rawSite, "en");

  assert.equal(cv.awards[0].org, "International Symposium on Field-Programmable Gate Arrays (2021)");
  assert.equal(cv.awards[1].org, "Xilinx, Inc. (2021)");
});

test("every TPC service conference appears in the reviewed-for list", () => {
  const reviewedFor = rawSite.reviews.journals.map((entry) => entry.en).join("\n");
  const tpcAcronyms = rawSite.services
    .filter((service) => service.role.en === "Technical Program Committee Member")
    .map((service) => service.event.cn.match(/（([A-Z]+)(?:\s*'\d+)?）/)?.[1]);

  assert.ok(tpcAcronyms.every(Boolean), "every TPC service must expose its conference acronym");
  for (const acronym of new Set(tpcAcronyms)) {
    assert.match(reviewedFor, new RegExp(`\\(${acronym}\\)`));
  }
});
