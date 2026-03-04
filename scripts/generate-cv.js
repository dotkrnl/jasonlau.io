#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const yaml = require("js-yaml");

const ROOT = path.resolve(__dirname, "..");
const CV_DIR = path.join(ROOT, "cv");
const DATA_OUT = path.join(CV_DIR, "data.json");
const PDF_OUT = path.join(CV_DIR, "jason-lau-cv.pdf");

// Strip HTML tags from a string
function stripHtml(str) {
  return str.replace(/<[^>]*>/g, "");
}

// Strip HTML recursively from strings in an object/array
function stripHtmlDeep(obj) {
  if (typeof obj === "string") return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(stripHtmlDeep);
  if (obj && typeof obj === "object") {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[k] = stripHtmlDeep(v);
    return out;
  }
  return obj;
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

// Apply developer overrides for CV entries
function applyOverrides(entry) {
  const dev = typeof entry.developer === "object" ? entry.developer : {};
  return { ...entry, ...dev };
}

// Combine all data, stripping HTML
const data = stripHtmlDeep({
  name: site.name,
  phone: site.phone,
  email: site.email,
  github: site.github,
  education: site.education
    .filter((e) => e.cv)
    .map((e) => {
      const merged = applyOverrides(e);
      return {
        degree: merged.degree,
        school: merged.school,
        time: merged.time,
        details: merged.details || [],
      };
    }),
  experience: site.experience
    .filter((e) => e.cv)
    .map((e) => {
      const merged = applyOverrides(e);
      return {
        title: merged.title,
        org: merged.org,
        time: merged.time,
        desc: merged.desc,
        location: merged.location || "",
      };
    }),
  publications: site.publications.map((p) => ({
    title: `${p.titleStart} ${p.titleEnd}`,
    authors: p.authors,
    venue: p.venue,
    year: p.year || p.cvYear || "",
    badges: p.badges || [],
  })),
  projects: site.projects,
  skills: site.skills,
  awards: site.awards,
  services: site.services,
  reviews: site.reviews,
});

fs.mkdirSync(CV_DIR, { recursive: true });
fs.writeFileSync(DATA_OUT, JSON.stringify(data, null, 2));
console.log(`Wrote ${DATA_OUT}`);

// Check for typst
try {
  execSync("which typst", { stdio: "ignore" });
} catch {
  console.error("Error: typst not found. Install with: brew install typst");
  process.exit(1);
}

// Compile PDF
const templatePath = path.join(CV_DIR, "template.typ");
console.log("Compiling PDF...");
execSync(`typst compile "${templatePath}" "${PDF_OUT}"`, { stdio: "inherit" });
console.log(`Generated ${PDF_OUT}`);
