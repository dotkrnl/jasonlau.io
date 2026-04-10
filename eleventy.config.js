const { execSync } = require("child_process");
const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));

  // Static assets (src/ relative paths)
  for (const pattern of [
    "src/*.png",
    "src/*.ico",
    "src/site.webmanifest",
    "src/robots.txt",
    "src/design-works",
    "src/research-papers",
  ]) {
    eleventyConfig.addPassthroughCopy(pattern);
  }

  // CV PDF lives in cv/, copy to site root
  eleventyConfig.addPassthroughCopy({ "cv/jason-lau-cv.pdf": "jason-lau-cv.pdf" });
  eleventyConfig.addPassthroughCopy({ "cv/jason-lau-cv-cn.pdf": "jason-lau-cv-cn.pdf" });

  // Build Tailwind CSS after Eleventy generates HTML (so it scans final output)
  eleventyConfig.on("eleventy.after", () => {
    execSync(
      "npx @tailwindcss/cli -i src/styles.css -o _site/styles.css --minify",
      { stdio: "inherit" }
    );
  });

  // Minify HTML output
  eleventyConfig.addTransform("htmlmin", async function (content) {
    if ((this.page.outputPath || "").endsWith(".html")) {
      const { minify } = await import("html-minifier-terser");
      return minify(content, {
        collapseWhitespace: true,
        conservativeCollapse: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true,
      });
    }
    return content;
  });

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
