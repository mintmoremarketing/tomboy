"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronLeft, Check, ShieldCheck, Truck, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";
import { LiveOrb } from "@/components/ui/live-orb";
import { AssistantPanel } from "@/components/assistant/assistant-panel";
import { recordRecentlyViewed } from "@/components/assistant/client";
import { TryOnDialog } from "@/components/assistant/try-on-dialog";
import { isTryOnEligible, TRY_ON_ENABLED } from "@/lib/try-on";
import { HighlightedDescription } from "@/components/product/highlighted-description";
import { looksLikeCode, useSwatches } from "@/lib/swatch-colors";
import { addToCart, openCart, useCart } from "@/lib/cart";
import { CartButton } from "@/components/cart/cart-drawer";
import { rememberProduct } from "@/components/cart/resume-pill";

// Smart CSS color mapping for Tomboy colorways
const colorSwatchMap: Record<string, string> = {
  black: "#111111",
  "navy blue": "#1B2A4A",
  navy: "#1B2A4A",
  "deep green": "#1B4332",
  green: "#1B4332",
  "deep slate purple": "#3C1F48",
  purple: "#5B21B6",
  white: "#FFFFFF",
  grey: "#6B7280",
  gray: "#6B7280",
  red: "#DC2626",
  yellow: "#FFE500",
  olive: "#556B2F",
  brown: "#5C4033",
  pink: "#FF3399",
  cyan: "#00F5D4",
  blue: "#2E7CF6",
  cream: "#F7F4EA",
  charcoal: "#2B2D42",
};

function getColorHex(name: string): string {
  const clean = name.trim().toLowerCase();
  for (const [key, val] of Object.entries(colorSwatchMap)) {
    if (clean.includes(key) || key.includes(clean)) return val;
  }
  return "#222222";
}

export default function ProductView({ product }: { product: any }) {
  // Scout on product pages: "This product" in its + menu attaches the one being viewed
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [orbDancing, setOrbDancing] = useState(false);
  const [audience, setAudience] = useState<"men" | "women" | "kids">("men");
  const [tryOnOpen, setTryOnOpen] = useState(false);
  // AI try-on is offered for adult outerwear only (see lib/try-on.ts)
  const canTryOn = TRY_ON_ENABLED && isTryOnEligible({ title: product.title, productType: product.productType });
  useEffect(() => {
    recordRecentlyViewed(product.handle);
    const saved = window.localStorage.getItem("tomboy-audience");
    if (saved === "men" || saved === "women" || saved === "kids") setAudience(saved);
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

    const imgMap: Record<string, string> = {};

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

      if (vColor && v.image?.url && !imgMap[vColor]) {
        imgMap[vColor] = v.image.url;
      }
    });

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
      const name = looksLikeCode(color) && swatches[color] ? swatches[color].name : color;
      used[name] = (used[name] ?? 0) + 1;
      labels[color] = used[name] > 1 ? `${name} ${used[name]}` : name;
    }
    return labels;
  }, [colors, swatches]);
  const colorHex = (color: string) => {
    const named = getColorHex(color);
    return named === "#222222" && swatches[color] ? swatches[color].hex : named;
  };

  // photos are matched by file, not full URL (variant and gallery URLs carry different query strings)
  const photoKey = (url?: string) => (url ?? "").split("?")[0];

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

  const cartItems = useCart();
  const [justAdded, setJustAdded] = useState(false);
  const cartLine = () => ({
    variantId: currentVariant.id,
    handle: product.handle,
    title: product.title,
    variantTitle: selectedColor && colorLabels[selectedColor]
      ? currentVariant.title?.replace(selectedColor, colorLabels[selectedColor])
      : currentVariant.title,
    image: currentVariant.image?.url || selectedImage || images[0]?.url || null,
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
      images: [currentVariant.image?.url, ...images.map((img: any) => img.url)]
        .filter((u, i, all): u is string => !!u && all.indexOf(u) === i)
        .slice(0, 3),
    });
  }, [currentVariant, product.handle, product.title, selectedSize, price, images]);

  // Phone back button: one step back like the system gesture, or home if they landed here directly
  const router = useRouter();
  function goBack() {
    const cameFromSite =
      window.sessionStorage.getItem("tomboy-navigated") === "1" || document.referrer.startsWith(window.location.origin);
    if (cameFromSite && window.history.length > 1) router.back();
    else router.push("/");
  }

  // Phones: a floating Add to cart / Buy now bar once the main buttons scroll out of view
  const actionsRef = useRef<HTMLDivElement>(null);
  const [showFloatingBar, setShowFloatingBar] = useState(false);
  useEffect(() => {
    const update = () => {
      const el = actionsRef.current;
      setShowFloatingBar(!!el && el.getBoundingClientRect().bottom < 0);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Buy now: makes sure it's in the cart (without doubling it), then opens the cart to check out
  function handleBuyNow() {
    if (!currentVariant?.id) return;
    if (!cartItems.some((i) => i.variantId === currentVariant.id)) addToCart(cartLine());
    openCart();
  }

  return (
    <div className="pdp-container">
      {/* Top Breadcrumb */}
      <div className="pdp-topbar">
        <div className="pdp-topbar__start">
          <button className="pdp-back" onClick={goBack} aria-label="Go back">
            <ChevronLeft size={22} />
          </button>
          <Link href="/" className="brand" aria-label="Tomboy homepage">
            <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
          </Link>
        </div>
        <div className="pdp-topbar__actions">
          <Link href="/" className="back-link hide-mobile">
            <ArrowLeft size={16} /> Back to store
          </Link>
          <CartButton />
          <button
            className="orb-button"
            aria-label="Ask Scout about this product"
            title="Ask Scout (press /)"
            onClick={() => setAssistantOpen(true)}
            onMouseEnter={() => setOrbDancing(true)}
            onMouseLeave={() => setOrbDancing(false)}
          >
            <LiveOrb variant="custom" color="#FF3333" eyeColor="#FAFAFA" size={34} dance={orbDancing} />
          </button>
        </div>
      </div>
      {isAvailable && (
        <div className={`pdp-floating-bar${showFloatingBar ? " is-visible" : ""}`} aria-hidden={!showFloatingBar} inert={!showFloatingBar}>
          <div className="pdp-floating-bar__price">
            {/* just the size: the full "1-2 years / B AOP 1" variant name doesn't fit */}
            <small>{selectedSize || selectedColor || "Price"}</small>
            <strong>₹{Math.round(Number(price) || 0).toLocaleString("en-IN")}</strong>
          </div>
          <button className="pdp-floating-bar__add" onClick={handleAddToCart} aria-label="Add to cart">
            {justAdded ? <Check size={20} /> : <ShoppingBag size={20} />}
          </button>
          <button className="button button--dark pdp-floating-bar__buy" onClick={handleBuyNow}>
            Buy Now
          </button>
        </div>
      )}
      <AssistantPanel
        open={assistantOpen}
        onOpenChange={setAssistantOpen}
        audience={audience}
        currentProduct={{ handle: product.handle }}
      />

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

          {images.length > 1 && (
            <div className="pdp-thumbnails">
              {images.map((img: any, index: number) => (
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
          <div className="pdp-price">Rs. {price}</div>

          {/* Option Selectors: Clean Separated Color & Size */}
          <div className="pdp-variants">
            {/* 1. Choose Colour */}
            {colors.length > 0 && (
              <div className="pdp-option-group">
                <div className="pdp-variants__label">
                  <span>Choose Colour:</span>
                  <strong>{colorLabels[selectedColor] ?? selectedColor}</strong>
                </div>
                <div className="pdp-color-swatches">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    const hex = colorHex(color);
                    return (
                      <button
                        key={color}
                        type="button"
                        className={`pdp-color-btn ${isSelected ? "is-selected" : ""}`}
                        onClick={() => handleColorSelect(color)}
                      >
                        <span
                          className="pdp-color-dot"
                          style={{ backgroundColor: hex }}
                        />
                        <span>{colorLabels[color] ?? color}</span>
                        {isSelected && <Check size={14} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
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
  );
}
