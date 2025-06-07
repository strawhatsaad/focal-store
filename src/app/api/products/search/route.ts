// src/app/api/products/search/route.ts
import { NextResponse } from 'next/server';
import { shopifyAdminRequest, PRODUCT_SEARCH_QUERY } from '../../../../../utils';
import { MappedProduct } from '@/types/product';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ message: 'Search query is required' }, { status: 400 });
  }

  try {
    const shopifyQuery = `(title:*${query}* OR tag:${query})`;
    const response = await shopifyAdminRequest(PRODUCT_SEARCH_QUERY, { query: shopifyQuery, first: 50 });

    const products: MappedProduct[] = response.data.products.edges.map(({ node }: any) => ({
      id: node.variants.edges[0]?.node.id || node.id, // Use variant ID for cart
      name: node.title,
      href: `/products/${node.handle}`,
      price: `$${parseFloat(node.priceRangeV2.minVariantPrice.amount).toFixed(2)}`,
      imageSrc: node.featuredImage?.url || 'https://placehold.co/300x300?text=No+Image',
      imageAlt: node.featuredImage?.altText || node.title,
      tags: node.tags,
    }));

    return NextResponse.json({ products });

  } catch (error: any) {
    console.error("Product search failed:", error);
    return NextResponse.json({ message: `Failed to search for products: ${error.message}` }, { status: 500 });
  }
}
