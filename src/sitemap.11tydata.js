const {
  buildSitemapEntries,
  loadRawSite,
} = require("./_data/site-utils");

const rawSite = loadRawSite();

module.exports = {
  sitemapEntries: buildSitemapEntries(rawSite),
};
