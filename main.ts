// One emoji for kebumen.ai: 🤫 — the agent that works in silence and only
// speaks when the USDC has actually landed. U+1F92B SHUSHING FACE:
// a single code point, one grapheme cluster, 4 bytes of UTF-8.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const EMOJI = "\u{1F92B}";

function isPictographic(cp: number): boolean {
  // U+FE0F (variation selector) and U+200D (zero width joiner) are allowed
  // as connectors inside an emoji sequence; everything else must be pictographic.
  if (cp === 0xfe0f || cp === 0x200d) return true;
  return /\p{Extended_Pictographic}/u.test(String.fromCodePoint(cp));
}

function validate(entry: string): void {
  if (entry.length < 1 || entry.length > 8) {
    throw new Error(`entry must be 1-8 characters, got ${entry.length}`);
  }
  // The gate counts characters, but a tie-break also favours fewer bytes:
  // refuse anything outside the 1-16 byte window as well.
  const byteLen = Buffer.byteLength(entry, "utf8");
  if (byteLen < 1 || byteLen > 16) {
    throw new Error(`entry must be 1-16 bytes, got ${byteLen}`);
  }
  if (entry.trim() !== entry || /\s/.test(entry)) {
    throw new Error("entry must not contain whitespace");
  }
  const clusters = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(entry)];
  if (clusters.length !== 1) {
    throw new Error(`entry must be exactly one grapheme cluster, got ${clusters.length}`);
  }
  // The single grapheme must be the whole entry, not a prefix of it.
  if (clusters[0].segment !== entry) {
    throw new Error("single grapheme cluster does not cover the whole entry");
  }
  for (const cp of entry) {
    if (!isPictographic(cp.codePointAt(0)!)) {
      throw new Error(`code point U+${cp.codePointAt(0)!.toString(16).toUpperCase()} is not pictographic`);
    }
  }
}

validate(EMOJI);
const outDir = process.env.OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "entry.txt"), EMOJI, "utf8");
