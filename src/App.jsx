import React, { useState, useEffect } from "react";

/**
 * FOCO — Conceito B "Próximo Movimento"
 * Anti-painel: uma coisa por vez, na hora certa. Calma radical.
 * Esta é a tela inicial. Ainda usa dados fixos (mock) — a lógica vem depois.
 */

const RED = "#E24034";

// ícone simples (SVG). Depois isso vira um arquivo próprio.
function Icon({ n, s = 18 }) {
  const p = { width: s, height: s, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" };
  const d = {
    play: <path d="M8 5v14l11-7z" />,
    dumbbell: <path d="M6.5 6.5v11M17.5 6.5v11M4 9.5v5M20 9.5v5M6.5 12h11" />,
    chevron: <path d="M6 9l6 6 6-6" />,
  };
  return <svg {...p}>{d[n]}</svg>;
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(id);
  }, []);

  // dado fixo por enquanto — o "próximo movimento" virá do motor de dados depois.
  const agora = {
    titulo: "Academia",
    horario: "10:00",
    faltam: "20 min",
    contexto: "1h20 no alvo.",
    icon: "dumbbell",
  };

  return (
    <div className="app">
      <style>{`
        .app{--red:${RED};--bone:#ECE6D9;--dim:#8C877B;--dim2:#5E5A52;
          min-height:100%;display:flex;justify-content:center;
          font-family:'Archivo',system-ui,sans-serif;color:var(--bone)}
        .app .mono{font-family:'IBM Plex Mono',monospace;font-variant-numeric:tabular-nums}

        .frame{width:100%;max-width:440px;min-height:100%;position:relative;display:flex;flex-direction:column;
          padding:calc(env(safe-area-inset-top) + 24px) 24px calc(env(safe-area-inset-bottom) + 22px)}
        .grain{position:absolute;inset:0;pointer-events:none;opacity:.045;mix-blend-mode:soft-light;
          background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}

        @media (prefers-reduced-motion:no-preference){
          .fade{opacity:0;animation:fade 1s ease forwards}
          .f1{animation-delay:.1s}.f2{animation-delay:.35s}.f3{animation-delay:1.1s}.f4{animation-delay:1.4s}
          .rise{opacity:0;transform:translateY(18px);animation:rise 1.1s cubic-bezier(.2,.7,.2,1) .35s forwards}
        }
        @keyframes fade{to{opacity:1}}
        @keyframes rise{to{opacity:1;transform:none}}

        .top{display:flex;justify-content:space-between;align-items:center;position:relative;z-index:1}
        .clock{font-size:12px;color:var(--dim);letter-spacing:1px}
        .queue{display:flex;align-items:center;gap:7px;font-size:10px;letter-spacing:1px;color:var(--dim2)}
        .qdot{width:5px;height:5px;border-radius:50%;background:var(--dim2)}

        .stage{flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;
          padding:0 6px;position:relative;z-index:1}
        .kicker{display:flex;align-items:center;gap:8px;font-size:10px;letter-spacing:2.4px;color:var(--dim);margin-bottom:28px}
        .live{width:6px;height:6px;border-radius:50%;background:var(--red);animation:blink 2.6s infinite}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}

        .glyph{width:60px;height:60px;border:1px solid rgba(236,230,217,0.16);border-radius:16px;
          display:flex;align-items:center;justify-content:center;color:var(--bone);margin-bottom:26px}
        .title{font-size:40px;font-weight:600;letter-spacing:-1.2px;line-height:1}
        .when{font-size:14px;color:var(--dim);margin-top:16px;letter-spacing:.3px}
        .when b{color:var(--red);font-weight:600}
        .ctx{font-size:14px;color:var(--dim);margin-top:22px;line-height:1.6;max-width:250px}
        .ctx b{color:var(--bone);font-weight:500}

        .cta{margin-top:38px;width:100%;max-width:290px;height:56px;border-radius:12px;
          background:var(--bone);color:#151310;border:none;font-family:'Archivo';font-size:16px;font-weight:600;
          letter-spacing:-.2px;display:flex;align-items:center;justify-content:center;gap:9px;cursor:pointer}
        .cta svg{stroke:#151310;fill:#151310}
        .defer{margin-top:16px;font-size:13px;color:var(--dim2);letter-spacing:.3px;cursor:pointer;
          background:none;border:none;font-family:'Archivo'}

        .ghost{padding-top:20px;border-top:1px solid rgba(236,230,217,0.06);position:relative;z-index:1}
        .glbl{font-size:9px;letter-spacing:2px;color:var(--dim2);margin-bottom:12px;text-align:center}
        .grow{display:flex;justify-content:center;gap:8px;font-size:12px;color:var(--dim2);letter-spacing:.3px;flex-wrap:wrap}
        .grow .mono{color:#4E4A44}
        .sep{color:#3A3833}
        .more{display:flex;align-items:center;justify-content:center;gap:6px;font-size:11px;color:var(--dim2);
          margin-top:16px;letter-spacing:.5px;cursor:pointer}
        .more svg{stroke:var(--dim2)}
      `}</style>

      <div className="frame">
        <div className="grain" />

        <div className="top fade f1">
          <span className="clock mono">09:41</span>
          <span className="queue">3 guardados <span className="qdot" /></span>
        </div>

        <div className="stage">
          <div className="kicker fade f2"><span className="live" /> AGORA</div>
          <div className="glyph rise"><Icon n={agora.icon} s={28} /></div>
          <div className="title rise">{agora.titulo}</div>
          <div className="when rise mono">{agora.horario} · começa em <b>{agora.faltam}</b></div>
          <div className="ctx rise">{agora.contexto} <b>O resto do dia fica guardado</b> até a sua hora.</div>
          <button className="cta rise"><Icon n="play" s={16} /> Iniciar</button>
          <button className="defer rise">agora não</button>
        </div>

        <div className="ghost fade f3">
          <div className="glbl">DEPOIS</div>
          <div className="grow">
            <span className="mono">11:45</span> Farmácia <span className="sep">·</span> <span className="mono">14:00</span> Turno WEG
          </div>
          <div className="more fade f4">ver o dia inteiro <Icon n="chevron" s={13} /></div>
        </div>
      </div>
    </div>
  );
}
