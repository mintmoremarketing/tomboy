"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Truck, RefreshCw, ShoppingBag, Sparkles } from "lucide-react";

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
  const [isCheckingOut, setIsCheckingOut] = useState(false);

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

  async function handleBuyNow() {
    if (!currentVariant?.id) return;
    setIsCheckingOut(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: [{ merchandiseId: currentVariant.id, quantity: 1 }],
        }),
      });

      const data = await res.json();
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert("Unable to reach checkout. Please try again.");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Error initiating checkout.");
    } finally {
      setIsCheckingOut(false);
    }
  }

  return (
    <div className="pdp-container">
      {/* Top Breadcrumb */}
      <div className="pdp-topbar">
        <Link href="/" className="brand" aria-label="Tomboy homepage">
          <img src="/logo.webp" alt="Tomboy India" className="brand-logo" />
        </Link>
        <Link href="/" className="back-link">
          <ArrowLeft size={16} /> Back to store
        </Link>
      </div>

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
                  className={`pdp-thumb ${selectedImage === img.url ? "is-active" : ""}`}
                  onClick={() => setSelectedImage(img.url)}
                  style={{ backgroundImage: `url(${img.url})` }}
                  aria-label={`View photo ${index + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Info & Actions */}
        <div className="pdp-info">
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="streetwear-sticker sticker-inline-cyan" style={{ padding: "4px 10px", fontSize: "0.75rem" }}>
              ⚡ 100% PURE COTTON
            </span>
            <p className="eyebrow" style={{ margin: 0 }}>
              {product.productType || "Everyday Essential"}
            </p>
          </div>

          <h1 className="pdp-title">{product.title}</h1>
          <div className="pdp-price">Rs. {price}</div>

          {/* Option Selectors: Clean Separated Color & Size */}
          <div className="pdp-variants">
            {/* 1. Choose Colour */}
            {colors.length > 0 && (
              <div className="pdp-option-group">
                <div className="pdp-variants__label">
                  <span>Choose Colour:</span>
                  <strong>{selectedColor}</strong>
                </div>
                <div className="pdp-color-swatches">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;
                    const hex = getColorHex(color);
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
                        <span>{color}</span>
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
          <div className="pdp-actions">
            <button
              className="button button--dark button--full"
              onClick={handleBuyNow}
              disabled={isCheckingOut || !isAvailable}
              style={{
                boxShadow: isAvailable ? "4px 4px 0px #00F5D4" : "none",
              }}
            >
              <ShoppingBag size={18} />
              {isCheckingOut
                ? "Securing Checkout..."
                : isAvailable
                ? "Buy Now – Instant Checkout"
                : "Out of Stock for this Selection"}
            </button>
          </div>

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
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
