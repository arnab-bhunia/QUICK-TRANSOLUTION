export const OfficeIcon = () => (
<svg xmlns="http://www.w3.org/2000/svg"
width="24"
height="24"
viewBox="0 0 24 24"
fill="none"
stroke="currentColor"
strokeWidth="2"
strokeLinecap="round"
strokeLinejoin="round">
<path d="M4 21h16"/>
<path d="M7 21V6l5-3 5 3v15"/>
<path d="M9 9h6"/>
<path d="M9 12h6"/>
<path d="M9 15h6"/>
<path d="M12 21v-3"/>
<circle cx="12" cy="3" r="1.2"/>
</svg>
);

export const TruckIcon = () => (
<svg width="340" height="220" viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    {/* <!-- Tata White Body Gradient --> */}
    <linearGradient id="tataWhite" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="40%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    
    {/* <!-- Cab Gradient --> */}
    <linearGradient id="tataCab" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="50%" stop-color="#f1f5f9"/>
      <stop offset="100%" stop-color="#cbd5e1"/>
    </linearGradient>
    
    {/* <!-- Tata Blue Accent --> */}
    <linearGradient id="tataBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#1e40af"/>
      <stop offset="100%" stop-color="#3b82f6"/>
    </linearGradient>
    
    {/* <!-- Window Gradient --> */}
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#bfdbfe"/>
      <stop offset="100%" stop-color="#60a5fa"/>
    </linearGradient>
    
    {/* <!-- Wheel Tire --> */}
    <radialGradient id="tire" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stop-color="#1e293b"/>
      <stop offset="85%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </radialGradient>
    
    {/* <!-- Rim Silver --> */}
    <radialGradient id="rim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="70%" stop-color="#94a3b8"/>
      <stop offset="100%" stop-color="#64748b"/>
    </radialGradient>
    
    {/* <!-- Hub Center --> */}
    <radialGradient id="hub" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="100%" stop-color="#475569"/>
    </radialGradient>
    
    {/* <!-- Shadow --> */}
    <filter id="drop" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="8" flood-color="#000" flood-opacity="0.35"/>
    </filter>
    
    {/* <!-- Glow --> */}
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  {/* <!-- Ground Shadow --> */}
  <ellipse cx="170" cy="198" rx="140" ry="9" fill="#000" opacity="0.22"/>
  
  {/* <!-- Speed Lines --> */}
  <g opacity="0.5">
    <line x1="15" y1="95" x2="55" y2="95" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)"/>
    <line x1="5" y1="115" x2="45" y2="115" stroke="#38bdf8" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
    <line x1="25" y1="135" x2="50" y2="135" stroke="#38bdf8" stroke-width="1" stroke-linecap="round" opacity="0.25"/>
    <line x1="295" y1="85" x2="330" y2="85" stroke="#fbbf24" stroke-width="2.5" stroke-linecap="round" filter="url(#glow)"/>
    <line x1="305" y1="105" x2="335" y2="105" stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" opacity="0.4"/>
  </g>
  
  {/* <!-- Floating Package Back --> */}
  <g transform="translate(40, 50) rotate(-12)">
    <rect x="0" y="0" width="26" height="26" rx="4" fill="#f59e0b" filter="url(#drop)"/>
    <rect x="2" y="2" width="22" height="22" rx="2" fill="#fbbf24"/>
    <line x1="13" y1="2" x2="13" y2="24" stroke="#d97706" stroke-width="2"/>
    <line x1="2" y1="13" x2="24" y2="13" stroke="#d97706" stroke-width="2"/>
    <circle cx="13" cy="13" r="3" fill="#f59e0b"/>
  </g>
  
  {/* <!-- Floating Package Front --> */}
  <g transform="translate(270, 40) rotate(8)">
    <rect x="0" y="0" width="22" height="22" rx="4" fill="#10b981" filter="url(#drop)"/>
    <rect x="2" y="2" width="18" height="18" rx="2" fill="#34d399"/>
    <line x1="11" y1="2" x2="11" y2="20" stroke="#059669" stroke-width="1.5"/>
    <line x1="2" y1="11" x2="20" y2="11" stroke="#059669" stroke-width="1.5"/>
    <circle cx="11" cy="11" r="2.5" fill="#10b981"/>
  </g>
  
  {/* <!-- TRUCK BODY --> */}
  <g filter="url(#drop)">
    {/* <!-- Cargo Container --> */}
    <rect x="50" y="58" width="155" height="92" rx="6" fill="url(#tataWhite)"/>
    
    {/* <!-- Container Top Highlight --> */}
    <rect x="52" y="60" width="151" height="3" rx="1.5" fill="white" opacity="0.6"/>
    
    {/* <!-- Container Side Panel Lines --> */}
    <line x1="65" y1="80" x2="190" y2="80" stroke="#94a3b8" stroke-width="0.8" opacity="0.4"/>
    <line x1="65" y1="100" x2="190" y2="100" stroke="#94a3b8" stroke-width="0.8" opacity="0.4"/>
    <line x1="65" y1="120" x2="190" y2="120" stroke="#94a3b8" stroke-width="0.8" opacity="0.4"/>
    <line x1="65" y1="140" x2="190" y2="140" stroke="#94a3b8" stroke-width="0.8" opacity="0.4"/>
    
    {/* <!-- Vertical Ribs on Container --> */}
    <line x1="85" y1="62" x2="85" y2="146" stroke="#cbd5e1" stroke-width="2" opacity="0.5"/>
    <line x1="120" y1="62" x2="120" y2="146" stroke="#cbd5e1" stroke-width="2" opacity="0.5"/>
    <line x1="155" y1="62" x2="155" y2="146" stroke="#cbd5e1" stroke-width="2" opacity="0.5"/>
    
    {/* <!-- Tata Blue Stripe on Container Bottom --> */}
    <rect x="50" y="142" width="155" height="8" rx="2" fill="url(#tataBlue)"/>
    
    {/* <!-- Cab --> */}
    <path d="M205 58 L275 58 Q292 58 297 75 L302 108 Q305 118 305 130 L305 150 L205 150 Z" fill="url(#tataCab)"/>
    
    {/* <!-- Cab Top Highlight --> */}
    <path d="M207 60 L273 60 Q288 60 293 75" stroke="white" stroke-width="2" fill="none" opacity="0.5"/>
    
    {/* <!-- Tata Blue Stripe on Cab --> */}
    <path d="M205 142 L305 142 L305 150 L205 150 Z" fill="url(#tataBlue)"/>
    
    {/* <!-- Windshield --> */}
    <path d="M275 62 L292 62 Q296 62 298 72 L301 100 L275 100 Z" fill="url(#glass)"/>
    <path d="M245 62 L270 62 L270 100 L245 100 Z" fill="url(#glass)"/>
    
    {/* <!-- Side Window --> */}
    <rect x="215" y="68" width="22" height="24" rx="3" fill="url(#glass)"/>
    
    {/* <!-- Window Reflection --> */}
    <path d="M215 68 L230 68 L222 92 L215 92 Z" fill="white" opacity="0.25"/>
    
    {/* <!-- Door Line --> */}
    <line x1="240" y1="62" x2="240" y2="150" stroke="#94a3b8" stroke-width="1" opacity="0.5"/>
    
    {/* <!-- Door Handle --> */}
    <rect x="246" y="112" width="11" height="3" rx="1.5" fill="#64748b"/>
    
    {/* <!-- Side Mirror --> */}
    <rect x="298" y="85" width="5" height="12" rx="2" fill="#334155"/>
    <line x1="298" y1="91" x2="293" y2="91" stroke="#334155" stroke-width="2"/>
    
    {/* <!-- Headlight --> */}
    <rect x="298" y="122" width="9" height="14" rx="4" fill="#fef08a" filter="url(#glow)"/>
    <rect x="300" y="124" width="5" height="10" rx="2" fill="#ffffff"/>
    
    {/* <!-- Headlight Beam --> */}
    <polygon points="307,122 340,115 340,143 307,136" fill="url(#glass)" opacity="0.15"/>
    
    {/* <!-- Taillight --> */}
    <rect x="46" y="122" width="7" height="16" rx="3" fill="#ef4444" filter="url(#glow)"/>
    <rect x="47" y="124" width="4" height="12" rx="2" fill="#fca5a5"/>
    
    {/* <!-- Front Bumper --> */}
    <rect x="290" y="150" width="20" height="11" rx="4" fill="#334155"/>
    <rect x="292" y="152" width="16" height="7" rx="2" fill="#475569"/>
    
    {/* <!-- Rear Bumper --> */}
    <rect x="44" y="150" width="14" height="11" rx="4" fill="#334155"/>
    
    {/* <!-- Chassis / Frame --> */}
    <rect x="48" y="148" width="255" height="5" rx="2.5" fill="#1e293b"/>
    
    {/* <!-- Fuel Tank --> */}
    <rect x="175" y="148" width="22" height="10" rx="5" fill="#475569"/>
    <rect x="177" y="150" width="18" height="6" rx="3" fill="#64748b"/>
    
    {/* <!-- Exhaust Pipe --> */}
    <rect x="60" y="155" width="30" height="4" rx="2" fill="#64748b"/>
  </g>
  
  {/* <!-- WHEELS --> */}
  {/* <!-- Rear Wheel --> */}
  <g transform="translate(95, 170)">
    <circle cx="0" cy="0" r="23" fill="url(#tire)"/>
    <circle cx="0" cy="0" r="15" fill="url(#rim)"/>
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Middle Wheel --> */}
  <g transform="translate(148, 170)">
    <circle cx="0" cy="0" r="23" fill="url(#tire)"/>
    <circle cx="0" cy="0" r="15" fill="url(#rim)"/>
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Front Wheel --> */}
  <g transform="translate(265, 170)">
    <circle cx="0" cy="0" r="23" fill="url(#tire)"/>
    <circle cx="0" cy="0" r="15" fill="url(#rim)"/>
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" stroke-width="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" stroke-width="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Route Path --> */}
  <path d="M35 38 Q170 15 305 38" stroke="url(#tataBlue)" stroke-width="1.5" fill="none" stroke-dasharray="5,4" opacity="0.4"/>
  
  {/* <!-- Start Location Pin --> */}
  <g transform="translate(28, 22)">
    <path d="M0 0 C-7 0 -11 5 -11 11 C-11 18 0 28 0 28 C0 28 11 18 11 11 C11 5 7 0 0 0 Z" fill="#10b981" filter="url(#drop)"/>
    <circle cx="0" cy="9" r="3.5" fill="white"/>
  </g>
  
  {/* <!-- End Location Pin --> */}
  <g transform="translate(312, 22)">
    <path d="M0 0 C-7 0 -11 5 -11 11 C-11 18 0 28 0 28 C0 28 11 18 11 11 C11 5 7 0 0 0 Z" fill="#ef4444" filter="url(#drop)"/>
    <circle cx="0" cy="9" r="3.5" fill="white"/>
  </g>
</svg>
);

export const WarehouseIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 10l9-6 9 6"/>
    <path d="M5 10v10h14V10"/>
    <path d="M9 20v-5h6v5"/>
  </svg>
);

export const CustomerIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="8" r="4"/>
    <path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6"/>
  </svg>
);