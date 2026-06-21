type Props = {
  className?: string;
  width?: number | string;
  height?: number | string;
};

// Mascot Bibi — versi setengah badan
export const BibiMascot = ({ className, width = 160, height = 150 }: Props) => {
  return (
    <svg
      viewBox="0 0 160 150"
      width={width}
      height={height}
      className={className}
      aria-label="Mascot Bibi"
    >
      <ellipse cx="80" cy="140" rx="46" ry="8" fill="#13294B" opacity="0.1" />
      {/* Badan + seragam */}
      <path d="M50,150 L50,108 Q50,76 80,76 Q110,76 110,108 L110,150 Z" fill="#13294B" />
      <path d="M50,150 L50,108 Q50,90 65,82 L70,98 L65,150 Z" fill="#4FC3C7" />
      <path d="M110,150 L110,108 Q110,90 95,82 L90,98 L95,150 Z" fill="#FFFFFF" opacity="0.85" />
      {/* Rambut + wajah */}
      <circle cx="80" cy="55" r="30" fill="#0B1B2E" />
      <circle cx="80" cy="60" r="23" fill="#F0C9A0" />
      <path d="M53,52 Q80,28 107,52 Q108,64 80,60 Q52,64 53,52" fill="#0B1B2E" />
      <circle cx="104" cy="62" r="9" fill="#0B1B2E" />
      <circle cx="104" cy="62" r="5" fill="#4FC3C7" />
      <ellipse cx="72" cy="62" rx="2.4" ry="3" fill="#1A2744" />
      <ellipse cx="88" cy="62" rx="2.4" ry="3" fill="#1A2744" />
      <path
        d="M70,72 Q80,78 90,72"
        stroke="#1A2744"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="80" cy="150" r="6" fill="#13294B" />
    </svg>
  );
};

// Mascot Bibi — versi melambai (untuk CTA)
export const BibiWave = ({ className }: { className?: string }) => {
  return (
    <svg viewBox="0 0 160 220" className={className} aria-label="Mascot Bibi melambai">
      <ellipse cx="80" cy="210" rx="55" ry="9" fill="#13294B" opacity="0.12" />
      <rect x="50" y="120" width="60" height="80" rx="20" fill="#13294B" />
      <rect x="50" y="120" width="60" height="18" rx="9" fill="#4FC3C7" />
      <rect x="56" y="200" width="20" height="20" rx="6" fill="#13294B" />
      <rect x="84" y="200" width="20" height="20" rx="6" fill="#13294B" />
      <circle cx="80" cy="75" r="34" fill="#0B1B2E" />
      <circle cx="80" cy="80" r="26" fill="#F0C9A0" />
      <path d="M48,70 Q80,42 112,70 Q113,84 80,80 Q47,84 48,70" fill="#0B1B2E" />
      <circle cx="108" cy="84" r="10" fill="#0B1B2E" />
      <circle cx="108" cy="84" r="5.5" fill="#4FC3C7" />
      <ellipse cx="71" cy="83" rx="2.6" ry="3.4" fill="#1A2744" />
      <ellipse cx="89" cy="83" rx="2.6" ry="3.4" fill="#1A2744" />
      <path
        d="M68,95 Q80,102 92,95"
        stroke="#1A2744"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M50,150 L30,170" stroke="#13294B" strokeWidth="9" strokeLinecap="round" />
      <circle cx="27" cy="173" r="7" fill="#F0C9A0" />
      <path d="M110,150 L132,128" stroke="#13294B" strokeWidth="9" strokeLinecap="round" />
      <circle cx="135" cy="124" r="7" fill="#F0C9A0" />
      <circle cx="146" cy="108" r="10" fill="#9FE1CB" />
      <circle cx="138" cy="100" r="8" fill="#5DCAA5" />
      <circle cx="154" cy="98" r="8" fill="#5DCAA5" />
      <circle cx="146" cy="88" r="8" fill="#9FE1CB" />
    </svg>
  );
};

export const BabooLogo = ({ className }: { className?: string }) => (
  <span className={className} aria-hidden>
    <svg width="18" height="18" viewBox="0 0 18 18">
      <circle cx="9" cy="9" r="7" fill="none" stroke="#5DCAA5" strokeWidth="2.4" />
      <circle cx="9" cy="9" r="2.4" fill="#5DCAA5" />
    </svg>
  </span>
);
