export const profiles = {
  main: {
    id: 'main',
    site: {
      title: 'AIMCC Blog',
      description: 'AI / Engineering / Collaboration',
      url: 'https://aimcc.example.com',
      lang: 'zh-CN',
    },
    theme: 'minimal',
    layouts: {
      default: 'wide',
      post: 'sidebar',
    },
    templates: {
      home: 'blog',
      post: 'reading',
      archive: 'timeline',
    },
    features: {
      toc: true,
      search: true,
      profileCard: false,
    },
    content: {
      owners: ['main', 'shared'],
    },
  },
};

export const profileNames = Object.keys(profiles);
