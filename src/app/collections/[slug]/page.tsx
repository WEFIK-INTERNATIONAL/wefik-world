import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/data/products';
import { COLLECTIONS_PAGES } from '@/lib/seo/programmatic-data';
import { ProgrammaticPageView } from '@/components/seo/programmatic-page-view';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return Object.keys(COLLECTIONS_PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const data = COLLECTIONS_PAGES[slug];

  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://wefik.world/collections/${slug}`,
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const data = COLLECTIONS_PAGES[slug];

  if (!data) {
    notFound();
  }

  const products = await getProducts();

  return (
    <ProgrammaticPageView
      data={{
        ...data,
        parentHub: { label: 'Collections', url: '/marketplace' },
      }}
      products={products}
      canonicalUrl={`https://wefik.world/collections/${slug}`}
    />
  );
}
