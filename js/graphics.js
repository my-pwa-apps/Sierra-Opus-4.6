/* ============================================
   King's Quest: The Enchanted Isle
   Graphics - Procedural pixel-art rendering
   ============================================ */

const GFX = {

  // ── EGA-ish Color Palette ──
  C: {
    BLACK: '#000000',
    DKBLUE: '#003366',
    BLUE: '#2255AA',
    LTBLUE: '#5588CC',
    SKYBLUE: '#88BBEE',
    DKGREEN: '#205020',
    GREEN: '#338833',
    LTGREEN: '#55BB55',
    GRASSGREEN: '#44AA44',
    DKBROWN: '#3B2010',
    BROWN: '#7B4B20',
    LTBROWN: '#AA7744',
    TAN: '#CCAA77',
    SAND: '#E8D8A0',
    DKGRAY: '#444444',
    GRAY: '#888888',
    LTGRAY: '#BBBBBB',
    WHITE: '#EEEEEE',
    RED: '#CC3333',
    DKRED: '#882222',
    ORANGE: '#DD8833',
    YELLOW: '#DDCC33',
    GOLD: '#DAA520',
    PURPLE: '#774488',
    DKPURPLE: '#442255',
    PINK: '#CC77AA',
    SKIN: '#EEBB88',
    LTSKIN: '#FFDDBB',
    WATER: '#2244AA',
    DKWATER: '#112266',
    STONE: '#9999AA',
    DKSTONE: '#666677',
    PUDDING: '#DD9944',
  },

  // ── Utility ──
  rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), Math.ceil(w), Math.ceil(h));
  },

  pixel(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(Math.floor(x), Math.floor(y), 1, 1);
  },

  // ── Sky Gradient ──
  drawSky(ctx, w, h, topColor, bottomColor) {
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, topColor);
    grad.addColorStop(1, bottomColor);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  },

  hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  },

  // ── Clouds ──
  drawCloud(ctx, x, y, size) {
    const c = this.C;
    const s = size;
    this.rect(ctx, x, y, s*3, s, c.WHITE);
    this.rect(ctx, x+s*0.5, y-s*0.5, s*2, s*0.5, c.WHITE);
    this.rect(ctx, x-s*0.3, y+s*0.2, s*0.5, s*0.5, c.WHITE);
    this.rect(ctx, x+s*2.8, y+s*0.2, s*0.5, s*0.5, c.WHITE);
  },

  // ── Mountains ──
  drawMountain(ctx, x, y, w, h, color, snowColor) {
    const peakX = x + w/2;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y + h);
    ctx.lineTo(peakX, y);
    ctx.lineTo(x + w, y + h);
    ctx.closePath();
    ctx.fill();

    if (snowColor) {
      ctx.fillStyle = snowColor;
      ctx.beginPath();
      ctx.moveTo(peakX, y);
      ctx.lineTo(peakX - w*0.08, y + h*0.15);
      ctx.lineTo(peakX - w*0.15, y + h*0.12);
      ctx.lineTo(peakX - w*0.12, y + h*0.2);
      ctx.lineTo(peakX + w*0.12, y + h*0.2);
      ctx.lineTo(peakX + w*0.15, y + h*0.12);
      ctx.lineTo(peakX + w*0.08, y + h*0.15);
      ctx.closePath();
      ctx.fill();
    }
  },

  // ── Trees ──
  drawPineTree(ctx, x, y, h) {
    const c = this.C;
    // Trunk
    this.rect(ctx, x-1, y-h*0.3, 3, h*0.3, c.BROWN);
    // Foliage layers
    const layers = 3;
    for (let i = 0; i < layers; i++) {
      const ly = y - h*0.3 - i*(h*0.22);
      const lw = h*0.4 - i*(h*0.08);
      ctx.fillStyle = i % 2 === 0 ? c.DKGREEN : c.GREEN;
      ctx.beginPath();
      ctx.moveTo(x - lw/2, ly);
      ctx.lineTo(x + 1, ly - h*0.25);
      ctx.lineTo(x + lw/2 + 1, ly);
      ctx.closePath();
      ctx.fill();
    }
  },

  drawDeciduousTree(ctx, x, y, h) {
    const c = this.C;
    // Trunk
    this.rect(ctx, x-2, y-h*0.4, 4, h*0.4, c.BROWN);
    // Canopy
    const r = h * 0.3;
    ctx.fillStyle = c.GREEN;
    ctx.beginPath();
    ctx.arc(x+1, y - h*0.55, r, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.LTGREEN;
    ctx.beginPath();
    ctx.arc(x-r*0.3, y - h*0.6, r*0.7, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.DKGREEN;
    ctx.beginPath();
    ctx.arc(x+r*0.4, y - h*0.5, r*0.6, 0, Math.PI*2);
    ctx.fill();
  },

  drawPalmTree(ctx, x, y, h) {
    const c = this.C;
    // Trunk (slightly curved)
    for (let i = 0; i < h*0.7; i++) {
      const tx = x + Math.sin(i * 0.03) * 3;
      this.rect(ctx, tx, y - i, 3, 1, i < h*0.35 ? c.BROWN : c.LTBROWN);
    }
    // Fronds
    const topY = y - h*0.7;
    const topX = x + Math.sin(h*0.7*0.03)*3;
    for (let f = 0; f < 5; f++) {
      const angle = (f / 5) * Math.PI * 2 - Math.PI * 0.3;
      ctx.strokeStyle = f % 2 === 0 ? c.GREEN : c.LTGREEN;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(topX+1, topY);
      const endX = topX + Math.cos(angle) * h*0.4;
      const endY = topY + Math.sin(angle) * h*0.25 - 3;
      ctx.quadraticCurveTo(topX + Math.cos(angle)*h*0.2, topY - 5, endX, endY);
      ctx.stroke();
    }
  },

  // ── Water ──
  drawWater(ctx, x, y, w, h, phase) {
    const c = this.C;
    for (let row = 0; row < h; row++) {
      const t = row / h;
      const color = t < 0.5 ? c.WATER : c.DKWATER;
      ctx.fillStyle = color;
      ctx.fillRect(x, y + row, w, 1);
      // Waves
      if (row % 4 === 0) {
        const waveX = ((phase * 20 + row * 3) % w);
        ctx.fillStyle = '#5577CC';
        ctx.fillRect(x + waveX, y + row, 8, 1);
        ctx.fillRect(x + ((waveX + w/2) % w), y + row, 6, 1);
      }
    }
  },

  // ── Ground/Grass ──
  drawGrass(ctx, x, y, w, h, color1, color2) {
    const c1 = color1 || this.C.GRASSGREEN;
    const c2 = color2 || this.C.GREEN;
    this.rect(ctx, x, y, w, h, c1);
    // Texture
    for (let i = 0; i < w * h * 0.05; i++) {
      const gx = x + Math.floor(this.seededRandom(i * 7) * w);
      const gy = y + Math.floor(this.seededRandom(i * 13) * h);
      this.pixel(ctx, gx, gy, c2);
    }
  },

  drawDirt(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, c.BROWN);
    for (let i = 0; i < w * h * 0.03; i++) {
      const dx = x + Math.floor(this.seededRandom(i * 11) * w);
      const dy = y + Math.floor(this.seededRandom(i * 17) * h);
      this.pixel(ctx, dx, dy, this.seededRandom(i) > 0.5 ? c.LTBROWN : c.DKBROWN);
    }
  },

  drawStoneFloor(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, c.DKSTONE);
    // Stone tiles
    for (let tx = x; tx < x + w; tx += 20) {
      for (let ty = y; ty < y + h; ty += 12) {
        const offset = (Math.floor(ty / 12) % 2) * 10;
        this.rect(ctx, tx + offset, ty, 19, 11, c.STONE);
        this.rect(ctx, tx + offset + 1, ty + 1, 17, 9, c.LTGRAY);
      }
    }
  },

  // ── Stone Wall ──
  drawStoneWall(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, c.DKSTONE);
    for (let row = 0; row < h; row += 8) {
      const offset = (Math.floor(row / 8) % 2) * 12;
      for (let col = 0; col < w; col += 24) {
        this.rect(ctx, x + col + offset, y + row, 22, 7, c.STONE);
        this.rect(ctx, x + col + offset + 1, y + row + 1, 20, 5,
          this.seededRandom(row * 100 + col) > 0.5 ? '#8888AA' : '#9999BB');
      }
    }
  },

  // ── Castle Elements ──
  drawCastleWall(ctx, x, y, w, h) {
    const c = this.C;
    this.drawStoneWall(ctx, x, y, w, h);
    // Battlements
    for (let bx = x; bx < x + w; bx += 10) {
      if (Math.floor(bx / 10) % 2 === 0) {
        this.rect(ctx, bx, y - 6, 9, 6, c.STONE);
        this.rect(ctx, bx + 1, y - 5, 7, 4, c.LTGRAY);
      }
    }
  },

  drawWindow(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, c.DKBLUE);
    this.rect(ctx, x + 1, y + 1, w-2, h-2, '#335588');
    // Cross panes
    this.rect(ctx, x + w/2 - 0.5, y, 1, h, c.DKSTONE);
    this.rect(ctx, x, y + h/2 - 0.5, w, 1, c.DKSTONE);
    // Light
    this.rect(ctx, x + 2, y + 2, w/2 - 3, h/2 - 3, '#4477AA');
  },

  drawTorch(ctx, x, y, phase) {
    const c = this.C;
    // Bracket
    this.rect(ctx, x, y, 2, 8, c.DKGRAY);
    this.rect(ctx, x - 1, y + 2, 4, 2, c.DKGRAY);
    // Flame
    const flicker = Math.sin(phase * 5) * 1.5;
    ctx.fillStyle = c.YELLOW;
    ctx.beginPath();
    ctx.arc(x + 1, y - 1 + flicker, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = c.ORANGE;
    ctx.beginPath();
    ctx.arc(x + 1, y + flicker, 1.5, 0, Math.PI * 2);
    ctx.fill();
  },

  // ── Door ──
  drawDoor(ctx, x, y, w, h, color) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, color || c.DKBROWN);
    this.rect(ctx, x + 1, y + 1, w-2, h-2, c.BROWN);
    // Panels
    this.rect(ctx, x + 3, y + 3, w-6, h*0.4, c.LTBROWN);
    this.rect(ctx, x + 3, y + h*0.5, w-6, h*0.4, c.LTBROWN);
    // Handle
    this.rect(ctx, x + w - 5, y + h*0.5, 2, 2, c.GOLD);
  },

  // ── Throne ──
  drawThrone(ctx, x, y) {
    const c = this.C;
    // Back
    this.rect(ctx, x, y, 24, 4, c.GOLD);
    this.rect(ctx, x + 2, y + 4, 20, 28, c.DKRED);
    this.rect(ctx, x + 4, y + 6, 16, 24, c.RED);
    // Seat
    this.rect(ctx, x, y + 24, 24, 4, c.GOLD);
    // Legs
    this.rect(ctx, x + 2, y + 28, 3, 8, c.GOLD);
    this.rect(ctx, x + 19, y + 28, 3, 8, c.GOLD);
    // Crown emblem
    this.rect(ctx, x + 9, y + 8, 6, 3, c.GOLD);
    this.rect(ctx, x + 8, y + 8, 2, 2, c.GOLD);
    this.rect(ctx, x + 14, y + 8, 2, 2, c.GOLD);
    this.rect(ctx, x + 11, y + 7, 2, 1, c.GOLD);
  },

  // ── Treasure Chest ──
  drawChest(ctx, x, y, open) {
    const c = this.C;
    if (open) {
      // Lid open
      this.rect(ctx, x, y - 6, 16, 6, c.BROWN);
      this.rect(ctx, x + 1, y - 5, 14, 4, c.LTBROWN);
      this.rect(ctx, x + 6, y - 7, 4, 2, c.GOLD);
    }
    // Body
    this.rect(ctx, x, y, 16, 10, c.BROWN);
    this.rect(ctx, x + 1, y + 1, 14, 8, c.LTBROWN);
    // Lock
    this.rect(ctx, x + 6, y + 2, 4, 4, c.GOLD);
    if (open) {
      // Sparkle inside
      this.pixel(ctx, x + 4, y + 3, c.YELLOW);
      this.pixel(ctx, x + 10, y + 4, c.YELLOW);
    }
  },

  // ── Barrel ──
  drawBarrel(ctx, x, y) {
    const c = this.C;
    this.rect(ctx, x, y, 12, 14, c.BROWN);
    this.rect(ctx, x + 1, y + 1, 10, 12, c.LTBROWN);
    this.rect(ctx, x, y + 3, 12, 2, c.DKBROWN);
    this.rect(ctx, x, y + 9, 12, 2, c.DKBROWN);
  },

  // ── Boat ──
  drawBoat(ctx, x, y, hasHole, fixed) {
    const c = this.C;
    // Hull
    ctx.fillStyle = c.BROWN;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 40, y);
    ctx.lineTo(x + 35, y + 12);
    ctx.lineTo(x + 5, y + 12);
    ctx.closePath();
    ctx.fill();
    // Interior
    ctx.fillStyle = c.LTBROWN;
    ctx.beginPath();
    ctx.moveTo(x + 3, y + 1);
    ctx.lineTo(x + 37, y + 1);
    ctx.lineTo(x + 33, y + 10);
    ctx.lineTo(x + 7, y + 10);
    ctx.closePath();
    ctx.fill();
    // Mast
    this.rect(ctx, x + 18, y - 25, 2, 25, c.DKBROWN);
    // Sail
    ctx.fillStyle = c.WHITE;
    ctx.beginPath();
    ctx.moveTo(x + 20, y - 24);
    ctx.lineTo(x + 36, y - 10);
    ctx.lineTo(x + 20, y - 5);
    ctx.closePath();
    ctx.fill();

    if (hasHole && !fixed) {
      // Hole
      ctx.fillStyle = c.BLACK;
      ctx.beginPath();
      ctx.arc(x + 12, y + 8, 3, 0, Math.PI*2);
      ctx.fill();
      // Water dripping
      this.rect(ctx, x + 11, y + 11, 3, 2, c.WATER);
    }
    if (fixed) {
      // Tar patch
      ctx.fillStyle = '#333';
      ctx.beginPath();
      ctx.arc(x + 12, y + 8, 4, 0, Math.PI*2);
      ctx.fill();
    }
  },

  // ── Bridge ──
  drawBridge(ctx, x, y, w) {
    const c = this.C;
    // Stone supports
    this.rect(ctx, x, y, 8, 40, c.STONE);
    this.rect(ctx, x + w - 8, y, 8, 40, c.STONE);
    // Deck
    this.rect(ctx, x, y, w, 6, c.DKBROWN);
    this.rect(ctx, x + 1, y + 1, w-2, 4, c.BROWN);
    // Railings
    for (let rx = x + 4; rx < x + w - 4; rx += 8) {
      this.rect(ctx, rx, y - 8, 2, 8, c.DKBROWN);
    }
    this.rect(ctx, x, y - 9, w, 2, c.BROWN);
  },

  // ── Mushrooms ──
  drawMushroom(ctx, x, y, size, color) {
    const c = this.C;
    // Stem
    this.rect(ctx, x - size*0.2, y - size*0.5, size*0.4, size*0.5, c.WHITE);
    // Cap
    ctx.fillStyle = color || c.RED;
    ctx.beginPath();
    ctx.arc(x, y - size*0.5, size*0.5, Math.PI, 0);
    ctx.fill();
    // Spots
    if (size > 4) {
      this.pixel(ctx, x - size*0.2, y - size*0.7, c.WHITE);
      this.pixel(ctx, x + size*0.15, y - size*0.8, c.WHITE);
    }
  },

  // ── Sparkles ──
  drawSparkle(ctx, x, y, phase, color) {
    const a = Math.sin(phase) * 0.5 + 0.5;
    if (a < 0.2) return;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = a * prevAlpha;
    ctx.fillStyle = color || '#FFFFFF';
    this.rect(ctx, x, y, 1, 1);
    this.rect(ctx, x-1, y, 3, 1);
    this.rect(ctx, x, y-1, 1, 3);
    ctx.globalAlpha = prevAlpha;
  },

  // ── Crystal ──
  drawCrystal(ctx, x, y, h, color) {
    const prevAlpha = ctx.globalAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + h*0.3, y - h);
    ctx.lineTo(x + h*0.15, y - h*1.1);
    ctx.lineTo(x - h*0.15, y - h*1.1);
    ctx.lineTo(x - h*0.3, y - h);
    ctx.closePath();
    ctx.fill();
    // Highlight
    ctx.globalAlpha = 0.27 * prevAlpha;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.moveTo(x - h*0.1, y - h*0.3);
    ctx.lineTo(x, y - h*0.9);
    ctx.lineTo(x + h*0.05, y - h*0.3);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = prevAlpha;
  },

  // ── Cauldron / Cooking Pot ──
  drawCauldron(ctx, x, y, phase) {
    const c = this.C;
    ctx.fillStyle = c.DKGRAY;
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, Math.PI);
    ctx.fill();
    this.rect(ctx, x - 10, y - 3, 20, 3, c.DKGRAY);
    // Steam (animated)
    const p = phase || 0;
    const prevAlpha = ctx.globalAlpha;
    ctx.fillStyle = `rgba(255,255,255,${0.25 * prevAlpha})`;
    for (let i = 0; i < 3; i++) {
      const drift = Math.sin(p * 2 + i * 1.5) * 2;
      const rise = Math.sin(p * 1.5 + i) * 1;
      ctx.beginPath();
      ctx.arc(x - 4 + i*4 + drift, y - 6 - i*3 + rise, 2 + Math.sin(p + i) * 0.5, 0, Math.PI*2);
      ctx.fill();
    }
  },

  // ── Bookshelf ──
  drawBookshelf(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, c.DKBROWN);
    this.rect(ctx, x+1, y+1, w-2, h-2, c.BROWN);
    // Shelves and books
    const shelfH = h / 3;
    for (let s = 0; s < 3; s++) {
      const sy = y + s * shelfH;
      this.rect(ctx, x, sy + shelfH - 2, w, 2, c.DKBROWN);
      // Books
      const colors = [c.RED, c.DKBLUE, c.GREEN, c.PURPLE, c.DKRED, c.ORANGE, '#335566'];
      let bx = x + 3;
      for (let b = 0; b < 5 + s; b++) {
        const bw = 2 + Math.floor(this.seededRandom(s*10+b) * 3);
        const bh = shelfH - 5 - Math.floor(this.seededRandom(s*10+b+50) * 4);
        const bc = colors[(s*7 + b) % colors.length];
        this.rect(ctx, bx, sy + shelfH - 2 - bh, bw, bh, bc);
        bx += bw + 1;
        if (bx > x + w - 4) break;
      }
    }
  },

  // ── Pedestal ──
  drawPedestal(ctx, x, y) {
    const c = this.C;
    this.rect(ctx, x - 6, y - 20, 12, 20, c.STONE);
    this.rect(ctx, x - 5, y - 19, 10, 18, c.LTGRAY);
    this.rect(ctx, x - 8, y - 2, 16, 2, c.STONE);
    this.rect(ctx, x - 8, y - 22, 16, 2, c.STONE);
  },

  // ── Fireplace ──
  drawFireplace(ctx, x, y, w, h, lit, phase) {
    const c = this.C;
    // Frame
    this.rect(ctx, x, y, w, h, c.DKSTONE);
    this.rect(ctx, x + 2, y + 2, w-4, h-2, c.STONE);
    // Mantle
    this.rect(ctx, x - 2, y, w + 4, 4, c.STONE);
    // Opening
    this.rect(ctx, x + 4, y + 6, w - 8, h - 6, c.BLACK);
    if (lit) {
      // Fire
      const flicker = Math.sin((phase || 0) * 8) * 2;
      ctx.fillStyle = c.ORANGE;
      ctx.beginPath();
      ctx.arc(x + w/2, y + h - 4 + flicker, 6, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = c.YELLOW;
      ctx.beginPath();
      ctx.arc(x + w/2, y + h - 3 + flicker, 3, Math.PI, 0);
      ctx.fill();
      ctx.fillStyle = c.RED;
      ctx.beginPath();
      ctx.arc(x + w/2 - 3, y + h - 5, 2.5, Math.PI, 0);
      ctx.fill();
    }
  },

  // ── Seeded Random (deterministic per-scene art) ──
  seededRandom(seed) {
    const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return x - Math.floor(x);
  },

  // ── Sierra Pseudo-3D Perspective ──

  // Depth scale factor based on Y position (higher = farther = smaller)
  depthScale(y) {
    const t = Math.max(0, Math.min(1, (y - 60) / (170 - 60)));
    return 0.55 + t * 0.45;
  },

  // Draw perspective side walls for indoor rooms (triangular depth panels)
  drawPerspectiveSideWalls(ctx, w, h, horizonY, wallColorHex) {
    const inset = 25;
    const rgb = this.hexToRgb(wallColorHex);
    // Left side wall (darker shade)
    ctx.fillStyle = `rgb(${Math.max(0,rgb.r-35)},${Math.max(0,rgb.g-35)},${Math.max(0,rgb.b-25)})`;
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(inset, horizonY);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();
    // Stone courses on left wall
    ctx.strokeStyle = `rgba(${Math.min(255,rgb.r+10)},${Math.min(255,rgb.g+10)},${Math.min(255,rgb.b+10)},0.25)`;
    ctx.lineWidth = 0.5;
    for (let row = horizonY + 6; row < h - 2; row += 8) {
      const t = (row - horizonY) / (h - horizonY);
      const wallW = inset * (1 - t);
      if (wallW > 3) {
        ctx.beginPath();
        ctx.moveTo(0, row);
        ctx.lineTo(wallW, row);
        ctx.stroke();
      }
    }
    // Right side wall (slightly lighter shade)
    ctx.fillStyle = `rgb(${Math.max(0,rgb.r-28)},${Math.max(0,rgb.g-28)},${Math.max(0,rgb.b-18)})`;
    ctx.beginPath();
    ctx.moveTo(w, horizonY);
    ctx.lineTo(w - inset, horizonY);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fill();
    for (let row = horizonY + 6; row < h - 2; row += 8) {
      const t = (row - horizonY) / (h - horizonY);
      const wallW = inset * (1 - t);
      if (wallW > 3) {
        ctx.beginPath();
        ctx.moveTo(w, row);
        ctx.lineTo(w - wallW, row);
        ctx.stroke();
      }
    }
    // Edge lines (wall-floor seam)
    ctx.strokeStyle = 'rgba(0,0,0,0.4)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(inset, horizonY);
    ctx.lineTo(0, h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(w - inset, horizonY);
    ctx.lineTo(w, h);
    ctx.stroke();
    // Horizon accent line
    ctx.strokeStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.moveTo(inset, horizonY);
    ctx.lineTo(w - inset, horizonY);
    ctx.stroke();
  },

  // Draw perspective floor grid lines (converge to vanishing point)
  drawPerspectiveFloorGrid(ctx, w, h, horizonY, lineColor) {
    const inset = 25;
    ctx.strokeStyle = lineColor || 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 0.5;
    // Horizontal depth lines (closer together near horizon)
    for (let i = 1; i <= 6; i++) {
      const t = Math.pow(i / 6, 1.8);
      const y = horizonY + t * (h - horizonY);
      const squeeze = 1 - t;
      const leftX = inset * squeeze;
      const rightX = w - inset * squeeze;
      ctx.beginPath();
      ctx.moveTo(leftX, y);
      ctx.lineTo(rightX, y);
      ctx.stroke();
    }
    // Vertical converging lines
    for (let i = 1; i <= 5; i++) {
      const t = i / 6;
      const topX = inset + t * (w - 2 * inset);
      const bottomX = t * w;
      ctx.beginPath();
      ctx.moveTo(topX, horizonY);
      ctx.lineTo(bottomX, h);
      ctx.stroke();
    }
  },

  // Draw perspective ground overlay for outdoor scenes (atmospheric depth)
  drawPerspectiveGroundOverlay(ctx, x, y, w, h) {
    const grad = ctx.createLinearGradient(0, y, 0, y + h);
    grad.addColorStop(0, 'rgba(0,0,30,0.18)');
    grad.addColorStop(0.5, 'rgba(0,0,10,0.06)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, w, h);
  },

  // ── Graham Character Sprite ──
  drawGraham(ctx, x, y, dir, frame, actionAnim) {
    // dir: 0=south, 1=west, 2=north, 3=east
    // frame: -1=standing, 0-3=walk cycle
    // actionAnim: { type, timer, duration, ... } or null
    const c = this.C;
    const legOffset = frame >= 0 ? Math.sin(frame * Math.PI / 2) * 2 : 0;

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(x, y, 6, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Determine flip for east/west
    const flip = dir === 1 ? -1 : 1;
    const isSide = dir === 1 || dir === 3;
    const isBack = dir === 2;

    ctx.save();
    ctx.translate(x, y);
    if (dir === 1) ctx.scale(-1, 1);

    // Boots
    if (isSide) {
      this.rect(ctx, -3 + legOffset, -3, 4, 3, c.DKBROWN);
      this.rect(ctx, 0 - legOffset, -3, 4, 3, c.DKBROWN);
    } else {
      this.rect(ctx, -4 + legOffset, -3, 3, 3, c.DKBROWN);
      this.rect(ctx, 1 - legOffset, -3, 3, 3, c.DKBROWN);
    }

    // Legs (brown pants)
    if (isSide) {
      this.rect(ctx, -2 + legOffset, -8, 3, 5, c.TAN);
      this.rect(ctx, 0 - legOffset, -8, 3, 5, c.TAN);
    } else {
      this.rect(ctx, -4 + legOffset, -8, 3, 5, c.TAN);
      this.rect(ctx, 1 - legOffset, -8, 3, 5, c.TAN);
    }

    // Torso (red tunic)
    this.rect(ctx, -4, -16, 8, 8, c.RED);
    this.rect(ctx, -3, -15, 6, 6, c.RED);
    // Belt
    this.rect(ctx, -4, -10, 8, 2, c.GOLD);

    // Arms
    const armSwing = frame >= 0 ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    // Action animation arm modification
    const isActing = actionAnim && (actionAnim.type === 'take' || actionAnim.type === 'use');
    const actT = isActing ? Math.sin((actionAnim.timer / actionAnim.duration) * Math.PI) : 0;
    if (isSide) {
      // Front arm reaches out during take/use
      const armReach = isActing ? actT * 5 : 0;
      const armRaise = isActing ? actT * -3 : 0;
      this.rect(ctx, 3 + armReach, -15 + armSwing + armRaise, 3, 7, c.RED);
      this.rect(ctx, 3 + armReach + 1, -9 + armSwing + armRaise, 2, 2, c.SKIN);
    } else {
      if (isActing) {
        // Both arms reach forward during action
        const armReach = actT * 3;
        this.rect(ctx, -6 - armReach, -15 + armSwing - actT * 2, 2, 7, c.RED);
        this.rect(ctx, -6 - armReach, -9 + armSwing - actT * 2, 2, 2, c.SKIN);
        this.rect(ctx, 4 + armReach, -15 - armSwing - actT * 2, 2, 7, c.RED);
        this.rect(ctx, 4 + armReach, -9 - armSwing - actT * 2, 2, 2, c.SKIN);
      } else {
        this.rect(ctx, -6, -15 + armSwing, 2, 7, c.RED);
        this.rect(ctx, -6, -9 + armSwing, 2, 2, c.SKIN);
        this.rect(ctx, 4, -15 - armSwing, 2, 7, c.RED);
        this.rect(ctx, 4, -9 - armSwing, 2, 2, c.SKIN);
      }
    }

    // Head
    this.rect(ctx, -3, -22, 6, 6, c.SKIN);

    if (!isBack) {
      // Face (front/side)
      if (isSide) {
        // Side face
        this.pixel(ctx, 1, -20, c.DKBLUE); // eye
        this.pixel(ctx, 2, -18, c.DKBROWN); // nose (...well, side nose)
        this.pixel(ctx, 0, -17, c.DKRED); // mouth
      } else {
        // Front face
        this.pixel(ctx, -2, -20, c.DKBLUE); // left eye
        this.pixel(ctx, 1, -20, c.DKBLUE); // right eye
        this.pixel(ctx, 0, -18, c.DKBROWN); // nose
        this.rect(ctx, -1, -17, 2, 1, c.DKRED); // mouth
      }
    }

    // Hair (blonde)
    this.rect(ctx, -3, -23, 6, 2, c.GOLD);
    if (isSide) {
      this.rect(ctx, -3, -22, 1, 3, c.GOLD); // side hair
    } else if (isBack) {
      this.rect(ctx, -3, -22, 6, 4, c.GOLD);
    } else {
      this.rect(ctx, -3, -22, 1, 2, c.GOLD);
      this.rect(ctx, 2, -22, 1, 2, c.GOLD);
    }

    // Hat (adventurer's cap - classic Graham look)
    this.rect(ctx, -4, -26, 8, 3, c.RED);
    this.rect(ctx, -3, -27, 6, 1, c.RED);
    if (!isBack) {
      this.rect(ctx, -1, -27, 2, 1, c.GOLD); // hat feather/emblem
    }

    ctx.restore();
  },

  // ── NPC Drawing Functions ──

  drawValanice(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Dress
    ctx.fillStyle = '#6666CC';
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();

    // Torso
    this.rect(ctx, -4, -16, 8, 8, '#6666CC');

    // Head
    this.rect(ctx, -3, -22, 6, 6, c.LTSKIN);
    // Eyes
    this.pixel(ctx, -2, -20, c.DKBLUE);
    this.pixel(ctx, 1, -20, c.DKBLUE);
    this.rect(ctx, -1, -17, 2, 1, c.PINK);
    // Hair
    this.rect(ctx, -4, -24, 8, 3, c.GOLD);
    this.rect(ctx, -4, -22, 1, 4, c.GOLD);
    this.rect(ctx, 3, -22, 1, 4, c.GOLD);
    // Crown
    this.rect(ctx, -3, -26, 6, 2, c.GOLD);
    this.pixel(ctx, -2, -27, c.GOLD);
    this.pixel(ctx, 0, -27, c.GOLD);
    this.pixel(ctx, 2, -27, c.GOLD);

    ctx.restore();
  },

  drawCook(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Body (wide)
    this.rect(ctx, -6, -16, 12, 16, c.WHITE);
    // Apron
    this.rect(ctx, -5, -10, 10, 10, '#EEDDCC');
    // Head
    this.rect(ctx, -3, -22, 6, 6, c.SKIN);
    this.pixel(ctx, -1, -20, c.BLACK);
    this.pixel(ctx, 1, -20, c.BLACK);
    this.rect(ctx, -1, -18, 3, 1, c.DKRED);
    // Chef hat
    this.rect(ctx, -4, -28, 8, 6, c.WHITE);
    this.rect(ctx, -3, -32, 6, 4, c.WHITE);
    // Mustache
    this.rect(ctx, -2, -19, 5, 1, c.DKBROWN);

    ctx.restore();
  },

  drawBarnaby(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Legs
    this.rect(ctx, -3, -3, 3, 3, c.DKBROWN);
    this.rect(ctx, 1, -3, 3, 3, c.DKBROWN);
    // Pants
    this.rect(ctx, -3, -9, 3, 6, c.DKBLUE);
    this.rect(ctx, 1, -9, 3, 6, c.DKBLUE);
    // Torso (sailor shirt)
    this.rect(ctx, -5, -16, 10, 7, '#DDDDEE');
    this.rect(ctx, -4, -14, 8, 1, c.BLUE);
    this.rect(ctx, -4, -12, 8, 1, c.BLUE);
    // Head
    this.rect(ctx, -3, -22, 7, 6, c.SKIN);
    this.pixel(ctx, -1, -20, c.BLACK);
    this.pixel(ctx, 2, -20, c.BLACK);
    this.rect(ctx, -1, -18, 4, 1, c.DKRED);
    // Beard
    this.rect(ctx, -2, -17, 6, 3, c.LTGRAY);
    // Hat
    this.rect(ctx, -4, -24, 9, 2, c.DKBLUE);
    this.rect(ctx, -3, -26, 7, 2, c.DKBLUE);

    ctx.restore();
  },

  drawTroll(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Feet
    this.rect(ctx, -5, -3, 4, 3, c.GREEN);
    this.rect(ctx, 1, -3, 4, 3, c.GREEN);
    // Body (large!)
    this.rect(ctx, -7, -20, 14, 17, c.GREEN);
    this.rect(ctx, -6, -18, 12, 14, c.LTGREEN);
    // Arms
    this.rect(ctx, -9, -18, 3, 10, c.GREEN);
    this.rect(ctx, 6, -18, 3, 10, c.GREEN);
    // Head
    this.rect(ctx, -5, -28, 10, 8, c.GREEN);
    this.rect(ctx, -4, -27, 8, 6, c.LTGREEN);
    // Eyes (big, yellow)
    this.rect(ctx, -3, -26, 3, 3, c.YELLOW);
    this.rect(ctx, 1, -26, 3, 3, c.YELLOW);
    this.pixel(ctx, -2, -25, c.BLACK);
    this.pixel(ctx, 2, -25, c.BLACK);
    // Mouth
    this.rect(ctx, -3, -22, 7, 2, c.DKRED);
    // Nose
    this.rect(ctx, -1, -24, 3, 2, c.DKGREEN);
    // Warts
    this.pixel(ctx, -4, -24, c.DKGREEN);
    this.pixel(ctx, 4, -26, c.DKGREEN);

    ctx.restore();
  },

  drawMadameMushroom(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Stem (body)
    this.rect(ctx, -4, -12, 8, 12, '#EEDDCC');
    this.rect(ctx, -3, -10, 6, 8, c.WHITE);
    // Cap (head) - large purple mushroom
    ctx.fillStyle = c.PURPLE;
    ctx.beginPath();
    ctx.arc(0, -12, 12, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#9966BB';
    ctx.beginPath();
    ctx.arc(0, -13, 10, Math.PI, -0.2);
    ctx.fill();
    // Spots
    this.rect(ctx, -6, -20, 3, 2, c.WHITE);
    this.rect(ctx, 2, -22, 2, 2, c.WHITE);
    this.rect(ctx, -2, -23, 2, 2, c.WHITE);
    // Face on stem
    this.pixel(ctx, -2, -8, c.BLACK); // eye
    this.pixel(ctx, 1, -8, c.BLACK); // eye
    this.rect(ctx, -1, -6, 2, 1, c.PINK); // mouth
    // Tiny arms
    this.rect(ctx, -6, -8, 2, 1, '#EEDDCC');
    this.rect(ctx, 4, -8, 2, 1, '#EEDDCC');
    // Sparkle effect
    const sp = Math.sin(phase * 2);
    if (sp > 0.5) {
      this.drawSparkle(ctx, -8, -18, phase, '#DD88FF');
      this.drawSparkle(ctx, 8, -14, phase + 1, '#DD88FF');
    }

    ctx.restore();
  },

  drawSirCumference(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Boots
    this.rect(ctx, -5, -4, 4, 4, c.DKGRAY);
    this.rect(ctx, 1, -4, 4, 4, c.DKGRAY);
    // Legs (armor)
    this.rect(ctx, -4, -10, 3, 6, c.GRAY);
    this.rect(ctx, 1, -10, 3, 6, c.GRAY);
    // Body (ROUND - he's Sir Cumference after all!)
    ctx.fillStyle = c.LTGRAY;
    ctx.beginPath();
    ctx.arc(0, -18, 9, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = c.GRAY;
    ctx.beginPath();
    ctx.arc(0, -18, 8, 0, Math.PI*2);
    ctx.fill();
    // Belt
    this.rect(ctx, -8, -15, 16, 2, c.BROWN);
    // Arms
    this.rect(ctx, -11, -22, 3, 10, c.GRAY);
    this.rect(ctx, 8, -22, 3, 10, c.GRAY);
    // Hands
    this.rect(ctx, -12, -13, 3, 3, c.SKIN);
    this.rect(ctx, 9, -13, 3, 3, c.SKIN);
    // Shield (left hand)
    this.rect(ctx, -15, -22, 5, 8, c.DKBLUE);
    this.rect(ctx, -14, -21, 3, 6, c.BLUE);
    // Head / Helmet
    this.rect(ctx, -4, -30, 8, 5, c.LTGRAY);
    this.rect(ctx, -3, -29, 6, 4, c.SKIN);
    // Visor
    this.rect(ctx, -4, -30, 8, 2, c.GRAY);
    this.rect(ctx, -3, -28, 6, 1, c.DKGRAY); // eye slit
    // Plume
    this.rect(ctx, 0, -34, 2, 4, c.RED);
    this.rect(ctx, 1, -35, 2, 2, c.RED);

    ctx.restore();
  },

  drawFumblemore(ctx, x, y, phase) {
    const c = this.C;
    ctx.save();
    ctx.translate(x, y);

    // Robe (long, purple)
    ctx.fillStyle = c.DKPURPLE;
    ctx.beginPath();
    ctx.moveTo(-6, -8);
    ctx.lineTo(-8, 0);
    ctx.lineTo(8, 0);
    ctx.lineTo(6, -8);
    ctx.closePath();
    ctx.fill();
    this.rect(ctx, -5, -18, 10, 10, c.DKPURPLE);
    this.rect(ctx, -4, -16, 8, 8, c.PURPLE);
    // Stars on robe
    this.pixel(ctx, -2, -14, c.YELLOW);
    this.pixel(ctx, 2, -12, c.YELLOW);
    this.pixel(ctx, 0, -6, c.YELLOW);
    this.pixel(ctx, -5, -4, c.YELLOW);
    // Arms (sleeves)
    this.rect(ctx, -8, -16, 3, 8, c.DKPURPLE);
    this.rect(ctx, 5, -16, 3, 8, c.DKPURPLE);
    // Hands
    this.rect(ctx, -9, -9, 3, 2, c.SKIN);
    this.rect(ctx, 6, -9, 3, 2, c.SKIN);
    // Staff (right hand)
    this.rect(ctx, 8, -30, 2, 22, c.BROWN);
    // Crystal on staff
    const glow = Math.sin(phase * 3) * 0.3 + 0.7;
    const prevGlowAlpha = ctx.globalAlpha;
    ctx.globalAlpha = glow * prevGlowAlpha;
    ctx.fillStyle = '#88DDFF';
    ctx.beginPath();
    ctx.arc(9, -32, 3, 0, Math.PI*2);
    ctx.fill();
    ctx.globalAlpha = prevGlowAlpha;
    // Head
    this.rect(ctx, -3, -24, 6, 6, c.SKIN);
    // Face
    this.pixel(ctx, -2, -22, c.BLACK);
    this.pixel(ctx, 1, -22, c.BLACK);
    this.pixel(ctx, 0, -20, c.DKBROWN); // nose
    this.rect(ctx, -1, -19, 3, 1, c.DKRED);
    // Long beard (white)
    this.rect(ctx, -2, -19, 5, 5, c.WHITE);
    this.rect(ctx, -1, -14, 3, 3, c.WHITE);
    this.rect(ctx, 0, -11, 2, 2, c.WHITE);
    // Wizard hat
    ctx.fillStyle = c.DKPURPLE;
    ctx.beginPath();
    ctx.moveTo(-5, -24);
    ctx.lineTo(0, -38);
    ctx.lineTo(5, -24);
    ctx.closePath();
    ctx.fill();
    // Hat brim
    this.rect(ctx, -6, -25, 12, 2, c.DKPURPLE);
    // Star on hat
    this.pixel(ctx, -1, -32, c.YELLOW);
    this.pixel(ctx, 1, -28, c.YELLOW);

    ctx.restore();
  },

  // ── Seagull ──
  drawSeagull(ctx, x, y, phase) {
    const wingPos = Math.sin(phase * 4) * 4;
    ctx.strokeStyle = this.C.WHITE;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + wingPos);
    ctx.quadraticCurveTo(x - 2, y - 2, x, y);
    ctx.quadraticCurveTo(x + 2, y - 2, x + 5, y + wingPos);
    ctx.stroke();
  },

  // ── Text Drawing on Canvas ──
  drawText(ctx, x, y, text, color, size) {
    ctx.fillStyle = color || '#FFFFFF';
    ctx.font = `${size || 6}px monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
  },

  // ── Title Screen ──
  drawTitleScreen(ctx, w, h, phase) {
    const c = this.C;

    // Sky
    this.drawSky(ctx, w, h * 0.6, '#001133', '#224488');

    // Stars
    for (let i = 0; i < 40; i++) {
      const sx = this.seededRandom(i * 7) * w;
      const sy = this.seededRandom(i * 13) * h * 0.4;
      const twinkle = Math.sin(phase * 2 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      this.pixel(ctx, sx, sy, c.WHITE);
      ctx.globalAlpha = 1;
    }

    // Mountains
    this.drawMountain(ctx, -20, h*0.35, w*0.4, h*0.3, '#112244', c.WHITE);
    this.drawMountain(ctx, w*0.3, h*0.3, w*0.5, h*0.35, '#1a2a4a', c.WHITE);
    this.drawMountain(ctx, w*0.65, h*0.35, w*0.4, h*0.3, '#152040', c.WHITE);

    // Castle silhouette
    const cx = w * 0.5;
    const cy = h * 0.4;
    this.rect(ctx, cx-30, cy, 60, 40, '#0a0a2a');
    this.rect(ctx, cx-35, cy+10, 70, 30, '#0a0a2a');
    // Towers
    this.rect(ctx, cx-35, cy-10, 12, 50, '#0a0a2a');
    this.rect(ctx, cx+23, cy-10, 12, 50, '#0a0a2a');
    this.rect(ctx, cx-5, cy-20, 10, 60, '#0a0a2a');
    // Tower tops
    for (const tx of [cx-29, cx+29, cx]) {
      this.rect(ctx, tx-3, cy - (tx === cx ? 22 : 12), 6, 3, '#0a0a2a');
    }
    // Windows (lit)
    ctx.fillStyle = '#FFCC44';
    for (const wx of [cx-25, cx-8, cx+8, cx+25]) {
      ctx.fillRect(wx, cy+15, 4, 5);
    }

    // Water (reflection)
    this.drawWater(ctx, 0, h*0.6, w, h*0.4, phase);

    // Moon
    ctx.fillStyle = '#FFFFDD';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.15, 15, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#001133';
    ctx.beginPath();
    ctx.arc(w * 0.8 + 5, h * 0.15 - 3, 13, 0, Math.PI * 2);
    ctx.fill();
  },

  // ═══════════════════════════════════════════════
  //  LEISURE SUIT LARRY - Character & Drawing
  // ═══════════════════════════════════════════════

  drawLarry(ctx, x, y, dir, frame, actionAnim) {
    const c = this.C;
    // Larry: white leisure suit, dark hair, gold chain
    // y is foot position, draw upward

    // Action animations
    if (actionAnim) {
      // Simple action pose
      this.rect(ctx, x - 4, y - 22, 8, 10, c.WHITE); // body
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN); // head
      this.rect(ctx, x - 3, y - 31, 6, 3, '#331100'); // hair
      this.rect(ctx, x - 3, y - 12, 3, 6, c.WHITE); // legs
      this.rect(ctx, x, y - 12, 3, 6, c.WHITE);
      this.rect(ctx, x - 3, y - 6, 3, 6, '#333'); // shoes
      this.rect(ctx, x, y - 6, 3, 6, '#333');
      // Extended arm
      this.rect(ctx, x + 4, y - 22, 6, 3, c.WHITE);
      this.rect(ctx, x + 8, y - 22, 3, 3, c.SKIN);
      this.pixel(ctx, x, y - 21, c.GOLD); // chain
      return;
    }

    const stepOff = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legL = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legR = -legL;

    if (dir === 0 || dir === 2) { // Facing south/north
      // Shoes
      this.rect(ctx, x - 4, y - 6 + legL, 3, 6, '#333');
      this.rect(ctx, x + 1, y - 6 + legR, 3, 6, '#333');
      // Pants
      this.rect(ctx, x - 4, y - 12 + legL, 3, 6, c.WHITE);
      this.rect(ctx, x + 1, y - 12 + legR, 3, 6, c.WHITE);
      // Body (jacket)
      this.rect(ctx, x - 5, y - 22, 10, 10, c.WHITE);
      this.rect(ctx, x - 4, y - 21, 8, 8, '#EEEEEE');
      // Gold chain
      this.pixel(ctx, x - 1, y - 20, c.GOLD);
      this.pixel(ctx, x, y - 19, c.GOLD);
      this.pixel(ctx, x + 1, y - 20, c.GOLD);
      // Head
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      // Hair (dark pompadour)
      this.rect(ctx, x - 3, y - 31, 6, 3, '#331100');
      this.rect(ctx, x - 4, y - 30, 1, 2, '#331100');
      if (dir === 0) {
        // Eyes and smile (south)
        this.pixel(ctx, x - 1, y - 27, c.BLACK);
        this.pixel(ctx, x + 1, y - 27, c.BLACK);
        this.pixel(ctx, x - 1, y - 25, c.SKIN);
        this.pixel(ctx, x + 1, y - 25, c.SKIN);
        this.rect(ctx, x - 1, y - 24, 3, 1, c.RED); // goofy smile
      }
      // Arms
      this.rect(ctx, x - 7, y - 21 - stepOff, 2, 8, c.WHITE);
      this.rect(ctx, x + 5, y - 21 + stepOff, 2, 8, c.WHITE);
    } else { // Side view
      const flip = dir === 3 ? 1 : -1;
      // Shoes
      this.rect(ctx, x - 2 + legL * flip, y - 6, 4, 6, '#333');
      this.rect(ctx, x - 2 + legR * flip, y - 6, 4, 6, '#333');
      // Pants
      this.rect(ctx, x - 2 + legL * flip, y - 12, 4, 6, c.WHITE);
      this.rect(ctx, x - 2 + legR * flip, y - 12, 4, 6, c.WHITE);
      // Body
      this.rect(ctx, x - 4, y - 22, 8, 10, c.WHITE);
      this.pixel(ctx, x, y - 20, c.GOLD); // chain
      // Head
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      this.rect(ctx, x - 3, y - 31, 6, 3, '#331100');
      // Eye
      this.pixel(ctx, x + flip * 1, y - 27, c.BLACK);
      // Arm
      this.rect(ctx, x + flip * 3, y - 21, 2, 8, c.WHITE);
    }
  },

  // ── LSL Title Screen ──
  drawTitleScreenLSL(ctx, w, h, phase) {
    const c = this.C;
    // Night city scene
    this.drawSky(ctx, w, h, '#110022', '#330044');

    // Stars
    for (let i = 0; i < 25; i++) {
      const sx = this.seededRandom(i * 7) * w;
      const sy = this.seededRandom(i * 13) * h * 0.3;
      const twinkle = Math.sin(phase * 2 + i) * 0.3 + 0.7;
      ctx.globalAlpha = twinkle;
      this.pixel(ctx, sx, sy, c.WHITE);
      ctx.globalAlpha = 1;
    }

    // City skyline
    const buildings = [
      { x: 0, w: 60, h: 180, color: '#1a0a2a' },
      { x: 55, w: 45, h: 220, color: '#220e3a' },
      { x: 95, w: 70, h: 160, color: '#1a0a2a' },
      { x: 160, w: 50, h: 240, color: '#2a1040' },
      { x: 205, w: 80, h: 190, color: '#220e3a' },
      { x: 280, w: 55, h: 210, color: '#1a0a2a' },
      { x: 330, w: 90, h: 170, color: '#2a1040' },
      { x: 415, w: 65, h: 230, color: '#220e3a' },
      { x: 475, w: 80, h: 185, color: '#1a0a2a' },
      { x: 550, w: 90, h: 200, color: '#220e3a' },
    ];
    for (const b of buildings) {
      this.rect(ctx, b.x, h - b.h, b.w, b.h, b.color);
      // Windows
      for (let wy = h - b.h + 10; wy < h - 20; wy += 15) {
        for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 10) {
          const lit = this.seededRandom(wx * 7 + wy * 13) > 0.4;
          if (lit) {
            const flicker = Math.sin(phase + wx + wy) * 0.15 + 0.85;
            ctx.globalAlpha = flicker;
            this.rect(ctx, wx, wy, 4, 5, '#FFCC44');
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // Neon signs
    const neonGlow = Math.sin(phase * 3) * 0.3 + 0.7;
    ctx.globalAlpha = neonGlow;
    this.rect(ctx, 170, h - 200, 30, 8, '#FF1493');
    this.rect(ctx, 320, h - 130, 40, 8, '#00FFFF');
    ctx.globalAlpha = 1;

    // Street level
    this.rect(ctx, 0, h - 30, w, 30, '#111');
    this.rect(ctx, 0, h - 32, w, 2, '#333');

    // Street lights
    for (let lx = 50; lx < w; lx += 120) {
      this.rect(ctx, lx, h - 80, 2, 50, '#444');
      const glow = Math.sin(phase + lx) * 0.1 + 0.9;
      ctx.globalAlpha = glow;
      this.rect(ctx, lx - 4, h - 82, 10, 4, '#FFD700');
      ctx.globalAlpha = 0.15;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(lx + 1, h - 45, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // ── LSL Scene Drawing Helpers ──
  drawNeonSign(ctx, x, y, w, h, color, phase) {
    const glow = Math.sin(phase * 3) * 0.3 + 0.7;
    const prevAlpha = ctx.globalAlpha;
    ctx.globalAlpha = glow * prevAlpha;
    this.rect(ctx, x, y, w, h, color);
    ctx.globalAlpha = 0.2 * prevAlpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x + w/2, y + h/2, Math.max(w, h), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = prevAlpha;
  },

  drawBarCounter(ctx, x, y, w) {
    const c = this.C;
    this.rect(ctx, x, y, w, 12, c.DKBROWN);
    this.rect(ctx, x + 1, y + 1, w - 2, 3, c.BROWN);
    this.rect(ctx, x + 1, y + 4, w - 2, 7, '#4a2a10');
    // Bar stools
    for (let sx = x + 10; sx < x + w - 10; sx += 25) {
      this.rect(ctx, sx, y + 12, 2, 15, c.DKGRAY);
      this.rect(ctx, sx - 3, y + 10, 8, 3, c.RED);
    }
  },

  drawJukebox(ctx, x, y, phase) {
    const c = this.C;
    this.rect(ctx, x, y, 16, 24, c.DKGRAY);
    this.rect(ctx, x + 1, y + 1, 14, 10, '#442244');
    // Color bands
    const bands = ['#FF3366', '#FF9933', '#FFFF33', '#33FF66', '#3366FF'];
    for (let i = 0; i < bands.length; i++) {
      const bright = Math.sin(phase * 4 + i) * 0.3 + 0.7;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = bright * prevAlpha;
      this.rect(ctx, x + 2 + i * 2, y + 2, 2, 8, bands[i]);
      ctx.globalAlpha = prevAlpha;
    }
    this.rect(ctx, x + 2, y + 13, 12, 8, c.GRAY);
    this.rect(ctx, x + 1, y + 22, 14, 2, c.GOLD);
  },

  drawSlotMachine(ctx, x, y) {
    const c = this.C;
    this.rect(ctx, x, y, 18, 28, c.RED);
    this.rect(ctx, x + 1, y + 1, 16, 12, c.DKGRAY);
    // Reels
    this.rect(ctx, x + 2, y + 2, 4, 10, c.WHITE);
    this.rect(ctx, x + 7, y + 2, 4, 10, c.WHITE);
    this.rect(ctx, x + 12, y + 2, 4, 10, c.WHITE);
    // Symbols
    this.pixel(ctx, x + 3, y + 6, c.RED);
    this.pixel(ctx, x + 8, y + 6, c.GOLD);
    this.pixel(ctx, x + 13, y + 6, c.RED);
    // Handle
    this.rect(ctx, x + 17, y + 4, 3, 2, c.DKGRAY);
    this.rect(ctx, x + 18, y + 6, 2, 8, c.GRAY);
    this.rect(ctx, x + 17, y + 14, 4, 3, c.RED);
    // Tray
    this.rect(ctx, x + 1, y + 15, 16, 10, '#222');
  },

  drawMirrorBall(ctx, x, y, phase) {
    const c = this.C;
    ctx.fillStyle = c.GRAY;
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fill();
    // Sparkles on the ball
    for (let i = 0; i < 6; i++) {
      const a = phase * 2 + i * Math.PI / 3;
      const sx = x + Math.cos(a) * 5;
      const sy = y + Math.sin(a) * 5;
      const bright = Math.sin(phase * 3 + i) * 0.4 + 0.6;
      const prevAlpha = ctx.globalAlpha;
      ctx.globalAlpha = bright * prevAlpha;
      this.pixel(ctx, sx, sy, c.WHITE);
      ctx.globalAlpha = prevAlpha;
    }
    // String
    this.rect(ctx, x, y - 12, 1, 5, c.DKGRAY);
  },

  drawCityBuilding(ctx, x, y, w, h, color) {
    this.rect(ctx, x, y, w, h, color || '#333344');
    // Windows
    for (let wy = y + 6; wy < y + h - 6; wy += 10) {
      for (let wx = x + 4; wx < x + w - 4; wx += 8) {
        const lit = this.seededRandom(wx * 3 + wy * 7) > 0.3;
        this.rect(ctx, wx, wy, 4, 5, lit ? '#FFCC44' : '#1a1a2e');
      }
    }
  },

  drawStreetLamp(ctx, x, y) {
    this.rect(ctx, x, y, 2, 40, '#444');
    this.rect(ctx, x - 3, y - 2, 8, 3, '#555');
    this.rect(ctx, x - 1, y - 4, 4, 2, '#FFD700');
  },

  // ── Bartender NPC ──
  drawBartender(ctx, x, y, phase) {
    const c = this.C;
    this.rect(ctx, x - 4, y - 20, 8, 10, c.WHITE); // shirt
    this.rect(ctx, x - 3, y - 26, 6, 6, c.SKIN); // head
    this.rect(ctx, x - 4, y - 28, 8, 2, '#222'); // hair
    this.rect(ctx, x - 3, y - 10, 3, 10, '#222'); // pants
    this.rect(ctx, x, y - 10, 3, 10, '#222');
    this.pixel(ctx, x - 1, y - 24, c.BLACK); // eyes
    this.pixel(ctx, x + 1, y - 24, c.BLACK);
    this.rect(ctx, x - 1, y - 22, 3, 1, '#555'); // mustache
    // Polishing glass
    const bob = Math.sin(phase * 2) * 1;
    this.rect(ctx, x + 4, y - 18 + bob, 3, 5, '#AADDFF');
  },

  // ── Disco DJ ──
  drawDJ(ctx, x, y, phase) {
    const c = this.C;
    this.rect(ctx, x - 4, y - 20, 8, 10, '#222'); // shirt
    this.rect(ctx, x - 3, y - 26, 6, 6, c.SKIN);
    this.rect(ctx, x - 4, y - 28, 8, 3, '#FF4444'); // wild hair
    this.rect(ctx, x - 5, y - 27, 1, 2, '#FF4444');
    this.rect(ctx, x + 4, y - 27, 1, 2, '#FF4444');
    this.rect(ctx, x - 3, y - 10, 3, 10, '#222');
    this.rect(ctx, x, y - 10, 3, 10, '#222');
    this.pixel(ctx, x - 1, y - 25, c.BLACK);
    this.pixel(ctx, x + 2, y - 25, c.BLACK);
    // Headphones
    this.rect(ctx, x - 4, y - 26, 1, 4, c.DKGRAY);
    this.rect(ctx, x + 4, y - 26, 1, 4, c.DKGRAY);
    this.rect(ctx, x - 5, y - 27, 2, 2, c.GRAY);
    this.rect(ctx, x + 4, y - 27, 2, 2, c.GRAY);
  },

  // ═══════════════════════════════════════════════
  //  SPACE QUEST - Character & Drawing
  // ═══════════════════════════════════════════════

  drawRoger(ctx, x, y, dir, frame, actionAnim) {
    const c = this.C;
    // Roger: blue-gray janitor jumpsuit, blond hair, average build

    if (actionAnim) {
      this.rect(ctx, x - 4, y - 22, 8, 10, '#5577AA'); // jumpsuit
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      this.rect(ctx, x - 2, y - 30, 4, 2, c.YELLOW); // blond hair
      this.rect(ctx, x - 3, y - 12, 3, 6, '#5577AA');
      this.rect(ctx, x, y - 12, 3, 6, '#5577AA');
      this.rect(ctx, x - 3, y - 6, 3, 6, '#334455');
      this.rect(ctx, x, y - 6, 3, 6, '#334455');
      this.rect(ctx, x + 4, y - 22, 6, 3, '#5577AA'); // reaching arm
      this.rect(ctx, x + 8, y - 22, 3, 3, c.SKIN);
      return;
    }

    const stepOff = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legL = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legR = -legL;

    if (dir === 0 || dir === 2) {
      // Boots
      this.rect(ctx, x - 4, y - 6 + legL, 3, 6, '#334455');
      this.rect(ctx, x + 1, y - 6 + legR, 3, 6, '#334455');
      // Jumpsuit legs
      this.rect(ctx, x - 4, y - 12 + legL, 3, 6, '#5577AA');
      this.rect(ctx, x + 1, y - 12 + legR, 3, 6, '#5577AA');
      // Jumpsuit body
      this.rect(ctx, x - 5, y - 22, 10, 10, '#5577AA');
      // Belt
      this.rect(ctx, x - 5, y - 13, 10, 1, c.DKGRAY);
      // Badge/patch
      this.rect(ctx, x - 3, y - 20, 3, 3, c.ORANGE);
      // Head
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      // Blond hair
      this.rect(ctx, x - 3, y - 30, 6, 2, c.YELLOW);
      this.rect(ctx, x - 3, y - 29, 1, 1, c.YELLOW);
      this.rect(ctx, x + 2, y - 29, 1, 1, c.YELLOW);
      if (dir === 0) {
        this.pixel(ctx, x - 1, y - 27, c.BLACK);
        this.pixel(ctx, x + 1, y - 27, c.BLACK);
        this.rect(ctx, x - 1, y - 25, 2, 1, c.SKIN); // neutral expression
      }
      // Arms
      this.rect(ctx, x - 7, y - 21 - stepOff, 2, 8, '#5577AA');
      this.rect(ctx, x + 5, y - 21 + stepOff, 2, 8, '#5577AA');
    } else {
      const flip = dir === 3 ? 1 : -1;
      this.rect(ctx, x - 2 + legL * flip, y - 6, 4, 6, '#334455');
      this.rect(ctx, x - 2 + legR * flip, y - 6, 4, 6, '#334455');
      this.rect(ctx, x - 2 + legL * flip, y - 12, 4, 6, '#5577AA');
      this.rect(ctx, x - 2 + legR * flip, y - 12, 4, 6, '#5577AA');
      this.rect(ctx, x - 4, y - 22, 8, 10, '#5577AA');
      this.rect(ctx, x - 4, y - 13, 8, 1, c.DKGRAY);
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      this.rect(ctx, x - 2, y - 30, 4, 2, c.YELLOW);
      this.pixel(ctx, x + flip * 1, y - 27, c.BLACK);
      this.rect(ctx, x + flip * 3, y - 21, 2, 8, '#5577AA');
    }
  },

  // ── SQ Title Screen ──
  drawTitleScreenSQ(ctx, w, h, phase) {
    const c = this.C;
    // Deep space scene
    ctx.fillStyle = '#000011';
    ctx.fillRect(0, 0, w, h);

    // Scrolling starfield
    for (let i = 0; i < 80; i++) {
      const speed = (this.seededRandom(i * 3) * 2 + 0.5);
      const sx = (this.seededRandom(i * 7) * w + phase * speed * 30) % w;
      const sy = this.seededRandom(i * 13) * h;
      const bright = this.seededRandom(i * 17) * 0.6 + 0.4;
      const twinkle = Math.sin(phase * 2 + i) * 0.2 + 0.8;
      ctx.globalAlpha = bright * twinkle;
      const size = speed > 1.5 ? 2 : 1;
      this.rect(ctx, sx, sy, size, 1, c.WHITE);
      ctx.globalAlpha = 1;
    }

    // Nebula
    ctx.globalAlpha = 0.15;
    const grad = ctx.createRadialGradient(w * 0.3, h * 0.4, 10, w * 0.3, h * 0.4, 120);
    grad.addColorStop(0, '#4400FF');
    grad.addColorStop(0.5, '#220066');
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;

    // Space station / ship
    const sx = w * 0.5, sy = h * 0.55;
    // Main hull
    this.rect(ctx, sx - 40, sy - 5, 80, 10, '#445566');
    this.rect(ctx, sx - 35, sy - 8, 70, 3, '#556677');
    // Bridge dome
    this.rect(ctx, sx - 10, sy - 15, 20, 10, '#334455');
    ctx.fillStyle = '#00CCFF';
    ctx.globalAlpha = 0.6 + Math.sin(phase * 2) * 0.2;
    ctx.fillRect(sx - 7, sy - 13, 14, 6);
    ctx.globalAlpha = 1;
    // Engines
    const engineGlow = Math.sin(phase * 4) * 0.2 + 0.8;
    ctx.globalAlpha = engineGlow;
    this.rect(ctx, sx - 42, sy - 2, 4, 5, '#FF6600');
    this.rect(ctx, sx + 38, sy - 2, 4, 5, '#FF6600');
    ctx.globalAlpha = 0.3;
    this.rect(ctx, sx - 48, sy - 1, 6, 3, '#FF3300');
    this.rect(ctx, sx + 42, sy - 1, 6, 3, '#FF3300');
    ctx.globalAlpha = 1;
    // Wings
    this.rect(ctx, sx - 50, sy + 2, 15, 3, '#334455');
    this.rect(ctx, sx + 35, sy + 2, 15, 3, '#334455');

    // Planet (bottom corner)
    ctx.fillStyle = '#113322';
    ctx.beginPath();
    ctx.arc(w * 0.85, h + 30, 80, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#1a4433';
    ctx.beginPath();
    ctx.arc(w * 0.85 + 10, h + 25, 60, 0, Math.PI * 2);
    ctx.fill();
  },

  // ── SQ Scene Drawing Helpers ──
  drawConsolePanel(ctx, x, y, w, h, phase) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, '#334455');
    this.rect(ctx, x + 1, y + 1, w - 2, h - 2, '#223344');
    // Blinking lights
    for (let lx = x + 4; lx < x + w - 4; lx += 6) {
      for (let ly = y + 3; ly < y + h - 3; ly += 5) {
        const on = Math.sin(phase * 3 + lx + ly * 2) > 0;
        const colors = [c.RED, c.GREEN, c.YELLOW, '#00CCFF'];
        const ci = Math.floor(this.seededRandom(lx * 7 + ly * 3) * colors.length);
        const prevAlpha = ctx.globalAlpha;
        ctx.globalAlpha = on ? (0.8 * prevAlpha) : (0.2 * prevAlpha);
        this.rect(ctx, lx, ly, 2, 2, colors[ci]);
        ctx.globalAlpha = prevAlpha;
      }
    }
  },

  drawViewscreen(ctx, x, y, w, h, phase) {
    const c = this.C;
    this.rect(ctx, x - 2, y - 2, w + 4, h + 4, '#445566');
    ctx.fillStyle = '#000022';
    ctx.fillRect(x, y, w, h);
    // Stars through viewscreen
    ctx.save();
    ctx.beginPath();
    ctx.rect(x, y, w, h);
    ctx.clip();
    for (let i = 0; i < 15; i++) {
      const sx = x + (this.seededRandom(i * 7) * w + phase * 10) % w;
      const sy = y + this.seededRandom(i * 13) * h;
      this.pixel(ctx, sx, sy, c.WHITE);
    }
    ctx.restore();
  },

  drawAirlock(ctx, x, y, w, h) {
    this.rect(ctx, x, y, w, h, '#556677');
    this.rect(ctx, x + 2, y + 2, w - 4, h - 4, '#334455');
    // Warning stripes
    for (let sy = y; sy < y + h; sy += 6) {
      this.rect(ctx, x, sy, 2, 3, '#FFCC00');
    }
    for (let sy = y; sy < y + h; sy += 6) {
      this.rect(ctx, x + w - 2, sy, 2, 3, '#FFCC00');
    }
  },

  drawAlienPlant(ctx, x, y, h, color) {
    const c = this.C;
    const col = color || '#44CC88';
    // Stem
    this.rect(ctx, x - 1, y - h, 2, h, col);
    // Bulbs
    ctx.fillStyle = col;
    ctx.beginPath();
    ctx.arc(x, y - h, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x - 3, y - h * 0.6, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 3, y - h * 0.7, 3, 0, Math.PI * 2);
    ctx.fill();
  },

  // ── SQ NPCs ──
  drawAlien(ctx, x, y, phase) {
    const c = this.C;
    // Green alien bartender
    this.rect(ctx, x - 4, y - 20, 8, 10, '#225533'); // body
    this.rect(ctx, x - 3, y - 28, 6, 8, '#33AA55'); // head (bigger)
    // Large eyes
    this.rect(ctx, x - 3, y - 26, 3, 3, c.BLACK);
    this.rect(ctx, x + 1, y - 26, 3, 3, c.BLACK);
    this.pixel(ctx, x - 2, y - 25, c.YELLOW);
    this.pixel(ctx, x + 2, y - 25, c.YELLOW);
    // Antennae
    this.rect(ctx, x - 2, y - 30, 1, 3, '#33AA55');
    this.rect(ctx, x + 2, y - 30, 1, 3, '#33AA55');
    const bob = Math.sin(phase * 2) * 1;
    this.pixel(ctx, x - 2, y - 31 + bob, c.YELLOW);
    this.pixel(ctx, x + 2, y - 31 - bob, c.YELLOW);
    // Body
    this.rect(ctx, x - 3, y - 10, 3, 10, '#225533');
    this.rect(ctx, x, y - 10, 3, 10, '#225533');
  },

  drawRobot(ctx, x, y, phase) {
    const c = this.C;
    // Boxy robot
    this.rect(ctx, x - 5, y - 20, 10, 12, c.GRAY);
    this.rect(ctx, x - 4, y - 27, 8, 7, c.LTGRAY);
    // Eyes (LED)
    const blink = Math.sin(phase * 3) > 0;
    this.rect(ctx, x - 2, y - 25, 2, 2, blink ? c.RED : '#330000');
    this.rect(ctx, x + 1, y - 25, 2, 2, blink ? c.RED : '#330000');
    // Antenna
    this.rect(ctx, x, y - 29, 1, 3, c.DKGRAY);
    this.pixel(ctx, x, y - 30, blink ? '#00FF00' : '#003300');
    // Legs
    this.rect(ctx, x - 4, y - 8, 3, 8, c.DKGRAY);
    this.rect(ctx, x + 1, y - 8, 3, 8, c.DKGRAY);
    // Arms
    this.rect(ctx, x - 7, y - 18, 2, 6, c.DKGRAY);
    this.rect(ctx, x + 5, y - 18, 2, 6, c.DKGRAY);
  },

  // ═══════════════════════════════════════════════
  //  POLICE QUEST - Character & Drawing
  // ═══════════════════════════════════════════════

  drawOfficer(ctx, x, y, dir, frame, actionAnim) {
    const c = this.C;
    // Officer Jack Stone: blue uniform, badge, cap

    if (actionAnim) {
      this.rect(ctx, x - 4, y - 22, 8, 10, '#223366'); // uniform
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      this.rect(ctx, x - 4, y - 30, 8, 2, '#112244'); // cap
      this.rect(ctx, x - 5, y - 29, 10, 1, '#112244'); // brim
      this.rect(ctx, x - 3, y - 12, 3, 6, '#112244');
      this.rect(ctx, x, y - 12, 3, 6, '#112244');
      this.rect(ctx, x - 3, y - 6, 3, 6, '#111');
      this.rect(ctx, x, y - 6, 3, 6, '#111');
      this.rect(ctx, x + 4, y - 22, 6, 3, '#223366');
      this.rect(ctx, x + 8, y - 22, 3, 3, c.SKIN);
      this.pixel(ctx, x + 2, y - 19, c.GOLD); // badge
      return;
    }

    const stepOff = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legL = (frame >= 0) ? Math.sin(frame * Math.PI / 2) * 2 : 0;
    const legR = -legL;

    if (dir === 0 || dir === 2) {
      // Shoes
      this.rect(ctx, x - 4, y - 6 + legL, 3, 6, '#111');
      this.rect(ctx, x + 1, y - 6 + legR, 3, 6, '#111');
      // Uniform pants
      this.rect(ctx, x - 4, y - 12 + legL, 3, 6, '#112244');
      this.rect(ctx, x + 1, y - 12 + legR, 3, 6, '#112244');
      // Uniform shirt
      this.rect(ctx, x - 5, y - 22, 10, 10, '#223366');
      // Badge
      this.pixel(ctx, x + 2, y - 19, c.GOLD);
      this.pixel(ctx, x + 2, y - 18, c.GOLD);
      // Belt with holster
      this.rect(ctx, x - 5, y - 13, 10, 2, '#111');
      this.rect(ctx, x + 3, y - 14, 2, 3, '#333'); // holster
      // Head
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      // Cap
      this.rect(ctx, x - 4, y - 30, 8, 2, '#112244');
      this.rect(ctx, x - 5, y - 29, 10, 1, '#112244');
      if (dir === 0) {
        // Face
        this.pixel(ctx, x - 1, y - 27, c.BLACK);
        this.pixel(ctx, x + 1, y - 27, c.BLACK);
        this.rect(ctx, x - 1, y - 25, 3, 1, c.SKIN);
      }
      // Arms
      this.rect(ctx, x - 7, y - 21 - stepOff, 2, 8, '#223366');
      this.rect(ctx, x + 5, y - 21 + stepOff, 2, 8, '#223366');
    } else {
      const flip = dir === 3 ? 1 : -1;
      this.rect(ctx, x - 2 + legL * flip, y - 6, 4, 6, '#111');
      this.rect(ctx, x - 2 + legR * flip, y - 6, 4, 6, '#111');
      this.rect(ctx, x - 2 + legL * flip, y - 12, 4, 6, '#112244');
      this.rect(ctx, x - 2 + legR * flip, y - 12, 4, 6, '#112244');
      this.rect(ctx, x - 4, y - 22, 8, 10, '#223366');
      this.rect(ctx, x - 4, y - 13, 8, 2, '#111');
      this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
      this.rect(ctx, x - 4, y - 30, 8, 2, '#112244');
      this.rect(ctx, x - 5, y - 29, 10, 1, '#112244');
      this.pixel(ctx, x + flip * 1, y - 27, c.BLACK);
      this.rect(ctx, x + flip * 3, y - 21, 2, 8, '#223366');
    }
  },

  // ── PQ Title Screen ──
  drawTitleScreenPQ(ctx, w, h, phase) {
    const c = this.C;
    // Urban night scene
    this.drawSky(ctx, w, h * 0.5, '#0a1525', '#1a2a40');

    // City skyline
    const bldgs = [
      { x: 0, w: 80, h: 200 }, { x: 75, w: 55, h: 250 },
      { x: 125, w: 90, h: 180 }, { x: 210, w: 60, h: 270 },
      { x: 265, w: 100, h: 200 }, { x: 360, w: 65, h: 230 },
      { x: 420, w: 80, h: 190 }, { x: 495, w: 70, h: 260 },
      { x: 560, w: 80, h: 210 },
    ];
    for (const b of bldgs) {
      this.rect(ctx, b.x, h - b.h, b.w, b.h, '#151a25');
      for (let wy = h - b.h + 8; wy < h - 30; wy += 12) {
        for (let wx = b.x + 5; wx < b.x + b.w - 5; wx += 9) {
          const lit = this.seededRandom(wx * 3 + wy * 7) > 0.5;
          if (lit) {
            this.rect(ctx, wx, wy, 4, 5, '#CCAA55');
          }
        }
      }
    }

    // Street
    this.rect(ctx, 0, h - 40, w, 40, '#222');
    this.rect(ctx, 0, h - 42, w, 2, '#444');
    // Yellow center line
    for (let lx = 0; lx < w; lx += 20) {
      this.rect(ctx, lx, h - 22, 10, 2, '#CCAA00');
    }

    // Police car
    const carX = w * 0.4 + Math.sin(phase * 0.5) * 5;
    this.rect(ctx, carX, h - 52, 60, 14, '#1a3366');
    this.rect(ctx, carX + 10, h - 60, 40, 10, '#2244AA');
    // Windows
    this.rect(ctx, carX + 14, h - 58, 14, 6, '#335577');
    this.rect(ctx, carX + 32, h - 58, 14, 6, '#335577');
    // Wheels
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(carX + 15, h - 38, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(carX + 45, h - 38, 5, 0, Math.PI * 2);
    ctx.fill();
    // Lights (flashing)
    const flash = Math.sin(phase * 6) > 0;
    if (flash) {
      this.rect(ctx, carX + 22, h - 62, 6, 3, '#FF0000');
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#FF0000';
      ctx.beginPath();
      ctx.arc(carX + 25, h - 60, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      this.rect(ctx, carX + 32, h - 62, 6, 3, '#0044FF');
      ctx.globalAlpha = 0.2;
      ctx.fillStyle = '#0044FF';
      ctx.beginPath();
      ctx.arc(carX + 35, h - 60, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Street lights
    for (let lx = 30; lx < w; lx += 150) {
      this.rect(ctx, lx, h - 90, 2, 50, '#555');
      this.rect(ctx, lx - 3, h - 92, 8, 3, '#666');
      ctx.globalAlpha = 0.8;
      this.rect(ctx, lx - 1, h - 94, 4, 2, '#FFD700');
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = '#FFD700';
      ctx.beginPath();
      ctx.arc(lx + 1, h - 70, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  },

  // ── PQ Scene Drawing Helpers ──
  drawDesk(ctx, x, y, w) {
    const c = this.C;
    this.rect(ctx, x, y, w, 8, c.BROWN);
    this.rect(ctx, x + 1, y + 1, w - 2, 4, c.LTBROWN);
    // Legs
    this.rect(ctx, x + 2, y + 8, 3, 12, c.DKBROWN);
    this.rect(ctx, x + w - 5, y + 8, 3, 12, c.DKBROWN);
  },

  drawPoliceCar(ctx, x, y) {
    const c = this.C;
    // Side view
    this.rect(ctx, x, y, 50, 12, '#1a3366');
    this.rect(ctx, x + 8, y - 8, 34, 9, '#2244AA');
    this.rect(ctx, x + 11, y - 6, 12, 5, '#446688');
    this.rect(ctx, x + 27, y - 6, 12, 5, '#446688');
    // Wheels
    ctx.fillStyle = '#111';
    ctx.beginPath();
    ctx.arc(x + 12, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 38, y + 12, 4, 0, Math.PI * 2);
    ctx.fill();
    // Light bar
    this.rect(ctx, x + 18, y - 10, 4, 2, c.RED);
    this.rect(ctx, x + 28, y - 10, 4, 2, c.BLUE);
    // Text
    this.rect(ctx, x + 20, y + 3, 10, 3, c.WHITE);
  },

  drawEvidenceBoard(ctx, x, y, w, h) {
    const c = this.C;
    this.rect(ctx, x, y, w, h, '#2a2a2a');
    this.rect(ctx, x + 1, y + 1, w - 2, h - 2, '#3a3a3a');
    // Pinned items
    const items = [
      { x: 8, y: 5, w: 12, h: 8, c: c.WHITE },
      { x: 25, y: 8, w: 10, h: 10, c: '#FFCCCC' },
      { x: 42, y: 4, w: 14, h: 9, c: c.WHITE },
      { x: 15, y: 20, w: 8, h: 8, c: '#CCCCFF' },
      { x: 35, y: 22, w: 12, h: 7, c: c.WHITE },
    ];
    for (const item of items) {
      this.rect(ctx, x + item.x, y + item.y, item.w, item.h, item.c);
      this.pixel(ctx, x + item.x + item.w / 2, y + item.y, c.RED); // pin
    }
    // String connections
    ctx.strokeStyle = c.RED;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(x + 14, y + 9);
    ctx.lineTo(x + 30, y + 13);
    ctx.lineTo(x + 49, y + 9);
    ctx.stroke();
  },

  drawCrimeSceneTape(ctx, x, y, w) {
    const c = this.C;
    this.rect(ctx, x, y, w, 3, c.YELLOW);
    // Diagonal stripes
    for (let sx = x; sx < x + w; sx += 8) {
      this.rect(ctx, sx, y, 4, 3, '#111');
    }
  },

  drawTrafficLight(ctx, x, y, phase) {
    this.rect(ctx, x, y + 20, 2, 30, '#444');
    this.rect(ctx, x - 3, y, 8, 20, '#333');
    const state = Math.floor(phase) % 3;
    this.rect(ctx, x - 1, y + 2, 4, 4, state === 0 ? '#FF0000' : '#330000');
    this.rect(ctx, x - 1, y + 8, 4, 4, state === 1 ? '#FFFF00' : '#333300');
    this.rect(ctx, x - 1, y + 14, 4, 4, state === 2 ? '#00FF00' : '#003300');
  },

  // ── PQ NPCs ──
  drawSergeant(ctx, x, y, phase) {
    const c = this.C;
    // Desk sergeant - heavier build
    this.rect(ctx, x - 5, y - 20, 10, 12, '#223366');
    this.rect(ctx, x - 4, y - 28, 8, 8, c.SKIN);
    this.rect(ctx, x - 5, y - 30, 10, 2, '#112244'); // cap
    this.rect(ctx, x - 4, y - 10, 4, 10, '#112244');
    this.rect(ctx, x, y - 10, 4, 10, '#112244');
    this.pixel(ctx, x - 2, y - 26, c.BLACK);
    this.pixel(ctx, x + 2, y - 26, c.BLACK);
    // Mustache
    this.rect(ctx, x - 2, y - 24, 5, 1, '#333');
    // Badge
    this.pixel(ctx, x + 3, y - 17, c.GOLD);
  },

  drawDetective(ctx, x, y, phase) {
    const c = this.C;
    // Plain clothes detective
    this.rect(ctx, x - 4, y - 22, 8, 10, '#554433'); // brown jacket
    this.rect(ctx, x - 3, y - 28, 6, 6, c.SKIN);
    this.rect(ctx, x - 3, y - 30, 6, 2, '#333'); // dark hair
    this.rect(ctx, x - 3, y - 12, 3, 6, '#333');
    this.rect(ctx, x, y - 12, 3, 6, '#333');
    this.rect(ctx, x - 3, y - 6, 3, 6, '#222');
    this.rect(ctx, x, y - 6, 3, 6, '#222');
    // Tie
    this.rect(ctx, x, y - 20, 1, 6, c.RED);
    this.pixel(ctx, x - 1, y - 27, c.BLACK);
    this.pixel(ctx, x + 1, y - 27, c.BLACK);
  }
};
