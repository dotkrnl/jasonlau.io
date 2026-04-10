#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");
const { buildCvData } = require("../src/_data/site-utils");

const ROOT = path.resolve(__dirname, "..");
const CV_DIR = path.join(ROOT, "cv");
const DATA_OUT = path.join(CV_DIR, "data.json");
const PDF_OUT = {
  en: path.join(CV_DIR, "jason-lau-cv.pdf"),
  cn: path.join(CV_DIR, "jason-lau-cv-cn.pdf"),
};

const args = process.argv.slice(2);
const options = {
  locale: null,
  omitProjectsSkills: false,
  output: null,
};

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index];

  if (arg === "--locale") {
    options.locale = args[index + 1] || null;
    index += 1;
    continue;
  }

  if (arg === "--output") {
    options.output = args[index + 1] || null;
    index += 1;
    continue;
  }

  if (arg === "--omit-projects-skills") {
    options.omitProjectsSkills = true;
  }
}

if (options.locale && !["en", "cn"].includes(options.locale)) {
  console.error(`Unsupported locale: ${options.locale}`);
  process.exit(1);
}

// Read site data (single source of truth)
let site;
try {
  site = yaml.load(
    fs.readFileSync(path.join(ROOT, "src/_data/site.yaml"), "utf-8"),
  );
} catch (err) {
  console.error("Failed to parse site.yaml:", err.message);
  process.exit(1);
}

fs.mkdirSync(CV_DIR, { recursive: true });

// Check for typst
try {
  execSync("which typst", { stdio: "ignore" });
} catch {
  console.error("Error: typst not found. Install with: brew install typst");
  process.exit(1);
}

// Compile PDF
const templatePath = path.join(CV_DIR, "template.typ");
const locales = options.locale ? [options.locale] : ["en", "cn"];

for (const locale of locales) {
  const data = buildCvData(site, locale, {
    omitProjectsSkills: options.omitProjectsSkills,
  });
  const outputPath =
    locales.length === 1 && options.output ? path.resolve(ROOT, options.output) : PDF_OUT[locale];

  fs.writeFileSync(DATA_OUT, JSON.stringify(data, null, 2));
  console.log(`Wrote ${DATA_OUT} for ${locale.toUpperCase()}`);
  console.log(`Compiling ${locale.toUpperCase()} CV...`);
  execSync(`typst compile "${templatePath}" "${outputPath}"`, { stdio: "inherit" });
  console.log(`Generated ${outputPath}`);
}
