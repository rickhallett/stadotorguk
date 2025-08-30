import { defineCollection, z } from 'astro:content';

// Define the schema for news articles
const newsCollection = defineCollection({
  schema: z.object({
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    title: z.string(),
    published: z.boolean().default(true),
  }),
});

// Export collections
export const collections = {
  'news': newsCollection,
};