/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: "https://agentthreatrule.org",
  generateRobotsTxt: true,
  outDir: "./out",
  generateIndexSitemap: false,
  exclude: ["/icon.svg", "/favicon.ico"],
  robotsTxtOptions: {
    policies: [
      { userAgent: "*", allow: "/" },
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
    ],
  },
  transform: async (_config, path) => {
    const priorities = {
      "/en": 1.0,
      "/zh": 1.0,
      "/en/rules": 0.9,
      "/zh/rules": 0.9,
      "/en/integrate": 0.9,
      "/zh/integrate": 0.9,
      "/en/ecosystem": 0.8,
      "/zh/ecosystem": 0.8,
      "/en/coverage": 0.8,
      "/zh/coverage": 0.8,
      "/en/research": 0.8,
      "/zh/research": 0.8,
      "/en/wall": 0.7,
      "/zh/wall": 0.7,
      "/en/contribute": 0.7,
      "/zh/contribute": 0.7,
    };

    return {
      loc: path,
      changefreq: path.includes("rules") ? "weekly" : "monthly",
      priority: priorities[path] ?? 0.5,
      lastmod: new Date().toISOString(),
    };
  },
};
