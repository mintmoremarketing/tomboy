// Scout's warm word on a colour pick. Compliments the choice (never the shopper's body),
// matched to the colour family, with a few versions so it doesn't repeat itself.

const BY_FAMILY: [RegExp, string[]][] = [
  [/\bblack\b/i, ["{c} is a classic. It goes with literally everything.", "Can't go wrong with {c}. Sharp, easy, and it never looks washed out."]],
  [/\b(navy|charcoal|dark gr[ae]y)\b/i, ["{c} is such a smart pick. Clean, grown-up and easy to style.", "Love {c}. It looks polished without trying too hard."]],
  [/\b(white|off-white|cream|ivory)\b/i, ["{c} looks so fresh. A proper wardrobe essential.", "Crisp choice. {c} always looks put-together."]],
  [/\b(gr[ae]y|grey melange|light gr[ae]y)\b/i, ["{c} is the ultimate easy-wear colour. Goes with everything.", "Nice, {c} is low-key and super versatile."]],
  [/\b(red|maroon|burgundy|wine)\b/i, ["Ooh, {c}! Bold pick. This one gets noticed.", "{c} is a statement. Confident choice, love it."]],
  [/\b(blue|royal|teal|sky|aqua|cobalt)\b/i, ["{c} is such a good colour. Bright without being loud.", "Great eye. {c} looks fresh on almost everyone."]],
  [/\b(green|olive|bottle green|mint)\b/i, ["{c} is a great pick. Earthy, easy and a bit different.", "Love {c}. It stands out without trying too hard."]],
  [/\b(pink|peach|lavender|purple|coral)\b/i, ["{c} is gorgeous. Soft and fun.", "Ooh, {c}! Such a happy colour."]],
  [/\b(yellow|mustard|orange)\b/i, ["{c}! Sunny and bold. This one's a mood.", "Fun pick. {c} brings the energy."]],
];

const GENERIC = ["Great pick. {c} looks really good on this one.", "Nice choice. {c} is a good look."];

// stable per product + colour, so the same pick always gets the same line
function pickOne(options: string[], seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return options[Math.abs(h) % options.length];
}

export function colourCompliment(colour: string, seed = "") {
  const options = BY_FAMILY.find(([re]) => re.test(colour))?.[1] ?? GENERIC;
  return pickOne(options, seed + colour).replaceAll("{c}", colour);
}
