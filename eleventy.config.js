export default function (eleventyConfig) {
  // Pass through CSS
  eleventyConfig.addPassthroughCopy("src/css");

  // Pass through Decap CMS admin (public/admin → _site/admin)
  eleventyConfig.addPassthroughCopy({ "public/admin": "admin" });

  // Date formatting filter
  eleventyConfig.addFilter("dateFormat", (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  });

  // Year filter
  eleventyConfig.addFilter("year", (date) => {
    return new Date(date).getFullYear();
  });

  // ISO date filter (for Atom feed)
  eleventyConfig.addFilter("isoDate", (date) => {
    return new Date(date).toISOString();
  });

  // Limit filter for arrays
  eleventyConfig.addFilter("limit", (arr, count) => {
    return arr.slice(0, count);
  });

  // Filter drafts in production
  eleventyConfig.addPreprocessor("drafts", "*", (data, content) => {
    if (data.draft && process.env.ELEVENTY_RUN_MODE === "build") {
      return false;
    }
  });

  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
