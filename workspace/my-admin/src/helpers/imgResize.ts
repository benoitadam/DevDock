export function imgFromBase64(base64: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = base64;
  });
}

export default async function imgResize(base64: string | HTMLImageElement, width = 400, height = 400) {
  try {
    const image = typeof base64 === 'string' ? await imgFromBase64(base64) : base64;
    const canvas = document.createElement('canvas'),
      ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no ctx');
    canvas.width = Math.round(width);
    canvas.height = Math.round(height);
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/jpeg', 0.8);
    return result;
  } catch (err) {
    console.error('imgResize', err);
    throw err;
  }
}
