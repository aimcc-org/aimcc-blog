export const profiles = {
  main: {
    id: 'main',
    site: {
      title: 'AIMCC Blog',
      description: 'AI / Engineering / Collaboration',
      url: 'https://aimcc.example.com',
      lang: 'zh-CN',
    },
    features: {
      toc: true,
      search: true,
    },
    content: {
      owners: ['main', 'shared'],
    },
  },
};

export const profileNames = Object.keys(profiles);
