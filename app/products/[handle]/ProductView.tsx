"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, ShieldCheck, X, Truck, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { recordRecentlyViewed } from "@/components/assistant/client";
import { TryOnDialog } from "@/components/assistant/try-on-dialog";
import { isTryOnEligible, TRY_ON_ENABLED } from "@/lib/try-on";
import { HighlightedDescription } from "@/components/product/highlighted-description";
import { Price } from "@/components/product/price";
import { looksLikeCode, useSwatches } from "@/lib/swatch-colors";
import { addToCart, openCart, useCart } from "@/lib/cart";
import { SiteHeader } from "@/components/layout/site-header";
import { rememberProduct } from "@/components/cart/resume-pill";

// Swatch colours for colour names used in the catalogue. Multi-word names are matched
// before single words, so "Light Grey" doesn't fall back to plain "Grey".
const colorSwatchMap: Record<string, string> = {
  "deep slate purple": "#3C1F48",
  "navy blue": "#1B2A4A",
  "royal blue": "#2E5BD8",
  "deep blue": "#1E4FD6",
  "sky blue": "#7CB8EC",
  "deep green": "#1B4332",
  "bottle green": "#1E4B3C",
  "olive green": "#556B2F",
  "dark grey": "#4B5058",
  "dark gray": "#4B5058",
  "light grey": "#C9CCD1",
  "light gray": "#C9CCD1",
  black: "#111111",
  navy: "#1B2A4A",
  green: "#1B4332",
  purple: "#5B21B6",
  lavender: "#B9A5DC",
  white: "#FFFFFF",
  grey: "#8A8F98",
  gray: "#8A8F98",
  charcoal: "#2B2D42",
  burgundy: "#7A1F34",
  maroon: "#6E1626",
  wine: "#6B1E3A",
  red: "#DC2626",
  coral: "#F06E5A",
  peach: "#F6B89A",
  pink: "#FF7AB6",
  yellow: "#FFE500",
  mustard: "#CDA028",
  olive: "#556B2F",
  khaki: "#B5A77A",
  beige: "#D8C3A5",
  cream: "#F7F4EA",
  skin: "#E3B899",
  nude: "#E3B899",
  brown: "#5C4033",
  teal: "#14697A",
  mint: "#A0E1BE",
  cyan: "#00F5D4",
  blue: "#2E7CF6",
};
const SWATCH_KEYS = Object.keys(colorSwatchMap).sort((a, b) => b.length - a.length);

// The colour names inside an option: "Burgundy Red Dark-Grey" -> ["Burgundy", "Red", "Dark Grey"]
function colorParts(name: string): string[] {
  let rest = ` ${name.toLowerCase().replace(/[-_/&,+]/g, " ").replace(/\s+/g, " ")} `;
  const found: { at: number; key: string }[] = [];
  for (const key of SWATCH_KEYS) {
    let i = rest.indexOf(` ${key} `);
    while (i !== -1) {
      found.push({ at: i, key });
      rest = rest.slice(0, i + 1) + "#".repeat(key.length) + rest.slice(i + 1 + key.length);
      i = rest.indexOf(` ${key} `);
    }
  }
  return found.sort((x, y) => x.at - y.at).map((f) => f.key.replace(/\b\w/g, (ch) => ch.toUpperCase()));
}

function getColorHex(name: string): string {
  const [first] = colorParts(name);
  return first ? colorSwatchMap[first.toLowerCase()] : "#222222";
}

export default function ProductView({ product }: { product: any }) {
  const [tryOnOpen, setTryOnOpen] = useState(false);
  // AI try-on is offered for adult outerwear only (see lib/try-on.ts)
  const canTryOn = TRY_ON_ENABLED && isTryOnEligible({ title: product.title, productType: product.productType });
  useEffect(() => {
    recordRecentlyViewed(product.handle);
  }, [product.handle]);

  const images = useMemo(
    () => product.images?.edges?.map((e: any) => e.node) || [],
    [product]
  );
  const variants = useMemo(
    () => product.variants?.edges?.map((e: any) => e.node) || [],
    [product]
  );

  // Extract distinct Color and Size options
  const { colors, sizes, colorImages } = useMemo(() => {
    const rawOptions = product.options || [];
    const colorOpt = rawOptions.find((o: any) =>
      /colou?r/i.test(o.name)
    );
    const sizeOpt = rawOptions.find((o: any) =>
      /size|waist|fit/i.test(o.name)
    );

    let parsedColors: string[] = colorOpt?.values || [];
    let parsedSizes: string[] = sizeOpt?.values || [];

    // every photo each colour's variants use, with how many sizes use it
    const colorPhotos: Record<string, Record<string, number>> = {};

    // Map each variant's image to its color
    variants.forEach((v: any) => {
      let vColor = "";
      let vSize = "";

      v.selectedOptions?.forEach((opt: any) => {
        if (/colou?r/i.test(opt.name)) vColor = opt.value;
        if (/size|waist|fit/i.test(opt.name)) vSize = opt.value;
      });

      // Fallback: parse from title "Deep Green / S"
      if (!vColor && v.title) {
        const parts = v.title.split("/").map((s: string) => s.trim());
        if (parts.length >= 2) {
          vColor = parts[0];
          vSize = parts[1];
        } else {
          vColor = parts[0];
        }
      }

      if (vColor && !parsedColors.includes(vColor) && vColor !== "Default Title") {
        parsedColors.push(vColor);
      }
      if (vSize && !parsedSizes.includes(vSize)) {
        parsedSizes.push(vSize);
      }

      if (vColor && v.image?.url) {
        const photos = (colorPhotos[vColor] ??= {});
        photos[v.image.url] = (photos[v.image.url] ?? 0) + 1;
      }
    });

    // One photo per colour. Shopify variants are sometimes linked to the wrong photo
    // (e.g. a "Royal Blue" size pointing at the Navy picture), so prefer the photo whose
    // file name matches the colour, then the one most sizes use.
    const squash = (t: string) => t.toLowerCase().replace(/[^a-z0-9]/g, "");
    const imgMap: Record<string, string> = {};
    for (const [color, photos] of Object.entries(colorPhotos)) {
      const urls = Object.keys(photos);
      const fileOf = (url: string) => squash(url.split("?")[0].split("/").pop() ?? "");
      const named = urls.find((u) => squash(color).length > 2 && fileOf(u).includes(squash(color)));
      imgMap[color] = named ?? urls.sort((a, b) => photos[b] - photos[a])[0];
    }

    return {
      colors: parsedColors.length > 0 ? parsedColors : [],
      sizes: parsedSizes.length > 0 ? parsedSizes : [],
      colorImages: imgMap,
    };
  }, [product, variants]);

  // Active Selections
  const [selectedColor, setSelectedColor] = useState<string>(
    colors[0] || ""
  );
  const [selectedSize, setSelectedSize] = useState<string>(
    sizes[0] || ""
  );
  const [selectedImage, setSelectedImage] = useState<string>(
    (selectedColor && colorImages[selectedColor]) || images[0]?.url || ""
  );

  // Find exact matching variant
  const currentVariant = useMemo(() => {
    if (variants.length === 0) return null;

    // Match by both color and size
    const exact = variants.find((v: any) => {
      const opts = v.selectedOptions || [];
      const matchesColor = selectedColor
        ? opts.some((o: any) => o.value?.toLowerCase() === selectedColor.toLowerCase()) ||
          v.title?.toLowerCase().includes(selectedColor.toLowerCase())
        : true;
      const matchesSize = selectedSize
        ? opts.some((o: any) => o.value?.toLowerCase() === selectedSize.toLowerCase()) ||
          v.title?.toLowerCase().includes(selectedSize.toLowerCase())
        : true;
      return matchesColor && matchesSize;
    });

    if (exact) return exact;

    // Fallback match by color only
    const colorMatch = variants.find((v: any) =>
      selectedColor
        ? v.title?.toLowerCase().includes(selectedColor.toLowerCase())
        : false
    );
    return colorMatch || variants[0];
  }, [variants, selectedColor, selectedSize]);

  // Check availability of specific size for current color
  function isSizeAvailable(sizeVal: string): boolean {
    const match = variants.find((v: any) => {
      const opts = v.selectedOptions || [];
      const matchesColor = selectedColor
        ? opts.some((o: any) => o.value?.toLowerCase() === selectedColor.toLowerCase()) ||
          v.title?.toLowerCase().includes(selectedColor.toLowerCase())
        : true;
      const matchesSize =
        opts.some((o: any) => o.value?.toLowerCase() === sizeVal.toLowerCase()) ||
        v.title?.toLowerCase().includes(sizeVal.toLowerCase());
      return matchesColor && matchesSize;
    });
    return match ? match.availableForSale !== false : true;
  }

  // Swatch dots and names: Shopify's name when it's a real colour, otherwise the colour read
  // from that variant's photo ("B AOP 3" -> "Teal"); repeats get numbered ("Navy 2").
  const swatches = useSwatches(colorImages);
  const colorLabels = useMemo(() => {
    const labels: Record<string, string> = {};
    const used: Record<string, number> = {};
    for (const color of colors) {
      // rename only true codes ("B AOP 1"): anything with a colour word we know keeps its name
      const isCode = looksLikeCode(color) && colorParts(color).length === 0;
      const name = isCode && swatches[color] ? swatches[color].name : color;
      used[name] = (used[name] ?? 0) + 1;
      labels[color] = used[name] > 1 ? `${name} ${used[name]}` : name;
    }
    return labels;
  }, [colors, swatches]);
  const colorName = (color: string) => {
    const parts = colorParts(color);
    if (parts.length > 1) return parts.join(" · ");
    const name = colorLabels[color] ?? color;
    return packSize > 1 ? `${packSize} × ${name}` : name;
  };

  // Swatch colour: the colour name when we know it. Photos are only read for coded names
  // ("B AOP 1"): on model shots the photo reader can't tell skin from brown/tan fabric,
  // so it isn't trusted over a real colour name (checked across all 110 multi-colour products).
  // Swatch colours the store set in Shopify win over everything else
  const shopifySwatch = useMemo(() => {
    const map: Record<string, string> = {};
    for (const option of product.options ?? []) {
      if (!/colou?r/i.test(option.name)) continue;
      for (const value of option.optionValues ?? []) if (value.swatch?.color) map[value.name] = value.swatch.color;
    }
    return map;
  }, [product.options]);

  const colorHex = (color: string) => {
    if (shopifySwatch[color]) return shopifySwatch[color];
    const named = getColorHex(color);
    return named === "#222222" && swatches[color] ? swatches[color].hex : named;
  };
  // Mixed pack: one stripe per colour in its name
  const packColors = (color: string) => colorParts(color).map((part) => colorSwatchMap[part.toLowerCase()]);

  // Multi-piece packs ("3 Pcs Pack", "Pack of 3"): every colour option is that many pieces,
  // so say it plainly: "3 × Red", or the three colours of a mixed pack.
  const packSize = useMemo(() => {
    const m = product.title.match(/(\d+)\s*(?:pcs|pieces|pc|pack)\b|pack\s*of\s*(\d+)/i);
    const n = Number(m?.[1] ?? m?.[2]);
    return n > 1 && n <= 12 ? n : 1;
  }, [product.title]);

  // Options that name several colours ("Blue Black Burgundy") are mixed packs; list them
  // after the single colours under their own heading instead of one long jumbled list.
  const colorGroups = useMemo(() => {
    const mixed = colors.filter((c) => colorParts(c).length > 1);
    const single = colors.filter((c) => colorParts(c).length <= 1);
    const singleTitle = packSize > 1 ? `All ${packSize} in one colour` : "Single colour";
    if (mixed.length === 0) return [{ title: packSize > 1 ? singleTitle : null, colors }];
    return [
      ...(single.length ? [{ title: singleTitle as string | null, colors: single }] : []),
      { title: (packSize > 1 ? `Mixed packs (${packSize} colours)` : "Mixed colour packs") as string | null, colors: mixed },
    ];
  }, [colors, packSize]);

  // photos are matched by file, not full URL (variant and gallery URLs carry different query strings)
  const photoKey = (url?: string) => (url ?? "").split("?")[0];

  // Thumbnails in the same order as the colour buttons (Shopify's gallery order is just
  // upload order); photos that aren't a colour's main photo, like close-ups, follow after.
  const galleryImages = useMemo(() => {
    const colorOrder = colors.map((c) => photoKey(colorImages[c])).filter(Boolean);
    const rank = (img: any) => {
      const i = colorOrder.indexOf(photoKey(img.url));
      return i === -1 ? colorOrder.length : i;
    };
    return [...images].sort((a: any, b: any) => rank(a) - rank(b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [images, colors, colorImages]);

  // keep the highlighted thumbnail visible in the scrolling row
  const thumbsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const row = thumbsRef.current;
    const active = row?.querySelector<HTMLElement>(".pdp-thumb.is-active");
    if (!row || !active) return;
    const box = row.getBoundingClientRect();
    const r = active.getBoundingClientRect();
    row.scrollBy({ left: r.left + r.width / 2 - (box.left + box.width / 2), behavior: "smooth" });
  }, [selectedImage]);

  // phones: the picked colour's tile slides into view in its swipe row
  // (e.g. when the colour was chosen by tapping a photo thumbnail)
  // (same for the size row)
  useEffect(() => {
    for (const selector of [".pdp-colour-tile.is-selected", ".pdp-size-btn.is-selected"]) {
      const tile = document.querySelector<HTMLElement>(selector);
      const row = tile?.parentElement;
      if (!tile || !row || row.scrollWidth <= row.clientWidth) continue;
      const box = row.getBoundingClientRect();
      const r = tile.getBoundingClientRect();
      if (r.left < box.left || r.right > box.right) {
        row.scrollBy({ left: r.left + r.width / 2 - (box.left + box.width / 2), behavior: "smooth" });
      }
    }
  }, [selectedColor, selectedSize]);

  function handleColorSelect(color: string) {
    setSelectedColor(color);
    if (colorImages[color]) {
      setSelectedImage(colorImages[color]);
    } else {
      // Find variant with that color
      const match = variants.find((v: any) =>
        v.title?.toLowerCase().includes(color.toLowerCase())
      );
      if (match?.image?.url) {
        setSelectedImage(match.image.url);
      }
    }
  }

  const price =
    currentVariant?.price?.amount ||
    product.priceRange?.minVariantPrice?.amount;

  const isAvailable = currentVariant?.availableForSale !== false;
  // Shopify's compare-at ("original") price for the struck-through price
  const compareAt =
    currentVariant?.compareAtPrice?.amount ?? product.compareAtPriceRange?.minVariantPrice?.amount ?? null;

  const cartItems = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const cartLine = () => ({
    variantId: currentVariant.id,
    handle: product.handle,
    title: product.title,
    variantTitle: selectedColor
      ? currentVariant.title?.replace(selectedColor, colorName(selectedColor))
      : currentVariant.title,
    image: colorImages[selectedColor] || currentVariant.image?.url || selectedImage || images[0]?.url || null,
    price: Number(price) || 0,
  });

  // Add to cart: just adds it, with a brief "Added" on the button
  function handleAddToCart() {
    if (!currentVariant?.id) return;
    addToCart(cartLine());
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 1600);
  }

  // remember this product (with the chosen size) for the "continue" pill on other pages
  useEffect(() => {
    if (!currentVariant?.id || currentVariant.availableForSale === false) return;
    rememberProduct({
      handle: product.handle,
      title: product.title,
      variantId: currentVariant.id,
      variantTitle: currentVariant.title,
      size: selectedSize || undefined,
      price: Number(price) || 0,
      images: [colorImages[selectedColor], currentVariant.image?.url, ...images.map((img: any) => img.url)]
        .filter((u, i, all): u is string => !!u && all.indexOf(u) === i)
        .slice(0, 3),
    });
  }, [currentVariant, product.handle, product.title, selectedSize, selectedColor, colorImages, price, images]);

  // Phones: bottom sheet to change colour/size from the floating bar
  const [pickerOpen, setPickerOpen] = useState(false);
  useEffect(() => {
    if (!pickerOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [pickerOpen]);

  // Phones: a floating Add to cart / Buy now bar whenever the main buttons aren't comfortably in view
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = actionsRef.current;
      if (!el) return setShowFloatingBar(false);
      // judge by the Add to Cart button itself: show the bar while it's below the fold, and again
      // once it has scrolled up into the top 30% of the screen
      const r = (el.firstElementChild ?? el).getBoundingClientRect();
      setShowFloatingBar(r.top < window.innerHeight * 0.3 || r.top > window.innerHeight - 40);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  // Buy now: makes sure it's in the cart (without doubling it), then opens the cart to check out
  function handleBuyNow() {
    if (!currentVariant?.id) return;
    if (!cartItems.some((i) => i.variantId === currentVariant.id)) addToCart(cartLine());
    openCart();
  }

  // Colour + size pickers: on the page, and again in the phone bottom sheet
  const variantPickers = (
    <div className="pdp-variants">
      {/* 1. Choose Colour */}
      {colors.length > 0 && (
        <div className="pdp-option-group">
          <div className="pdp-variants__label">
            <span>Choose Colour:</span>

          </div>
          {colorGroups.map((group) => (
            <div key={group.title ?? "all"}>
              {group.title && <p className="pdp-color-group__title">{group.title}</p>}
              <div className="pdp-colour-grid" role="radiogroup" aria-label={group.title ?? "Colour"}>
                {group.colors.map((color) => {
                  const isSelected = selectedColor === color;
                  const parts = colorParts(color);
                  const isPack = parts.length > 1 && !shopifySwatch[color];
                  return (
                    <button
                      key={color}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      className={`pdp-colour-tile${isSelected ? " is-selected" : ""}`}
                      onClick={() => handleColorSelect(color)}
                      // where the swatch colour came from, for checking the catalogue (photo vs name)
                      data-source={getColorHex(color) === "#222222" && swatches[color] ? "photo" : "name"}
                    >
                      {/* colour + name side by side, so it works without telling colours apart */}
                      <span className="pdp-colour-tile__dots" aria-hidden>
                        {(isPack ? packColors(color) : [colorHex(color)]).map((hex, i) => (
                          <span key={i} className="pdp-colour-tile__dot" style={{ backgroundColor: hex }} />
                        ))}
                      </span>
                      <span className="pdp-colour-tile__name">{colorName(color)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 2. Choose Size */}
      {sizes.length > 0 && (
        <div className="pdp-option-group">
          <div className="pdp-variants__label">
            <span>Choose Size:</span>
            <strong>{selectedSize}</strong>
          </div>
          <div className="pdp-size-grid">
            {sizes.map((size) => {
              const isSelected = selectedSize === size;
              const available = isSizeAvailable(size);
              return (
                <button
                  key={size}
                  type="button"
                  className={`pdp-size-btn ${isSelected ? "is-selected" : ""} ${
                    !available ? "is-soldout" : ""
                  }`}
                  onClick={() => available && setSelectedSize(size)}
                  title={available ? `Size ${size}` : `Size ${size} (Sold Out)`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const optionSummary =
    [selectedColor && colorName(selectedColor).replace(/ · /g, "/"), selectedSize && `Size ${selectedSize}`]
      .filter(Boolean)
      .join(" · ") || "Choose options";

  return (
    <>
    <SiteHeader currentProduct={{ handle: product.handle }} />
    <div className="pdp-container">
      {isAvailable && (
        <div className={`pdp-floating-bar${showFloatingBar ? " is-visible" : ""}`} aria-hidden={!showFloatingBar} inert={!showFloatingBar}>
          <div className="pdp-floating-bar__price">
            {/* what they're buying ("3 × Red · Size S"); tap to change it without scrolling */}
            <button
              type="button"
              className="pdp-floating-bar__options"
              onClick={() => setPickerOpen(true)}
              aria-label={`${optionSummary}. Change colour or size`}
            >
              <span>{optionSummary}</span>
              <ChevronDown size={12} strokeWidth={3} aria-hidden />
            </button>
            <strong>
              <Price amount={price} compareAt={compareAt} size="sm" showBadge={false} />
            </strong>
          </div>
          <button className="pdp-floating-bar__add" onClick={handleAddToCart} aria-label="Add to cart">
            {justAdded ? <Check size={20} /> : <ShoppingBag size={20} />}
          </button>
          <button className="button button--dark pdp-floating-bar__buy" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      )}

      {pickerOpen && (
        <div className="pdp-sheet" role="dialog" aria-modal="true" aria-label="Choose colour and size">
          <button className="pdp-sheet__backdrop" aria-label="Close" onClick={() => setPickerOpen(false)} />
          <div className="pdp-sheet__panel">
            {/* the photo stays in view while picking, so a colour change shows straight away */}
            <div className="pdp-sheet__head">
              <span className="pdp-sheet__photo" style={selectedImage ? { backgroundImage: `url(${selectedImage})` } : {}} />
              <div className="pdp-sheet__info">
                <p className="pdp-sheet__title">{product.title}</p>
                <Price amount={price} compareAt={compareAt} size="sm" />
                <p className="pdp-sheet__summary">{optionSummary}</p>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setPickerOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="pdp-sheet__body">{variantPickers}</div>
            <div className="pdp-sheet__foot">
              <button
                className="button button--light"
                onClick={() => {
                  handleAddToCart();
                  setPickerOpen(false);
                }}
                disabled={!isAvailable}
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button
                className="button button--dark"
                onClick={() => {
                  setPickerOpen(false);
                  handleBuyNow();
                }}
                disabled={!isAvailable}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="pdp-grid">
        {/* Left: Gallery */}
        <div className="pdp-gallery">
          <div
            className="pdp-gallery__main"
            style={
              selectedImage
                ? { backgroundImage: `url(${selectedImage})` }
                : {}
            }
          >
            {!selectedImage && <div className="pdp-no-image">No Image</div>}
          </div>

          {galleryImages.length > 1 && (
            <div className="pdp-thumbnails" ref={thumbsRef}>
              {galleryImages.map((img: any, index: number) => (
                <button
                  key={index}
                  className={`pdp-thumb ${photoKey(selectedImage) === photoKey(img.url) ? "is-active" : ""}`}
                  onClick={() => {
                    setSelectedImage(img.url);
                    // a photo of another colour selects that colour too
                    const color = Object.keys(colorImages).find((c) => photoKey(colorImages[c]) === photoKey(img.url));
                    if (color && color !== selectedColor) setSelectedColor(color);
                  }}
                  style={{ backgroundImage: `url(${img.url})` }}
                  aria-label={`View photo ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="pdp-info">


          <h1 className="pdp-title">{product.title}</h1>
          <div className="pdp-price">
            <Price amount={price} compareAt={compareAt} size="lg" />
          </div>

          {variantPickers}


          {/* Action Buttons */}
          <div className="pdp-actions" ref={actionsRef}>
            <button
              className="button button--dark button--full"
              onClick={handleAddToCart}
              disabled={!isAvailable}
              style={{
                boxShadow: isAvailable ? "4px 4px 0px #00F5D4" : "none",
              }}
            >
              {justAdded ? <Check size={18} /> : <ShoppingBag size={18} />}
              {!isAvailable ? "Out of Stock for this Selection" : justAdded ? "Added to Cart" : "Add to Cart"}
            </button>
            <button
              className="button button--light button--full"
              onClick={handleBuyNow}
              disabled={!isAvailable}
              hidden={!isAvailable}
            >
              Buy Now<span className="hide-mobile">&nbsp;– Instant Checkout</span>
            </button>
            {canTryOn && (
              <button className="button button--light button--full pdp-tryon" onClick={() => setTryOnOpen(true)}>
                <Sparkles size={18} /> Try it on with AI
              </button>
            )}
          </div>
          {tryOnOpen && (
            <TryOnDialog
              product={{ handle: product.handle, title: product.title, image: images[0]?.url ?? null }}
              onClose={() => setTryOnOpen(false)}
            />
          )}

          {/* Value Props & Trust Badges */}
          <div className="pdp-perks">
            <div className="pdp-perk">
              <Truck size={18} />
              <span>Free shipping across India over Rs. 899</span>
            </div>
            <div className="pdp-perk">
              <RefreshCw size={18} />
              <span>Easy 7-day exchanges & returns</span>
            </div>
            <div className="pdp-perk">
              <ShieldCheck size={18} />
              <span>100% Super Combed Pure Cotton – Anti-Pinch Waistband</span>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="pdp-description">
              <h3>Product Details</h3>
              <HighlightedDescription text={product.description} extraTerms={colors} />
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}
