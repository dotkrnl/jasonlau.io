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
    pageKey: () => "researcher",
    siteView: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "researcher"),
    pageContent: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "researcher").pages.researcher,
    ui: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "researcher").ui,
    title: (data) => data.pageContent.title,
    description: (data) => data.pageContent.description,
    keywords: (data) => data.pageContent.keywords,
    h1: (data) => data.pageContent.h1,
    printSubtitle: (data) => data.pageContent.printSubtitle,
    activeRole: (data) => data.pageContent.activeRole,
    tagline: (data) => data.pageContent.tagline,
    email: (data) => data.pageContent.email,
    lang: (data) => data.siteView.htmlLang,
    permalink: (data) => getPermalink("researcher", data.localeEntry.code),
  },
};
