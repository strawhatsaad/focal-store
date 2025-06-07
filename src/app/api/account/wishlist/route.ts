// src/app/api/account/wishlist/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/authOptions';
import { shopifyAdminRequest } from '../../../../../utils';

const WISHLIST_METAFIELD_NAMESPACE = "focal_wishlist";
const WISHLIST_METAFIELD_KEY = "products";

const GET_WISHLIST_QUERY = `
  query getCustomerWishlist($customerId: ID!) {
    customer(id: $customerId) {
      wishlist: metafield(namespace: "${WISHLIST_METAFIELD_NAMESPACE}", key: "${WISHLIST_METAFIELD_KEY}") {
        value
      }
    }
  }
`;

const SET_WISHLIST_MUTATION = `
  mutation setCustomerWishlist($metafields: [MetafieldsSetInput!]!) {
    metafieldsSet(metafields: $metafields) {
      metafields {
        id
        key
        namespace
        value
      }
      userErrors {
        field
        message
        code
      }
    }
  }
`;

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopifyCustomerId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const response = await shopifyAdminRequest(GET_WISHLIST_QUERY, {
      customerId: session.user.shopifyCustomerId,
    });
    
    const value = response.data?.customer?.wishlist?.value;
    const wishlist = value ? JSON.parse(value) : [];

    return NextResponse.json({ wishlist });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to fetch wishlist: ${error.message}` }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.shopifyCustomerId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { wishlist } = await request.json();

    const metafieldsInput = [
      {
        key: WISHLIST_METAFIELD_KEY,
        namespace: WISHLIST_METAFIELD_NAMESPACE,
        ownerId: session.user.shopifyCustomerId,
        type: 'json_string',
        value: JSON.stringify(wishlist),
      },
    ];

    const response = await shopifyAdminRequest(SET_WISHLIST_MUTATION, {
      metafields: metafieldsInput,
    });
    
    const userErrors = response.data?.metafieldsSet?.userErrors;
    if (userErrors && userErrors.length > 0) {
        throw new Error(userErrors.map((e:any) => e.message).join(', '));
    }

    return NextResponse.json({ success: true, metafields: response.data?.metafieldsSet?.metafields });
  } catch (error: any) {
    return NextResponse.json({ message: `Failed to update wishlist: ${error.message}` }, { status: 500 });
  }
}
