import { ProcessedImageResult } from '../types';

export interface ProcessImageOptions {
  maxSize?: number; // Default 1600
  thumbSize?: number; // Default 400
  quality?: number; // Default 0.75
  format?: 'image/webp' | 'image/jpeg';
}

/**
 * Pipeline de otimização de imagem 100% Client-side
 * - Redimensiona para até 1600px (Imagem Principal)
 * - Redimensiona para até 400px (Thumbnail)
 * - Converte para WebP (com fallback para JPEG)
 * - Aplica compressão ~75%
 * - Corringe orientação via Canvas
 */
export async function processImageFile(
  file: File,
  options: ProcessImageOptions = {}
): Promise<ProcessedImageResult> {
  const maxSize = options.maxSize || 1600;
  const thumbSize = options.thumbSize || 400;
  const quality = options.quality ?? 0.75;
  const preferredFormat = options.format || 'image/webp';

  const originalSize = file.size;

  // Carregar imagem em elemento Image
  const image = await loadImage(file);
  const { width: origWidth, height: origHeight } = image;

  // Processar Imagem Principal (Max 1600px)
  const { dataUrl: mainDataUrl, width: mainW, height: mainH } = resizeAndCompress(
    image,
    maxSize,
    quality,
    preferredFormat
  );

  // Processar Thumbnail (Max 400px)
  const { dataUrl: thumbDataUrl } = resizeAndCompress(
    image,
    thumbSize,
    0.7,
    preferredFormat
  );

  // Calcular tamanhos aproximados em bytes
  const mainSize = estimateBase64Size(mainDataUrl);
  const thumbSizeInBytes = estimateBase64Size(thumbDataUrl);

  return {
    main: mainDataUrl,
    thumb: thumbDataUrl,
    originalSize,
    mainSize,
    thumbSize: thumbSizeInBytes,
    width: mainW,
    height: mainH,
    format: preferredFormat.replace('image/', ''),
  };
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error('Erro ao carregar arquivo de imagem: ' + err));
      img.src = e.target?.result as string;
    };
    reader.onerror = (err) => reject(new Error('Erro ao ler arquivo: ' + err));
    reader.readAsDataURL(file);
  });
}

function resizeAndCompress(
  img: HTMLImageElement,
  maxDim: number,
  quality: number,
  mimeType: string
): { dataUrl: string; width: number; height: number } {
  let { width, height } = img;

  // Calcular dimensões proporcionalmente
  if (width > maxDim || height > maxDim) {
    if (width > height) {
      height = Math.round((height * maxDim) / width);
      width = maxDim;
    } else {
      width = Math.round((width * maxDim) / height);
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Não foi possível obter contexto 2D do Canvas.');
  }

  // Desenhar com suavização de imagem
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(img, 0, 0, width, height);

  // Tentar exportar em WebP, com fallback em JPEG
  let dataUrl = canvas.toDataURL(mimeType, quality);
  if (mimeType === 'image/webp' && !dataUrl.startsWith('data:image/webp')) {
    dataUrl = canvas.toDataURL('image/jpeg', quality);
  }

  return { dataUrl, width, height };
}

function estimateBase64Size(dataUrl: string): number {
  const base64Str = dataUrl.split(',')[1] || '';
  return Math.round((base64Str.length * 3) / 4);
}

export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
