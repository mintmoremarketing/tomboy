const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export async function shopifyFetch<T = any>({
  query,
  variables,
}: {
  query: string;
  variables?: any;
}): Promise<{ status: number; body?: { data?: T; errors?: any[] }; error?: string }> {
  const endpoint = `https://${domain}/api/2024-01/graphql.json`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken as string,
      },
      body: JSON.stringify({ query, variables }),
      next: { revalidate: 60 }, // Revalidate every minute
    });

    const body = await result.json();

    if (body.errors) {
      console.error("Shopify API Errors:", body.errors);
      return { status: 400, error: body.errors[0]?.message || "Shopify GraphQL error" };
    }

    return {
      status: result.status,
      body,
    };
  } catch (error: any) {
    console.error("Shopify Fetch Error:", error);
    return {
      status: 500,
      error: error?.message || "Error receiving data from Shopify",
    };
  }
}

// 1. Fetch Homepage / General Products
export async function getProducts(first = 20) {
  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            images(first: 2) {
              edges {
                node {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { first } });
  return response.body?.data?.products?.edges || [];
}

// 2. Fetch Single Product by Handle
export async function getProductByHandle(handle: string) {
  const query = `
    query getProductByHandle($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        descriptionHtml
        productType
        vendor
        options {
          id
          name
          values
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 50) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 100) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  return response.body?.data?.product || null;
}

// 3. Fetch Collection by Handle
export async function getCollectionByHandle(handle: string, first = 50) {
  const query = `
    query getCollectionByHandle($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        handle
        description
        image {
          url
          altText
        }
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              productType
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              images(first: 2) {
                edges {
                  node {
                    url
                    altText
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle, first } });
  return response.body?.data?.collection || null;
}

// 4. Fetch CMS Page by Handle
export async function getPageByHandle(handle: string) {
  const query = `
    query getPageByHandle($handle: String!) {
      page(handle: $handle) {
        id
        title
        handle
        body
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { handle } });
  return response.body?.data?.page || null;
}

// 5. Create Cart Mutation
export async function createCart(lines: { merchandiseId: string; quantity: number }[]) {
  const query = `
    mutation createCart($lines: [CartLineInput!]) {
      cartCreate(input: { lines: $lines }) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            subtotalAmount {
              amount
              currencyCode
            }
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 20) {
            edges {
              node {
                id
                quantity
                cost {
                  totalAmount {
                    amount
                    currencyCode
                  }
                }
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      handle
                    }
                    image {
                      url
                      altText
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await shopifyFetch({ query, variables: { lines } });
  return response.body?.data?.cartCreate?.cart || null;
}
