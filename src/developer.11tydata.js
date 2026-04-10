const {
  buildLocalizedSite,
  getPermalink,
  loadRawSite,
} = require("./_data/site-utils");

const rawSite = loadRawSite();

module.exports = {
  pagination: {
    data: "site.locales",
    size: 1,
    alias: "localeEntry",
  },
  eleventyComputed: {
    locale: (data) => data.localeEntry.code,
    pageKey: () => "developer",
    siteView: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "developer"),
    pageContent: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "developer").pages.developer,
    ui: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "developer").ui,
    title: (data) => data.pageContent.title,
    description: (data) => data.pageContent.description,
    keywords: (data) => data.pageContent.keywords,
    h1: (data) => data.pageContent.h1,
    printSubtitle: (data) => data.pageContent.printSubtitle,
    activeRole: (data) => data.pageContent.activeRole,
    tagline: (data) => data.pageContent.tagline,
    lang: (data) => data.siteView.htmlLang,
    permalink: (data) => getPermalink("developer", data.localeEntry.code),
  },
};
