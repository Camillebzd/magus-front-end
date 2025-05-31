export function dottingDataToPng(
  dottingData: Map<number, Map<number, { color: string }>>,
  pixelSize = 1
): string {
  // Get the bounds
  const rows = Array.from(dottingData.keys());
  const cols = Array.from(
    new Set(rows.flatMap(row => Array.from(dottingData.get(row)?.keys() ?? [])))
  );
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  const width = (maxCol - minCol + 1) * pixelSize;
  const height = (maxRow - minRow + 1) * pixelSize;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  for (let row = minRow; row <= maxRow; row++) {
    const colMap = dottingData.get(row);
    if (!colMap) continue;
    for (let col = minCol; col <= maxCol; col++) {
      const pixel = colMap.get(col);
      if (pixel && pixel.color && pixel.color !== 'transparent' && pixel.color !== '') {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(
          (col - minCol) * pixelSize,
          (row - minRow) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  // Export as PNG data URL
  return canvas.toDataURL('image/png');
}

export async function pngToDottingData(
  imageSrc: string, // can be a data URL or a normal URL
  width: number,
  height: number
): Promise<Map<number, Map<number, { color: string }>>> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return reject("No canvas context");
      ctx.imageSmoothingEnabled = false; // <--- Add this line!
      ctx.drawImage(img, 0, 0, width, height);
      const imageData = ctx.getImageData(0, 0, width, height).data;

      const dottingData = new Map<number, Map<number, { color: string }>>();
      for (let y = 0; y < height; y++) {
        const row = new Map<number, { color: string }>();
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          const r = imageData[idx];
          const g = imageData[idx + 1];
          const b = imageData[idx + 2];
          const a = imageData[idx + 3];
          if (a === 0) {
            row.set(x, { color: "" });
          } else {
            const color = `rgba(${r},${g},${b},${a / 255})`;
            row.set(x, { color });
          }
        }
        if (row.size > 0) {
          dottingData.set(y, row);
        }
      }
      resolve(dottingData);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

export function dataURLtoBlob(dataurl: string) {
  if (!dataurl || dataurl.length == 0) return new Blob();
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || '';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

export function dottingDataToBlob(
  dottingData: Map<number, Map<number, { color: string }>>,
  pixelSize = 1
): Blob | null {
  // Get the bounds
  const rows = Array.from(dottingData.keys());
  const cols = Array.from(
    new Set(rows.flatMap(row => Array.from(dottingData.get(row)?.keys() ?? [])))
  );
  if (rows.length === 0 || cols.length === 0) return null;

  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);

  const width = (maxCol - minCol + 1) * pixelSize;
  const height = (maxRow - minRow + 1) * pixelSize;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.clearRect(0, 0, width, height);

  for (let row = minRow; row <= maxRow; row++) {
    const colMap = dottingData.get(row);
    if (!colMap) continue;
    for (let col = minCol; col <= maxCol; col++) {
      const pixel = colMap.get(col);
      if (pixel && pixel.color && pixel.color !== 'transparent' && pixel.color !== '') {
        ctx.fillStyle = pixel.color;
        ctx.fillRect(
          (col - minCol) * pixelSize,
          (row - minRow) * pixelSize,
          pixelSize,
          pixelSize
        );
      }
    }
  }

  // Synchronous: get data URL and convert to Blob
  const dataUrl = canvas.toDataURL('image/png');
  return dataURLtoBlob(dataUrl);
}