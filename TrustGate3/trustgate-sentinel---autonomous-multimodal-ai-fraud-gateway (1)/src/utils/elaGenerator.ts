/**
 * Real client-side Error Level Analysis (ELA) implementation.
 * ELA highlights differences in compression error levels across an image.
 * Resaved/inpainting zones show higher or inconsistent error levels.
 */

export async function generateELACanvas(
  sourceCanvasOrImage: HTMLCanvasElement | HTMLImageElement,
  scaleFactor: number = 20,
  jpegQuality: number = 0.75
): Promise<string> {
  const width =
    'naturalWidth' in sourceCanvasOrImage
      ? sourceCanvasOrImage.naturalWidth || 800
      : sourceCanvasOrImage.width;
  const height =
    'naturalHeight' in sourceCanvasOrImage
      ? sourceCanvasOrImage.naturalHeight || 600
      : sourceCanvasOrImage.height;

  // Offscreen canvas for original
  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext('2d');
  if (!origCtx) return '';

  origCtx.drawImage(sourceCanvasOrImage, 0, 0, width, height);
  const origData = origCtx.getImageData(0, 0, width, height);

  // Recompress as JPEG
  const jpegUrl = origCanvas.toDataURL('image/jpeg', jpegQuality);

  // Load compressed image back
  const compressedImg = new Image();
  await new Promise<void>((resolve, reject) => {
    compressedImg.onload = () => resolve();
    compressedImg.onerror = reject;
    compressedImg.src = jpegUrl;
  });

  const compCanvas = document.createElement('canvas');
  compCanvas.width = width;
  compCanvas.height = height;
  const compCtx = compCanvas.getContext('2d');
  if (!compCtx) return '';

  compCtx.drawImage(compressedImg, 0, 0, width, height);
  const compData = compCtx.getImageData(0, 0, width, height);

  // Output diff canvas
  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return '';

  const outData = outCtx.createImageData(width, height);

  for (let i = 0; i < origData.data.length; i += 4) {
    const dr = Math.abs(origData.data[i] - compData.data[i]) * scaleFactor;
    const dg = Math.abs(origData.data[i + 1] - compData.data[i + 1]) * scaleFactor;
    const db = Math.abs(origData.data[i + 2] - compData.data[i + 2]) * scaleFactor;

    // Heatmap coloring: high difference -> bright cyan/magenta, low difference -> deep dark blue
    const diff = Math.min(255, (dr + dg + db) / 3);

    if (diff < 30) {
      // Background noise
      outData.data[i] = Math.floor(diff * 0.4);
      outData.data[i + 1] = Math.floor(diff * 0.6);
      outData.data[i + 2] = Math.floor(diff * 1.5) + 15;
    } else if (diff < 90) {
      // Moderate compression discrepancy
      outData.data[i] = Math.floor(diff * 0.2);
      outData.data[i + 1] = Math.floor(diff * 1.8);
      outData.data[i + 2] = 255;
    } else {
      // Severe anomaly / tampering inpainting seam (magenta/hot red)
      outData.data[i] = 255;
      outData.data[i + 1] = Math.max(0, 255 - Math.floor(diff * 1.8));
      outData.data[i + 2] = Math.floor(diff * 1.2);
    }
    outData.data[i + 3] = 255;
  }

  outCtx.putImageData(outData, 0, 0);
  return outCanvas.toDataURL('image/png');
}

export async function generateELACanvasElement(
  sourceCanvasOrImage: HTMLCanvasElement | HTMLImageElement,
  scaleFactor: number = 20,
  jpegQuality: number = 0.75
): Promise<{ dataUrl: string; canvas: HTMLCanvasElement }> {
  const width =
    'naturalWidth' in sourceCanvasOrImage
      ? sourceCanvasOrImage.naturalWidth || 800
      : sourceCanvasOrImage.width;
  const height =
    'naturalHeight' in sourceCanvasOrImage
      ? sourceCanvasOrImage.naturalHeight || 600
      : sourceCanvasOrImage.height;

  const origCanvas = document.createElement('canvas');
  origCanvas.width = width;
  origCanvas.height = height;
  const origCtx = origCanvas.getContext('2d');
  if (!origCtx) return { dataUrl: '', canvas: origCanvas };

  origCtx.drawImage(sourceCanvasOrImage, 0, 0, width, height);
  const origData = origCtx.getImageData(0, 0, width, height);

  const jpegUrl = origCanvas.toDataURL('image/jpeg', jpegQuality);

  const compressedImg = new Image();
  await new Promise<void>((resolve, reject) => {
    compressedImg.onload = () => resolve();
    compressedImg.onerror = reject;
    compressedImg.src = jpegUrl;
  });

  const compCanvas = document.createElement('canvas');
  compCanvas.width = width;
  compCanvas.height = height;
  const compCtx = compCanvas.getContext('2d');
  if (!compCtx) return { dataUrl: '', canvas: origCanvas };

  compCtx.drawImage(compressedImg, 0, 0, width, height);
  const compData = compCtx.getImageData(0, 0, width, height);

  const outCanvas = document.createElement('canvas');
  outCanvas.width = width;
  outCanvas.height = height;
  const outCtx = outCanvas.getContext('2d');
  if (!outCtx) return { dataUrl: '', canvas: origCanvas };

  const outData = outCtx.createImageData(width, height);

  for (let i = 0; i < origData.data.length; i += 4) {
    const dr = Math.abs(origData.data[i] - compData.data[i]) * scaleFactor;
    const dg = Math.abs(origData.data[i + 1] - compData.data[i + 1]) * scaleFactor;
    const db = Math.abs(origData.data[i + 2] - compData.data[i + 2]) * scaleFactor;

    const diff = Math.min(255, (dr + dg + db) / 3);

    if (diff < 30) {
      outData.data[i] = Math.floor(diff * 0.4);
      outData.data[i + 1] = Math.floor(diff * 0.6);
      outData.data[i + 2] = Math.floor(diff * 1.5) + 15;
    } else if (diff < 90) {
      outData.data[i] = Math.floor(diff * 0.2);
      outData.data[i + 1] = Math.floor(diff * 1.8);
      outData.data[i + 2] = 255;
    } else {
      outData.data[i] = 255;
      outData.data[i + 1] = Math.max(0, 255 - Math.floor(diff * 1.8));
      outData.data[i + 2] = Math.floor(diff * 1.2);
    }
    outData.data[i + 3] = 255;
  }

  outCtx.putImageData(outData, 0, 0);
  return { dataUrl: outCanvas.toDataURL('image/png'), canvas: outCanvas };
}
