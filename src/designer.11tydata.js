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
    pageKey: () => "designer",
    siteView: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "designer"),
    pageContent: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "designer").pages.designer,
    ui: (data) => buildLocalizedSite(rawSite, data.localeEntry.code, "designer").ui,
    title: (data) => data.pageContent.title,
    description: (data) => data.pageContent.description,
    keywords: (data) => data.pageContent.keywords,
    h1: (data) => data.pageContent.h1,
    printSubtitle: (data) => data.pageContent.printSubtitle,
    activeRole: (data) => data.pageContent.activeRole,
    tagline: (data) => data.pageContent.tagline,
    introMaxWidthClass: (data) => data.pageContent.introMaxWidthClass,
    lang: (data) => data.siteView.htmlLang,
    permalink: (data) => getPermalink("designer", data.localeEntry.code),
  },
};
