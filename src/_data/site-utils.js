const fs = require("node:fs");
const path = require("node:path");
const yaml = require("js-yaml");

const LOCALE_KEYS = new Set(["en", "cn"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isLocalizedObject(value) {
  if (!isPlainObject(value)) return false;
  const keys = Object.keys(value);
  return keys.length > 0 && keys.every((key) => LOCALE_KEYS.has(key));
}

function localizeValue(value, locale) {
  if (Array.isArray(value)) {
    return value.map((item) => localizeValue(item, locale));
  }

  if (isLocalizedObject(value)) {
    return value[locale] ?? value.en ?? value.cn;
  }

  if (isPlainObject(value)) {
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localizeValue(item, locale)]),
    );
  }

  return value;
}

function getPageRoute(pageKey) {
  if (pageKey === "researcher") return "";
  if (pageKey === "developer") return "developer.html";
  if (pageKey === "designer") return "designer.html";
  throw new Error(`Unknown page key: ${pageKey}`);
}

function getPageUrl(pageKey, locale) {
  const route = getPageRoute(pageKey);
  if (locale === "en") return route ? `/${route}` : "/";
  return route ? `/cn/${route}` : "/cn/";
}

function getPermalink(pageKey, locale) {
  const route = getPageRoute(pageKey);
  if (locale === "en") return route || "index.html";
  return route ? `cn/${route}` : "cn/index.html";
}

function replaceCount(template, count) {
  return template.replace("{{count}}", String(count));
}

function toRootRelative(pathname) {
  if (typeof pathname !== "string" || pathname.startsWith("/")) return pathname;
  return `/${pathname}`;
}

function stripHtmlForCv(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<[^>]+>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadRawSite() {
  return yaml.load(fs.readFileSync(path.join(__dirname, "site.yaml"), "utf-8"));
}

function buildLocalizedSite(rawSite, locale, pageKey) {
  const site = localizeValue(rawSite, locale);
  const currentLocale = site.locales.find((entry) => entry.code === locale);

  return {
    ...site,
    locale,
    htmlLang: currentLocale.htmlLang,
    currentPageKey: pageKey,
    currentUrl: getPageUrl(pageKey, locale),
    roles: site.roles.map((role) => ({
      ...role,
      url: getPageUrl(role.key, locale),
      isActive: role.key === pageKey,
    })),
    navLinks: site.navLinks.map((link) => ({
      ...link,
      url: link.cv ? rawSite.cv.files[locale] : link.url,
    })),
    publications: site.publications.map((publication, index) => {
      const rawPub = rawSite.publications[index];
      const result = {
        ...publication,
        pdf: toRootRelative(publication.pdf),
        titleStartEn: localizeValue(rawPub.titleStart, "en"),
        titleEndEn: localizeValue(rawPub.titleEnd, "en"),
      };
      if (rawPub.translationPdf) {
        result.translationPdf = toRootRelative(rawPub.translationPdf);
        result.titleStartCn = localizeValue(rawPub.titleStart, "cn");
        result.titleEndCn = localizeValue(rawPub.titleEnd, "cn");
      }
      return result;
    }),
    locales: site.locales.map((entry) => ({
      ...entry,
      url: getPageUrl(pageKey, entry.code),
      isCurrent: entry.code === locale,
    })),
  };
}

function applyDeveloperOverrides(entry) {
  const developer = isPlainObject(entry.developer) ? entry.developer : {};
  return { ...entry, ...developer };
}

function buildCvData(rawSite, locale, options = {}) {
  const site = buildLocalizedSite(rawSite, locale, "researcher");
  const publicationTitleSeparator = site.ui.publicationTitleSeparator ?? " ";
  const omitProjectsSkills = options.omitProjectsSkills === true;
  const reviewedPapers = replaceCount(site.ui.reviewedPapers, site.reviews.count);
  const reviewsLeadIn =
    locale === "cn"
      ? `${reviewedPapers}（${site.ui.excludingSubreviews}）：`
      : `${reviewedPapers} (${site.ui.excludingSubreviews}) for:`;

  return {
    locale,
    meta: site.cv.meta,
    labels: {
      reviewedPapers,
      excludingSubreviews: site.ui.excludingSubreviews,
      serviceConnector: site.ui.serviceConnector,
      reviewsLeadIn,
    },
    name: site.name,
    phone: site.phone,
    email: site.email,
    github: site.github,
    education: site.education
      .filter((entry) => entry.cv)
      .map((entry) => {
        const merged = applyDeveloperOverrides(entry);
        return {
          degree: merged.degree,
          school: merged.school,
          time: merged.time,
          details: merged.details || [],
        };
      }),
    experience: site.experience
      .filter((entry) => entry.cv)
      .map((entry) => {
        const merged = applyDeveloperOverrides(entry);
        return {
          title: merged.title,
          org: merged.org,
          time: merged.time,
          desc: merged.desc,
          location: merged.location || "",
        };
      }),
    publications: site.publications.map((publication, index) => {
      const rawPub = rawSite.publications[index];
      const result = {
        title: `${publication.titleStart}${publicationTitleSeparator}${publication.titleEnd}`.trim(),
        authors: stripHtmlForCv(publication.authors),
        venue: stripHtmlForCv(publication.venue),
        year: publication.year || publication.cvYear || "",
        badges: publication.badges || [],
      };
      if (locale === "cn") {
        result.titleEn = `${localizeValue(rawPub.titleStart, "en")} ${localizeValue(rawPub.titleEnd, "en")}`.trim();
      }
      if (rawPub.translationPdf) {
        result.titleCn = `${localizeValue(rawPub.titleStart, "cn")}${publicationTitleSeparator}${localizeValue(rawPub.titleEnd, "cn")}`.trim();
        result.hasTranslation = true;
      }
      return result;
    }),
    projects: omitProjectsSkills ? [] : site.projects,
    skills: omitProjectsSkills ? [] : site.skills,
    awards: site.awards,
    services: site.services,
    reviews: site.reviews,
  };
}

module.exports = {
  buildCvData,
  buildLocalizedSite,
  getPageUrl,
  getPermalink,
  loadRawSite,
  localizeValue,
};
