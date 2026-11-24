// LoginArt.jsx - mga drawing (SVG) ng Gulayan, Prutasan, at Babuyan para sa login page.
// Walang image file na kailangan. Para palitan ang kulay, baguhin ang "fill" sa bawat drawing.

// Gulayan: carrot na may dahon
export function VeggieArt() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Vegetables">
      <path d="M60 40 C42 8 26 22 40 42 Z" fill="#43a047" />
      <path d="M60 40 C58 2 82 6 76 40 Z" fill="#66bb6a" />
      <path d="M60 40 C78 12 98 24 80 44 Z" fill="#2e7d32" />
      <path d="M40 42 Q60 30 80 42 Q72 82 60 112 Q48 82 40 42 Z" fill="#ff8a3d" />
      <path d="M49 58 h11 M57 73 h10 M54 88 h7" stroke="#e8690f" strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="50" cy="48" rx="4" ry="8" fill="#fff" opacity="0.28" transform="rotate(10 50 48)" />
    </svg>
  );
}

// Prutasan: prutas (kahel/mangga) na may dahon
export function FruitArt() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Fruits">
      <path d="M60 36 C38 24 16 40 20 70 C24 98 46 112 60 104 C74 112 96 98 100 70 C104 40 82 24 60 36 Z" fill="#ffa21f" />
      <path d="M60 36 C38 24 16 40 20 70 C24 98 46 112 60 104 Z" fill="#ff8f00" opacity="0.35" />
      <ellipse cx="42" cy="60" rx="8" ry="14" fill="#fff" opacity="0.3" transform="rotate(20 42 60)" />
      <path d="M60 36 Q58 22 66 12" stroke="#6d4c41" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M64 26 Q82 12 94 24 Q80 38 64 26 Z" fill="#4caf50" />
    </svg>
  );
}

// Babuyan: baboy
export function PigArt() {
  return (
    <svg viewBox="0 0 120 120" role="img" aria-label="Pig">
      <path d="M28 44 L20 12 L54 28 Z" fill="#f48fb1" />
      <path d="M92 44 L100 12 L66 28 Z" fill="#f48fb1" />
      <ellipse cx="60" cy="66" rx="40" ry="35" fill="#f8bbd0" />
      <circle cx="38" cy="74" r="6" fill="#f48fb1" opacity="0.6" />
      <circle cx="82" cy="74" r="6" fill="#f48fb1" opacity="0.6" />
      <circle cx="45" cy="56" r="5" fill="#3e2723" />
      <circle cx="75" cy="56" r="5" fill="#3e2723" />
      <circle cx="46.5" cy="54.5" r="1.6" fill="#fff" />
      <circle cx="76.5" cy="54.5" r="1.6" fill="#fff" />
      <ellipse cx="60" cy="78" rx="17" ry="13" fill="#f06292" />
      <circle cx="54" cy="78" r="3" fill="#880e4f" />
      <circle cx="66" cy="78" r="3" fill="#880e4f" />
    </svg>
  );
}

// Burol sa ilalim ng hero (palamuti)
export function Hills() {
  return (
    <svg className="hills" viewBox="0 0 600 160" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 90 Q150 20 300 80 T600 60 V160 H0 Z" fill="rgba(255,255,255,0.07)" />
      <path d="M0 120 Q170 70 330 115 T600 100 V160 H0 Z" fill="rgba(255,255,255,0.1)" />
    </svg>
  );
}

// Ang tatlong department na ipapakita sa hero
export const DEPARTMENTS = [
  { key: 'gulayan', name: 'Gulayan', text: 'Vegetables, sold per kilo', Art: VeggieArt },
  { key: 'prutasan', name: 'Prutasan', text: 'Fruits, sold per kilo', Art: FruitArt },
  { key: 'babuyan', name: 'Babuyan', text: 'Hog batches, feeds & medicine', Art: PigArt },
];
