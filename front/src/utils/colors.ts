/**
 * Utilitários de cores para o Catálogo Express
 */

/**
 * Converte Hex para RGB
 */
export function hexToRgb(hexColor?: string): { r: number; g: number; b: number } {
  if (!hexColor || !hexColor.startsWith('#')) return { r: 245, g: 247, b: 251 };
  let hex = hexColor.replace('#', '').trim();
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 0;
  const g = parseInt(hex.substring(2, 4), 16) || 0;
  const b = parseInt(hex.substring(4, 6), 16) || 0;
  return { r, g, b };
}

/**
 * Converte RGB para Hexadecimal
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Escurece uma cor hexadecimal por uma porcentagem (ex: 40% = 0.40),
 * preservando com precisão o tom (hue) e saturação originais.
 */
export function darkenColor(hexColor: string | undefined, percent: number = 0.40): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#1E1E1E';
  const { r, g, b } = hexToRgb(hexColor);
  const factor = Math.max(0, 1 - percent);
  return rgbToHex(r * factor, g * factor, b * factor);
}

/**
 * Clareia uma cor hexadecimal por uma porcentagem
 */
export function lightenColor(hexColor: string | undefined, percent: number = 0.20): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';
  const { r, g, b } = hexToRgb(hexColor);
  return rgbToHex(r + (255 - r) * percent, g + (255 - g) * percent, b + (255 - b) * percent);
}

/**
 * Retorna '#FFFFFF' ou '#0F172A' para garantir alto contraste e legibilidade
 * sobre uma cor de fundo em formato hexadecimal.
 */
export function getContrastText(hexColor?: string): string {
  if (!hexColor || !hexColor.startsWith('#')) return '#FFFFFF';
  const { r, g, b } = hexToRgb(hexColor);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 140 ? '#0F172A' : '#FFFFFF';
}
