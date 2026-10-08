import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const content = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './content' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      published: z.coerce.date(),
      updated: z.coerce.date().optional(),
      draft: z.boolean().default(false),
      description: z.string().default(''),
      image: image().optional(),
      tags: z.array(z.string()).default([]),
      category: z.string().default(''),
      lang: z.string().default('zh-CN'),
    }),
});

export const collections = { content };
