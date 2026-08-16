/**
 * O'zbekistonda Yandex Maps eng ko'p ishlatiladigan xarita xizmati —
 * "Yo'nalish" tugmasi shu orqali ochiladi (Google Maps'ga bog'liq emas).
 */
export function yandexDirectionsUrl(lat: number, lng: number, label?: string): string {
  const point = `${lng},${lat}`;
  const params = new URLSearchParams({
    rtext: `~${lat},${lng}`,
    rtt: "auto",
  });
  if (label) params.set("text", label);
  return `https://yandex.com/maps/?${params.toString()}&pt=${point}`;
}
