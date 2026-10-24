export interface OptimizedImageResult {
  file: File;
  previewUrl: string;
}

const DEFAULT_AVATAR_SIZE = 512;
const DEFAULT_WEBP_QUALITY = 0.82;

function loadImageElement(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No s'ha pogut processar la imatge seleccionada."));
    img.src = src;
  });
}

/**
 * Center-crops and resizes an image file to a square WebP on the client using Canvas.
 */
export async function optimizeAvatarToWebp(
  sourceFile: File,
  targetSize: number = DEFAULT_AVATAR_SIZE,
  quality: number = DEFAULT_WEBP_QUALITY,
): Promise<OptimizedImageResult> {
  const sourceUrl = URL.createObjectURL(sourceFile);

  try {
    const img = await loadImageElement(sourceUrl);
    const width = img.naturalWidth || img.width || targetSize;
    const height = img.naturalHeight || img.height || targetSize;

    const cropSide = Math.min(width, height);
    const sx = Math.floor((width - cropSide) / 2);
    const sy = Math.floor((height - cropSide) / 2);
    const outputSide = Math.min(targetSize, cropSide);

    const canvas = document.createElement('canvas');
    canvas.width = outputSide;
    canvas.height = outputSide;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error("No s'ha pogut inicialitzar el llenç de transformació d'imatge.");
    }

    ctx.drawImage(img, sx, sy, cropSide, cropSide, 0, 0, outputSide, outputSide);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob((result) => resolve(result), 'image/webp', quality);
    });

    if (!blob) {
      throw new Error("No s'ha pogut convertir la imatge a format WebP.");
    }

    const baseName = sourceFile.name.replace(/\.[^.]+$/, '') || 'avatar';
    const webpFile = new File([blob], `${baseName}.webp`, { type: 'image/webp' });
    const previewUrl = URL.createObjectURL(webpFile);

    return {
      file: webpFile,
      previewUrl,
    };
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}

