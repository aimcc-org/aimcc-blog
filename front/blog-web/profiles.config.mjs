export const profiles = {
  main: {
    id: "main",
    site: {
      title: "AIMCC",
      description: "AI、工程与协作的实验研究日志",
      url: "http://47.96.92.202",
      lang: "zh-CN",
    },
    features: {
      toc: true,
      search: true,
    },
    content: {
      owners: ["main", "shared"],
    },
  },
};

export const profileNames = Object.keys(profiles);
