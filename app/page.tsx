import Home, { type HomeData } from "./home";
import { getCollectionByHandle } from "@/lib/shopify";
import { getEssentialPhotos } from "@/lib/essentials";
import { audienceContent } from "@/data/homepage";

// The homepage is interactive (app/home.tsx), but its Shopify data is fetched here on the
// server while the page is built, so products and category photos arrive with the HTML
// instead of after the JavaScript loads and asks for them. Cached by shopifyFetch (60s).
export const revalidate = 60;

const AUDIENCES = ["men", "women", "kids"] as const;

export default async function Page() {
  const [products, photos] = await Promise.all([
    Promise.all(
      AUDIENCES.map(async (a) => {
        try {
          return (await getCollectionByHandle(audienceContent[a].collectionHandle, 20))?.products?.edges ?? null;
        } catch {
          return null; // the client fetches it instead
        }
      }),
    ),
    Promise.all(AUDIENCES.map((a) => getEssentialPhotos(a).catch(() => null))),
  ]);

  const initial: HomeData = { products: {}, photos: {} };
  AUDIENCES.forEach((a, i) => {
    if (products[i]?.length) initial.products[a] = products[i];
    if (photos[i]) initial.photos[a] = photos[i]!;
  });

  return <Home initial={initial} />;
}
