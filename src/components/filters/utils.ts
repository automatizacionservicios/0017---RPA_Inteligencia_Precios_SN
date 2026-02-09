export const parseGramsFromPresentation = (presentation: string): number | null => {
  const match = presentation.match(/(\d+(?:\.\d+)?)\s*(?:g|kg)/i);
  if (!match) return null;
  const value = parseFloat(match[1]);
  return presentation.toLowerCase().includes('kg') ? value * 1000 : value;
};
