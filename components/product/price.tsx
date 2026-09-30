// Price with the original (Shopify "compare-at") price struck through and the % saved.
// Only shows a saving when the store actually set a higher compare-at price.

export const rupees = (n: number) => `₹${Math.round(n).toLocaleString("en-IN")}`;

export function Price({
  amount,
  compareAt,
  size = "md",
  showBadge = true,
  className = "",
}: {
  amount: number | string | null | undefined;
  compareAt?: number | string | null;
  size?: "sm" | "md" | "lg";
  showBadge?: boolean;
  className?: string;
}) {
  const now = Number(amount) || 0;
  const was = Number(compareAt) || 0;
  const onSale = was > now && now > 0;
  const off = onSale ? Math.round(((was - now) / was) * 100) : 0;

  return (
    <span className={`price price--${size}${onSale ? " price--sale" : ""} ${className}`.trim()}>
      <span className="price__now">{rupees(now)}</span>
      {onSale && (
        <>
          <s className="price__was" aria-label={`was ${rupees(was)}`}>
            {rupees(was)}
          </s>
          {showBadge && <span className="price__off">{off}% off</span>}
        </>
      )}
    </span>
  );
}
