#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const SCHOLAR_URL =
  "https://scholar.google.com/citations?user=8mKFNtUAAAAJ&hl=en";
const SITE_YAML = path.resolve(__dirname, "../src/_data/site.yaml");

console.log("Fetching citation count from Google Scholar...");

let html;
try {
  html = execSync(
    `curl -sL -A "Mozilla/5.0 (compatible)" "${SCHOLAR_URL}"`,
    { timeout: 15000, encoding: "utf-8" },
  );
} catch (err) {
  console.error("Failed to fetch Google Scholar:", err.message);
  process.exit(1);
}

// The citation stats table uses class "gsc_rsb_std".
// The first occurrence is the all-time total citation count.
const match = html.match(/gsc_rsb_std[^>]*>(\d+)/);
if (!match) {
  console.error("Could not parse citation count from page.");
  process.exit(1);
}

const count = match[1];
console.log(`Total citations: ${count}`);

// Update site.yaml
const yaml = fs.readFileSync(SITE_YAML, "utf-8");
const updated = yaml.replace(
  /^publicationsCitations:.*$/m,
  `publicationsCitations: "${count}"`,
);

const today = new Date().toISOString().slice(0, 10);
const updated2 = updated.replace(/^lastmod:.*$/m, `lastmod: "${today}"`);

if (updated2 === yaml) {
  console.log("site.yaml already up to date.");
} else {
  fs.writeFileSync(SITE_YAML, updated2);
  if (updated !== yaml)
    console.log(`Updated publicationsCitations to "${count}" in site.yaml`);
  if (updated2 !== updated)
    console.log(`Updated lastmod to "${today}" in site.yaml`);
}
