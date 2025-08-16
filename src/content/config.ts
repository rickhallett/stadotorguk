import { defineCollection, z } from 'astro:content';

// Define the schema for news articles
const newsCollection = defineCollection({
  schema: z.object({
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    title: z.string(),
  }),
});

// Define the schema for community feed items
const feedCollection = defineCollection({
  schema: z.object({
    username: z.string(),
    location: z.string(),
    timestamp: z.string().or(z.date()).transform((val) => new Date(val)),
    comment: z.string(),
    published: z.boolean().default(true),
  }),
});

// Export collections
export const collections = {
  'news': newsCollection,
  'feed': feedCollection,
};