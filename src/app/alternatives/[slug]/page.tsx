import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/data/products';
import { ALTERNATIVES_PAGES } from '@/lib/seo/programmatic-data';
import { ProgrammaticPageView } from '@/components/seo/programmatic-page-view';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(ALTERNATIVES_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = ALTERNATIVES_PAGES[slug];

  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://wefik.world/alternatives/${slug}`,
    },
  };
}

export default async function AlternativePage({ params }: Props) {
  const { slug } = await params;
  const data = ALTERNATIVES_PAGES[slug];

  if (!data) {
    notFound();
  }

  const products = await getProducts();

  return (
    <ProgrammaticPageView
      data={{
        ...data,
        parentHub: { label: 'Marketplace', url: '/marketplace' },
      }}
      products={products}
      canonicalUrl={`https://wefik.world/alternatives/${slug}`}
    />
  );
}
