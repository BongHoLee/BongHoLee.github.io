// Place any global data in this file.
// You can import this data from anywhere in your site by using the `import` keyword.

export const SITE_TITLE = "Bong5's Tech Blog";
export const SITE_DESCRIPTION = '개발과 기술에 대한 생각을 기록하는 공간입니다';

// Giscus (GitHub Discussions-based comments) configuration.
// 1) Enable Discussions on your repo and install the giscus app.
// 2) Visit https://giscus.app to generate the values below and paste them here.
//    - repo: "owner/repo" (e.g., "BongHoLee/BongHoLee.github.io")
//    - repoId: GraphQL node ID for the repo
//    - category: Discussion category name for comments (e.g., "General" or "Comments")
//    - categoryId: GraphQL node ID for the chosen category
// If any required field is empty, the comments widget will not render.
export const GISCUS = {
  repo: "bongholee/BongHoLee.github.io", // using this repo for comments
  repoId: "MDEwOlJlcG9zaXRvcnkyMTMxMDQ2NDg=",
  category: "",
  categoryId: "DIC_kwDODLO4CM4CvDM4",
  mapping: "pathname" as const, // Map blog posts to discussions by page pathname
  strict: "0" as const,
  reactionsEnabled: "1" as const,
  emitMetadata: "0" as const,
  inputPosition: "bottom" as const,
  // Theme options: "light", "dark", "preferred_color_scheme", etc.
  theme: "preferred_color_scheme" as const,
  lang: "ko" as const,
};
