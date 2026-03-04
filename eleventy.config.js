const { execSync } = require("child_process");
const yaml = require("js-yaml");

module.exports = function (eleventyConfig) {
  eleventyConfig.addDataExtension("yaml,yml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/*.ico");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/profile-picture.png");
  eleventyConfig.addPassthroughCopy("src/design-works");
  eleventyConfig.addPassthroughCopy("src/research-papers");
  eleventyConfig.addPassthroughCopy("src/robots.txt");

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
