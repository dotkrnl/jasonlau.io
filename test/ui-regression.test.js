const assert = require("node:assert/strict");
const { readFileSync } = require("node:fs");
const test = require("node:test");

const read = (path) => readFileSync(path, "utf8");

test("PDF preview focus trap includes every visible preview control", () => {
  const index = read("src/index.njk");

  assert.match(index, /getPreviewFocusables/);
  assert.match(index, /switchBtn/);
  assert.match(index, /filter\(\(el\) => !el\.classList\.contains\('hidden'\)\)/);
});

test("publication titles expose a subtle PDF preview hint", () => {
  const index = read("src/index.njk");
  const site = read("src/_data/site.yaml");
  const styles = read("src/styles.css");

  assert.match(site, /previewPdf:/);
  assert.match(index, /paper-preview-hint/);
  assert.match(index, /paper-preview-label/);
  assert.match(styles, /\.paper-preview-icon/);
  assert.match(styles, /align-items:\s*center/);
  assert.match(styles, /\.paper-preview-icon\s*{[^}]*height:\s*0\.6875rem/s);
  assert.match(styles, /\.paper-preview-label\s*{[^}]*font-size:\s*0\.6875rem/s);
  assert.doesNotMatch(styles, /translateY/);
  assert.doesNotMatch(styles, /\.paper-title:hover \.paper-preview-icon/);
  assert.doesNotMatch(styles, /\.paper-title:focus-visible \.paper-preview-icon/);
  assert.match(styles, /\.paper-title:hover \.paper-preview-label/);
  assert.match(styles, /\.paper-title:focus-visible \.paper-preview-label/);
});

test("global interactive links get a custom keyboard focus treatment", () => {
  const styles = read("src/styles.css");

  assert.match(styles, /\.button-underline:focus-visible/);
  assert.match(styles, /outline-offset:\s*3px/);
});

test("role navigation uses radio-style markers without text decoration", () => {
  const base = read("src/_includes/base.njk");
  const styles = read("src/styles.css");

  assert.match(base, /role-nav/);
  assert.match(base, /role-token/);
  assert.match(base, /ui\.afterRolesPunctuation/);
  assert.match(base, /role-marker/);
  assert.match(base, /role-active/);
  assert.match(styles, /\.role-token\s*{[^}]*white-space:\s*nowrap/s);
  assert.match(base, /●/);
  assert.match(base, /○/);
  assert.match(styles, /\.role-marker\s*{[^}]*font-size:\s*0\.58em/s);
  assert.match(styles, /\.role-marker\s*{[^}]*display:\s*inline-block/s);
  assert.match(styles, /\.role-marker\s*{[^}]*margin-right:\s*0\.28em/s);
  assert.match(styles, /\.role-marker\s*{[^}]*vertical-align:\s*0\.1em/s);
  assert.doesNotMatch(styles, /\.role-active::before/);
  assert.doesNotMatch(styles, /background-color:\s*#edf0f2/);
  assert.doesNotMatch(styles, /border-bottom:\s*2px solid currentColor/);
  assert.doesNotMatch(styles, /border-radius:\s*50%/);
});

test("designer works use reusable caption and logo sizing classes", () => {
  const designer = read("src/designer.njk");
  const styles = read("src/styles.css");

  assert.match(designer, /work-caption/);
  assert.match(designer, /logo-work logo-work-small/);
  assert.match(styles, /\.logo-work/);
  assert.doesNotMatch(designer, /pl-32|pr-32|-mt-6/);
});
