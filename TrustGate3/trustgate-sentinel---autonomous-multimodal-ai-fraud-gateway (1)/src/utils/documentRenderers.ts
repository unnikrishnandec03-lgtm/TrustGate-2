/**
 * Procedural canvas renderers for high-fidelity forensic documents.
 * Produces crisp, realistic documents with exact pixel coordinates matching forensic hallmarks.
 */

export function renderDocumentToCanvas(
  presetId: string,
  canvas: HTMLCanvasElement,
  highlightHallmarkId?: string | null
): void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = 900;
  const h = 600;
  canvas.width = w;
  canvas.height = h;

  // Background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  if (presetId === 'clean-payslip') {
    renderCleanPayslip(ctx, w, h);
  } else if (presetId === 'altered-statement') {
    renderAlteredStatement(ctx, w, h);
  } else if (presetId === 'synthetic-kyc') {
    renderSyntheticKycId(ctx, w, h);
  } else if (presetId === 'voice-clone-deepfake') {
    renderAudioWaveformCanvas(ctx, w, h);
  } else if (presetId === 'social-engineering-trap') {
    renderSocialEngineeringEmail(ctx, w, h);
  } else if (presetId === 'wash-trading-cycle') {
    renderWashTradingGraph(ctx, w, h);
  } else {
    renderGenericDocument(ctx, w, h);
  }
}

function renderCleanPayslip(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Paper sheet
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(30, 20, w - 60, h - 40);

  // Border & subtle security pattern
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 20, w - 60, h - 40);

  // Header band
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(40, 30, w - 80, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('NEXUS ENTERPRISE GLOBAL TECHNOLOGIES INC.', 60, 60);

  ctx.font = 'normal 11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#94a3b8';
  ctx.fillText('CONFIDENTIAL EARNINGS STATEMENT • OCT 2026', 60, 72);

  // Status badge
  ctx.fillStyle = '#10b981';
  ctx.fillRect(w - 220, 42, 140, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('✓ HASH VERIFIED', w - 200, 59);

  // Employee details row
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(50, 95, w - 100, 45);
  ctx.strokeStyle = '#e2e8f0';
  ctx.strokeRect(50, 95, w - 100, 45);

  ctx.fillStyle = '#475569';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('EMPLOYEE NAME: ELEANOR VANCE', 65, 112);
  ctx.fillText('EMP ID: #4892-NX', 65, 128);
  ctx.fillText('ROLE: PRINCIPAL SYSTEMS ARCHITECT', 320, 112);
  ctx.fillText('DEPARTMENT: CORE INFRASTRUCTURE', 320, 128);
  ctx.fillText('PAY PERIOD: 01-OCT TO 31-OCT-2026', 580, 112);
  ctx.fillText('DISBURSEMENT: DIRECT DEPOSIT (ACH)', 580, 128);

  // Earnings Table Header
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 155, 380, 24);
  ctx.fillRect(450, 155, 400, 24);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('EARNINGS & ALLOWANCES', 60, 171);
  ctx.fillText('DEDUCTIONS & WITHHOLDINGS', 460, 171);

  // Table items
  const earnings = [
    { name: 'Basic Fixed Salary', amount: '$7,500.00' },
    { name: 'HRA & Living Allowance', amount: '$1,200.00' },
    { name: 'Special Systems Allowance', amount: '$750.00' },
  ];

  const deductions = [
    { name: 'Federal Income Tax (W-4)', amount: '$1,320.30' },
    { name: 'State & Local Withholding', amount: '$530.00' },
    { name: 'Tier-1 Comprehensive Health', amount: '$365.00' },
  ];

  ctx.font = '11px "JetBrains Mono", monospace';
  ctx.fillStyle = '#1e293b';

  earnings.forEach((item, i) => {
    const y = 200 + i * 26;
    ctx.fillText(item.name, 60, y);
    ctx.fillText(item.amount, 360, y);
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(60, y + 6);
    ctx.lineTo(420, y + 6);
    ctx.stroke();
  });

  deductions.forEach((item, i) => {
    const y = 200 + i * 26;
    ctx.fillText(item.name, 460, y);
    ctx.fillText(item.amount, 760, y);
    ctx.strokeStyle = '#f1f5f9';
    ctx.beginPath();
    ctx.moveTo(460, y + 6);
    ctx.lineTo(840, y + 6);
    ctx.stroke();
  });

  // Totals Sub-bars
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(50, 290, 380, 32);
  ctx.fillRect(450, 290, 400, 32);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(50, 290, 380, 32);
  ctx.strokeRect(450, 290, 400, 32);

  ctx.font = 'bold 11px "Plus Jakarta Sans", sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText('TOTAL GROSS EARNINGS: $9,450.00', 60, 310);
  ctx.fillText('TOTAL DEDUCTIONS: $2,215.30', 460, 310);

  // Net Pay Highlight Box (corresponds to [ymin: 680, xmin: 520, ymax: 780, xmax: 920])
  const netX = 500;
  const netY = 360;
  const netW = 340;
  const netH = 65;
  ctx.fillStyle = '#ecfdf5';
  ctx.fillRect(netX, netY, netW, netH);
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(netX, netY, netW, netH);

  ctx.fillStyle = '#065f46';
  ctx.font = 'bold 12px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('OFFICIAL NET DEPOSIT AMOUNT', netX + 20, netY + 26);
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#047857';
  ctx.fillText('$7,234.70 USD', netX + 20, netY + 54);

  // Stamp and Verification
  ctx.strokeStyle = '#059669';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(70, 360, 160, 65);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillStyle = '#059669';
  ctx.fillText('WORKDAY HCM VERIFIED', 80, 382);
  ctx.font = '9px monospace';
  ctx.fillText('TIMESTAMP: 2026-10-01', 80, 400);
  ctx.fillText('CHECKSUM: OK', 80, 414);

  // Footer bar
  ctx.fillStyle = '#64748b';
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillText('Document generated digitally under 26 U.S. Code § 6051. SHA256: 9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08', 60, 520);
}

function renderAlteredStatement(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Paper sheet
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(30, 20, w - 60, h - 40);

  // Bank Header
  ctx.fillStyle = '#004c8f';
  ctx.fillRect(40, 30, w - 80, 46);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 17px "Plus Jakarta Sans", sans-serif';
  ctx.fillText('HDFC BANK • PREMIER ASSET STATEMENT', 60, 60);

  ctx.font = 'normal 10px "JetBrains Mono", monospace';
  ctx.fillStyle = '#bfdbfe';
  ctx.fillText('BRANCH: FORT, MUMBAI • IFSC: HDFC0000004 • A/C #501004928172', 60, 72);

  // Account Summary bar
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(50, 90, w - 100, 50);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(50, 90, w - 100, 50);

  ctx.fillStyle = '#334155';
  ctx.font = '10px "JetBrains Mono", monospace';
  ctx.fillText('ACCOUNT HOLDER: RAJESH VERMA', 65, 110);
  ctx.fillText('STATEMENT PERIOD: 01-JUL-2026 TO 30-SEP-2026', 65, 126);
  ctx.fillText('OPENING BALANCE: ₹2,10,000.00', 480, 110);
  ctx.fillText('CURRENCY: INR (INDIAN RUPEE)', 480, 126);

  // Transaction Ledger Header
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(50, 155, w - 100, 26);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 10px "JetBrains Mono", monospace';
  ctx.fillText('DATE', 65, 172);
  ctx.fillText('TRANSACTION PARTICULARS', 160, 172);
  ctx.fillText('DEBIT (DR)', 460, 172);
  ctx.fillText('CREDIT (CR)', 590, 172);
  ctx.fillText('BALANCE', 740, 172);

  // Rows
  const rows = [
    { date: '04-JUL-26', desc: 'NEFT CR - TECHSOL PVT CONSULTING', dr: '-', cr: '₹1,00,000.00', bal: '₹3,10,000.00' },
    { date: '19-JUL-26', desc: 'UPI DR - PRIME ASSET BROKERAGE', dr: '₹2,20,000.00', cr: '-', bal: '₹90,000.00' },
    // TAMPERED ROW
    { date: '12-AUG-26', desc: 'WIRE IN - OFFSHORE LIQUIDITY DIVIDEND', dr: '-', cr: '₹8,50,000.00', bal: '₹9,40,000.00', altered: true },
    { date: '28-AUG-26', desc: 'ATM WDL - MUMBAI AIRPORT T2', dr: '₹20,000.00', cr: '-', bal: '₹9,20,000.00' },
    { date: '15-SEP-26', desc: 'FD MATURITY INTEREST CREDIT', dr: '-', cr: '₹5,00,000.00', bal: '₹14,20,000.00', alteredBal: true },
  ];

  rows.forEach((r, idx) => {
    const y = 205 + idx * 36;

    if (r.altered) {
      // Highlight row with subtle forgery tell
      ctx.fillStyle = '#fef2f2';
      ctx.fillRect(52, y - 18, w - 104, 32);
      ctx.strokeStyle = '#fca5a5';
      ctx.strokeRect(52, y - 18, w - 104, 32);
    }

    ctx.fillStyle = '#1e293b';
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillText(r.date, 65, y);
    ctx.fillText(r.desc, 160, y);
    ctx.fillText(r.dr, 460, y);

    // Font mismatch for forged credit
    if (r.altered) {
      ctx.font = 'bold 12px Arial, sans-serif'; // Kerning & font weight mismatch!
      ctx.fillStyle = '#dc2626';
      ctx.fillText(r.cr, 586, y);
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.fillStyle = '#1e293b';
    } else {
      ctx.fillText(r.cr, 590, y);
    }

    ctx.fillText(r.bal, 740, y);

    ctx.strokeStyle = '#e2e8f0';
    ctx.beginPath();
    ctx.moveTo(50, y + 14);
    ctx.lineTo(w - 50, y + 14);
    ctx.stroke();
  });

  // Altered Closing Balance Highlight Box
  const cbX = 520;
  const cbY = 410;
  const cbW = 320;
  const cbH = 75;

  ctx.fillStyle = '#fff1f2';
  ctx.fillRect(cbX, cbY, cbW, cbH);
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2;
  ctx.strokeRect(cbX, cbY, cbW, cbH);

  ctx.fillStyle = '#9f1239';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('STATED CLOSING BALANCE (FORGED)', cbX + 15, cbY + 24);
  ctx.font = 'bold 22px "JetBrains Mono", monospace';
  ctx.fillStyle = '#e11d48';
  ctx.fillText('₹14,20,000.00', cbX + 15, cbY + 50);

  ctx.font = 'bold 9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#be123c';
  ctx.fillText('MATH ERROR: EXPECTED SUM IS ₹6,70,000.00', cbX + 15, cbY + 68);

  // Photoshop Watermark finding
  ctx.fillStyle = '#dc2626';
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('⚠️ FORENSIC FLAG: Adobe Photoshop CC 2024 layer structure detected', 60, 440);
  ctx.font = '9px "JetBrains Mono", monospace';
  ctx.fillStyle = '#64748b';
  ctx.fillText('SHA-256: 4a6b4d320fb72462e08615c4d3209581eb080a2b5e28a0115c5443fa7e4a11b9', 60, 520);
}

function renderSyntheticKycId(ctx: CanvasRenderingContext2D, w: number, h: number) {
  // Card background (ID Card plastic look)
  const cardX = 90;
  const cardY = 50;
  const cardW = 720;
  const cardH = 460;

  // Outer drop shadow
  ctx.fillStyle = '#0a0f1d';
  ctx.fillRect(cardX + 8, cardY + 8, cardW, cardH);

  // Gradient card substrate
  const grad = ctx.createLinearGradient(cardX, cardY, cardX + cardW, cardY + cardH);
  grad.addColorStop(0, '#e0e7ff');
  grad.addColorStop(0.5, '#f1f5f9');
  grad.addColorStop(1, '#c7d2fe');
  ctx.fillStyle = grad;
  ctx.fillRect(cardX, cardY, cardW, cardH);

  // Card outline
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2;
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  // Guilloche curved pattern
  ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.lineWidth = 1;
  for (let i = 0; i < 20; i++) {
    ctx.beginPath();
    ctx.arc(cardX + 350 + i * 15, cardY + 200, 140, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Header band
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(cardX + 20, cardY + 20, cardW - 40, 50);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 15px sans-serif';
  ctx.fillText('FEDERAL IDENTITY PERMIT & TRAVEL PASS', cardX + 35, cardY + 46);

  ctx.font = 'normal 10px monospace';
  ctx.fillStyle = '#a5b4fc';
  ctx.fillText('REPUBLIC SYSTEM DELEGATION • CARD ID: #KYC-9981-SF', cardX + 35, cardY + 60);

  // Photo Frame (Bounding Box zone: [180, 110, 480, 420])
  const px = cardX + 35;
  const py = cardY + 90;
  const pw = 180;
  const ph = 220;

  ctx.fillStyle = '#cbd5e1';
  ctx.fillRect(px, py, pw, ph);

  // Simulated synthetic portrait
  // Background
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(px + 10, py + 10, pw - 20, ph - 20);

  // Face oval
  ctx.fillStyle = '#fed7aa';
  ctx.beginPath();
  ctx.ellipse(px + pw / 2, py + 95, 45, 60, 0, 0, Math.PI * 2);
  ctx.fill();

  // Eyes (asymmetric lighting)
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.arc(px + pw / 2 - 18, py + 90, 6, 0, Math.PI * 2);
  ctx.arc(px + pw / 2 + 18, py + 90, 6, 0, Math.PI * 2);
  ctx.fill();

  // Glint mismatch
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(px + pw / 2 - 19, py + 89, 2.5, 0, Math.PI * 2); // Bright specularity
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath();
  ctx.arc(px + pw / 2 + 19, py + 90, 1.2, 0, Math.PI * 2); // Diffuse mismatched glint
  ctx.fill();

  // Diffusion seam halo around portrait
  ctx.strokeStyle = '#f43f5e';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(px + 4, py + 4, pw - 8, ph - 8);

  ctx.fillStyle = '#e11d48';
  ctx.font = 'bold 9px sans-serif';
  ctx.fillText('DIFFUSION INPAINTING SEAM', px + 15, py + ph - 8);

  // Identity Data Fields
  ctx.fillStyle = '#1e293b';
  ctx.font = '10px "JetBrains Mono", monospace';
  const fields = [
    ['FULL SURNAME:', 'KAUFMAN'],
    ['GIVEN NAMES:', 'VIKTOR ALEXANDER'],
    ['NATIONALITY:', 'NEUTRAL ZONE (X0)'],
    ['DATE OF BIRTH:', '14-MAY-1988'],
    ['DOCUMENT NUMBER:', 'T84029140'],
    ['EXPIRY DATE:', '14-MAY-2032'],
    ['ISSUING AUTH:', 'CENTRAL BUREAU OF BIOMETRICS'],
  ];

  fields.forEach(([k, v], i) => {
    const fy = cardY + 115 + i * 26;
    ctx.fillStyle = '#64748b';
    ctx.fillText(k, cardX + 245, fy);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.fillText(v, cardX + 380, fy);
    ctx.font = '10px "JetBrains Mono", monospace';
  });

  // Machine Readable Zone (MRZ)
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(cardX + 20, cardY + cardH - 85, cardW - 40, 65);
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(cardX + 20, cardY + cardH - 85, cardW - 40, 65);

  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('P<UTOKAUFMAN<<VIKTOR<ALEXANDER<<<<<<<<<<<<<<', cardX + 35, cardY + cardH - 55);
  ctx.fillText('T840291405UTO8805148M3205142<<<<<<<<<<<<<<04', cardX + 35, cardY + cardH - 30);
}

function renderAudioWaveformCanvas(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, w, h);

  // Spectrogram header
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, 20, w - 60, 45);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 14px "JetBrains Mono", monospace';
  ctx.fillText('AUDIO SPECTRUM & VOCODER PHASE FORENSIC VIEW', 50, 48);

  // Brickwall filter line at 8.2 kHz
  const cutoffY = 160;
  ctx.strokeStyle = '#f43f5e';
  ctx.setLineDash([6, 4]);
  ctx.beginPath();
  ctx.moveTo(50, cutoffY);
  ctx.lineTo(w - 50, cutoffY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.fillStyle = '#fb7185';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('⚠️ BRICKWALL VOCODER CUTOFF (8,200 Hz) - NEURAL TTS ARTIFACT', 60, cutoffY - 10);

  // Synthetic frequency blocks
  for (let x = 60; x < w - 60; x += 18) {
    const barH = 50 + Math.sin(x * 0.05) * 40 + Math.random() * 30;
    const barY = cutoffY + 30;

    const grad = ctx.createLinearGradient(0, barY, 0, barY + barH);
    grad.addColorStop(0, '#06b6d4');
    grad.addColorStop(1, '#3b82f6');
    ctx.fillStyle = grad;
    ctx.fillRect(x, barY, 12, barH);
  }

  // Waveform area
  const waveY = 360;
  ctx.strokeStyle = '#22d3ee';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(50, waveY);

  for (let x = 50; x < w - 50; x += 4) {
    const amp = Math.sin((x - 50) * 0.12) * Math.sin((x - 50) * 0.02) * 55;
    ctx.lineTo(x, waveY + amp);
  }
  ctx.stroke();

  // Inhalation missing annotation
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('BIOLOGICAL INHALATION GAP: 0 DETECTED (EXPECTED 3-4 IN 8.4s AUDIO)', 60, 460);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '10px monospace';
  ctx.fillText('Target voice clone model: ElevenLabs Speech Synthesis v2 / Phase Jitter Index: 0.88', 60, 485);
}

function renderSocialEngineeringEmail(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, 20, w - 60, h - 40);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 30, w - 80, 70);

  ctx.fillStyle = '#f87171';
  ctx.font = 'bold 13px monospace';
  ctx.fillText('PRETEXTING THREAT: EXECUTIVE IMPERSONATION ATTEMPT', 60, 55);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '11px monospace';
  ctx.fillText('FROM: "David Marcus, CEO" <d.marcus@cfo-office-exec-portal.net>', 60, 75);
  ctx.fillText('TO: Treasury Desk <treasury-desk@nexus-enterprises.internal>', 60, 90);

  // Email body
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 115, w - 80, 340);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '12px "JetBrains Mono", monospace';
  const lines = [
    'CONFIDENTIAL URGENT WIRE DIRECTIVE',
    '------------------------------------------------------------',
    'Team,',
    'I am currently in closed-door M&A escrow arbitration.',
    'Under strict NDA regulatory gag order, do NOT discuss this on Slack or phone.',
    '',
    'Execute immediate offshore wire of $2,450,000 USD to Escrow Account #CH-992-814.',
    'Routing must complete prior to 2:00 PM EST market close or syndicate defaults.',
    '',
    'I will send executive confirmation signature post-settlement.',
    'Confirm receipt immediately.',
    '',
    '- David Marcus, Chief Executive Officer',
  ];

  lines.forEach((line, i) => {
    if (line.includes('Execute immediate') || line.includes('do NOT discuss')) {
      ctx.fillStyle = '#fca5a5';
      ctx.fillText(line, 60, 150 + i * 20);
      ctx.fillStyle = '#e2e8f0';
    } else {
      ctx.fillText(line, 60, 150 + i * 20);
    }
  });

  // Flag footer
  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 11px monospace';
  ctx.fillText('⚡ Autonomous Pretexting Score: 9.4/10 | Homograph Domain: Punycode Spoof Detected', 60, 480);
}

function renderWashTradingGraph(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#020617';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(30, 20, w - 60, 40);
  ctx.fillStyle = '#38bdf8';
  ctx.font = 'bold 13px "JetBrains Mono", monospace';
  ctx.fillText('MEMPOOL WASH-TRADING CYCLE DETECTED (4-HOP CIRCULAR ARBITRAGE)', 50, 46);

  // Circular cycle nodes
  const nodes = [
    { x: 200, y: 180, label: 'Wallet 0x71a (Deployer)', color: '#ef4444' },
    { x: 700, y: 180, label: 'Wallet 0x33b (Relay Hop)', color: '#f59e0b' },
    { x: 700, y: 400, label: 'Wallet 0x99f (DEX Pool)', color: '#ec4899' },
    { x: 200, y: 400, label: 'Wallet 0x12a (Cashout)', color: '#8b5cf6' },
  ];

  // Draw circular arrows
  ctx.strokeStyle = '#38bdf8';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(nodes[0].x, nodes[0].y);
  ctx.lineTo(nodes[1].x, nodes[1].y);
  ctx.lineTo(nodes[2].x, nodes[2].y);
  ctx.lineTo(nodes[3].x, nodes[3].y);
  ctx.closePath();
  ctx.stroke();

  // Nodes
  nodes.forEach((n) => {
    ctx.fillStyle = n.color;
    ctx.beginPath();
    ctx.arc(n.x, n.y, 22, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 11px monospace';
    ctx.fillText(n.label, n.x - 70, n.y + 36);
  });

  // Cycle metric box
  ctx.fillStyle = '#1e1b4b';
  ctx.fillRect(330, 250, 240, 90);
  ctx.strokeStyle = '#6366f1';
  ctx.strokeRect(330, 250, 240, 90);

  ctx.fillStyle = '#a5b4fc';
  ctx.font = 'bold 11px sans-serif';
  ctx.fillText('CIRCULAR FLOW ANALYSIS', 345, 275);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px "JetBrains Mono", monospace';
  ctx.fillText('98.1% RETENTION', 345, 302);
  ctx.font = '10px monospace';
  ctx.fillStyle = '#f43f5e';
  ctx.fillText('Synthetic volume: $4,800,000', 345, 324);
}

function renderGenericDocument(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 40, w - 80, h - 80);
  ctx.fillStyle = '#94a3b8';
  ctx.font = '14px monospace';
  ctx.fillText('CUSTOM UPLOAD DOCUMENT PREVIEW', 80, 80);
}
