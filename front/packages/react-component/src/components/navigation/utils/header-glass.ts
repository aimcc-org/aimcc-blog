/** A neutral center and a rounded refractive bezel; generated only on resize. */
export function createGlassMap(width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) return "";
  const image = context.createImageData(width, height);
  const radius = Math.min(18, height / 2);
  const distance = (x: number, y: number) => {
    const qx = Math.abs(x - width / 2) - (width / 2 - radius);
    const qy = Math.abs(y - height / 2) - (height / 2 - radius);
    return (
      Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) +
      Math.min(Math.max(qx, qy), 0) -
      radius
    );
  };
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const edge = distance(x + 0.5, y + 0.5);
      const strength =
        edge <= 0 && edge > -12 ? Math.sin((-edge / 12) * Math.PI) * 0.85 : 0;
      const nx = distance(x + 1, y) - distance(x - 1, y);
      const ny = distance(x, y + 1) - distance(x, y - 1);
      const length = Math.hypot(nx, ny) || 1;
      const i = (y * width + x) * 4;
      image.data[i] = 128 + (nx / length) * strength * 127;
      image.data[i + 1] = 128 + (ny / length) * strength * 127;
      image.data[i + 2] = 128;
      image.data[i + 3] = 255;
    }
  context.putImageData(image, 0, 0);
  return canvas.toDataURL();
}
