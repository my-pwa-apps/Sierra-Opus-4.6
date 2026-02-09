/* ============================================
   Sierra Tribute Collection
   App Bootstrap - Launcher, Screen Flow & VR
   ============================================ */

const App = {
  titlePhase: 0,
  titleAnimId: null,
  vrSession: null,
  vrSupported: false,
  selectedGameId: null,

  // ── Game Configurations ──
  gameConfigs: {
    kq: {
      id: 'kq', title: "King's Quest", subtitle: 'The Enchanted Isle',
      credit: 'A Sierra On-Line Adventure', themeColor: '#003366',
      maxScore: 145, startScene: 'throneRoom', startX: 160, startY: 135,
      drawCharacter: (...args) => GFX.drawGraham(...args),
      drawTitle: (ctx, w, h, phase) => GFX.drawTitleScreen(ctx, w, h, phase),
      titleColor: '#DAA520',
      introMessages: [
        { message: 'In the Kingdom of Daventry, something strange is afoot...', duration: 3000 },
        { message: 'The castle moat has turned to pudding, the gardens grow backwards, and the royal cat now speaks fluent Latin.', duration: 4500 },
        { message: 'King Graham must find the source of this magical mayhem and put things right!', duration: 3500 },
      ],
      aboutText: "King's Quest: The Enchanted Isle\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nA Sierra On-Line style adventure\n\nStory: King Graham must travel to a mysterious\nisland to find the wizard Fumblemore, who\naccidentally shattered the Crystal of Order,\nsending all magic haywire!\n\nVR: Put on your headset and press Enter VR\nto explore as King Graham in first person!\n\nScore: 145 points possible",
      storagePrefix: 'kq', hasVR: true, emoji: '👑'
    },
    lsl: {
      id: 'lsl', title: 'Leisure Suit Larry', subtitle: 'Byte Club',
      credit: 'A Sierra On-Line Adventure', themeColor: '#660033',
      maxScore: 100, startScene: 'bar', startX: 160, startY: 140,
      drawCharacter: (...args) => GFX.drawLarry(...args),
      drawTitle: (ctx, w, h, phase) => GFX.drawTitleScreenLSL(ctx, w, h, phase),
      titleColor: '#FF69B4',
      introMessages: [
        { message: 'In the neon-lit city of Lost Wages...', duration: 3000 },
        { message: "Larry Laffer, the world's most hopeless romantic, arrives looking for love in all the wrong places.", duration: 4500 },
        { message: "Armed with nothing but a leisure suit, bad pickup lines, and unshakeable optimism, Larry's adventure begins!", duration: 3500 },
      ],
      aboutText: "Leisure Suit Larry: Byte Club\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nA Sierra On-Line style adventure\n\nStory: Larry Laffer arrives in Lost Wages\nhoping to find true love. Navigate nightlife,\nsurvive awkward encounters, and try not to\nembarrass yourself too badly!\n\nScore: 100 points possible",
      storagePrefix: 'lsl', hasVR: false, emoji: '🕺'
    },
    sq: {
      id: 'sq', title: 'Space Quest', subtitle: 'Debris of Destiny',
      credit: 'A Sierra On-Line Adventure', themeColor: '#000033',
      maxScore: 100, startScene: 'janitorCloset', startX: 160, startY: 130,
      drawCharacter: (...args) => GFX.drawRoger(...args),
      drawTitle: (ctx, w, h, phase) => GFX.drawTitleScreenSQ(ctx, w, h, phase),
      titleColor: '#00CCFF',
      introMessages: [
        { message: 'Somewhere in the Andromeda galaxy...', duration: 3000 },
        { message: 'The SS Titanium, a state-of-the-art research vessel, has been boarded by the dreaded Sludge Pirates.', duration: 4500 },
        { message: 'The entire crew has been captured. All except one... the janitor who was napping in a supply closet.', duration: 3500 },
      ],
      aboutText: "Space Quest: Debris of Destiny\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nA Sierra On-Line style adventure\n\nStory: You're the janitor on the SS Titanium.\nWhen aliens capture the crew, it's up to\nyou and your trusty mop to save everyone.\nYou are spectacularly unqualified for this.\n\nScore: 100 points possible",
      storagePrefix: 'sq', hasVR: false, emoji: '🚀'
    },
    pq: {
      id: 'pq', title: 'Police Quest', subtitle: 'Code Blue',
      credit: 'A Sierra On-Line Adventure', themeColor: '#003355',
      maxScore: 100, startScene: 'briefingRoom', startX: 160, startY: 130,
      drawCharacter: (...args) => GFX.drawOfficer(...args),
      drawTitle: (ctx, w, h, phase) => GFX.drawTitleScreenPQ(ctx, w, h, phase),
      titleColor: '#4488CC',
      introMessages: [
        { message: 'In the city of Lytton Springs...', duration: 3000 },
        { message: "A wave of mysterious burglaries has the police department baffled. Evidence just doesn't add up.", duration: 4500 },
        { message: "Rookie Officer Jack Stone is assigned to the case. What could go wrong? (Everything. Everything could go wrong.)", duration: 3500 },
      ],
      aboutText: "Police Quest: Code Blue\n━━━━━━━━━━━━━━━━━━━━━━━━━━━\nA Sierra On-Line style adventure\n\nStory: You're Officer Jack Stone, rookie cop\nin Lytton Springs. Investigate a string\nof burglaries that may lead to something\nmuch bigger. Follow procedure!\n\nScore: 100 points possible",
      storagePrefix: 'pq', hasVR: false, emoji: '🚔'
    }
  },

  init() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Screen transitions
    this.screens = {
      launcher: document.getElementById('launcher-screen'),
      login: document.getElementById('login-screen'),
      title: document.getElementById('title-screen'),
      game: document.getElementById('game-screen'),
    };

    this.setupLauncher();
    this.setupNameScreen();
    this.setupTitle();
    this.checkVR();

    // Pre-fill last used name
    const lastPlayer = AccountManager.getLastPlayer();
    if (lastPlayer) {
      const displayName = localStorage.getItem('sierra_display_name_' + lastPlayer) || localStorage.getItem('kq_display_name_' + lastPlayer) || lastPlayer;
      document.getElementById('username').value = displayName;
    }
  },

  // ── Launcher Screen ──
  setupLauncher() {
    const gameCards = document.querySelectorAll('.game-card');
    gameCards.forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.game;
        this.selectGame(id);
      });
    });

    // Render mini previews on each card canvas
    gameCards.forEach(card => {
      const id = card.dataset.game;
      const cfg = this.gameConfigs[id];
      if (!cfg) return;
      const canvas = card.querySelector('.game-preview');
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      ctx.imageSmoothingEnabled = false;
      cfg.drawTitle(ctx, canvas.width, canvas.height, 0.5);
    });
  },

  selectGame(id) {
    const cfg = this.gameConfigs[id];
    if (!cfg) return;
    this.selectedGameId = id;
    AccountManager.setGamePrefix(cfg.storagePrefix);
    // Update theme color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', cfg.themeColor);
    // Update login screen title
    const titleEl = document.getElementById('login-game-title');
    const subEl = document.getElementById('login-game-subtitle');
    if (titleEl) titleEl.textContent = cfg.title;
    if (subEl) subEl.textContent = cfg.subtitle;
    this.showScreen('login');
  },

  showScreen(name) {
    Object.values(this.screens).forEach(s => { s.classList.remove('active'); });
    this.screens[name].classList.add('active');
  },

  // ── Name Screen (replaces login) ──
  setupNameScreen() {
    const msgEl = document.getElementById('login-message');

    document.getElementById('btn-play').addEventListener('click', () => {
      const name = document.getElementById('username').value.trim();
      if (!name || name.length < 1) {
        msgEl.textContent = 'Please enter your name.';
        msgEl.className = 'login-msg';
        return;
      }
      AccountManager.setName(name);
      msgEl.textContent = `Welcome, ${name}!`;
      msgEl.className = 'login-msg success';
      setTimeout(() => this.showTitle(), 600);
    });

    // Enter key
    document.getElementById('username').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-play').click();
    });
  },

  // ── Check WebXR VR Support ──
  async checkVR() {
    if (navigator.xr) {
      try {
        this.vrSupported = await navigator.xr.isSessionSupported('immersive-vr');
      } catch (e) {
        this.vrSupported = false;
      }
    }
    const vrBtn = document.getElementById('btn-vr');
    if (vrBtn && this.vrSupported) {
      vrBtn.style.display = '';
    }
  },

  // ── Title Screen ──
  setupTitle() {
    document.getElementById('btn-new-game').addEventListener('click', () => {
      this.stopTitleAnim();
      this.startGame(null);
    });

    document.getElementById('btn-continue').addEventListener('click', () => {
      const lastSave = AccountManager.getLastSave();
      if (lastSave) {
        this.stopTitleAnim();
        this.startGame(lastSave);
      } else {
        // Flash the button to indicate no save
        const btn = document.getElementById('btn-continue');
        btn.textContent = 'No Save Found!';
        setTimeout(() => { btn.textContent = 'Continue'; }, 1500);
      }
    });

    document.getElementById('btn-about').addEventListener('click', () => {
      const cfg = this.gameConfigs[this.selectedGameId] || this.gameConfigs.kq;
      alert(
        cfg.aboutText + "\n\n" +
        "Gameplay Tips:\n" +
        "• Use the verb buttons to interact\n" +
        "• Check your inventory often\n" +
        "• Talk to everyone (twice!)\n" +
        "• SAVE OFTEN (This is a Sierra game!)\n" +
        "• Be careful what you eat or walk into...\n\n" +
        "Built with ♥ in the spirit of classic Sierra adventures"
      );
    });

    document.getElementById('btn-back').addEventListener('click', () => {
      this.stopTitleAnim();
      this.showScreen('launcher');
    });

    // VR button
    document.getElementById('btn-vr').addEventListener('click', () => {
      this.stopTitleAnim();
      this.startVR();
    });
  },

  showTitle() {
    this.showScreen('title');
    this.startTitleAnim();

    const cfg = this.gameConfigs[this.selectedGameId] || this.gameConfigs.kq;

    // Update continue button state
    const btn = document.getElementById('btn-continue');
    const hasSaves = AccountManager.hasSaves();
    btn.style.opacity = hasSaves ? '1' : '0.5';
    btn.style.pointerEvents = hasSaves ? 'auto' : 'auto'; // always clickable for feedback

    // VR button visibility
    const vrBtn = document.getElementById('btn-vr');
    if (vrBtn) {
      vrBtn.style.display = (cfg.hasVR && this.vrSupported) ? '' : 'none';
    }

    // Show welcome message
    const name = AccountManager.getDisplayName();
    const titleOverlay = document.querySelector('.title-overlay');
    let welcomeEl = document.getElementById('title-welcome');
    if (!welcomeEl) {
      welcomeEl = document.createElement('p');
      welcomeEl.id = 'title-welcome';
      welcomeEl.style.cssText = 'font-family: var(--pixel-font); font-size: 0.45rem; color: #AAD; margin-bottom: 8px; text-align: center;';
      titleOverlay.insertBefore(welcomeEl, titleOverlay.firstChild);
    }
    welcomeEl.textContent = `Welcome, ${name}`;
  },

  startTitleAnim() {
    const canvas = document.getElementById('title-canvas');
    const ctx = canvas.getContext('2d');
    const cfg = this.gameConfigs[this.selectedGameId] || this.gameConfigs.kq;

    // Size title canvas to fill screen
    const rect = this.screens.title.getBoundingClientRect();
    canvas.width = 640;
    canvas.height = 400;
    ctx.imageSmoothingEnabled = false;

    let lastTime = performance.now();
    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;
      this.titlePhase += dt;
      cfg.drawTitle(ctx, canvas.width, canvas.height, this.titlePhase);

      // Title text overlay
      ctx.fillStyle = cfg.titleColor || '#DAA520';
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText(cfg.title.toUpperCase(), canvas.width/2, canvas.height * 0.22);

      ctx.fillStyle = '#AAD';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText(cfg.subtitle, canvas.width/2, canvas.height * 0.28);

      ctx.fillStyle = '#888';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText(cfg.credit, canvas.width/2, canvas.height * 0.33);

      this.titleAnimId = requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  },

  stopTitleAnim() {
    if (this.titleAnimId) {
      cancelAnimationFrame(this.titleAnimId);
      this.titleAnimId = null;
    }
  },

  // ── Start Game ──
  startGame(saveData) {
    this.showScreen('game');

    const eng = window.Engine;
    const cfg = this.gameConfigs[this.selectedGameId] || this.gameConfigs.kq;
    const worlds = window.GameWorlds || {};

    // Only init once - prevent re-binding event listeners
    if (!this._gameInitialized) {
      eng.init('game-canvas');
      this._gameInitialized = true;
    }

    // Register per-game scenes and config
    eng.scenes = worlds[cfg.id] || worlds.kq || window.GameScenes;
    eng.gameConfig = cfg;

    // Snapshot initial NPC hidden states for reset on new game
    for (const scene of Object.values(eng.scenes)) {
      if (scene.npcs) {
        for (const npc of scene.npcs) {
          if (npc._initialHidden === undefined) {
            npc._initialHidden = !!npc.hidden;
          }
        }
      }
    }

    if (saveData) {
      eng.loadSaveData(saveData);
    } else {
      eng.startNewGame();
    }

    eng.start();

    // Resume audio context on interaction (browser policy)
    if (eng.audioCtx && eng.audioCtx.state === 'suspended') {
      eng.audioCtx.resume().catch(() => {});
    }
  },

  // ══════════════════════════════════════
  //  VR MODE - 3D world, Sierra pseudo-3D style
  //  You ARE Graham — first person in a 3D version
  //  of the 2D scenes with distinct walls & floors
  // ══════════════════════════════════════

  // ── 3D Scene Definitions ──
  // Each scene maps to a set of colored quads:
  //   floor planes (y=0), walls (vertical), and objects (boxes/quads)
  // Coordinates: x=right, y=up, z=into-screen(north)

  vr3DScenes: {
    throneRoom: {
      skyColor: [0.04, 0.04, 0.08, 1],
      floor: { color: [0.4, 0.4, 0.5, 1], x: -5, z: -5, w: 10, d: 10, y: 0 },
      floorTiles: true,
      walls: [
        // Back wall (north)
        { color: [0.35, 0.35, 0.42, 1], x: -5, y: 0, z: -5, w: 10, h: 4, facing: 'south' },
        // Left wall
        { color: [0.3, 0.3, 0.38, 1], x: -5, y: 0, z: -5, w: 10, h: 4, facing: 'east' },
        // Right wall
        { color: [0.3, 0.3, 0.38, 1], x: 5, y: 0, z: -5, w: 10, h: 4, facing: 'west' },
      ],
      objects: [
        // Red carpet (floor strip)
        { type: 'floor', color: [0.7, 0.15, 0.15, 1], x: -0.4, z: -5, w: 0.8, d: 10, y: 0.01 },
        // Carpet gold trim
        { type: 'floor', color: [0.85, 0.65, 0.13, 1], x: -0.45, z: -5, w: 0.05, d: 10, y: 0.015 },
        { type: 'floor', color: [0.85, 0.65, 0.13, 1], x: 0.4, z: -5, w: 0.05, d: 10, y: 0.015 },
        // King's Throne (left of center, against back wall)
        { type: 'box', color: [0.7, 0.15, 0.15, 1], x: -1.0, y: 0, z: -4.5, w: 0.8, h: 2.0, d: 0.6 },
        { type: 'box', color: [0.85, 0.65, 0.13, 1], x: -1.0, y: 1.7, z: -4.5, w: 0.9, h: 0.15, d: 0.65 }, // gold top
        { type: 'box', color: [0.85, 0.65, 0.13, 1], x: -1.0, y: 0.85, z: -4.5, w: 0.85, h: 0.08, d: 0.65 }, // gold seat
        // Queen's Throne (right of center)
        { type: 'box', color: [0.7, 0.15, 0.15, 1], x: 1.0, y: 0, z: -4.5, w: 0.8, h: 2.0, d: 0.6 },
        { type: 'box', color: [0.85, 0.65, 0.13, 1], x: 1.0, y: 1.7, z: -4.5, w: 0.9, h: 0.15, d: 0.65 },
        { type: 'box', color: [0.85, 0.65, 0.13, 1], x: 1.0, y: 0.85, z: -4.5, w: 0.85, h: 0.08, d: 0.65 },
        // Left window (back wall)
        { type: 'wall', color: [0.2, 0.35, 0.55, 1], x: -3.5, y: 1.5, z: -4.98, w: 0.7, h: 1.2, facing: 'south' },
        // Right window
        { type: 'wall', color: [0.2, 0.35, 0.55, 1], x: 3.5, y: 1.5, z: -4.98, w: 0.7, h: 1.2, facing: 'south' },
        // Left tapestry (red)
        { type: 'wall', color: [0.7, 0.15, 0.15, 1], x: -2.2, y: 1.2, z: -4.97, w: 0.5, h: 1.5, facing: 'south' },
        // Right tapestry (blue)
        { type: 'wall', color: [0.15, 0.2, 0.6, 1], x: 2.2, y: 1.2, z: -4.97, w: 0.5, h: 1.5, facing: 'south' },
        // Mirror (left wall)
        { type: 'wall', color: [0.33, 0.47, 0.67, 1], x: -4.97, y: 1.5, z: -3.0, w: 0.6, h: 0.8, facing: 'east' },
        { type: 'wall', color: [0.85, 0.65, 0.13, 1], x: -4.96, y: 1.45, z: -3.0, w: 0.66, h: 0.05, facing: 'east' },
        { type: 'wall', color: [0.85, 0.65, 0.13, 1], x: -4.96, y: 2.3, z: -3.0, w: 0.66, h: 0.05, facing: 'east' },
        // Chest (right side, near wall)
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 4.0, y: 0, z: -4.0, w: 0.5, h: 0.4, d: 0.35 },
        { type: 'box', color: [0.67, 0.47, 0.27, 1], x: 4.0, y: 0.3, z: -4.0, w: 0.55, h: 0.1, d: 0.4 },
        // Door (south wall opening - represented as a dark rectangle)
        { type: 'wall', color: [0.25, 0.15, 0.07, 1], x: 0, y: 0, z: 4.98, w: 1.0, h: 2.5, facing: 'north' },
        // Torches (left and right, on back wall) - bright spots
        { type: 'box', color: [1.0, 0.8, 0.2, 1], x: -2.8, y: 2.5, z: -4.8, w: 0.1, h: 0.15, d: 0.1 },
        { type: 'box', color: [1.0, 0.8, 0.2, 1], x: 2.8, y: 2.5, z: -4.8, w: 0.1, h: 0.15, d: 0.1 },
      ],
      npcs: [
        // Queen Valanice (standing near Queen's throne)
        { color: [0.4, 0.4, 0.8, 1], x: 1.5, y: 0, z: -3.5, w: 0.4, h: 1.5, d: 0.3, name: 'Queen Valanice' },
      ]
    },

    courtyard: {
      skyColor: [0.27, 0.53, 0.8, 1],
      floor: { color: [0.27, 0.67, 0.27, 1], x: -8, z: -8, w: 16, d: 16, y: 0 },
      walls: [
        // Castle wall (north)
        { color: [0.4, 0.4, 0.47, 1], x: -8, y: 0, z: -8, w: 16, h: 5, facing: 'south' },
        // Battlements on top
        { color: [0.5, 0.5, 0.57, 1], x: -8, y: 5, z: -8, w: 16, h: 0.5, facing: 'south' },
      ],
      objects: [
        // Dirt path (center)
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -1, z: -8, w: 2, d: 16, y: 0.01 },
        // Pudding moat!
        { type: 'floor', color: [0.87, 0.6, 0.27, 1], x: -8, z: -5.5, w: 16, d: 1.0, y: -0.1 },
        // Garden (left, flowers growing down)
        { type: 'box', color: [0.13, 0.3, 0.13, 1], x: -5, y: 0, z: -3, w: 2.5, h: 0.3, d: 1.5 },
        // Castle door
        { type: 'wall', color: [0.3, 0.18, 0.08, 1], x: 0, y: 0, z: -7.98, w: 1.2, h: 2.5, facing: 'south' },
        // Kitchen door (left)
        { type: 'wall', color: [0.3, 0.18, 0.08, 1], x: -3.5, y: 0, z: -7.98, w: 0.8, h: 2.0, facing: 'south' },
        // Well (right side)
        { type: 'box', color: [0.4, 0.4, 0.47, 1], x: 4.0, y: 0, z: -2.0, w: 0.8, h: 0.6, d: 0.8 },
        { type: 'box', color: [0.13, 0.2, 0.5, 1], x: 4.0, y: 0.1, z: -2.0, w: 0.6, h: 0.45, d: 0.6 },
        // Clouds (floating white boxes)
        { type: 'box', color: [0.95, 0.95, 0.98, 1], x: -3, y: 8, z: -10, w: 2, h: 0.5, d: 1 },
        { type: 'box', color: [0.95, 0.95, 0.98, 1], x: 4, y: 9, z: -12, w: 1.5, h: 0.4, d: 0.8 },
      ],
      npcs: []
    },

    kitchen: {
      skyColor: [0.06, 0.06, 0.12, 1],
      floor: { color: [0.4, 0.4, 0.5, 1], x: -5, z: -5, w: 10, d: 10, y: 0 },
      floorTiles: true,
      walls: [
        { color: [0.35, 0.35, 0.42, 1], x: -5, y: 0, z: -5, w: 10, h: 3.5, facing: 'south' },
        { color: [0.3, 0.3, 0.38, 1], x: -5, y: 0, z: -5, w: 10, h: 3.5, facing: 'east' },
        { color: [0.3, 0.3, 0.38, 1], x: 5, y: 0, z: -5, w: 10, h: 3.5, facing: 'west' },
      ],
      objects: [
        // Fireplace (left wall, recessed dark area with fire)
        { type: 'wall', color: [0.05, 0.05, 0.05, 1], x: -4.95, y: 0, z: -3, w: 1.5, h: 1.5, facing: 'east' },
        { type: 'box', color: [0.9, 0.5, 0.1, 1], x: -4.5, y: 0.1, z: -3, w: 0.3, h: 0.4, d: 0.3 }, // fire
        { type: 'box', color: [1.0, 0.9, 0.2, 1], x: -4.5, y: 0.3, z: -3, w: 0.15, h: 0.25, d: 0.15 }, // flame tip
        // Table (center)
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 0, y: 0.7, z: -1, w: 2.0, h: 0.08, d: 0.8 },
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: -0.7, y: 0, z: -1, w: 0.1, h: 0.7, d: 0.1 }, // leg
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 0.7, y: 0, z: -1, w: 0.1, h: 0.7, d: 0.1 },  // leg
        // Cauldron (near fireplace)
        { type: 'box', color: [0.25, 0.25, 0.25, 1], x: -3.5, y: 0, z: -2.5, w: 0.5, h: 0.5, d: 0.5 },
        // Shelves (right wall)
        { type: 'wall', color: [0.48, 0.3, 0.13, 1], x: 4.95, y: 1.2, z: -2, w: 2.0, h: 0.08, facing: 'west' },
        { type: 'wall', color: [0.48, 0.3, 0.13, 1], x: 4.95, y: 2.0, z: -2, w: 2.0, h: 0.08, facing: 'west' },
        // Spice jars on shelf
        { type: 'box', color: [0.85, 0.2, 0.2, 1], x: 4.6, y: 1.25, z: -2.5, w: 0.12, h: 0.2, d: 0.12 },
        { type: 'box', color: [0.2, 0.65, 0.2, 1], x: 4.6, y: 1.25, z: -2.2, w: 0.12, h: 0.2, d: 0.12 },
        { type: 'box', color: [0.2, 0.2, 0.85, 1], x: 4.6, y: 1.25, z: -1.9, w: 0.12, h: 0.2, d: 0.12 },
        { type: 'box', color: [0.85, 0.65, 0.2, 1], x: 4.6, y: 1.25, z: -1.6, w: 0.12, h: 0.2, d: 0.12 },
        // Door (right side, south wall)
        { type: 'wall', color: [0.3, 0.18, 0.08, 1], x: 3.5, y: 0, z: 4.98, w: 0.8, h: 2.0, facing: 'north' },
        // Window (back wall)
        { type: 'wall', color: [0.33, 0.47, 0.67, 1], x: 0, y: 1.5, z: -4.98, w: 0.7, h: 1.0, facing: 'south' },
      ],
      npcs: [
        { color: [0.95, 0.95, 0.95, 1], x: -2.5, y: 0, z: -1, w: 0.5, h: 1.6, d: 0.4, name: 'Chef Pierre' },
      ]
    },

    docks: {
      skyColor: [0.27, 0.53, 0.8, 1],
      floor: { color: [0.48, 0.3, 0.13, 1], x: -6, z: 0, w: 12, d: 6, y: 0 },
      walls: [],
      objects: [
        // Ocean (north, blue floor)
        { type: 'floor', color: [0.13, 0.27, 0.67, 1], x: -15, z: -20, w: 30, d: 20, y: -0.3 },
        // Dock planks
        { type: 'floor', color: [0.55, 0.35, 0.18, 1], x: -6, z: -1, w: 12, d: 1, y: 0.2 },
        // Dock posts
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: -4, y: -0.3, z: -0.5, w: 0.15, h: 0.7, d: 0.15 },
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: -2, y: -0.3, z: -0.5, w: 0.15, h: 0.7, d: 0.15 },
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: 0, y: -0.3, z: -0.5, w: 0.15, h: 0.7, d: 0.15 },
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: 2, y: -0.3, z: -0.5, w: 0.15, h: 0.7, d: 0.15 },
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: 4, y: -0.3, z: -0.5, w: 0.15, h: 0.7, d: 0.15 },
        // Barnaby's boat (hull)
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 0, y: -0.2, z: -3, w: 1.5, h: 0.4, d: 0.6 },
        // Mast
        { type: 'box', color: [0.3, 0.18, 0.08, 1], x: 0, y: 0, z: -3, w: 0.06, h: 1.5, d: 0.06 },
        // Sail
        { type: 'box', color: [0.95, 0.95, 0.95, 1], x: 0.3, y: 0.5, z: -3, w: 0.5, h: 0.8, d: 0.03 },
        // Distant island
        { type: 'box', color: [0.27, 0.4, 0.27, 1], x: 5, y: -0.2, z: -18, w: 4, h: 1.5, d: 2 },
        // Clouds
        { type: 'box', color: [0.95, 0.95, 0.98, 1], x: -5, y: 8, z: -10, w: 2, h: 0.5, d: 1 },
        { type: 'box', color: [0.95, 0.95, 0.98, 1], x: 6, y: 9, z: -15, w: 1.5, h: 0.4, d: 0.8 },
        // Dirt path south
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -1, z: 0, w: 2, d: 6, y: 0.01 },
      ],
      npcs: [
        { color: [0.87, 0.87, 0.93, 1], x: 3.5, y: 0, z: 1, w: 0.4, h: 1.5, d: 0.3, name: 'Old Barnaby' },
      ]
    },

    beach: {
      skyColor: [0.2, 0.47, 0.73, 1],
      floor: { color: [0.91, 0.85, 0.63, 1], x: -8, z: -2, w: 16, d: 12, y: 0 },
      walls: [],
      objects: [
        // Ocean
        { type: 'floor', color: [0.13, 0.27, 0.67, 1], x: -15, z: -20, w: 30, d: 18, y: -0.15 },
        // Surf line
        { type: 'floor', color: [0.9, 0.95, 1.0, 1], x: -15, z: -2.2, w: 30, d: 0.3, y: 0.01 },
        // Palm tree trunks
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: -4, y: 0, z: 2, w: 0.15, h: 3, d: 0.15 },
        { type: 'box', color: [0.27, 0.55, 0.27, 1], x: -4, y: 2.7, z: 2, w: 1.2, h: 0.4, d: 1.2 }, // fronds
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 5, y: 0, z: 0, w: 0.15, h: 2.5, d: 0.15 },
        { type: 'box', color: [0.27, 0.55, 0.27, 1], x: 5, y: 2.2, z: 0, w: 1.0, h: 0.35, d: 1.0 },
        // Driftwood
        { type: 'box', color: [0.67, 0.47, 0.27, 1], x: 1.5, y: 0, z: 3, w: 0.6, h: 0.08, d: 0.12 },
        // Shells
        { type: 'box', color: [0.95, 0.6, 0.7, 1], x: -1.5, y: 0, z: 4, w: 0.1, h: 0.06, d: 0.1 },
        // Beached boat
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: -6, y: 0, z: -1, w: 1.0, h: 0.35, d: 0.5 },
        // Forest treeline (north, as a wall of green)
        { type: 'box', color: [0.13, 0.3, 0.13, 1], x: -8, y: 0, z: -1.5, w: 16, h: 3, d: 0.5 },
      ],
      npcs: []
    },

    forestPath: {
      skyColor: [0.13, 0.27, 0.13, 1],
      floor: { color: [0.13, 0.27, 0.13, 1], x: -6, z: -6, w: 12, d: 12, y: 0 },
      walls: [],
      objects: [
        // Dirt path (center, N-S)
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -0.8, z: -6, w: 1.6, d: 12, y: 0.01 },
        // Path east
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: 0, z: -1, w: 6, d: 1.5, y: 0.01 },
        // Path west
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -6, z: -1, w: 6, d: 1.5, y: 0.01 },
        // Pine trees
        { type: 'box', color: [0.18, 0.35, 0.18, 1], x: -3, y: 0, z: -3, w: 0.8, h: 3.5, d: 0.8 },
        { type: 'box', color: [0.13, 0.25, 0.13, 1], x: -4.5, y: 0, z: 1, w: 0.7, h: 3.0, d: 0.7 },
        { type: 'box', color: [0.18, 0.35, 0.18, 1], x: 3, y: 0, z: -4, w: 0.9, h: 4.0, d: 0.9 },
        { type: 'box', color: [0.13, 0.25, 0.13, 1], x: 4.5, y: 0, z: 2, w: 0.6, h: 2.8, d: 0.6 },
        { type: 'box', color: [0.2, 0.4, 0.2, 1], x: -2, y: 0, z: 4, w: 1.0, h: 3.2, d: 1.0 },
        { type: 'box', color: [0.2, 0.4, 0.2, 1], x: 3.5, y: 0, z: 4.5, w: 0.8, h: 2.5, d: 0.8 },
        // Red mushrooms
        { type: 'box', color: [0.8, 0.15, 0.15, 1], x: -2.5, y: 0, z: 1.5, w: 0.2, h: 0.2, d: 0.2 },
        { type: 'box', color: [0.65, 0.2, 0.0, 1], x: -2.2, y: 0, z: 1.8, w: 0.12, h: 0.15, d: 0.12 },
        // Purple mushroom (item)
        { type: 'box', color: [0.53, 0.33, 0.87, 1], x: 3.0, y: 0, z: 0.5, w: 0.2, h: 0.25, d: 0.2 },
        // Rune stone
        { type: 'box', color: [0.6, 0.6, 0.67, 1], x: 1.5, y: 0, z: -2, w: 0.4, h: 0.35, d: 0.3 },
        // Sparkles (bright spots)
        { type: 'box', color: [0.33, 1.0, 0.33, 1], x: -1, y: 0.5, z: -2, w: 0.05, h: 0.05, d: 0.05 },
        { type: 'box', color: [0.33, 1.0, 0.33, 1], x: 2, y: 0.6, z: 1, w: 0.05, h: 0.05, d: 0.05 },
      ],
      npcs: []
    },

    trollBridge: {
      skyColor: [0.2, 0.27, 0.3, 1],
      floor: { color: [0.13, 0.27, 0.13, 1], x: -6, z: -6, w: 5, d: 12, y: 0 },
      walls: [],
      objects: [
        // Far side ground
        { type: 'floor', color: [0.13, 0.27, 0.13, 1], x: 3, z: -6, w: 5, d: 12, y: 0 },
        // Chasm (dark void)
        { type: 'floor', color: [0.02, 0.02, 0.05, 1], x: -1, z: -6, w: 4, d: 12, y: -2 },
        // Bridge
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -1, z: -1, w: 4, d: 2, y: 0.1 },
        // Bridge railings
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: -1, y: 0.1, z: -1, w: 0.06, h: 0.8, d: 2 },
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: 3, y: 0.1, z: -1, w: 0.06, h: 0.8, d: 2 },
        // Bridge supports
        { type: 'box', color: [0.4, 0.4, 0.47, 1], x: -1, y: -2, z: -0.5, w: 0.4, h: 2.2, d: 0.4 },
        { type: 'box', color: [0.4, 0.4, 0.47, 1], x: 3, y: -2, z: -0.5, w: 0.4, h: 2.2, d: 0.4 },
        // Trees near side
        { type: 'box', color: [0.18, 0.35, 0.18, 1], x: -4, y: 0, z: 1, w: 0.8, h: 3, d: 0.8 },
        // Trees far side
        { type: 'box', color: [0.18, 0.35, 0.18, 1], x: 5, y: 0, z: -3, w: 0.8, h: 3, d: 0.8 },
        { type: 'box', color: [0.13, 0.25, 0.13, 1], x: 6, y: 0, z: 0, w: 0.7, h: 2.5, d: 0.7 },
        // Mist
        { type: 'box', color: [0.75, 0.75, 0.85, 0.3], x: 1, y: -0.5, z: -0.5, w: 4, h: 0.3, d: 2 },
      ],
      npcs: [
        { color: [0.2, 0.6, 0.2, 1], x: 1, y: 0.1, z: 0, w: 0.7, h: 1.8, d: 0.5, name: 'Greta the Troll' },
      ]
    },

    mushroomGlade: {
      skyColor: [0.13, 0.07, 0.27, 1],
      floor: { color: [0.2, 0.4, 0.27, 1], x: -6, z: -6, w: 12, d: 12, y: 0 },
      walls: [],
      objects: [
        // Giant mushrooms
        { type: 'box', color: [0.47, 0.13, 0.47, 1], x: -3, y: 1.5, z: -2, w: 1.5, h: 0.4, d: 1.5 }, // cap
        { type: 'box', color: [0.9, 0.87, 0.8, 1], x: -3, y: 0, z: -2, w: 0.3, h: 1.5, d: 0.3 },     // stem
        { type: 'box', color: [0.67, 0.2, 0.8, 1], x: 3.5, y: 1.2, z: -1, w: 1.2, h: 0.35, d: 1.2 },
        { type: 'box', color: [0.9, 0.87, 0.8, 1], x: 3.5, y: 0, z: -1, w: 0.25, h: 1.2, d: 0.25 },
        { type: 'box', color: [0.87, 0.33, 0.73, 1], x: 0, y: 1.0, z: -3.5, w: 0.9, h: 0.3, d: 0.9 },
        { type: 'box', color: [0.9, 0.87, 0.8, 1], x: 0, y: 0, z: -3.5, w: 0.2, h: 1.0, d: 0.2 },
        // Fairy ring (circle of small white mushrooms)
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 1.5, y: 0, z: 2, w: 0.1, h: 0.12, d: 0.1 },
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 2.3, y: 0, z: 2.5, w: 0.1, h: 0.12, d: 0.1 },
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 2.5, y: 0, z: 3.3, w: 0.1, h: 0.12, d: 0.1 },
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 2.0, y: 0, z: 3.8, w: 0.1, h: 0.12, d: 0.1 },
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 1.2, y: 0, z: 3.5, w: 0.1, h: 0.12, d: 0.1 },
        { type: 'box', color: [0.95, 0.95, 0.8, 1], x: 0.9, y: 0, z: 2.7, w: 0.1, h: 0.12, d: 0.1 },
        // Sparkling pond (left, purple water)
        { type: 'floor', color: [0.4, 0.27, 0.67, 1], x: -4, z: 2, w: 2, d: 1.5, y: 0.01 },
        // Magical sparkles
        { type: 'box', color: [0.87, 0.53, 1.0, 1], x: -1, y: 1, z: -0.5, w: 0.04, h: 0.04, d: 0.04 },
        { type: 'box', color: [0.87, 0.53, 1.0, 1], x: 2, y: 0.8, z: -2, w: 0.04, h: 0.04, d: 0.04 },
        { type: 'box', color: [1.0, 1.0, 0.53, 1], x: -2, y: 1.2, z: 0, w: 0.04, h: 0.04, d: 0.04 },
        // Path east
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: 4, z: -1, w: 2, d: 2, y: 0.01 },
      ],
      npcs: [
        { color: [0.47, 0.27, 0.6, 1], x: 0, y: 0, z: 0, w: 0.5, h: 1.0, d: 0.4, name: 'Madame Mushroom' },
      ]
    },

    towerExterior: {
      skyColor: [0.2, 0.27, 0.33, 1],
      floor: { color: [0.13, 0.27, 0.13, 1], x: -6, z: -6, w: 12, d: 12, y: 0 },
      walls: [],
      objects: [
        // Tower (large stone column)
        { type: 'box', color: [0.4, 0.4, 0.47, 1], x: 0, y: 0, z: -4, w: 2.0, h: 8.0, d: 2.0 },
        // Tower roof (purple)
        { type: 'box', color: [0.27, 0.13, 0.33, 1], x: 0, y: 8, z: -4, w: 2.5, h: 2.0, d: 2.5 },
        // Tower door
        { type: 'wall', color: [0.3, 0.18, 0.08, 1], x: 0, y: 0, z: -3, w: 0.7, h: 1.8, facing: 'south' },
        // Tower windows
        { type: 'wall', color: [0.2, 0.35, 0.55, 1], x: 0, y: 3, z: -2.98, w: 0.4, h: 0.6, facing: 'south' },
        { type: 'wall', color: [0.2, 0.35, 0.55, 1], x: 0, y: 5, z: -2.98, w: 0.4, h: 0.6, facing: 'south' },
        // Dirt path
        { type: 'floor', color: [0.48, 0.3, 0.13, 1], x: -6, z: -1, w: 12, d: 2, y: 0.01 },
        // Trees
        { type: 'box', color: [0.18, 0.35, 0.18, 1], x: -4, y: 0, z: 2, w: 0.7, h: 2.5, d: 0.7 },
        { type: 'box', color: [0.13, 0.25, 0.13, 1], x: 4.5, y: 0, z: -2, w: 0.6, h: 2.0, d: 0.6 },
        { type: 'box', color: [0.2, 0.4, 0.2, 1], x: 5, y: 0, z: 3, w: 0.9, h: 3.0, d: 0.9 },
        // Garden gnome
        { type: 'box', color: [0.8, 0.15, 0.15, 1], x: -2, y: 0, z: -2, w: 0.15, h: 0.35, d: 0.15 },
        // Crooked sign
        { type: 'box', color: [0.67, 0.47, 0.27, 1], x: 3, y: 0, z: 0, w: 0.05, h: 0.8, d: 0.05 },
        { type: 'box', color: [0.67, 0.47, 0.27, 1], x: 3, y: 0.6, z: 0, w: 0.6, h: 0.3, d: 0.05 },
        // Magical sparkles around tower
        { type: 'box', color: [0.53, 0.4, 1.0, 1], x: 1.2, y: 4, z: -4, w: 0.05, h: 0.05, d: 0.05 },
        { type: 'box', color: [0.53, 0.4, 1.0, 1], x: -1.2, y: 5, z: -4, w: 0.05, h: 0.05, d: 0.05 },
        { type: 'box', color: [0.53, 0.4, 1.0, 1], x: 0, y: 6, z: -3.5, w: 0.05, h: 0.05, d: 0.05 },
      ],
      npcs: [
        { color: [0.73, 0.73, 0.73, 1], x: 0, y: 0, z: -2, w: 0.7, h: 1.6, d: 0.5, name: 'Sir Cumference' },
      ]
    },

    towerInterior: {
      skyColor: [0.04, 0.04, 0.08, 1],
      floor: { color: [0.38, 0.38, 0.47, 1], x: -4, z: -4, w: 8, d: 8, y: 0 },
      floorTiles: true,
      walls: [
        { color: [0.35, 0.35, 0.42, 1], x: -4, y: 0, z: -4, w: 8, h: 4, facing: 'south' },
        { color: [0.3, 0.3, 0.38, 1], x: -4, y: 0, z: -4, w: 8, h: 4, facing: 'east' },
        { color: [0.3, 0.3, 0.38, 1], x: 4, y: 0, z: -4, w: 8, h: 4, facing: 'west' },
      ],
      objects: [
        // Purple magical glow (floor)
        { type: 'floor', color: [0.17, 0.17, 0.4, 0.5], x: -3, z: -3, w: 6, d: 6, y: 0.005 },
        // Bookshelves (left wall)
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: -3.8, y: 0, z: -2, w: 0.3, h: 2.5, d: 1.5 },
        // Books on shelves (colored spines)
        { type: 'box', color: [0.7, 0.15, 0.15, 1], x: -3.6, y: 0.5, z: -2.5, w: 0.08, h: 0.3, d: 0.12 },
        { type: 'box', color: [0.15, 0.15, 0.6, 1], x: -3.6, y: 0.5, z: -2.2, w: 0.1, h: 0.25, d: 0.1 },
        { type: 'box', color: [0.15, 0.5, 0.15, 1], x: -3.6, y: 0.5, z: -1.9, w: 0.07, h: 0.28, d: 0.1 },
        // Bookshelves (right wall)
        { type: 'box', color: [0.35, 0.2, 0.08, 1], x: 3.5, y: 0, z: -2, w: 0.3, h: 2.5, d: 1.5 },
        // Crystal ball on small table
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: -2.0, y: 0, z: -1, w: 0.4, h: 0.65, d: 0.4 }, // table
        { type: 'box', color: [0.53, 0.67, 1.0, 1], x: -2.0, y: 0.7, z: -1, w: 0.25, h: 0.25, d: 0.25 }, // orb
        // Potion shelf (right)
        { type: 'box', color: [0.48, 0.3, 0.13, 1], x: 3.2, y: 0.9, z: 0, w: 0.1, h: 0.05, d: 0.8 }, // shelf
        { type: 'box', color: [1.0, 0.2, 0.2, 1], x: 3.2, y: 0.95, z: -0.3, w: 0.08, h: 0.15, d: 0.08 },
        { type: 'box', color: [0.2, 1.0, 0.2, 1], x: 3.2, y: 0.95, z: -0.1, w: 0.08, h: 0.15, d: 0.08 },
        { type: 'box', color: [0.2, 0.2, 1.0, 1], x: 3.2, y: 0.95, z: 0.1, w: 0.08, h: 0.15, d: 0.08 },
        { type: 'box', color: [1.0, 1.0, 0.2, 1], x: 3.2, y: 0.95, z: 0.3, w: 0.08, h: 0.15, d: 0.08 },
        // Telescope
        { type: 'box', color: [0.3, 0.3, 0.3, 1], x: -0.5, y: 0, z: -3.5, w: 0.08, h: 1.8, d: 0.08 },
        { type: 'box', color: [0.4, 0.4, 0.4, 1], x: -0.5, y: 1.5, z: -3.3, w: 0.12, h: 0.25, d: 0.5 },
        // Window (back wall)
        { type: 'wall', color: [0.33, 0.47, 0.67, 1], x: 0.5, y: 1.5, z: -3.98, w: 0.6, h: 0.9, facing: 'south' },
        // Door (south)
        { type: 'wall', color: [0.3, 0.18, 0.08, 1], x: 0, y: 0, z: 3.98, w: 0.8, h: 2.2, facing: 'north' },
        // Staircase down
        { type: 'box', color: [0.15, 0.15, 0.2, 1], x: -3.5, y: -0.5, z: 1, w: 0.7, h: 0.6, d: 0.5 },
        // Torches
        { type: 'box', color: [1.0, 0.8, 0.2, 1], x: -1.5, y: 2.0, z: -3.8, w: 0.08, h: 0.12, d: 0.08 },
        { type: 'box', color: [1.0, 0.8, 0.2, 1], x: 2.0, y: 2.0, z: -3.8, w: 0.08, h: 0.12, d: 0.08 },
        // Sparkles
        { type: 'box', color: [0.53, 0.4, 1.0, 1], x: -1, y: 1.8, z: -1, w: 0.04, h: 0.04, d: 0.04 },
        { type: 'box', color: [0.67, 0.53, 1.0, 1], x: 1.5, y: 2.2, z: 0, w: 0.04, h: 0.04, d: 0.04 },
      ],
      npcs: [
        { color: [0.27, 0.13, 0.33, 1], x: -1, y: 0, z: 1, w: 0.5, h: 1.7, d: 0.4, name: 'Fumblemore' },
      ]
    },

    crystalCavern: {
      skyColor: [0.02, 0.02, 0.05, 1],
      floor: { color: [0.08, 0.08, 0.15, 1], x: -6, z: -6, w: 12, d: 12, y: 0 },
      walls: [
        { color: [0.1, 0.1, 0.17, 1], x: -6, y: 0, z: -6, w: 12, h: 5, facing: 'south' },
        { color: [0.08, 0.08, 0.14, 1], x: -6, y: 0, z: -6, w: 12, h: 5, facing: 'east' },
        { color: [0.08, 0.08, 0.14, 1], x: 6, y: 0, z: -6, w: 12, h: 5, facing: 'west' },
      ],
      objects: [
        // Stalactites (ceiling hanging boxes)
        { type: 'box', color: [0.15, 0.15, 0.22, 1], x: -3, y: 3.5, z: -4, w: 0.15, h: 1.2, d: 0.15 },
        { type: 'box', color: [0.15, 0.15, 0.22, 1], x: 2, y: 3.8, z: -3, w: 0.12, h: 0.9, d: 0.12 },
        { type: 'box', color: [0.15, 0.15, 0.22, 1], x: -1, y: 4.0, z: -2, w: 0.1, h: 0.7, d: 0.1 },
        { type: 'box', color: [0.15, 0.15, 0.22, 1], x: 4, y: 3.6, z: 0, w: 0.14, h: 1.0, d: 0.14 },
        // Decorative crystals (colored glow)
        { type: 'box', color: [0.2, 0.2, 1.0, 0.7], x: -4.5, y: 0, z: -2, w: 0.3, h: 1.2, d: 0.2 },
        { type: 'box', color: [1.0, 0.2, 0.2, 0.7], x: -3, y: 0, z: -4.5, w: 0.2, h: 0.9, d: 0.15 },
        { type: 'box', color: [0.2, 1.0, 0.2, 0.7], x: 4.5, y: 0, z: -3, w: 0.25, h: 1.1, d: 0.2 },
        { type: 'box', color: [1.0, 1.0, 0.2, 0.7], x: 3.5, y: 0, z: -4.5, w: 0.18, h: 0.8, d: 0.15 },
        { type: 'box', color: [1.0, 0.2, 1.0, 0.7], x: -5, y: 0, z: 0, w: 0.15, h: 0.6, d: 0.12 },
        // Crystal shards (3, bright cyan)
        { type: 'box', color: [0.67, 0.87, 1.0, 1], x: -3.5, y: 0, z: 1, w: 0.15, h: 0.5, d: 0.1 },
        { type: 'box', color: [0.67, 0.87, 1.0, 1], x: 2.5, y: 0, z: -1, w: 0.15, h: 0.5, d: 0.1 },
        { type: 'box', color: [0.67, 0.87, 1.0, 1], x: 4, y: 0, z: 2.5, w: 0.15, h: 0.5, d: 0.1 },
        // Pedestal (center)
        { type: 'box', color: [0.6, 0.6, 0.67, 1], x: 0, y: 0, z: 0, w: 0.5, h: 1.0, d: 0.5 },
        { type: 'box', color: [0.73, 0.73, 0.8, 1], x: 0, y: 0.9, z: 0, w: 0.6, h: 0.1, d: 0.6 },
        // Underground pool (dark blue)
        { type: 'floor', color: [0.07, 0.13, 0.33, 1], x: -3, z: 2, w: 2, d: 1.5, y: 0.01 },
        // Stairs back (right side)
        { type: 'box', color: [0.15, 0.15, 0.2, 1], x: 5, y: 0, z: -2, w: 0.7, h: 0.3, d: 0.5 },
        { type: 'box', color: [0.15, 0.15, 0.2, 1], x: 5, y: 0.3, z: -2.4, w: 0.7, h: 0.3, d: 0.5 },
        // Ambient sparkles
        { type: 'box', color: [0.4, 0.4, 1.0, 1], x: -2, y: 2, z: -3, w: 0.04, h: 0.04, d: 0.04 },
        { type: 'box', color: [1.0, 0.4, 0.4, 1], x: 3, y: 1.5, z: -1, w: 0.04, h: 0.04, d: 0.04 },
        { type: 'box', color: [0.4, 1.0, 0.4, 1], x: -1, y: 2.5, z: 1, w: 0.04, h: 0.04, d: 0.04 },
      ],
      npcs: []
    },
  },

  async startVR() {
    if (!navigator.xr || !this.vrSupported) {
      alert('WebXR VR is not supported on this device/browser.');
      return;
    }

    try {
      // Start the normal game first so engine state is ready
      this.startGame(null);
      const eng = window.Engine;

      // Request immersive VR session
      const session = await navigator.xr.requestSession('immersive-vr', {
        requiredFeatures: ['local-floor']
      });
      this.vrSession = session;

      // Create WebGL canvas for VR rendering
      const vrCanvas = document.createElement('canvas');
      const gl = vrCanvas.getContext('webgl2', { xrCompatible: true }) ||
                 vrCanvas.getContext('webgl', { xrCompatible: true });

      if (!gl) {
        alert('WebGL not available for VR rendering.');
        session.end();
        return;
      }

      await gl.makeXRCompatible();

      const refSpace = await session.requestReferenceSpace('local-floor');
      const baseLayer = new XRWebGLLayer(session, gl);
      session.updateRenderState({ baseLayer });

      // VR game state
      const vrState = {
        gl,
        refSpace,
        session,
        eng,
        moveSpeed: 2.5,
        playerPos: { x: 0, y: 0, z: 0 },
        lastTime: 0,
        triggerWasPressed: false,
        buffers: {},     // geometry buffers cache
        shaderProgram: null,
        currentVRScene: null,
      };

      session.addEventListener('end', () => {
        this.vrSession = null;
      });

      session.requestAnimationFrame((t, frame) => this.vrRenderLoop(t, frame, vrState));

    } catch (err) {
      console.error('Failed to start VR:', err);
      alert('Could not start VR session: ' + err.message);
    }
  },

  vrRenderLoop(timestamp, frame, vrState) {
    const session = vrState.session;
    if (!session || session.ended) return;

    session.requestAnimationFrame((t, f) => this.vrRenderLoop(t, f, vrState));

    const { gl, refSpace, eng } = vrState;
    const dt = vrState.lastTime ? Math.min((timestamp - vrState.lastTime) / 1000, 0.05) : 0.016;
    vrState.lastTime = timestamp;

    const pose = frame.getViewerPose(refSpace);
    if (!pose) return;

    const glLayer = session.renderState.baseLayer;
    gl.bindFramebuffer(gl.FRAMEBUFFER, glLayer.framebuffer);

    // ── Controller input ──
    for (const source of session.inputSources) {
      if (!source.gamepad) continue;
      const axes = source.gamepad.axes;
      const moveX = axes[2] || 0;
      const moveZ = axes[3] || 0;

      if (Math.abs(moveX) > 0.15 || Math.abs(moveZ) > 0.15) {
        const view = pose.views[0];
        const mat = view.transform.matrix;
        const fwdX = -mat[8], fwdZ = -mat[10];
        const rightX = mat[0], rightZ = mat[2];
        const len = Math.sqrt(fwdX * fwdX + fwdZ * fwdZ) || 1;

        vrState.playerPos.x += (rightX * moveX + fwdX / len * -moveZ) * vrState.moveSpeed * dt;
        vrState.playerPos.z += (rightZ * moveX + fwdZ / len * -moveZ) * vrState.moveSpeed * dt;

        // Sync Graham's 2D position
        const mapScale = 20;
        eng.player.x = 160 + vrState.playerPos.x * mapScale;
        eng.player.y = 130 + vrState.playerPos.z * mapScale;

        if (Math.abs(fwdZ) > Math.abs(fwdX)) {
          eng.player.direction = fwdZ < 0 ? 2 : 0;
        } else {
          eng.player.direction = fwdX > 0 ? 3 : 1;
        }
      }

      // Trigger: interact (debounced)
      const triggerPressed = source.gamepad.buttons[0]?.pressed;
      if (triggerPressed && !vrState.triggerWasPressed) {
        eng.handleClick(Math.round(eng.player.x), Math.round(eng.player.y) - 15);
      }
      vrState.triggerWasPressed = triggerPressed;
    }

    // ── Determine which 3D scene to render ──
    const sceneId = eng.currentSceneId;
    const scene3D = this.vr3DScenes[sceneId];

    // ── Render each eye ──
    for (const view of pose.views) {
      const viewport = glLayer.getViewport(view);
      gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

      const sky = scene3D ? scene3D.skyColor : [0.2, 0.35, 0.55, 1];
      gl.clearColor(sky[0], sky[1], sky[2], sky[3]);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST);

      if (scene3D) {
        this.vrRender3DScene(gl, view, vrState, scene3D);
      }
    }
  },

  // ── Render a full 3D scene ──
  vrRender3DScene(gl, view, vrState, scene3D) {
    if (!vrState.shaderProgram) {
      vrState.shaderProgram = this.vrCreateShader(gl);
      if (vrState.shaderProgram) {
        // Cache uniform & attribute locations
        const prog = vrState.shaderProgram;
        vrState.shaderLocs = {
          uProj: gl.getUniformLocation(prog, 'uP'),
          uView: gl.getUniformLocation(prog, 'uV'),
          uModel: gl.getUniformLocation(prog, 'uM'),
          uColor: gl.getUniformLocation(prog, 'uC'),
          posLoc: gl.getAttribLocation(prog, 'aP'),
        };
      }
    }
    const prog = vrState.shaderProgram;
    if (!prog) return;

    gl.useProgram(prog);

    const { uProj, uView, uModel, uColor, posLoc } = vrState.shaderLocs;

    gl.uniformMatrix4fv(uProj, false, view.projectionMatrix);
    gl.uniformMatrix4fv(uView, false, view.transform.inverse.matrix);

    // Ensure we have a unit cube buffer
    if (!vrState.buffers.cube) {
      vrState.buffers.cube = this.vrCreateCube(gl);
    }
    // Ensure we have a unit quad buffer (flat on Y=0)
    if (!vrState.buffers.quad) {
      vrState.buffers.quad = this.vrCreateQuad(gl);
    }
    // Wall quad (vertical, facing south by default)
    if (!vrState.buffers.wallQuad) {
      vrState.buffers.wallQuad = this.vrCreateWallQuad(gl);
    }

    gl.enableVertexAttribArray(posLoc);

    // Player offset
    const px = vrState.playerPos.x;
    const pz = vrState.playerPos.z;

    // ── Draw floor ──
    const fl = scene3D.floor;
    if (fl) {
      gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.quad.buf);
      gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
      const m = this.vrMat4Translate(fl.x + fl.w / 2 - px, fl.y, fl.z + fl.d / 2 - pz);
      this.vrMat4Scale(m, fl.w, 1, fl.d);
      gl.uniformMatrix4fv(uModel, false, m);
      gl.uniform4fv(uColor, fl.color);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      // Tile overlay for indoor scenes
      if (scene3D.floorTiles) {
        // Draw grid lines as thin strips
        const tileSize = 1.0;
        gl.uniform4fv(uColor, [fl.color[0] * 0.8, fl.color[1] * 0.8, fl.color[2] * 0.8, 1]);
        for (let tx = fl.x; tx <= fl.x + fl.w; tx += tileSize) {
          const m2 = this.vrMat4Translate(tx + 0.02 - px, fl.y + 0.005, fl.z + fl.d / 2 - pz);
          this.vrMat4Scale(m2, 0.04, 1, fl.d);
          gl.uniformMatrix4fv(uModel, false, m2);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        for (let tz = fl.z; tz <= fl.z + fl.d; tz += tileSize) {
          const m2 = this.vrMat4Translate(fl.x + fl.w / 2 - px, fl.y + 0.005, tz + 0.02 - pz);
          this.vrMat4Scale(m2, fl.w, 1, 0.04);
          gl.uniformMatrix4fv(uModel, false, m2);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
      }
    }

    // ── Draw walls ──
    gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.wallQuad.buf);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    for (const wall of (scene3D.walls || [])) {
      gl.uniform4fv(uColor, wall.color);
      const m = this.vrMakeWallMatrix(wall, px, pz);
      gl.uniformMatrix4fv(uModel, false, m);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    // ── Draw objects ──
    for (const obj of (scene3D.objects || [])) {
      gl.uniform4fv(uColor, obj.color);

      if (obj.type === 'floor') {
        gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.quad.buf);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        const m = this.vrMat4Translate(obj.x + obj.w / 2 - px, obj.y, obj.z + obj.d / 2 - pz);
        this.vrMat4Scale(m, obj.w, 1, obj.d);
        gl.uniformMatrix4fv(uModel, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      } else if (obj.type === 'box') {
        gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.cube.buf);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        const m = this.vrMat4Translate(obj.x - px, obj.y + obj.h / 2, obj.z - pz);
        this.vrMat4Scale(m, obj.w, obj.h, obj.d);
        gl.uniformMatrix4fv(uModel, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 36);
      } else if (obj.type === 'wall') {
        gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.wallQuad.buf);
        gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
        const m = this.vrMakeWallMatrix(obj, px, pz);
        gl.uniformMatrix4fv(uModel, false, m);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      }
    }

    // ── Draw NPCs as colored boxes ──
    gl.bindBuffer(gl.ARRAY_BUFFER, vrState.buffers.cube.buf);
    gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);

    for (const npc of (scene3D.npcs || [])) {
      gl.uniform4fv(uColor, npc.color);
      const m = this.vrMat4Translate(npc.x - px, npc.y + npc.h / 2, npc.z - pz);
      this.vrMat4Scale(m, npc.w, npc.h, npc.d);
      gl.uniformMatrix4fv(uModel, false, m);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    gl.disableVertexAttribArray(posLoc);
  },

  // ── Shader (minimal, color-only) ──
  vrCreateShader(gl) {
    const vs = `
      attribute vec3 aP;
      uniform mat4 uP, uV, uM;
      void main() { gl_Position = uP * uV * uM * vec4(aP, 1.0); }
    `;
    const fs = `
      precision mediump float;
      uniform vec4 uC;
      void main() { gl_FragColor = uC; }
    `;
    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.error(gl.getShaderInfoLog(s)); return null; }
      return s;
    };
    const vShader = compile(gl.VERTEX_SHADER, vs);
    const fShader = compile(gl.FRAGMENT_SHADER, fs);
    if (!vShader || !fShader) return null;
    const prog = gl.createProgram();
    gl.attachShader(prog, vShader);
    gl.attachShader(prog, fShader);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { console.error(gl.getProgramInfoLog(prog)); return null; }
    return prog;
  },

  // ── Geometry: unit cube centered at origin ──
  vrCreateCube(gl) {
    const s = 0.5;
    // 6 faces × 2 triangles × 3 vertices = 36 vertices
    const v = new Float32Array([
      // Front (+Z)
      -s,-s, s,  s,-s, s,  s, s, s,  -s,-s, s,  s, s, s, -s, s, s,
      // Back (-Z)
      s,-s,-s, -s,-s,-s, -s, s,-s,   s,-s,-s, -s, s,-s,  s, s,-s,
      // Left (-X)
      -s,-s,-s, -s,-s, s, -s, s, s,  -s,-s,-s, -s, s, s, -s, s,-s,
      // Right (+X)
      s,-s, s,  s,-s,-s,  s, s,-s,   s,-s, s,  s, s,-s,  s, s, s,
      // Top (+Y)
      -s, s, s,  s, s, s,  s, s,-s,  -s, s, s,  s, s,-s, -s, s,-s,
      // Bottom (-Y)
      -s,-s,-s,  s,-s,-s,  s,-s, s,  -s,-s,-s,  s,-s, s, -s,-s, s,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    return { buf, count: 36 };
  },

  // ── Geometry: flat quad on XZ plane (y=0), unit size ──
  vrCreateQuad(gl) {
    const s = 0.5;
    const v = new Float32Array([
      -s, 0, -s,   s, 0, -s,   s, 0, s,
      -s, 0, -s,   s, 0, s,   -s, 0, s,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    return { buf, count: 6 };
  },

  // ── Geometry: vertical quad facing south (on XY plane, z=0) ──
  vrCreateWallQuad(gl) {
    const s = 0.5;
    const v = new Float32Array([
      -s, 0, 0,   s, 0, 0,   s, 1, 0,
      -s, 0, 0,   s, 1, 0,  -s, 1, 0,
    ]);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, v, gl.STATIC_DRAW);
    return { buf, count: 6 };
  },

  // ── Matrix helpers ──
  vrMat4Translate(x, y, z) {
    return new Float32Array([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      x, y, z, 1
    ]);
  },

  vrMat4Scale(m, sx, sy, sz) {
    m[0] *= sx; m[1] *= sx; m[2] *= sx;
    m[4] *= sy; m[5] *= sy; m[6] *= sy;
    m[8] *= sz; m[9] *= sz; m[10] *= sz;
  },

  // Build a model matrix for a wall quad given facing direction
  vrMakeWallMatrix(wall, px, pz) {
    const f = wall.facing || 'south';
    let m;
    switch (f) {
      case 'south': // faces toward +Z, placed at wall.z
        m = this.vrMat4Translate(wall.x + (wall.w || 0) / 2 - px, wall.y || 0, wall.z - pz);
        this.vrMat4Scale(m, wall.w || 1, wall.h || 1, 1);
        break;
      case 'north': // faces toward -Z
        m = this.vrMat4Translate(wall.x + (wall.w || 0) / 2 - px, wall.y || 0, wall.z - pz);
        this.vrMat4Scale(m, -(wall.w || 1), wall.h || 1, 1);
        break;
      case 'east': { // faces toward +X, rotate 90°
        const w = wall.w || 1, h = wall.h || 1;
        m = new Float32Array([
          0, 0, -w, 0,
          0, h, 0, 0,
          1, 0, 0, 0,
          wall.x - px, wall.y || 0, wall.z + w / 2 - pz, 1
        ]);
        break;
      }
      case 'west': // faces toward -X
        m = new Float32Array([
          0, 0, wall.w || 1, 0,
          0, wall.h || 1, 0, 0,
          -1, 0, 0, 0,
          wall.x - px, wall.y || 0, wall.z + (wall.w || 0) / 2 - pz, 1
        ]);
        break;
      default:
        m = this.vrMat4Translate(wall.x - px, wall.y || 0, wall.z - pz);
        this.vrMat4Scale(m, wall.w || 1, wall.h || 1, 1);
    }
    return m;
  },
};

window.App = App;

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
