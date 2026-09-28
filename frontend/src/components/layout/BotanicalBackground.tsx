import React from 'react';

export const BotanicalBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none bg-[#edf4ed]"
      aria-hidden="true"
    >
      <svg
        className="w-full h-full object-cover min-w-[1024px]"
        viewBox="0 0 1440 900"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Subtle soft gradient background overlay */}
          <linearGradient id="botanical-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f3f8f3" />
            <stop offset="60%" stopColor="#edf4ed" />
            <stop offset="100%" stopColor="#e3ede3" />
          </linearGradient>

          {/* Leaf / Canopy soft organic green fill */}
          <radialGradient id="canopy-glow" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#d4e7d5" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#bdd4be" stopOpacity="0.45" />
          </radialGradient>
        </defs>

        {/* Global canvas wash */}
        <rect width="1440" height="900" fill="url(#botanical-bg-grad)" />

        {/* ============================================================ */}
        {/* LEFT BOTANICAL TREE ILLUSTRATION                            */}
        {/* ============================================================ */}
        <g opacity="0.95">
          {/* Ground contour & concentric ripple arcs */}
          <ellipse
            cx="170"
            cy="900"
            rx="480"
            ry="280"
            stroke="#688a6d"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
          />
          <ellipse
            cx="170"
            cy="900"
            rx="340"
            ry="200"
            stroke="#688a6d"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.28"
          />
          <ellipse
            cx="170"
            cy="900"
            rx="200"
            ry="120"
            stroke="#688a6d"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.32"
          />

          {/* Leaf Canopy Circles (Dotted & Translucent Fill) */}
          {/* 1. Lower Left Canopy */}
          <circle
            cx="75"
            cy="565"
            r="46"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeDasharray="5 5"
          />

          {/* 2. Mid Left Canopy */}
          <circle
            cx="115"
            cy="420"
            r="54"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeDasharray="5 5"
          />

          {/* 3. Upper Left Canopy */}
          <circle
            cx="155"
            cy="330"
            r="66"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeDasharray="5 5"
          />

          {/* 4. Top Center Crown Canopy (Largest, Overlapping) */}
          <circle
            cx="210"
            cy="265"
            r="72"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />

          {/* 5. Top Right Crown Canopy */}
          <circle
            cx="280"
            cy="335"
            r="58"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeDasharray="5 5"
          />

          {/* 6. Mid Right Canopy */}
          <circle
            cx="320"
            cy="500"
            r="52"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeDasharray="5 5"
          />

          {/* Main Tree Trunk & Organic Branches */}
          {/* Main vertical trunk */}
          <path
            d="M 172 900 C 170 760, 168 620, 166 480 C 165 420, 172 350, 192 280"
            stroke="#537559"
            strokeWidth="2.8"
            strokeLinecap="round"
          />

          {/* Branch to Lower Left */}
          <path
            d="M 169 725 C 150 680, 115 625, 78 575"
            stroke="#5e8264"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Branch to Mid Left */}
          <path
            d="M 167 590 C 152 535, 134 475, 118 430"
            stroke="#5e8264"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Branch to Upper Left */}
          <path
            d="M 166 485 C 162 430, 160 380, 156 345"
            stroke="#5e8264"
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Branch to Upper Right Crown */}
          <path
            d="M 176 385 C 205 365, 245 350, 275 340"
            stroke="#5e8264"
            strokeWidth="2.0"
            strokeLinecap="round"
          />

          {/* Branch to Mid Right */}
          <path
            d="M 167 635 C 210 595, 270 550, 315 510"
            stroke="#5e8264"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Little sprig at very top left */}
          <path
            d="M 140 100 C 150 115, 175 125, 185 110 C 170 95, 150 90, 140 100 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.5"
          />
        </g>

        {/* ============================================================ */}
        {/* TOP RIGHT HANGING BOTANICAL SPRIG                           */}
        {/* ============================================================ */}
        <g opacity="0.9">
          {/* Main curving vine stem */}
          <path
            d="M 1410 0 C 1380 90, 1350 210, 1335 320"
            stroke="#537559"
            strokeWidth="2.2"
            strokeLinecap="round"
          />

          {/* Leaf Pair 1 */}
          <path
            d="M 1396 75 C 1350 60, 1315 75, 1300 95 C 1335 115, 1375 105, 1396 75 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />
          <path
            d="M 1388 90 C 1425 90, 1445 75, 1455 60 C 1435 98, 1410 110, 1388 90 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />

          {/* Leaf Pair 2 */}
          <path
            d="M 1372 165 C 1320 155, 1285 175, 1270 200 C 1310 220, 1350 205, 1372 165 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />
          <path
            d="M 1365 185 C 1405 190, 1430 180, 1440 160 C 1420 205, 1390 215, 1365 185 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />

          {/* Leaf Pair 3 */}
          <path
            d="M 1348 260 C 1300 255, 1265 275, 1250 300 C 1290 320, 1330 300, 1348 260 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />
          <path
            d="M 1342 278 C 1378 285, 1405 280, 1415 260 C 1395 305, 1365 310, 1342 278 Z"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
          />
        </g>

        {/* ============================================================ */}
        {/* RIGHT ARCHITECTURAL PINE / FIR TREES                         */}
        {/* ============================================================ */}
        <g opacity="0.95">
          {/* Subtle terrain curves on right */}
          <ellipse
            cx="1350"
            cy="900"
            rx="500"
            ry="260"
            stroke="#688a6d"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.25"
          />
          <ellipse
            cx="1350"
            cy="900"
            rx="320"
            ry="170"
            stroke="#688a6d"
            strokeWidth="1.2"
            strokeDasharray="4 6"
            strokeOpacity="0.28"
          />

          {/* --- Smaller Pine Tree (Left of Pair) --- */}
          {/* Central Trunk */}
          <line
            x1="1200"
            y1="450"
            x2="1200"
            y2="900"
            stroke="#537559"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Tier 1 (Top) */}
          <polygon
            points="1200,440 1162,530 1238,530"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Tier 2 (Middle) */}
          <polygon
            points="1200,515 1140,625 1260,625"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Tier 3 (Bottom) */}
          <polygon
            points="1200,600 1110,735 1290,735"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* --- Larger Pine Tree (Right of Pair) --- */}
          {/* Central Trunk */}
          <line
            x1="1340"
            y1="280"
            x2="1340"
            y2="900"
            stroke="#537559"
            strokeWidth="2.6"
            strokeLinecap="round"
          />

          {/* Tier 1 (Top) */}
          <polygon
            points="1340,265 1285,385 1395,385"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Tier 2 */}
          <polygon
            points="1340,365 1255,505 1425,505"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Tier 3 */}
          <polygon
            points="1340,475 1220,645 1460,645"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Tier 4 (Bottom) */}
          <polygon
            points="1340,600 1175,795 1505,795"
            fill="url(#canopy-glow)"
            stroke="#5e8264"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </div>
  );
};
