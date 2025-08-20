import { defineCollection, z } from 'astro:content';

// Define the schema for news articles
const newsCollection = defineCollection({
  schema: z.object({
    date: z.string().or(z.date()).transform((val) => new Date(val)),
    title: z.string(),
    published: z.boolean().default(true),
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

// Define the schema for campaign supporters/leads
const leadsCollection = defineCollection({
  schema: z.object({
    timestamp: z.string().or(z.date()).transform((val) => new Date(val)),
    user_id: z.string(),
    name: z.string(),
    first_name: z.string(),
    last_name: z.string(),
    email: z.string(),
    visitor_type: z.enum(['Local', 'Visitor', 'Tourist', 'Other']).default('Local'),
    comments: z.string().optional().default(''),
    referral_code: z.string().optional().default(''),
    source: z.string().default('survey_modal'),
    submission_id: z.string(),
    published: z.boolean().default(true),
  }),
});

// Export collections
export const collections = {
  'news': newsCollection,
  'feed': feedCollection,
  'leads': leadsCollection,
};