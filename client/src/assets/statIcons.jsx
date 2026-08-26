export const OfficeIcon = () => (
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 412 400"
  width="512"
  height="512"
>
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#0f0c29"/>
      <stop offset="50%" stopColor="#302b63"/>
      <stop offset="100%" stopColor="#24243e"/>
    </linearGradient>

    <linearGradient id="desk" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#ff6b6b"/>
      <stop offset="100%" stopColor="#ee5a6f"/>
    </linearGradient>

    <linearGradient id="screen" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#00f5ff"/>
      <stop offset="100%" stopColor="#00c9ff"/>
    </linearGradient>

    <linearGradient id="plant" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#a8ff78"/>
      <stop offset="100%" stopColor="#78ffd6"/>
    </linearGradient>

    <linearGradient id="coffee" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#f6d365"/>
      <stop offset="100%" stopColor="#fda085"/>
    </linearGradient>

    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur in="SourceAlpha" stdDeviation="4"/>
      <feOffset dx="2" dy="4"/>
      <feComponentTransfer>
        <feFuncA type="linear" slope="0.3"/>
      </feComponentTransfer>
      <feMerge>
        <feMergeNode/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  {/* Everything shifted upward to center the illustration */}
  <g transform="translate(0,-55)">

    {/* Background */}
    {/* <rect width="512" height="512" rx="80" fill="url(#bg)"/> */}

    {/* Decorative floating elements */}
    
    <polygon
      points="60,80 90,60 120,80 120,115 90,135 60,115"
      fill="none"
      stroke="#ff6b6b"
      strokeWidth="3"
      opacity="0.4"
    />

    <circle
      cx="430"
      cy="420"
      r="25"
      fill="none"
      stroke="#a8ff78"
      strokeWidth="3"
      opacity="0.3"
    />

    <circle cx="100" cy="400" r="6" fill="#00f5ff" opacity="0.5"/>
    <circle cx="420" cy="100" r="8" fill="#f6d365" opacity="0.4"/>
    <circle cx="80" cy="180" r="4" fill="#fff" opacity="0.3"/>
   

    {/* Floating document */}
    <rect
      x="380"
      y="180"
      width="40"
      height="50"
      rx="4"
      fill="#fff"
      opacity="0.08"
      stroke="#fff"
      strokeWidth="1"
      strokeOpacity="0.2"
    />

    <rect
      x="388"
      y="192"
      width="24"
      height="3"
      rx="1"
      fill="#fff"
      opacity="0.4"
    />

    <rect
      x="388"
      y="202"
      width="18"
      height="3"
      rx="1"
      fill="#fff"
      opacity="0.3"
    />

    <rect
      x="388"
      y="212"
      width="22"
      height="3"
      rx="1"
      fill="#fff"
      opacity="0.35"
    />

    <polygon
      points="380,230 400,230 380,210"
      fill="#fff"
      opacity="0.15"
    />

    {/* Desk */}
    <polygon
      points="156,280 356,280 386,340 126,340"
      fill="url(#desk)"
      filter="url(#shadow)"
    />

    <polygon
      points="156,280 356,280 356,288 156,288"
      fill="#fff"
      opacity="0.15"
    />

    {/* Monitor stand */}
    <polygon
      points="236,280 276,280 276,250 266,240 246,240 236,250"
      fill="#2d3748"
    />

    <ellipse
      cx="256"
      cy="280"
      rx="35"
      ry="8"
      fill="#1a202c"
    />

    {/* Monitor */}
    <rect
      x="186"
      y="160"
      width="140"
      height="90"
      rx="8"
      fill="#1a1a2e"
      filter="url(#shadow)"
    />

    <rect
      x="190"
      y="164"
      width="132"
      height="82"
      rx="6"
      fill="url(#screen)"
      opacity="0.9"
    />

    {/* Code lines */}
    <rect
      x="200"
      y="178"
      width="60"
      height="4"
      rx="2"
      fill="#fff"
      opacity="0.7"
    />

    <rect
      x="200"
      y="188"
      width="40"
      height="4"
      rx="2"
      fill="#fff"
      opacity="0.5"
    />

    <rect
      x="200"
      y="198"
      width="80"
      height="4"
      rx="2"
      fill="#fff"
      opacity="0.6"
    />

    <rect
      x="200"
      y="208"
      width="50"
      height="4"
      rx="2"
      fill="#fff"
      opacity="0.4"
    />

    <rect
      x="200"
      y="218"
      width="70"
      height="4"
      rx="2"
      fill="#fff"
      opacity="0.5"
    />

    <rect
      x="274"
      y="218"
      width="3"
      height="8"
      rx="1"
      fill="#fff"
      opacity="0.9"
    />

    {/* Keyboard */}
    <polygon
      points="210,310 302,310 308,322 204,322"
      fill="#2d3748"
      filter="url(#shadow)"
    />

    <rect x="214" y="313" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="232" y="313" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="250" y="313" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="268" y="313" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="286" y="313" width="12" height="2" rx="1" fill="#4a5568"/>

    <rect x="214" y="317" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="232" y="317" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="250" y="317" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="268" y="317" width="12" height="2" rx="1" fill="#4a5568"/>
    <rect x="286" y="317" width="12" height="2" rx="1" fill="#4a5568"/>

    {/* Mouse */}
    <ellipse
      cx="322"
      cy="316"
      rx="8"
      ry="12"
      fill="#2d3748"
      filter="url(#shadow)"
    />

    <ellipse
      cx="322"
      cy="312"
      rx="4"
      ry="6"
      fill="#4a5568"
    />

    {/* Coffee cup */}
    <ellipse
      cx="330"
      cy="305"
      rx="18"
      ry="10"
      fill="url(#coffee)"
      filter="url(#shadow)"
    />

    <ellipse
      cx="330"
      cy="295"
      rx="16"
      ry="8"
      fill="#f6d365"
    />

    <ellipse
      cx="330"
      cy="295"
      rx="14"
      ry="6"
      fill="#6f4e37"
    />

    <path
      d="M 348,295 Q 358,295 358,305 Q 358,315 348,315"
      fill="none"
      stroke="url(#coffee)"
      strokeWidth="4"
      strokeLinecap="round"
    />

    <path
      d="M 325,285 Q 320,275 325,265"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      opacity="0.3"
      strokeLinecap="round"
    />

    <path
      d="M 335,282 Q 340,272 335,262"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      opacity="0.2"
      strokeLinecap="round"
    />

    {/* Plant pot */}
    <polygon
      points="160,330 190,330 185,300 165,300"
      fill="#d4a373"
      filter="url(#shadow)"
    />

    <ellipse
      cx="175"
      cy="300"
      rx="12"
      ry="5"
      fill="#8b5e3c"
    />

    <polygon
      points="175,300 155,260 175,270"
      fill="url(#plant)"
    />

    <polygon
      points="175,300 195,255 180,275"
      fill="url(#plant)"
      opacity="0.9"
    />

    <polygon
      points="175,300 170,245 185,265"
      fill="url(#plant)"
      opacity="0.8"
    />

    <polygon
      points="175,300 160,270 170,280"
      fill="#78ffd6"
      opacity="0.7"
    />

    {/* Accent rings behind monitor */}
    <circle
      cx="256"
      cy="205"
      r="75"
      fill="none"
      stroke="#00f5ff"
      strokeWidth="1"
      opacity="0.1"
    />

    <circle
      cx="256"
      cy="205"
      r="85"
      fill="none"
      stroke="#ff6b6b"
      strokeWidth="1"
      opacity="0.08"
    />

    {/* Table Legs */}
    <polygon
      points="132,340 152,340 152,410 132,410"
      fill="#1a202c"
      filter="url(#shadow)"
    />

    <polygon
      points="132,340 152,340 152,410 132,410"
      fill="url(#desk)"
      opacity="0.3"
    />

    <polygon
      points="132,340 152,340 152,348 132,348"
      fill="#fff"
      opacity="0.1"
    />

    <polygon
      points="360,340 380,340 380,410 360,410"
      fill="#1a202c"
      filter="url(#shadow)"
    />

    <polygon
      points="360,340 380,340 380,410 360,410"
      fill="url(#desk)"
      opacity="0.3"
    />

    <polygon
      points="360,340 380,340 380,348 360,348"
      fill="#fff"
      opacity="0.1"
    />

    {/* Leg crossbar */}
    <rect
      x="152"
      y="385"
      width="208"
      height="8"
      rx="2"
      fill="#2d3748"
      opacity="0.8"
    />

  </g>
</svg>
);

export const TruckIcon = () => (
<svg width="340" height="220" viewBox="0 0 340 220" xmlns="http://www.w3.org/2000/svg">
  <defs>
    {/* <!-- Tata White Body Gradient --> */}
    <linearGradient id="tataWhite" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#FF8A4C" />
  <stop offset="40%" stopColor="#F26A3D" />
  <stop offset="100%" stopColor="#D94A28" />
</linearGradient>
    
    {/* <!-- Cab Gradient --> */}
    <linearGradient id="tataCab" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#ffffff"/>
      <stop offset="50%" stopColor="#f1f5f9"/>
      <stop offset="100%" stopColor="#cbd5e1"/>
    </linearGradient>
    
    {/* <!-- Tata Blue Accent --> */}
    <linearGradient id="tataBlue" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stopColor="#1e40af"/>
      <stop offset="100%" stopColor="#3b82f6"/>
    </linearGradient>

    {/* <!-- Light White Accent --> */}
<linearGradient id="lightwhite" x1="0%" y1="0%" x2="100%" y2="0%">
  <stop offset="0%" stopColor="#FFFFFF" />
  <stop offset="100%" stopColor="#E2E8F0" />
</linearGradient>
    
    {/* <!-- Window Gradient --> */}
    <linearGradient id="glass" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#bfdbfe"/>
      <stop offset="100%" stopColor="#60a5fa"/>
    </linearGradient>
    
    {/* <!-- Wheel Tire --> */}
    <radialGradient id="tire" cx="50%" cy="50%" r="50%">
      <stop offset="60%" stopColor="#1e293b"/>
      <stop offset="85%" stopColor="#334155"/>
      <stop offset="100%" stopColor="#0f172a"/>
    </radialGradient>
    
    {/* <!-- Rim Silver --> */}
    <radialGradient id="rim" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#f1f5f9"/>
      <stop offset="70%" stopColor="#94a3b8"/>
      <stop offset="100%" stopColor="#64748b"/>
    </radialGradient>
    
    {/* <!-- Hub Center --> */}
    <radialGradient id="hub" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#e2e8f0"/>
      <stop offset="100%" stopColor="#475569"/>
    </radialGradient>
    
    {/* <!-- Shadow --> */}
    <filter id="drop" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="5" stdDeviation="8" floodColor="#000" floodOpacity="0.35"/>
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
  <ellipse cx="170" cy="198" rx="140" ry="9" fill="#F8FAFC" opacity="0.25"/>
  
  {/* <!-- Speed Lines --> */}
  <g opacity="0.5">
    <line x1="15" y1="95" x2="55" y2="95" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)"/>
    <line x1="5" y1="115" x2="45" y2="115" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    <line x1="25" y1="135" x2="50" y2="135" stroke="#38bdf8" strokeWidth="1" strokeLinecap="round" opacity="0.25"/>
    <line x1="295" y1="85" x2="330" y2="85" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round" filter="url(#glow)"/>
    <line x1="305" y1="105" x2="335" y2="105" stroke="#fbbf24" strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
  </g>
  
  
  {/* <!-- TRUCK BODY --> */}
  <g filter="url(#drop)">
    {/* <!-- Cargo Container --> */}
    <rect x="50" y="58" width="155" height="92" rx="6" fill="url(#tataWhite)"/>
    
    {/* <!-- Container Side Panel Lines --> */}
    <line x1="65" y1="80" x2="190" y2="80" stroke="#94a3b8" strokeWidth="0.8" opacity="0.4"/>
    <line x1="65" y1="100" x2="190" y2="100" stroke="#94a3b8" strokeWidth="0.8" opacity="0.4"/>
    <line x1="65" y1="120" x2="190" y2="120" stroke="#94a3b8" strokeWidth="0.8" opacity="0.4"/>
    <line x1="65" y1="140" x2="190" y2="140" stroke="#94a3b8" strokeWidth="0.8" opacity="0.4"/>
    
    {/* <!-- Vertical Ribs on Container --> */}
    <line x1="85" y1="62" x2="85" y2="146" stroke="#cbd5e1" strokeWidth="2" opacity="0.5"/>
    <line x1="120" y1="62" x2="120" y2="146" stroke="#cbd5e1" strokeWidth="2" opacity="0.5"/>
    <line x1="155" y1="62" x2="155" y2="146" stroke="#cbd5e1" strokeWidth="2" opacity="0.5"/>
    
    {/* <!-- Tata Blue Stripe on Container Bottom --> */}
    <rect x="50" y="142" width="155" height="8" rx="2" fill="url(#tataBlue)"/>
    
    {/* <!-- Cab --> */}
    <path d="M205 58 L275 58 Q292 58 297 75 L302 108 Q305 118 305 130 L305 150 L205 150 Z" fill="url(#tataCab)"/>
    
    {/* <!-- Cab Top Highlight --> */}
    <path d="M207 60 L273 60 Q288 60 293 75" stroke="white" strokeWidth="2" fill="none" opacity="0.5"/>
    
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
    <line x1="240" y1="62" x2="240" y2="150" stroke="#94a3b8" strokeWidth="1" opacity="0.5"/>
    
    {/* <!-- Door Handle --> */}
    <rect x="246" y="112" width="11" height="3" rx="1.5" fill="#64748b"/>
    
    {/* <!-- Side Mirror --> */}
    <rect x="298" y="85" width="5" height="12" rx="2" fill="#334155"/>
    <line x1="298" y1="91" x2="293" y2="91" stroke="#334155" strokeWidth="2"/>
    
    {/* <!-- Headlight --> */}
    <rect x="298" y="122" width="9" height="14" rx="4" fill="#fef08a" filter="url(#glow)"/>
    <rect x="300" y="124" width="5" height="10" rx="2" fill="#ffffff"/>
    
    {/* <!-- Headlight Beam --> */}
    <polygon points="307,122 340,115 340,143 307,136" fill="url(#glass)" opacity="0.20"/>
    
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
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" strokeWidth="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Middle Wheel --> */}
  <g transform="translate(148, 170)">
    <circle cx="0" cy="0" r="23" fill="url(#tire)"/>
    <circle cx="0" cy="0" r="15" fill="url(#rim)"/>
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" strokeWidth="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Front Wheel --> */}
  <g transform="translate(265, 170)">
    <circle cx="0" cy="0" r="23" fill="url(#tire)"/>
    <circle cx="0" cy="0" r="15" fill="url(#rim)"/>
    <line x1="0" y1="-15" x2="0" y2="15" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="-7.5" x2="13" y2="7.5" stroke="#64748b" strokeWidth="2.5"/>
    <line x1="-13" y1="7.5" x2="13" y2="-7.5" stroke="#64748b" strokeWidth="2.5"/>
    <circle cx="0" cy="0" r="7" fill="url(#hub)"/>
    <circle cx="0" cy="0" r="3" fill="#1e293b"/>
  </g>
  
  {/* <!-- Route Path --> */}
  <path d="M35 38 Q170 15 305 38" stroke="url(#lightwhite)" strokeWidth="1.5" fill="none" strokeDasharray="5,4" opacity="0.4"/>
  
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
<svg xmlns="http://www.w3.org/2000/svg" viewBox="80 136 336 312" fill="none">
  
  {/* <!-- Ground Grid --> */}
  <path d="M96 352 L256 448 L416 352" stroke="#1E293B" strokeWidth="4" strokeLinecap="round"/>
  <path d="M136 328 L256 400 L376 328" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" opacity="0.5"/>
  
  {/* <!-- Outside Floor Blocks (Pavement) --> */}
<g stroke="#CBD5E1" strokeWidth="1.5" strokeLinejoin="round">
  <path d="M152 378 L166 386 L152 394 L138 386 Z" fill="#F8FAFC"/>
  <path d="M180 394 L194 402 L180 410 L166 402 Z" fill="#D98F1F"/> 
  <path d="M124 362 L138 370 L124 378 L110 370 Z" fill="#F1F5F9"/> 
  <path d="M138 394 L152 402 L138 410 L124 402 Z" fill="#E2E8F0"/>  
  <path d="M166 410 L180 418 L166 426 L152 418 Z" fill="#D6482B"/> 
  <path d="M110 378 L124 386 L110 394 L96 386 Z" fill="#E2E8F0"/>  
  <path d="M152 410 L166 418 L152 426 L138 418 Z" fill="#C23E24"/> 
  <path d="M180 426 L194 434 L180 442 L166 434 Z" fill="#CBD5E1"/> 
  <path d="M196 386 L210 394 L196 402 L182 394 Z" fill="#F1F5F9"/>
  <path d="M168 370 L182 378 L168 386 L154 378 Z" fill="#F8FAFC"/>
</g>
  
  {/* <!-- Warehouse Structure --> */}
  {/* <!-- Main Building Body --> */}
  <path d="M128 240 L256 312 L256 416 L128 344 Z" fill="#334155" stroke="#475569" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M256 312 L384 240 L384 344 L256 416 Z" fill="#1E293B" stroke="#475569" strokeWidth="3" strokeLinejoin="round"/>
  
  {/* <!-- Roof --> */}
  <path d="M128 240 L256 168 L384 240 L256 312 Z" fill="#64748B" stroke="#94A3B8" strokeWidth="3" strokeLinejoin="round"/>
  <path d="M256 168 L256 312" stroke="#475569" strokeWidth="2" opacity="0.3"/>
  
  {/* <!-- Roof Accent / Skylight --> */}
  <path d="M200 200 L256 232 L312 200 L256 168 Z" fill="#38BDF8" opacity="0.9"/>
  
  {/* <!-- Loading Dock Door --> */}
  <path d="M160 268 L220 302 L220 380 L160 346 Z" fill="#0F172A" stroke="#38BDF8" strokeWidth="2"/>
  
  {/* <!-- Door Scanning Lines --> */}
  <path d="M175 278 L205 295" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  <path d="M175 295 L205 312" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6"/>
  
  {/* <!-- STAIRS (Outside Door) --> */}
  <g strokeLinejoin="round">
    {/* <!-- Stair Side Faces (Left) --> */}
    <path d="M160 346 L152 348 L152 357 L160 355 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1"/>
    <path d="M152 357 L144 359 L144 368 L152 366 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1"/>
    <path d="M144 368 L136 370 L136 377 L144 375 Z" fill="#1E293B" stroke="#1E293B" strokeWidth="1"/>
    
    {/* <!-- Stair Riser Fronts --> */}
    <path d="M152 348 L188 369 L188 378 L152 357 Z" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
    <path d="M144 359 L180 380 L180 389 L144 368 Z" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
    <path d="M136 370 L172 391 L172 398 L136 377 Z" fill="#334155" stroke="#475569" strokeWidth="1.5"/>
    
    {/* <!-- Stair Tread Tops --> */}
    <path d="M160 346 L196 367 L188 369 L152 348 Z" fill="#475569" stroke="#94A3B8" strokeWidth="1"/>
    <path d="M152 357 L188 378 L180 380 L144 359 Z" fill="#475569" stroke="#94A3B8" strokeWidth="1"/>
    <path d="M144 368 L180 389 L172 391 L136 370 Z" fill="#475569" stroke="#94A3B8" strokeWidth="1"/>
  </g>
  
  {/* <!-- Threshold Platform (Right of Stairs) --> */}
  <path d="M196 367 L220 380 L220 388 L196 375 Z" fill="#475569" stroke="#475569" strokeWidth="1"/>
  <path d="M196 375 L220 388 L220 384 L196 371 Z" fill="#334155" stroke="#334155" strokeWidth="1"/>
  
  {/* <!-- Window (Right Face) --> */}
  <path d="M288 340 L352 302 L352 340 L288 378 Z" fill="#38BDF8" opacity="0.2" stroke="#38BDF8" strokeWidth="2"/>
  <path d="M288 340 L352 340" stroke="#38BDF8" strokeWidth="2" opacity="0.5"/>
  <path d="M320 321 L320 359" stroke="#38BDF8" strokeWidth="2" opacity="0.5"/>
  
  {/* <!-- Scanning Beam --> */}
  <path d="M160 346 L220 380" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
  <path d="M165 344 L165 352" stroke="#F59E0B" strokeWidth="2"/>
  <path d="M180 353 L180 361" stroke="#F59E0B" strokeWidth="2"/>
  <path d="M195 362 L195 370" stroke="#F59E0B" strokeWidth="2"/>
  <path d="M210 371 L210 379" stroke="#F59E0B" strokeWidth="2"/>
  
  {/* <!-- Floating Parcel --> */}
  <g transform="translate(320, 200)">
    <path d="M0 16 L24 30 L48 16 L24 2 Z" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="2"/>
    <path d="M0 16 L0 40 L24 54 L24 30 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="2"/>
    <path d="M24 30 L24 54 L48 40 L48 16 Z" fill="#CBD5E1" stroke="#94A3B8" strokeWidth="2"/>
    <path d="M8 20 L24 29 L40 20 L24 11 Z" fill="#38BDF8" opacity="0.8"/>
    <path d="M24 -8 C32 -8 32 2 24 2" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.6"/>
    <path d="M24 -16 C40 -16 40 2 24 2" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.4"/>
    <path d="M24 -24 C48 -24 48 2 24 2" stroke="#F59E0B" strokeWidth="2" fill="none" opacity="0.2"/>
  </g>
  
  {/* <!-- Shadow under floating box --> */}
  <ellipse cx="344" cy="270" rx="16" ry="8" fill="#000" opacity="0.3"/>
  
  {/* <!-- Data Flow Lines --> */}
  <path d="M344 254 L344 290 L296 318" stroke="#38BDF8" strokeWidth="2" strokeDasharray="4 4" opacity="0.6" fill="none"/>
  <circle cx="296" cy="318" r="3" fill="#38BDF8"/>
</svg>
);

export const CustomerIcon = () => (
 <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="120" height="120">
  <defs>
    {/* <!-- Deep space background --> */}
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#1e293b"/>
      <stop offset="100%" stopColor="#0f172a"/>
    </radialGradient>
    
    {/* <!-- Subtle silver sheen for figures --> */}
    <linearGradient id="silver" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stopColor="#f8fafc"/>
      <stop offset="100%" stopColor="#94a3b8"/>
    </linearGradient>
    
    {/* <!-- Premium accent glow --> */}
    <radialGradient id="accentGlow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25"/>
      <stop offset="100%" stopColor="#38bdf8" stopOpacity="0"/>
    </radialGradient>
    
    {/* <!-- Soft shadow for depth --> */}
    <filter id="softShadow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="1" stdDeviation="2" floodColor="#000" floodOpacity="0.4"/>
    </filter>
  </defs>
  
  
  {/* <!-- Left figure (abstract geometric human) --> */}
  <g filter="url(#softShadow)">
    <circle cx="42" cy="48" r="10" fill="url(#silver)" opacity="0.9"/>
    <path d="M 42 60 L 42 60 C 48 60, 52 65, 52 75 L 52 82 C 52 86, 48 88, 42 88 C 36 88, 32 86, 32 82 L 32 75 C 32 65, 36 60, 42 60 Z" fill="url(#silver)" opacity="0.85"/>
  </g>
  
  {/* <!-- Right figure --> */}
  <g filter="url(#softShadow)">
    <circle cx="78" cy="48" r="10" fill="url(#silver)" opacity="0.9"/>
    <path d="M 78 60 L 78 60 C 84 60, 88 65, 88 75 L 88 82 C 88 86, 84 88, 78 88 C 72 88, 68 86, 68 82 L 68 75 C 68 65, 72 60, 78 60 Z" fill="url(#silver)" opacity="0.85"/>
  </g>
  
  {/* <!-- Center figure (leader/primary - slightly larger) --> */}
  <g filter="url(#softShadow)">
    <circle cx="60" cy="38" r="11" fill="#f1f5f9"/>
    <path d="M 60 52 L 60 52 C 67 52, 72 58, 72 70 L 72 78 C 72 83, 67 86, 60 86 C 53 86, 48 83, 48 78 L 48 70 C 48 58, 53 52, 60 52 Z" fill="#f1f5f9"/>
  </g>
  
  {/* <!-- Premium accent ring --> */}
  <circle cx="60" cy="60" r="56" fill="none" stroke="#334155" strokeWidth="1.5" opacity="0.8"/>
  <circle cx="60" cy="60" r="56" fill="none" stroke="#38bdf8" strokeWidth="1" opacity="0.3" />
  
  {/* <!-- Subtle glow behind center figure --> */}
  <circle cx="60" cy="55" r="25" fill="url(#accentGlow)"/>
</svg>
);