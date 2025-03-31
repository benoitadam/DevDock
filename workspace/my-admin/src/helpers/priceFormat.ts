export const priceFormat = (price: number) => {
  const v = Math.round(price * 100)
    .toString()
    .padStart(3, "0");
  const n = v.substring(0, v.length - 2);
  const d = v.substring(v.length - 2);

  return [n ? n : "0", d ? `,${d}` : ""];
};
