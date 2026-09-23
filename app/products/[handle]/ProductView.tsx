"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ShieldCheck, Truck, RefreshCw, ShoppingBag } from "lucide-react";

export default function ProductView({ product }: { product: any }) {
  const images = product.images?.edges?.map((e: any) => e.node) || [];
  const variants = product.variants?.edges?.map((e: any) => e.node) || [];
  const [selectedImage, setSelectedImage] = useState(images[0]?.url || "");
  const [selectedVariantId, setSelectedVariantId] = useState(variants[0]?.id || "");
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const selectedVariant = variants.find((v: any) => v.id === selectedVariantId) || variants[0];
  const price = selectedVariant?.price?.amount || product.priceRange?.minVariantPrice?.amount;

  async function handleBuyNow() {
    if (!selectedVariantId) return;
    setIsCheckingOut(true);

    try {
      const res = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: [{ merchandiseId: selectedVariantId, quantity: 1 }],
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
          <p className="eyebrow">{product.productType || "Comfort Essential"}</p>
          <h1 className="pdp-title">{product.title}</h1>
          <div className="pdp-price">Rs. {price}</div>

          {/* Variants / Size Picker */}
          {variants.length > 1 && (
            <div className="pdp-variants">
              <label className="pdp-variants__label">
                Select Option: <strong>{selectedVariant?.title}</strong>
              </label>
              <div className="pdp-variants__grid">
                {variants.map((variant: any) => (
                  <button
                    key={variant.id}
                    className={`pdp-variant-btn ${
                      selectedVariantId === variant.id ? "is-selected" : ""
                    }`}
                    onClick={() => setSelectedVariantId(variant.id)}
                  >
                    {variant.title}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pdp-actions">
            <button
              className="button button--dark button--full"
              onClick={handleBuyNow}
              disabled={isCheckingOut || !selectedVariant?.availableForSale}
            >
              <ShoppingBag size={18} />
              {isCheckingOut
                ? "Securing Checkout..."
                : selectedVariant?.availableForSale !== false
                ? "Buy Now – Instant Checkout"
                : "Out of Stock"}
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
              <span>100% Super Combed Pure Cotton</span>
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
