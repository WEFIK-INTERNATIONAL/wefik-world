import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProducts } from '@/lib/data/products';
import { USE_CASE_PAGES } from '@/lib/seo/programmatic-data';
import { ProgrammaticPageView } from '@/components/seo/programmatic-page-view';

interface Props {
  params: Promise<{ useCase: string }>;
}

export async function generateStaticParams() {
  return [
    { useCase: 'for-agencies' },
    { useCase: 'for-restaurants' },
    { useCase: 'for-portfolios' },
    { useCase: 'for-ecommerce' },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { useCase } = await params;
  const key = `wordpress-themes-${useCase}`;
  const data = USE_CASE_PAGES[key];

  if (!data) return {};

  return {
    title: data.title,
    description: data.metaDescription,
    alternates: {
      canonical: `https://wefik.world/wordpress-themes/${useCase}`,
    },
  };
}

export default async function WordPressThemeUseCasePage({ params }: Props) {
  const { useCase } = await params;
  const key = `wordpress-themes-${useCase}`;
  const data = USE_CASE_PAGES[key];

  if (!data) {
    notFound();
  }

  const products = await getProducts();

  return (
    <ProgrammaticPageView
      data={{
        ...data,
        parentHub: { label: 'WordPress Themes', url: '/wordpress-themes' },
      }}
      products={products}
      canonicalUrl={`https://wefik.world/wordpress-themes/${useCase}`}
    />
  );
}
