/**
 * Rewrite style options for paraphrasing.
 */
export const REWRITE_STYLES = [
  "Simple",
  "Formal",
  "Professional",
  "Marketing",
  "Shorter",
  "More detailed",
] as const;

export type RewriteStyle = (typeof REWRITE_STYLES)[number];

/**
 * Maps each rewrite style to the instruction string used in the AI prompt.
 */
export const REWRITE_STYLE_INSTRUCTIONS: Record<RewriteStyle, string> = {
  Simple: "Rewrite in simple, everyday language.",
  Formal: "Rewrite in a formal, academic tone.",
  Professional: "Rewrite in a professional, business-appropriate tone.",
  Marketing: "Rewrite in a persuasive, marketing-friendly style.",
  Shorter: "Rewrite to be shorter and more concise.",
  "More detailed": "Rewrite with more detail and elaboration.",
};

export function isRewriteStyle(value: string): value is RewriteStyle {
  return REWRITE_STYLES.includes(value as RewriteStyle);
}
