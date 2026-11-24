// ProductImage.jsx - larawan ng product (Gulayan / Prutasan)
// 1) Kung may file sa  public/products/<pangalan>.png  (hal. mango.png), iyon ang ipapakita (totoong photo).
// 2) Kung wala, gagamit ng drawn na larawan sa ibaba. 3) Kung wala pa rin, letra ng product.
import { useState } from 'react';

const LEAF = '<path d="M32 16c2-6 10-8 14-6-2 6-8 8-14 6z" fill="#3f9a3c"/>';
const ICONS = {
  mango: '<ellipse cx="32" cy="36" rx="21" ry="17" fill="#f6b21b"/><ellipse cx="38" cy="32" rx="9" ry="7" fill="#f08a1c" opacity=".5"/>' + LEAF,
  saging: '<path d="M12 20c4 26 28 36 44 26-18 2-30-8-34-28z" fill="#f7d02c"/><path d="M18 14c4 22 24 34 40 26-16 0-28-10-30-26z" fill="#fbe05a"/><rect x="10" y="12" width="8" height="8" rx="2" fill="#7a5a2a"/>',
  bayabas: '<circle cx="32" cy="36" r="20" fill="#8fc86a"/><circle cx="38" cy="38" r="11" fill="#f9d9d9"/><circle cx="38" cy="38" r="5" fill="#f08a9a"/>' + LEAF,
  pakwan: '<path d="M6 24a26 26 0 0 0 52 0z" fill="#2f8f3f"/><path d="M10 24a22 22 0 0 0 44 0z" fill="#e8384f"/><g fill="#222"><circle cx="24" cy="34" r="1.8"/><circle cx="32" cy="40" r="1.8"/><circle cx="40" cy="34" r="1.8"/></g>',
  pinya: '<ellipse cx="32" cy="40" rx="15" ry="19" fill="#f2a81d"/><path d="M20 32l24 16M44 32L20 48M32 22v36" stroke="#b87410" stroke-width="1.5"/><path d="M32 22l-9-15 9 6 9-6z" fill="#3f9a3c"/>',
  dalanghita: '<circle cx="32" cy="36" r="21" fill="#f58a1f"/><circle cx="25" cy="29" r="4" fill="#fff" opacity=".3"/>' + LEAF,
  ubas: '<g fill="#7a2f8a"><circle cx="22" cy="30" r="8"/><circle cx="38" cy="30" r="8"/><circle cx="30" cy="42" r="8"/><circle cx="22" cy="46" r="6"/><circle cx="38" cy="46" r="6"/></g><path d="M30 20c0-6 8-10 14-8" stroke="#3f9a3c" stroke-width="4" fill="none"/>',
  lanzones: '<g fill="#e6c77a" stroke="#c9a44a"><circle cx="20" cy="28" r="9"/><circle cx="38" cy="26" r="9"/><circle cx="28" cy="42" r="9"/><circle cx="44" cy="42" r="8"/><circle cx="14" cy="44" r="7"/></g>',
  kangkong: '<g fill="#3f9a3c"><ellipse cx="20" cy="26" rx="7" ry="14" transform="rotate(-30 20 26)"/><ellipse cx="44" cy="26" rx="7" ry="14" transform="rotate(30 44 26)"/><ellipse cx="32" cy="24" rx="7" ry="16"/></g><path d="M32 40v16" stroke="#6aa84a" stroke-width="4"/>',
  pechay: '<path d="M26 58l-4-28h20l-4 28z" fill="#e8f1d8"/><path d="M22 30c-12-4-14-18-6-22 6 2 10 10 10 22zM42 30c12-4 14-18 6-22-6 2-10 10-10 22zM32 30c-8-6-6-20 0-24 6 4 8 18 0 24z" fill="#3f9a3c"/>',
  talong: '<path d="M44 14c8 8 4 30-12 40-8 4-16 0-14-6 2-8 14-8 18-20 2-6 4-12 8-14z" fill="#5b2a73"/><path d="M44 14c-6-4-12 0-12 4l10 2z" fill="#3f9a3c"/>',
  sitaw: '<g stroke="#4aa34a" stroke-width="3.5" fill="none" stroke-linecap="round"><path d="M8 22c16 4 32-2 48 2"/><path d="M8 32c16 4 32-2 48 2"/><path d="M8 42c16 4 32-2 48 2"/></g>',
  okra: '<path d="M10 20c12 0 40 10 44 24-14 0-38-6-44-24z" fill="#4f9d3f"/><path d="M14 42c12-4 36-2 42 8-14 4-34 0-42-8z" fill="#6bb54b"/>',
  repolyo: '<circle cx="32" cy="34" r="22" fill="#9fd47a"/><path d="M32 12c-10 12-10 32 0 44M32 12c10 12 10 32 0 44M12 34c12-6 28-6 40 0" stroke="#6aa84a" stroke-width="2" fill="none"/>',
  kamatis: '<circle cx="32" cy="36" r="21" fill="#e53a2f"/><path d="M22 18l10 6 10-6-4 9-6-3-6 3z" fill="#3f9a3c"/>',
  sibuyas: '<ellipse cx="32" cy="38" rx="20" ry="18" fill="#a83e7c"/><path d="M32 20c-8 8-8 28 0 36M32 20c8 8 8 28 0 36" stroke="#7c2559" stroke-width="1.5" fill="none"/><path d="M32 20l-3-10h6z" fill="#d9a05a"/>',
};

const slug = (name = '') => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

export default function ProductImage({ name, size = 72 }) {
  const key = slug(name);
  const [photoIndex, setPhotoIndex] = useState(0);
  const extensions = ['png', 'jpg', 'jpeg', 'webp'];
  const photoFailed = photoIndex >= extensions.length;
  const box = { width: size, height: size, display: 'inline-grid', placeItems: 'center', flexShrink: 0 };

  if (!photoFailed) {
    return (
      <span style={box}>
        <img src={`/products/${key}.${extensions[photoIndex]}`} alt={name} width={size} height={size}
          style={{ objectFit: 'contain' }} onError={() => setPhotoIndex((i) => i + 1)} />
      </span>
    );
  }
  if (ICONS[key]) {
    return <svg viewBox="0 0 64 64" width={size} height={size} role="img" aria-label={name} style={{ flexShrink: 0 }} dangerouslySetInnerHTML={{ __html: ICONS[key] }} />;
  }
  return <span style={{ ...box, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--accent-dark)', fontWeight: 700, fontSize: size * 0.45 }}>{(name || '?')[0].toUpperCase()}</span>;
}
