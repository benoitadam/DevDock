const resizeImage = async ({ input, inputType, width }: {
    input: string,
    inputType: 'image/jpeg'|'image/png',
    width: number,
}): Promise<Blob|null> => {
    const image = new Image();

    await new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = (err) => reject(err);
        image.src = `data:${inputType};base64,${input}`;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Calculer la hauteur proportionnelle
    const scaleFactor = width / image.width;
    const height = image.height * scaleFactor;

    // Redimensionner le canvas
    canvas.width = width;
    canvas.height = height;

    // Dessiner l'image redimensionnée sur le canvas
    ctx.drawImage(image, 0, 0, width, height);

    const blob = await new Promise<Blob|null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg');
    });

    return blob;
}

export default resizeImage;