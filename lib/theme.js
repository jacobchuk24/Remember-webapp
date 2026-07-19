function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  const int = parseInt(n, 16);
  return { r: (int >> 16) & 255, g: (int >> 8) & 255, b: int & 255 };
}
function rgbToHex({ r, g, b }) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}
function mix(hexA, hexB, weight) {
  const a = hexToRgb(hexA);
  const b = hexToRgb(hexB);
  return rgbToHex({
    r: a.r + (b.r - a.r) * weight,
    g: a.g + (b.g - a.g) * weight,
    b: a.b + (b.b - a.b) * weight,
  });
}
function luminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rs, gs, bs] = [r, g, b].map((v) => v / 255);
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}
function readableText(bgHex) {
  return luminance(bgHex) > 0.55 ? "#3A342B" : "#F6F1E6";
}

export function derivePalette({ primary_color, accent_color, background_color }) {
  const isDarkBg = luminance(background_color) < 0.55;
  const charcoal = readableText(background_color);
  return {
    forest: primary_color,
    forestDeep: mix(primary_color, "#000000", 0.28),
    onForest: readableText(primary_color),
    gold: accent_color,
    goldSoft: mix(accent_color, "#ffffff", 0.35),
    onGold: readableText(accent_color),
    cream: background_color,
    card: mix(background_color, "#ffffff", isDarkBg ? 0.08 : 0.5),
    charcoal,
    charcoalSoft: mix(charcoal, background_color, 0.45),
    line: mix(background_color, charcoal, isDarkBg ? 0.35 : 0.14),
  };
}
