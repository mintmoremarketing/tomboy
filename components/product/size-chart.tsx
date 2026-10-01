"use client";

import { useEffect, useState } from "react";
import { Ruler, X } from "lucide-react";
import { sizeKey, type SizeChart } from "@/data/size-charts";

const cm = (inches: number) => Math.round(inches * 2.54);

// "Size chart" link + sheet. Shows the store's own chart image when the product has one
// in Shopify, otherwise the matching standard chart (only the sizes this product comes in).
export function SizeChartLink({
  chart,
  imageUrl,
  sizes,
  selectedSize,
}: {
  chart: SizeChart | null;
  imageUrl?: string | null;
  sizes: string[];
  selectedSize?: string;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!chart && !imageUrl) return null;

  // rows for the sizes this product actually comes in (all rows if none match)
  const wanted = new Set(sizes.map(sizeKey));
  const allRows = chart ? Object.entries(chart.rows) : [];
  const matching = allRows.filter(([size]) => wanted.has(sizeKey(size)));
  const rows = matching.length ? matching : allRows;

  return (
    <>
      <button type="button" className="size-chart-link" onClick={() => setOpen(true)}>
        <Ruler size={15} aria-hidden /> Size chart
      </button>

      {open && (
        <div className="pdp-sheet size-chart" role="dialog" aria-modal="true" aria-label="Size chart">
          <button className="pdp-sheet__backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="pdp-sheet__panel size-chart__panel">
            <div className="size-chart__head">
              <div>
                <p className="size-chart__eyebrow">Size chart</p>
                <h3>{chart?.title ?? "Sizing"}</h3>
              </div>
              <button className="icon-button" aria-label="Close" onClick={() => setOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="size-chart__body">
              {imageUrl ? (
                <img className="size-chart__image" src={imageUrl} alt="Size chart" />
              ) : (
                chart && (
                  <>
                    <p className="size-chart__note">Body measurements in inches (centimetres in brackets).</p>
                    <div className="size-chart__table-wrap">
                      <table className="size-chart__table">
                        <thead>
                          <tr>
                            <th scope="col">Size</th>
                            {chart.columns.map((c) => (
                              <th scope="col" key={c}>
                                {c}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {rows.map(([size, values]) => (
                            <tr key={size} className={selectedSize && sizeKey(size) === sizeKey(selectedSize) ? "is-current" : undefined}>
                              <th scope="row">{size}</th>
                              {values.map((v, i) => (
                                <td key={i}>
                                  {typeof v === "string" ? (
                                    v
                                  ) : (
                                    <>
                                      {v[0]}–{v[1]}
                                      <small>
                                        {" "}
                                        ({cm(v[0])}–{cm(v[1])})
                                      </small>
                                    </>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="size-chart__how">
                      <p className="size-chart__eyebrow">How to measure</p>
                      <ul>
                        {chart.howToMeasure.map((tip) => (
                          <li key={tip}>{tip}</li>
                        ))}
                      </ul>
                    </div>
                  </>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
