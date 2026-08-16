import React from "react";

interface CutZoneLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "full";
  showText?: boolean;
}

export function CutZoneBarberPole({ className = "w-6 h-12" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 100"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Chrome Metallic Top & Bottom Gradient */}
        <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="25%" stopColor="#94a3b8" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="75%" stopColor="#64748b" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>

        {/* Cylinder Glass Shadow/Highlight */}
        <linearGradient id="glassShine" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.6" />
          <stop offset="25%" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="70%" stopColor="#000000" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.4" />
        </linearGradient>

        {/* Clip path for diagonal stripes inside cylinder */}
        <clipPath id="poleCylinderClip">
          <rect x="8" y="22" width="24" height="56" rx="2" />
        </clipPath>
      </defs>

      {/* Top Finial Ball */}
      <circle cx="20" cy="8" r="5" fill="url(#chromeGrad)" stroke="#475569" strokeWidth="0.8" />
      <circle cx="18" cy="6" r="1.5" fill="#ffffff" fillOpacity="0.8" />

      {/* Top Cap */}
      <path
        d="M10 16 C10 12, 30 12, 30 16 L33 22 L7 22 Z"
        fill="url(#chromeGrad)"
        stroke="#475569"
        strokeWidth="0.8"
      />
      <rect x="7" y="20" width="26" height="3" rx="1.5" fill="url(#chromeGrad)" />

      {/* Middle Cylinder Background (White) */}
      <rect x="8" y="22" width="24" height="56" fill="#ffffff" rx="2" />

      {/* Barber Pole Striped Pattern Group */}
      <g clipPath="url(#poleCylinderClip)">
        {[-40, -20, 0, 20, 40, 60, 80].map((yOffset, i) => (
          <g key={i} transform={`translate(0, ${yOffset})`}>
            {/* Red Stripe */}
            <path
              d="M-5 10 L35 -15 L45 -7 L5 18 Z"
              fill="#E11D48"
            />
            {/* Blue Stripe */}
            <path
              d="M-5 24 L35 -1 L45 7 L5 32 Z"
              fill="#2563EB"
            />
          </g>
        ))}
      </g>

      {/* Glass Inner Reflection Overlay */}
      <rect
        x="8"
        y="22"
        width="24"
        height="56"
        fill="url(#glassShine)"
        rx="2"
        style={{ mixBlendMode: "multiply" }}
      />
      <line x1="12" y1="24" x2="12" y2="76" stroke="#ffffff" strokeWidth="1.5" strokeOpacity="0.7" strokeLinecap="round" />

      {/* Outer Cylinder Border */}
      <rect x="8" y="22" width="24" height="56" fill="none" stroke="#64748b" strokeWidth="0.8" rx="2" />

      {/* Bottom Cap */}
      <rect x="7" y="77" width="26" height="3" rx="1.5" fill="url(#chromeGrad)" />
      <path
        d="M7 78 L33 78 L30 85 C30 88, 10 88, 10 85 Z"
        fill="url(#chromeGrad)"
        stroke="#475569"
        strokeWidth="0.8"
      />

      {/* Bottom Finial Base */}
      <circle cx="20" cy="91" r="4.5" fill="url(#chromeGrad)" stroke="#475569" strokeWidth="0.8" />
    </svg>
  );
}

export function CutZoneLogo({ className = "", size = "md", showText = true }: CutZoneLogoProps) {
  const heightClass =
    size === "sm" ? "h-8" : size === "md" ? "h-11" : size === "lg" ? "h-14" : "h-auto w-full";

  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      {/* Left Barber Pole */}
      <CutZoneBarberPole className={`${heightClass} w-auto shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-300`} />

      {showText && (
        <div className="flex flex-col items-center justify-center px-1">
          {/* Top Decorative Filigree / Flourish */}
          <svg
            viewBox="0 0 100 20"
            className="w-14 h-2.5 text-slate-400 opacity-90 mb-0.5"
            fill="currentColor"
          >
            <path d="M50 2 C51.5 5, 54 8, 57 8 C53 8.5, 51 11, 50 14 C49 11, 47 8.5, 43 8 C46 8, 48.5 5, 50 2 Z" />
            <path
              d="M50 8 C40 8, 30 2, 20 5 C15 6.5, 12 11, 15 14 C17.5 16.5, 23 15, 22 11 C21 8, 16 9, 18 12 C18 10, 24 6, 32 10 C40 14, 48 10, 50 8 Z"
              fillOpacity="0.8"
            />
            <path
              d="M50 8 C60 8, 70 2, 80 5 C85 6.5, 88 11, 85 14 C82.5 16.5, 77 15, 78 11 C79 8, 84 9, 82 12 C82 10, 76 6, 68 10 C60 14, 52 10, 50 8 Z"
              fillOpacity="0.8"
            />
          </svg>

          {/* CutZone Text */}
          <div className="flex items-center">
            <span
              className="font-serif text-lg sm:text-xl font-bold tracking-wider text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)]"
              style={{
                fontFamily: "Georgia, 'Times New Roman', serif",
                letterSpacing: "0.06em",
              }}
            >
              Cutzone
            </span>
          </div>
        </div>
      )}

      {/* Right Barber Pole */}
      <CutZoneBarberPole className={`${heightClass} w-auto shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-300`} />
    </div>
  );
}
