/** The generator a seed drives: xorshift32 started from the string's hash, never zero. */
function seededRandom(seed: string): () => number {
  let state = 0;
  for (let i = 0; i < seed.length; i++) state = (state * 31 + seed.charCodeAt(i)) >>> 0;
  state = state || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return state / 4294967296;
  };
}

/**
 * A stand-in voice shape for a {@link SiteWave} that has no measured levels (an illustration, a
 * sample not loaded yet): a speech-like envelope of syllables and the odd pause, smoothed, one level
 * per bar between 0.07 and 1. The same seed always draws the same shape, so a picture never moves
 * between renders; it is the generator the reference design's waveform draws with.
 */
export function seededLevels(seed: string, count: number): number[] {
  const random = seededRandom(seed);
  const out: number[] = [];
  let envelope = 0.3;
  for (let i = 0; i < count; i++) {
    const syllable = 0.5 + 0.5 * Math.sin(i * 1.25 + random() * 1.4);
    const gap = random() < 0.07 ? 0.1 : 1;
    envelope = envelope * 0.5 + syllable * gap * 0.5;
    out.push(Math.min(1, Math.max(0.07, envelope * (0.45 + 0.65 * random()))));
  }
  return out;
}
