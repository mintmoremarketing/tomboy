import React from "react";

interface LensDriftTextProps {
  children?: string;
  className?: string;
}

export function LensDriftText({
  children = "FOCUS",
  className,
}: LensDriftTextProps) {
  const text = children;
  const chars = text.split("");

  return (
    <div
      className={className ? `fx-focus ${className}` : "fx-focus"}
      role="img"
      aria-label={text}
    >
      {chars.map((char, index) => (
        <b
          key={index}
          aria-hidden="true"
          style={{ "--i": index } as React.CSSProperties}
        >
          {char === " " ? "\u00A0" : char}
        </b>
      ))}
    </div>
  );
}

export const FlipText = LensDriftText;
export const FlowingText = LensDriftText;
export default LensDriftText;
