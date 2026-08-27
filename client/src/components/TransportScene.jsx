import React from 'react';
import './TransportScene.css';

const TransportScene = ({ active }) => {
  return (
    <div className={`transport-scene-wrapper ${active ? 'active' : ''}`}>
      <svg
        className="transport-scene"
        viewBox="0 0 1200 720"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* === SKY & ATMOSPHERE === */}
        <g className="layer layer-sky">
          <rect x="0" y="0" width="1200" height="720" fill="var(--color-bg)" />
          
          <circle cx="1020" cy="110" r="70" fill="var(--color-accent)" opacity="0.1" />
          <circle cx="1020" cy="110" r="45" fill="var(--color-accent)" opacity="0.18" />
          
          <g style={{ transform: 'translateX(120px) translateY(90px)' }}>
            <g className="cloud-drift">
              <path d="M0,20 Q20,0 40,20 T80,20 T120,20 L120,45 L0,45 Z" fill="var(--color-primary-light)" opacity="0.35" />
            </g>
          </g>
          
          <g style={{ transform: 'translateX(520px) translateY(140px)' }}>
            <g className="cloud-drift">
              <path d="M0,15 Q15,0 30,15 T60,15 T90,15 L90,35 L0,35 Z" fill="var(--color-primary-light)" opacity="0.25" />
            </g>
          </g>
          
          <g style={{ transform: 'translateX(880px) translateY(70px)' }}>
            <g className="cloud-drift">
              <path d="M0,18 Q25,0 50,18 T100,18 T150,18 L150,42 L0,42 Z" fill="var(--color-primary-light)" opacity="0.3" />
            </g>
          </g>
        </g>

        {/* === BIRDS === */}
        <g className="layer layer-birds">
          <g style={{ transform: 'translateX(1120px) translateY(130px)' }}>
            <g className="bird-drift">
              <path d="M0,0 Q10,-12 20,0" fill="none" stroke="var(--color-ink)" strokeWidth="2" opacity="0.3" strokeLinecap="round" />
            </g>
          </g>
          <g style={{ transform: 'translateX(1180px) translateY(105px)' }}>
            <g className="bird-drift">
              <path d="M0,0 Q8,-10 16,0" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" opacity="0.2" strokeLinecap="round" />
            </g>
          </g>
          <g style={{ transform: 'translateX(1080px) translateY(160px)' }}>
            <g className="bird-drift">
              <path d="M0,0 Q6,-8 12,0" fill="none" stroke="var(--color-ink)" strokeWidth="1.5" opacity="0.25" strokeLinecap="round" />
            </g>
          </g>
        </g>

        {/* === HILLS === */}
        <g className="layer layer-hills">
          <path d="M0,420 Q180,370 360,400 T720,380 T1080,410 T1200,390 L1200,720 L0,720 Z" fill="var(--color-primary-dark)" opacity="0.45" />
          <path d="M0,460 Q240,430 480,445 T960,425 T1200,450 L1200,720 L0,720 Z" fill="var(--color-primary-dark)" opacity="0.75" />
        </g>

        {/* === WATER & SHIP === */}
        <g className="layer layer-ship">
          <rect x="0" y="480" width="1200" height="240" fill="var(--color-primary-light)" opacity="0.12" />
          <path d="M0,505 Q300,498 600,505 T1200,500 L1200,720 L0,720 Z" fill="var(--color-primary-light)" opacity="0.22" />
          <path d="M0,530 Q400,520 800,530 T1200,525 L1200,720 L0,720 Z" fill="var(--color-primary-light)" opacity="0.32" />
          
          <g style={{ transform: 'translateX(680px) translateY(485px)' }}>
            <g className="ship-motion">
              <g className="ship-body">
                <path d="M0,55 L25,90 L240,90 L270,55 Z" fill="var(--color-primary)" />
                <rect x="25" y="50" width="220" height="5" fill="var(--color-primary-light)" />
                <path d="M30,92 L235,92" stroke="var(--color-accent)" strokeWidth="2" opacity="0.4" />
                <rect x="35" y="15" width="42" height="35" rx="2" fill="var(--color-accent)" />
                <rect x="82" y="15" width="42" height="35" rx="2" fill="var(--color-signal)" />
                <rect x="129" y="15" width="42" height="35" rx="2" fill="var(--color-accent-dark)" />
                <rect x="35" y="-22" width="42" height="35" rx="2" fill="var(--color-accent-dark)" />
                <rect x="82" y="-22" width="42" height="35" rx="2" fill="var(--color-accent)" />
                <rect x="129" y="-22" width="42" height="35" rx="2" fill="var(--color-accent)" opacity="0.8" />
                <rect x="190" y="22" width="38" height="33" rx="2" fill="var(--color-primary-light)" />
                <rect x="200" y="30" width="18" height="12" rx="1" fill="var(--color-accent)" opacity="0.35" />
                <rect x="50" y="65" width="170" height="3" fill="var(--color-primary-light)" opacity="0.4" />
              </g>
            </g>
          </g>
        </g>

        {/* === BRIDGE === */}
        <g className="layer layer-bridge">
          <rect x="0" y="375" width="1200" height="14" fill="var(--color-primary-light)" />
          <rect x="0" y="389" width="1200" height="4" fill="var(--color-primary)" opacity="0.6" />
          
          <rect x="180" y="393" width="16" height="107" fill="var(--color-primary)" />
          <rect x="420" y="393" width="16" height="107" fill="var(--color-primary)" />
          <rect x="660" y="393" width="16" height="107" fill="var(--color-primary)" />
          <rect x="900" y="393" width="16" height="107" fill="var(--color-primary)" />
          
          <path d="M196,393 Q308,340 420,393" fill="none" stroke="var(--color-primary-dark)" strokeWidth="3" opacity="0.4" />
          <path d="M436,393 Q548,340 660,393" fill="none" stroke="var(--color-primary-dark)" strokeWidth="3" opacity="0.4" />
          <path d="M676,393 Q788,340 900,393" fill="none" stroke="var(--color-primary-dark)" strokeWidth="3" opacity="0.4" />
          
          <line x1="0" y1="378" x2="1200" y2="378" stroke="var(--color-primary-dark)" strokeWidth="1.5" opacity="0.5" />
          {/* === RAILWAY TRAFFIC SIGNAL === */}
<g className="rail-signal" transform="translate(300, 0)">

  {/* Signal pole */}
  <rect
    x="0"
    y="315"
    width="5"
    height="60"
    rx="0"
    fill="var(--color-primary-dark)"
  />

  {/* Signal housing */}
  <rect
    x="-8"
    y="265"
    width="21"
    height="66"
    rx="5"
    fill="var(--color-ink)"
    stroke="var(--color-primary-dark)"
    strokeWidth="2"
  />

  {/* Green — TOP */}
  <circle
    className="signal-green"
    cx="2.5"
    cy="276"
    r="5"
    fill="#0ceb5e"
  />

  {/* Yellow — MIDDLE */}
  <circle
    className="signal-yellow"
    cx="2.5"
    cy="298"
    r="5"
    fill="var(--color-accent)"
    opacity="0.18"
  />

  {/* Red — BOTTOM */}
  <circle
    className="signal-red"
    cx="2.5"
    cy="320"
    r="5"
    fill="#f80202"
  />

</g>
          <g style={{ transform: 'translateY(347px)' }}>
            <g className="train-motion">
              <g className="train-body">
                <rect x="0" y="0" width="85" height="30" rx="3" fill="var(--color-primary)" />
                <rect x="60" y="-20" width="24" height="20" rx="2" fill="var(--color-primary-light)" />
                <rect x="66" y="-15" width="12" height="10" fill="var(--color-accent)" opacity="0.45" />
                <circle cx="22" cy="30" r="10" fill="var(--color-ink)" className="wheel" />
                <circle cx="50" cy="30" r="10" fill="var(--color-ink)" className="wheel" />
                <circle cx="75" cy="30" r="10" fill="var(--color-ink)" className="wheel" />
                <rect x="85" y="20" width="8" height="4" fill="var(--color-ink)" opacity="0.5" />
                
                <rect x="98" y="5" width="75" height="25" rx="2" fill="var(--color-primary)" />
                <rect x="104" y="9" width="20" height="14" fill="var(--color-accent)" opacity="0.65" />
                <rect x="127" y="9" width="20" height="14" fill="var(--color-accent)" opacity="0.65" />
                <rect x="150" y="9" width="17" height="14" fill="var(--color-accent)" opacity="0.65" />
                <circle cx="118" cy="30" r="9" fill="var(--color-ink)" className="wheel" />
                <circle cx="152" cy="30" r="9" fill="var(--color-ink)" className="wheel" />
                <rect x="173" y="20" width="8" height="4" fill="var(--color-ink)" opacity="0.5" />
                
                <rect x="186" y="5" width="75" height="25" rx="2" fill="var(--color-primary)" />
                <rect x="192" y="9" width="20" height="14" fill="var(--color-signal)" opacity="0.75" />
                <rect x="215" y="9" width="20" height="14" fill="var(--color-signal)" opacity="0.75" />
                <rect x="238" y="9" width="17" height="14" fill="var(--color-signal)" opacity="0.75" />
                <circle cx="206" cy="30" r="9" fill="var(--color-ink)" className="wheel" />
                <circle cx="240" cy="30" r="9" fill="var(--color-ink)" className="wheel" />
              </g>
            </g>
          </g>
        </g>

        {/* === ROAD === */}
        <g className="layer layer-road">
          <rect x="0" y="550" width="1200" height="170" fill="var(--color-primary-dark)" opacity="0.9" />
          <rect x="0" y="548" width="1200" height="2" fill="var(--color-accent)" opacity="0.5" />
          <line x1="0" y1="635" x2="1200" y2="635" stroke="var(--color-bg)" strokeWidth="4" strokeDasharray="50 35" opacity="0.85" />
          <rect x="0" y="548" width="1200" height="1" fill="var(--color-bg)" opacity="0.3" />
        </g>

        {/* === TRUCK (gray body) === */}
        <g className="layer layer-truck">
          <g style={{ transform: 'translateY(535px)' }}>
            <g className="truck-motion">
              <g className="truck-body" transform="translate(-300, 0)">
                <ellipse cx="115" cy="88" rx="140" ry="9" fill="var(--color-primary-dark)" opacity="0.2" />
                
                {/* Trailer — now gray */}
                <rect x="0" y="5" width="150" height="78" rx="6" fill="var(--color-truck)" />
                <rect x="10" y="15" width="130" height="58" fill="none" stroke="var(--color-primary-light)" strokeWidth="1" opacity="0.25" />
                <line x1="48" y1="15" x2="48" y2="73" stroke="var(--color-primary-dark)" strokeWidth="2.5" opacity="0.35" />
                <line x1="96" y1="15" x2="96" y2="73" stroke="var(--color-primary-dark)" strokeWidth="2.5" opacity="0.35" />
                <line x1="10" y1="40" x2="140" y2="40" stroke="var(--color-primary-dark)" strokeWidth="1.5" opacity="0.2" />
                
                {/* Cab — now gray */}
                <path d="M158,22 L208,22 Q225,22 230,42 L230,83 L158,83 Z" fill="var(--color-truck)" />
                <path d="M175,28 L205,28 L218,45 L175,45 Z" fill="var(--color-primary-light)" opacity="0.25" />
                <path d="M178,30 L202,30 L212,42 L178,42 Z" fill="var(--color-accent)" opacity="0.2" />
                <circle cx="228" cy="70" r="5" fill="var(--color-accent)" />
                <circle cx="228" cy="70" r="10" fill="var(--color-accent)" opacity="0.2" />
                <rect x="152" y="78" width="5" height="12" fill="var(--color-ink)" opacity="0.6" />
                <rect x="151" y="88" width="7" height="3" fill="var(--color-ink)" opacity="0.4" />
                
                <g transform="translate(38, 85)">
                  <circle r="16" fill="var(--color-ink)" className="wheel" />
                  <circle r="8" fill="var(--color-bg)" className="wheel" />
                  <circle r="3" fill="var(--color-ink)" opacity="0.3" className="wheel" />
                </g>
                <g transform="translate(112, 85)">
                  <circle r="16" fill="var(--color-ink)" className="wheel" />
                  <circle r="8" fill="var(--color-bg)" className="wheel" />
                  <circle r="3" fill="var(--color-ink)" opacity="0.3" className="wheel" />
                </g>
                <g transform="translate(198, 85)">
                  <circle r="16" fill="var(--color-ink)" className="wheel" />
                  <circle r="8" fill="var(--color-bg)" className="wheel" />
                  <circle r="3" fill="var(--color-ink)" opacity="0.3" className="wheel" />
                </g>
              </g>
            </g>
          </g>
        </g>

        {/* === WAREHOUSE + WORKER === */}
        <g className="layer layer-warehouse">
          <g style={{ transform: 'translateX(30px) translateY(400px)' }}>
            <rect x="5" y="150" width="210" height="10" rx="5" fill="var(--color-primary-dark)" opacity="0.15" />
            <rect x="20" y="30" width="180" height="120" fill="var(--color-primary)" />
            <polygon points="10,30 110,0 210,30" fill="var(--color-primary-dark)" />
            <line x1="45" y1="15" x2="175" y2="15" stroke="var(--color-primary-light)" strokeWidth="1" opacity="0.35" />
            <line x1="60" y1="8" x2="160" y2="8" stroke="var(--color-primary-light)" strokeWidth="1" opacity="0.25" />
            <rect x="55" y="70" width="55" height="80" fill="var(--color-primary-dark)" />
            <line x1="55" y1="88" x2="110" y2="88" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
            <line x1="55" y1="106" x2="110" y2="106" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
            <line x1="55" y1="124" x2="110" y2="124" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
            <line x1="55" y1="142" x2="110" y2="142" stroke="var(--color-primary)" strokeWidth="2" opacity="0.4" />
            <circle cx="118" cy="52" r="7" fill="var(--color-signal)" className="loading-light" />
            <rect x="114" y="61" width="8" height="3" fill="var(--color-ink)" opacity="0.35" />
            <rect x="140" y="50" width="20" height="16" rx="2" fill="var(--color-accent)" opacity="0.12" />
            <rect x="168" y="50" width="20" height="16" rx="2" fill="var(--color-accent)" opacity="0.12" />
            <rect x="53" y="68" width="59" height="84" fill="none" stroke="var(--color-primary-light)" strokeWidth="1" opacity="0.4" />

            {/* Worker standing beside the warehouse */}
            <g transform="translate(228, 105)">
              {/* Hard hat */}
              <path d="M4,4 Q10,-3 16,4 L16,6 L4,6 Z" fill="var(--color-accent)" />
              {/* Head */}
              <circle cx="10" cy="12" r="5.5" fill="#E8C39E" />
              {/* Neck */}
              <rect x="8" y="17" width="4" height="3" fill="#D4A574" />
              {/* Safety vest */}
              <path d="M5,20 L15,20 L17,40 L3,40 Z" fill="var(--color-accent)" />
              <rect x="6" y="21" width="8" height="8" rx="1" fill="var(--color-accent-dark)" opacity="0.5" />
              {/* Arms */}
              <rect x="1" y="22" width="3" height="14" rx="1.5" fill="var(--color-ink)" />
              <rect x="16" y="22" width="3" height="14" rx="1.5" fill="var(--color-ink)" />
              {/* Legs */}
              <rect x="6" y="40" width="3.5" height="14" rx="1" fill="var(--color-ink)" />
              <rect x="10.5" y="40" width="3.5" height="14" rx="1" fill="var(--color-ink)" />
              {/* Boots */}
              <path d="M5,54 L9,54 L9,57 L5,57 Z" fill="var(--color-primary-dark)" />
              <path d="M11,54 L15,54 L15,57 L11,57 Z" fill="var(--color-primary-dark)" />
            </g>
          </g>
        </g>

        {/* === CONTAINERS === */}
        <g className="layer layer-containers">
          <g style={{ transform: 'translateX(250px) translateY(495px)' }}>
            <rect x="0" y="30" width="58" height="32" rx="2" fill="var(--color-accent)" />
            <rect x="4" y="34" width="50" height="24" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1" opacity="0.4" />
            <rect x="0" y="0" width="58" height="28" rx="2" fill="var(--color-accent-dark)" />
            <rect x="4" y="4" width="50" height="20" fill="none" stroke="var(--color-accent)" strokeWidth="1" opacity="0.4" />
          </g>
          <g style={{ transform: 'translateX(320px) translateY(520px)' }}>
            <rect x="0" y="0" width="52" height="28" rx="2" fill="var(--color-signal)" />
            <rect x="4" y="4" width="44" height="20" fill="none" stroke="var(--color-primary-dark)" strokeWidth="1" opacity="0.3" />
          </g>
          <g style={{ transform: 'translateX(960px) translateY(525px)' }}>
            <rect x="0" y="0" width="55" height="28" rx="2" fill="var(--color-accent)" />
            <rect x="4" y="4" width="47" height="20" fill="none" stroke="var(--color-accent-dark)" strokeWidth="1" opacity="0.4" />
          </g>
          <g style={{ transform: 'translateX(1025px) translateY(535px)' }}>
            <rect x="0" y="0" width="50" height="22" rx="2" fill="var(--color-primary-light)" />
          </g>
        </g>
      </svg>
    </div>
  );
};

export default TransportScene;