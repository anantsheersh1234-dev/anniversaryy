import { useEffect, useRef, useState } from "react";

const IMAGES = [
  "https://images.pexels.com/photos/6578958/pexels-photo-6578958.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/17836484/pexels-photo-17836484.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/9451203/pexels-photo-9451203.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/5911261/pexels-photo-5911261.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6578965/pexels-photo-6578965.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6579005/pexels-photo-6579005.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
  "https://images.pexels.com/photos/6578994/pexels-photo-6578994.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=800&w=1200",
];

function clamp01(v: number) { return Math.max(0, Math.min(1, v)); }
function mapRange(v: number, a: number, b: number) { return clamp01((v - a) / (b - a)); }
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2,3)/2;
}

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const max = el.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? clamp01(window.scrollY / max) : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── ZOOM
  const zoomP = easeInOutCubic(mapRange(progress, 0.03, 0.50));
  const scale = 1 + zoomP * 130;
  const textOpacity = clamp01(1 - zoomP * 2.8);
  const dark = clamp01(zoomP * 1.4);
  const r = Math.round(7  + (1-dark)*4);
  const g = Math.round(3  + (1-dark)*2);
  const b = Math.round(15 + (1-dark)*8);

  // ── IMAGES
  const imgPhaseP = mapRange(progress, 0.50, 0.95);
  const N = IMAGES.length;
  const slotSize = 1 / N;

  const imageOpacities = IMAGES.map((_, i) => {
    const slotStart = i * slotSize;
    const slotEnd   = slotStart + slotSize;
    const local     = clamp01((imgPhaseP - slotStart) / slotSize);
    let opacity = 0;
    if (imgPhaseP >= slotStart && imgPhaseP <= slotEnd) {
      if (local < 0.18)       opacity = local / 0.18;
      else if (local < 0.82)  opacity = 1;
      else                    opacity = 1 - (local - 0.82) / 0.18;
    }
    if (i === N - 1 && imgPhaseP > slotEnd - slotSize * 0.1) {
      opacity = clamp01(mapRange(imgPhaseP, slotEnd - slotSize*0.2, slotEnd - slotSize*0.05));
    }
    return opacity;
  });

  const activeIdx = imageOpacities.reduce((best, op, i) => op > (imageOpacities[best] ?? 0) ? i : best, 0);

  // ── OUTRO
  const outroP = mapRange(progress, 0.88, 1.0);

  // ── SCROLL HINT
  const hintOpacity = clamp01(1 - progress * 12);
  const counterOpacity = clamp01(mapRange(progress, 0.50, 0.58));
  const vignetteOpacity = clamp01(zoomP * 1.6);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,900;1,700&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #07030f; }
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(7px)} }
        @keyframes floatUp {
          0%   { transform: translateY(0) rotate(0deg) scale(1);  opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.15; }
          100% { transform: translateY(-110vh) rotate(360deg) scale(0.5); opacity: 0; }
        }
      `}</style>

      <div ref={containerRef} style={{ height: "700vh", position: "relative" }}>
        <div style={{
          position: "sticky", top: 0, width: "100%", height: "100vh",
          overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center",
          background: `rgb(${r},${g},${b})`,
        }}>

          {/* Floating hearts */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: clamp01(1 - progress * 5), zIndex: 2 }}>
            {["❤️","🌹","✨","💕","💖","🌸"].flatMap((e, ei) =>
              [...Array(4)].map((_, j) => {
                const idx = ei * 4 + j;
                return (
                  <span key={idx} style={{
                    position: "absolute",
                    left: `${(idx * 14 + 3) % 100}%`,
                    bottom: "-20px",
                    fontSize: `${10 + (idx % 5) * 4}px`,
                    animation: `floatUp ${8 + (idx % 6)}s linear ${(idx * 0.6) % 10}s infinite`,
                  }}>{e}</span>
                );
              })
            )}
          </div>

          {/* THE SEVEN */}
          <div style={{
            position: "relative", display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 10, willChange: "transform",
            transform: `scale(${scale})`,
          }}>
            <svg viewBox="0 0 220 280" width="220" height="280" style={{ overflow: "visible" }}>
              <defs>
                <clipPath id="sevenClip">
                  <text x="110" y="272" textAnchor="middle" fontSize="290"
                    fontFamily="'Playfair Display', serif" fontWeight="900">7</text>
                </clipPath>
                <linearGradient id="goldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%"   stopColor="#fff8cc"/>
                  <stop offset="40%"  stopColor="#f5c842"/>
                  <stop offset="100%" stopColor="#b8720a"/>
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                  <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
                </filter>
              </defs>

              {/* Images clipped to "7" */}
              <g clipPath="url(#sevenClip)">
                <rect x="-300" y="-300" width="820" height="880" fill="#0d0520"/>
                {IMAGES.map((src, i) => {
                  const local = clamp01((imgPhaseP - i * slotSize) / slotSize);
                  const kb = 1 + local * 0.07;
                  return (
                    <image key={i} href={src}
                      x="-300" y="-300" width="820" height="880"
                      preserveAspectRatio="xMidYMid slice"
                      style={{ opacity: imageOpacities[i] }}
                      transform={`scale(${kb}) translate(${(1-kb)*110},${(1-kb)*140})`}
                    />
                  );
                })}
              </g>

              {/* Gold "7" fill */}
              <text x="110" y="272" textAnchor="middle" fontSize="290"
                fontFamily="'Playfair Display', serif" fontWeight="900"
                fill="url(#goldGrad)" filter="url(#glow)"
                style={{ opacity: textOpacity }}>7</text>

              {/* Outline */}
              <text x="110" y="272" textAnchor="middle" fontSize="290"
                fontFamily="'Playfair Display', serif" fontWeight="900"
                fill="none" stroke="rgba(255,210,140,0.6)" strokeWidth="1.5"
                style={{ opacity: textOpacity }}>7</text>
            </svg>

            {/* Glow halo */}
            <div style={{
              position: "absolute", inset: "-30%", borderRadius: "50%",
              background: "radial-gradient(ellipse at center, rgba(245,180,60,0.22) 0%, transparent 65%)",
              pointerEvents: "none", zIndex: -1, opacity: textOpacity,
            }}/>
          </div>

          {/* Vignette */}
          <div style={{
            position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20,
            background: "radial-gradient(ellipse at center, transparent 35%, rgba(5,2,15,0.85) 100%)",
            opacity: vignetteOpacity,
          }}/>

          {/* Dot counter */}
          <div style={{
            position: "absolute", top: 32, right: 40, zIndex: 40,
            display: "flex", gap: 8, opacity: counterOpacity,
          }}>
            {IMAGES.map((_, i) => (
              <div key={i} style={{
                width: 7, height: 7, borderRadius: "50%",
                background: i === activeIdx ? "rgba(245,180,60,0.9)" : "rgba(245,180,60,0.2)",
                border: "1px solid rgba(245,180,60,0.5)",
                transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
                transition: "all 0.4s",
              }}/>
            ))}
          </div>

          {/* Scroll hint */}
          <div style={{
            position: "absolute", bottom: 48, left: "50%", transform: "translateX(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
            zIndex: 30, pointerEvents: "none", opacity: hintOpacity,
          }}>
            <p style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: "0.85rem", color: "rgba(255,210,160,0.75)",
              letterSpacing: "0.35em", textTransform: "uppercase",
            }}>Scroll to remember</p>
            <span style={{ color: "rgba(245,180,60,0.7)", fontSize: "1.5rem", animation: "bounce 1.6s ease-in-out infinite" }}>↓</span>
          </div>

          {/* Outro */}
          <div style={{
            position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 50, opacity: outroP, pointerEvents: outroP > 0.05 ? "auto" : "none",
          }}>
            <div style={{
              textAlign: "center", padding: "3rem 3.5rem", borderRadius: "2rem",
              background: "rgba(7,2,18,0.82)", backdropFilter: "blur(16px)",
              border: "1px solid rgba(245,180,60,0.2)",
              boxShadow: "0 0 60px rgba(200,120,10,0.12), 0 0 120px rgba(200,120,10,0.06)",
              maxWidth: 560, width: "90%",
            }}>
              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(0.65rem,1.8vw,0.8rem)",
                color: "rgba(245,180,60,0.75)", letterSpacing: "0.4em", textTransform: "uppercase",
                marginBottom: "1.1rem",
              }}>7 Years of Us</p>

              <h1 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2rem,6vw,3.2rem)", fontWeight: 900, fontStyle: "italic",
                background: "linear-gradient(135deg,#fff5c0 0%,#f5c842 45%,#c8860a 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                backgroundClip: "text", lineHeight: 1.2, marginBottom: "1.3rem",
              }}>Happy Anniversary,<br/>My Love ❤️</h1>

              <p style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: "clamp(1rem,2.4vw,1.2rem)", fontStyle: "italic",
                color: "rgba(255,215,185,0.85)", lineHeight: 1.9, marginBottom: "1.8rem",
              }}>
                Seven years of laughter, adventures,<br/>
                late nights and beautiful mornings —<br/>
                every moment with you is my favourite.
              </p>

              <div style={{ color: "rgba(245,150,60,0.65)", fontSize: "1.3rem", letterSpacing: "0.55rem" }}>
                ♥ ♥ ♥ ♥ ♥ ♥ ♥
              </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
