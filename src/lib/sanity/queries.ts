import { groq } from 'next-sanity';

// All published blog posts for blog index
export const postsQuery = groq`
  *[_type == "post" && defined(slug.current)] | order(publishedAt desc) {
    _id,
    title,
    slug,
    excerpt,
    mainImage,
    publishedAt,
    estimatedReadingTime,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, image, role }
  }
`;

// Single blog post by slug
export const postBySlugQuery = groq`
  *[_type == "post" && slug.current == $slug][0] {
    _id,
    title,
    slug,
    excerpt,
    body,
    mainImage,
    publishedAt,
    estimatedReadingTime,
    "categories": categories[]->{ _id, title, slug },
    "author": author->{ name, image, role, bio }
  }
`;

// All post slugs for generateStaticParams
export const postSlugsQuery = groq`
  *[_type == "post" && defined(slug.current)][].slug.current
`;

// FAQs for pricing and homepage
export const faqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    category
  }
`;

// Testimonials for trust section
export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(order asc) {
    _id,
    clientName,
    company,
    role,
    quote,
    avatar,
    metric
  }
`;
