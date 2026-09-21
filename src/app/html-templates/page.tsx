import { Metadata } from 'next';
import { getProducts } from '@/lib/data/products';
import { CATEGORY_HUBS } from '@/lib/seo/programmatic-data';
import { ProgrammaticPageView } from '@/components/seo/programmatic-page-view';

const data = CATEGORY_HUBS['html-templates'];

export const metadata: Metadata = {
  title: data.title,
  description: data.metaDescription,
  alternates: {
    canonical: 'https://wefik.world/html-templates',
  },
};

export default async function HtmlTemplatesHub() {
  const products = await getProducts();
  return (
    <ProgrammaticPageView
      data={data}
      products={products}
      canonicalUrl="https://wefik.world/html-templates"
      categoryLabel="HTML Templates"
    />
  );
}
