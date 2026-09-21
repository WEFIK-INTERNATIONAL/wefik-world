import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/data/products';
import { FREE_HUBS } from '@/lib/seo/programmatic-data';
import { ProgrammaticPageView } from '@/components/seo/programmatic-page-view';

interface Props {
  params: Promise<{ category: string }>;
}

export async function generateStaticParams() {
  return [
    { category: 'wordpress-themes' },
    { category: 'wordpress-plugins' },
    { category: 'html-templates' },
    { category: 'code-snippets' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const key = `free-${category}`;
  const data = FREE_HUBS[key];

  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://wefik.world/free/${category}`,
    },
  };
}

export default async function FreeCategoryHubPage({ params }: Props) {
  const { category } = await params;
  const key = `free-${category}`;
  const data = FREE_HUBS[key];

  if (!data) {
    notFound();
  }

  const products = await getProducts();

  return (
    <ProgrammaticPageView
      data={{
        ...data,
        parentHub: { label: 'Freebies', url: '/freebies' },
      }}
      products={products}
      canonicalUrl={`https://wefik.world/free/${category}`}
    />
  );
}
