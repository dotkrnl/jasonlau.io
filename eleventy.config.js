module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src/*.png");
  eleventyConfig.addPassthroughCopy("src/*.ico");
  eleventyConfig.addPassthroughCopy("src/site.webmanifest");
  eleventyConfig.addPassthroughCopy("src/profile-picture.png");
  eleventyConfig.addPassthroughCopy("src/design-works");
  eleventyConfig.addPassthroughCopy("src/research-papers");

  return {
    dir: {
      input: "src",
      output: "_site",
    },
  };
};
