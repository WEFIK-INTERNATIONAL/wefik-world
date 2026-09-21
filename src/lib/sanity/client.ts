import { createClient } from 'next-sanity';
import imageUrlBuilder from '@sanity/image-url';

export const projectId =
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'placeholder-sanity-id';
export const dataset =
  process.env.NEXT_PUBLIC_SANITY_DATASET || 'production';
export const apiVersion = '2024-01-01';

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: process.env.NODE_ENV === 'production',
  perspective: 'published',
});

// Admin client for server-side mutations or preview draft mode
export const previewClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
  perspective: 'previewDrafts',
});

const builder = imageUrlBuilder(client);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function urlFor(source: any) {
  return builder.image(source);
}
