/**
 * Sfondo decorativo dell'area principale: circuito visto dall'alto (cordoli, pilastri, gomme, griglia di partenza)
 * con un kart in derapata. Solo SVG, i colori arrivano dalle variabili --trk-* (tema chiaro/scuro in globals.css).
 */
const TRACK =
  "M 260 620 C 140 620 112 478 206 414 C 300 350 424 420 524 360 C 624 300 566 172 690 138 C 814 104 1000 140 1042 262 C 1084 384 984 432 966 520 C 948 608 1012 660 902 690 C 792 720 380 620 260 620 Z";

const PILLARS: [number, number][] = [
  [350, 512], [470, 498], [612, 240], [800, 232], [930, 296], [880, 560], [380, 735], [1130, 420], [120, 300],
];

const TIRE_STACKS: [number, number, number][] = [
  // x, y, rotazione: file di gomme all'esterno delle curve
  [80, 520, -70], [700, 40, 10], [1150, 200, 60], [1080, 740, -20],
];

export function TrackBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden">
      <svg
        viewBox="0 0 1200 800"
        className="h-full max-h-[900px] w-full max-w-[1400px] opacity-[var(--trk-opacity)]"
        style={{
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 55%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, #000 55%, transparent 100%)",
        }}
      >
        <defs>
          <pattern id="trk-checker" width="14" height="14" patternUnits="userSpaceOnUse">
            <rect width="14" height="14" fill="var(--trk-kerb-b)" />
            <rect width="7" height="7" fill="var(--trk-kerb-dark)" />
            <rect x="7" y="7" width="7" height="7" fill="var(--trk-kerb-dark)" />
          </pattern>
          <filter id="trk-soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
          <filter id="trk-shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="4" dy="6" stdDeviation="4" floodColor="var(--trk-shadow)" />
          </filter>
        </defs>

        {/* via di fuga, cordoli, asfalto, linea centrale */}
        <path d={TRACK} fill="none" stroke="var(--trk-runoff)" strokeWidth="156" strokeLinejoin="round" />
        <path d={TRACK} fill="none" stroke="var(--trk-kerb-b)" strokeWidth="106" strokeLinejoin="round" />
        <path d={TRACK} fill="none" stroke="var(--trk-kerb-a)" strokeWidth="106" strokeLinejoin="round" strokeDasharray="18 18" />
        <path d={TRACK} fill="none" stroke="var(--trk-asphalt)" strokeWidth="92" strokeLinejoin="round" />
        <path d={TRACK} fill="none" stroke="var(--trk-line)" strokeWidth="2.5" strokeDasharray="16 18" />

        {/* traguardo a scacchi sul rettilineo basso */}
        <rect x="577" y="620" width="14" height="92" fill="url(#trk-checker)" transform="rotate(9.2 584 666)" />

        {/* segni di frenata e fumo dietro al kart in curva */}
        <g fill="none" stroke="var(--trk-skid)" strokeWidth="6" strokeLinecap="round">
          <path d="M 958 168 C 1000 190 1030 222 1046 262" />
          <path d="M 976 150 C 1022 176 1052 212 1066 254" />
        </g>
        <g fill="var(--trk-smoke)" filter="url(#trk-soft)">
          <circle cx="1008" cy="196" r="16" />
          <circle cx="984" cy="176" r="22" />
          <circle cx="956" cy="156" r="28" opacity="0.7" />
          <circle cx="926" cy="140" r="32" opacity="0.45" />
        </g>

        {/* kart visto dall'alto, muso verso l'interno della curva */}
        <g transform="translate(1056 292) rotate(132)" filter="url(#trk-shadow)">
          <rect x="-15" y="-27" width="9" height="14" rx="3" fill="var(--trk-tire)" />
          <rect x="6" y="-27" width="9" height="14" rx="3" fill="var(--trk-tire)" />
          <rect x="-17" y="13" width="11" height="16" rx="3" fill="var(--trk-tire)" />
          <rect x="6" y="13" width="11" height="16" rx="3" fill="var(--trk-tire)" />
          <path d="M -9 -34 L 9 -34 L 13 -18 L 13 24 L 8 32 L -8 32 L -13 24 L -13 -18 Z" fill="var(--trk-kart)" />
          <rect x="-12" y="-38" width="24" height="6" rx="2" fill="var(--trk-kart-dark)" />
          <rect x="-14" y="30" width="28" height="5" rx="2" fill="var(--trk-kart-dark)" />
          <circle cx="0" cy="6" r="7.5" fill="var(--trk-kart-dark)" />
          <circle cx="0" cy="6" r="4" fill="var(--trk-kart)" opacity="0.6" />
        </g>

        {/* pilastri */}
        {PILLARS.map(([x, y]) => (
          <g key={`${x}-${y}`} filter="url(#trk-shadow)">
            <circle cx={x} cy={y} r="15" fill="var(--trk-pillar)" />
            <circle cx={x} cy={y} r="9" fill="var(--trk-pillar-top)" />
          </g>
        ))}

        {/* barriere di gomme */}
        {TIRE_STACKS.map(([x, y, r]) => (
          <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
            {[-36, -12, 12, 36].map((dx) => (
              <g key={dx}>
                <circle cx={dx} cy="0" r="11" fill="var(--trk-tire)" />
                <circle cx={dx} cy="0" r="4.5" fill="var(--trk-runoff)" />
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
