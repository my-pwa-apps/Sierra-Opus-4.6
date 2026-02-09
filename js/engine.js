/* ============================================
   Sierra Tribute Collection
   Game Engine - Core game loop, input, state
   ============================================ */

class GameEngine {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.VW = 320;
    this.VH = 170;

    // Player state
    this.player = {
      x: 160, y: 130,
      targetX: 160, targetY: 130,
      direction: 0,  // 0=south, 1=west, 2=north, 3=east
      frame: 0, frameTimer: 0,
      walking: false,
      visible: true,
      speed: 55,
      exitTarget: null,
      pendingAction: null,
      actionAnim: null
    };

    // Game state
    this.inventory = [];
    this.flags = {};
    this.score = 0;
    this.maxScore = 145;
    this.currentVerb = 'walk';
    this.selectedItem = null;
    this.currentSceneId = null;
    this.currentScene = null;
    this.scenes = {};

    // UI state
    this.currentMessage = '';
    this.messageTimer = 0;
    this.messageCallback = null;
    this.dialogActive = false;
    this.isDead = false;
    this.hasWon = false;
    this.paused = false;
    this.cutsceneActive = false;
    this.cutsceneSteps = [];

    // Animation
    this.lastTime = 0;
    this.waterPhase = 0;
    this.sparklePhase = 0;
    this._rafId = null;

    // Game configuration (set per-game)
    this.gameConfig = null;

    // Audio
    this.audioCtx = null;

    // Scene transition fade
    this._fadeAlpha = 0;
    this._fadeDir = 0; // 0=none, 1=fading out, -1=fading in
    this._fadeCallback = null;

    // Cached DOM refs
    this._dom = {};
  }

  init(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = this.VW;
    this.canvas.height = this.VH;
    this.ctx.imageSmoothingEnabled = false;

    // Cache DOM element references
    this._dom = {
      messageText: document.getElementById('message-text'),
      sceneName: document.getElementById('scene-name'),
      scoreDisplay: document.getElementById('score-display'),
      inventoryPanel: document.getElementById('inventory-panel'),
      inventoryGrid: document.getElementById('inventory-grid'),
      dialogPanel: document.getElementById('dialog-panel'),
      dialogSpeaker: document.getElementById('dialog-speaker'),
      dialogText: document.getElementById('dialog-text'),
      dialogChoices: document.getElementById('dialog-choices'),
      gameMenu: document.getElementById('game-menu'),
      saveLoadPanel: document.getElementById('save-load-panel'),
      saveLoadTitle: document.getElementById('save-load-title'),
      saveSlots: document.getElementById('save-slots'),
      deathScreen: document.getElementById('death-screen'),
      deathMessage: document.getElementById('death-message'),
      victoryScreen: document.getElementById('victory-screen'),
      victoryMessage: document.getElementById('victory-message'),
      victoryScore: document.getElementById('victory-score'),
    };

    this.setupInput();
    this.setupUI();

    // Create AudioContext lazily on first user interaction
    if (!this.audioCtx) {
      const initAudio = () => {
        try {
          this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch(e) { /* audio not available */ }
      };
      document.addEventListener('click', initAudio, { once: true });
      document.addEventListener('touchend', initAudio, { once: true });
    }
  }

  // ── Input ──
  setupInput() {
    const getVirtual = (e) => {
      const r = this.canvas.getBoundingClientRect();
      const cx = e.touches ? e.touches[0].clientX : e.clientX;
      const cy = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: Math.floor((cx - r.left) * (this.VW / r.width)),
        y: Math.floor((cy - r.top) * (this.VH / r.height))
      };
    };

    const processClick = (x, y) => {
      if (this.isDead || this.hasWon || this.paused) return;

      // Dismiss message on click
      if (this.currentMessage && this.messageTimer > 500) {
        const hadCallback = !!this.messageCallback;
        this.currentMessage = '';
        this.messageTimer = 0;
        clearTimeout(this._msgTimeout);
        if (this.messageCallback) { const cb = this.messageCallback; this.messageCallback = null; cb(); }
        this.updateMessageBar();
        // If the message had a callback, it was important — consume the click
        if (hadCallback) return;
        // Otherwise let the click pass through to game interaction
      }
      if (this.dialogActive) return;
      if (this.cutsceneActive) return;

      this.handleClick(x, y);
    };

    // Mouse click  
    this.canvas.addEventListener('click', (e) => {
      const p = getVirtual(e);
      processClick(p.x, p.y);
    });

    // Touch support - prevent double-fire from click
    let touchHandled = false;
    this.canvas.addEventListener('touchstart', (e) => {
      e.preventDefault(); // Prevent scroll/zoom
      touchHandled = true;
      const r = this.canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = Math.floor((touch.clientX - r.left) * (this.VW / r.width));
      const y = Math.floor((touch.clientY - r.top) * (this.VH / r.height));
      processClick(x, y);
    }, { passive: false });

    this.canvas.addEventListener('click', (e) => {
      if (touchHandled) { touchHandled = false; e.stopImmediatePropagation(); }
    }, true);

    // ── Keyboard Support ──
    document.addEventListener('keydown', (e) => {
      if (this.isDead || this.hasWon) return;

      // Dismiss message on Space/Enter
      if (this.currentMessage && (e.key === ' ' || e.key === 'Enter')) {
        e.preventDefault();
        if (this.messageTimer > 300) {
          this.currentMessage = '';
          this.messageTimer = 0;
          clearTimeout(this._msgTimeout);
          if (this.messageCallback) { const cb = this.messageCallback; this.messageCallback = null; cb(); }
          this.updateMessageBar();
        }
        return;
      }

      // Verb shortcuts
      const verbKeys = { 'w': 'walk', '1': 'walk', 'l': 'look', '2': 'look', 't': 'take', '3': 'take', 'u': 'use', '4': 'use', 'k': 'talk', '5': 'talk' };
      if (verbKeys[e.key]) {
        this.currentVerb = verbKeys[e.key];
        this.selectedItem = null;
        document.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`[data-verb="${verbKeys[e.key]}"]`);
        if (btn) btn.classList.add('active');
        this.updateCursor();
        return;
      }

      // Inventory toggle
      if (e.key === 'i' || e.key === '6') {
        this.toggleInventory();
        return;
      }

      // Menu
      if (e.key === 'Escape') {
        if (!this._dom.gameMenu.classList.contains('hidden')) {
          this.hideOverlay('game-menu');
        } else if (!this._dom.inventoryPanel.classList.contains('hidden')) {
          this._dom.inventoryPanel.classList.add('hidden');
        } else if (!this._dom.saveLoadPanel.classList.contains('hidden')) {
          this.hideOverlay('save-load-panel');
        } else {
          this.toggleMenu();
        }
        return;
      }

      // Arrow key movement
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (this.dialogActive || this.cutsceneActive) return;
        const step = 20;
        let tx = this.player.x, ty = this.player.y;
        if (e.key === 'ArrowUp') ty -= step;
        if (e.key === 'ArrowDown') ty += step;
        if (e.key === 'ArrowLeft') tx -= step;
        if (e.key === 'ArrowRight') tx += step;
        const wp = this.clampToWalkable(tx, ty);
        this.player.targetX = wp.x;
        this.player.targetY = wp.y;
        this.player.walking = true;
        this.player.exitTarget = null;
        this.player.hsTarget = null;

        // Check if walking into an exit
        if (this.currentScene && this.currentScene.exits) {
          for (const ex of this.currentScene.exits) {
            if (ex.condition && !ex.condition(this)) continue;
            if (wp.x >= ex.x && wp.x <= ex.x + ex.w && wp.y >= ex.y && wp.y <= ex.y + ex.h) {
              const wx = ex.walkX !== undefined ? ex.walkX : ex.x + ex.w / 2;
              const wy = ex.walkY !== undefined ? ex.walkY : ex.y + ex.h / 2;
              this.player.targetX = wx;
              this.player.targetY = wy;
              this.player.exitTarget = ex;
              break;
            }
          }
        }
      }
    });
  }

  setupUI() {
    // Verb buttons
    document.querySelectorAll('.verb-btn[data-verb]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentVerb = btn.dataset.verb;
        this.selectedItem = null;
        document.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateCursor();
      });
    });

    // Inventory toggle
    document.getElementById('btn-inv').addEventListener('click', () => {
      this.toggleInventory();
    });

    // Inventory close
    document.getElementById('btn-close-inv').addEventListener('click', () => {
      this._dom.inventoryPanel.classList.add('hidden');
    });

    // Menu
    document.getElementById('btn-menu').addEventListener('click', () => this.toggleMenu());
    document.getElementById('btn-close-menu').addEventListener('click', () => this.toggleMenu());
    document.getElementById('btn-save').addEventListener('click', () => this.showSaveLoad('save'));
    document.getElementById('btn-load').addEventListener('click', () => this.showSaveLoad('load'));
    document.getElementById('btn-restart').addEventListener('click', () => { this.hideAllOverlays(); this.startNewGame(); });
    document.getElementById('btn-quit').addEventListener('click', () => { this.hideAllOverlays(); this.stop(); window.App.showTitle(); });
    document.getElementById('btn-cancel-save').addEventListener('click', () => this.hideOverlay('save-load-panel'));

    // Death
    document.getElementById('btn-restore').addEventListener('click', () => {
      this.hideOverlay('death-screen');
      this.isDead = false;
      const saveData = window.AccountManager.getLastSave();
      if (saveData) { this.loadSaveData(saveData); }
      else { this.startNewGame(); }
    });
    document.getElementById('btn-restart-death').addEventListener('click', () => {
      this.hideOverlay('death-screen');
      this.isDead = false;
      this.startNewGame();
    });

    // Victory
    document.getElementById('btn-play-again').addEventListener('click', () => {
      this.hideOverlay('victory-screen');
      this.hasWon = false;
      this.stop();
      window.App.showTitle();
    });
  }

  updateCursor() {
    const cursors = { walk: 'crosshair', look: 'help', take: 'grab', use: 'pointer', talk: 'cell' };
    this.canvas.style.cursor = cursors[this.currentVerb] || 'crosshair';
  }

  // ── Click Handling ──
  handleClick(x, y) {
    const scene = this.currentScene;
    if (!scene) return;
    if (this.player.actionAnim) return; // Action animation playing

    // Cancel any pending action from previous click
    this.player.pendingAction = null;

    // Check NPCs
    if (scene.npcs) {
      for (const npc of scene.npcs) {
        if (npc.hidden) continue;
        const nw = npc.w || 24;
        const nh = npc.h || 32;
        if (x >= npc.x - nw/2 && x <= npc.x + nw/2 && y >= npc.y - nh && y <= npc.y) {
          if (this.currentVerb === 'walk') {
            // Walk toward NPC
            const wp = this.clampToWalkable(npc.x, npc.y);
            this.player.targetX = wp.x;
            this.player.targetY = wp.y;
            this.player.walking = true;
            this.player.exitTarget = null;
            this.player.hsTarget = null;
          } else {
            const npcDist = Math.sqrt((this.player.x - npc.x)**2 + (this.player.y - npc.y)**2);
            if (this.currentVerb !== 'look' && npcDist > 35) {
              // Walk to NPC first, then interact
              const wp = this.clampToWalkable(npc.x, npc.y);
              this.player.targetX = wp.x;
              this.player.targetY = wp.y;
              this.player.walking = true;
              this.player.exitTarget = null;
              this.player.hsTarget = null;
              this.player.pendingAction = { type: 'npc', target: npc, verb: this.currentVerb, itemId: this.selectedItem };
            } else {
              this.startActionAnim(this.currentVerb, npc.x, npc.y - (npc.h || 32) / 2, () => {
                this.interactNPC(npc);
              });
            }
          }
          return;
        }
      }
    }

    // Check hotspots
    if (scene.hotspots) {
      for (const hs of scene.hotspots) {
        if (hs.hidden) continue;
        if (x >= hs.x && x <= hs.x + hs.w && y >= hs.y && y <= hs.y + hs.h) {
          if (this.currentVerb === 'walk') {
            if (hs.walkTarget) {
              // Walk to the target point, then trigger onArrive
              this.player.targetX = hs.walkTarget.x;
              this.player.targetY = hs.walkTarget.y;
              this.player.walking = true;
              this.player.exitTarget = null;
              this.player.hsTarget = hs;
            } else if (hs.onWalk) {
              // Death traps and other walk interactions
              hs.onWalk(this);
            } else {
              // No walk handler - just walk to the spot
              const wp = this.clampToWalkable(x, y);
              this.player.targetX = wp.x;
              this.player.targetY = wp.y;
              this.player.walking = true;
              this.player.exitTarget = null;
              this.player.hsTarget = null;
            }
          } else {
            const hsCX = hs.x + hs.w / 2;
            const hsCY = hs.y + hs.h / 2;
            const hsDist = Math.sqrt((this.player.x - hsCX)**2 + (this.player.y - hsCY)**2);
            if (this.currentVerb !== 'look' && hsDist > 35) {
              // Walk to hotspot first, then interact
              const wp = this.clampToWalkable(hsCX, hs.y + hs.h);
              this.player.targetX = wp.x;
              this.player.targetY = wp.y;
              this.player.walking = true;
              this.player.exitTarget = null;
              this.player.hsTarget = null;
              this.player.pendingAction = { type: 'hotspot', target: hs, verb: this.currentVerb, itemId: this.selectedItem };
            } else {
              this.startActionAnim(this.currentVerb, hsCX, hsCY, () => {
                this.interactHotspot(hs);
              });
            }
          }
          return;
        }
      }
    }

    // Check exits
    if (scene.exits) {
      for (const ex of scene.exits) {
        if (ex.condition && !ex.condition(this)) continue;
        if (x >= ex.x && x <= ex.x + ex.w && y >= ex.y && y <= ex.y + ex.h) {
          const wx = ex.walkX !== undefined ? ex.walkX : ex.x + ex.w / 2;
          const wy = ex.walkY !== undefined ? ex.walkY : ex.y + ex.h / 2;
          this.player.targetX = wx;
          this.player.targetY = wy;
          this.player.walking = true;
          this.player.exitTarget = ex;
          this.player.hsTarget = null;
          return;
        }
      }
    }

    // Look at scene (clicking empty space with look verb)
    if (this.currentVerb === 'look') {
      if (this.currentScene.onLookScene) {
        this.currentScene.onLookScene(this);
      } else {
        this.showMessage(`You look around the ${this.currentScene.name || 'area'}.`);
      }
      return;
    }

    // Walk to position (for walk verb or clicking empty space)
    if (this.currentVerb === 'walk') {
      const wp = this.clampToWalkable(x, y);
      this.player.targetX = wp.x;
      this.player.targetY = wp.y;
      this.player.walking = true;
      this.player.exitTarget = null;
      this.player.hsTarget = null;
    }
  }

  clampToWalkable(x, y) {
    const areas = this.currentScene.walkable;
    if (!areas || areas.length === 0) return { x, y };

    // Check if already in walkable area
    for (const a of areas) {
      if (x >= a.x && x <= a.x + a.w && y >= a.y && y <= a.y + a.h) return { x, y };
    }

    // Find closest walkable point
    let best = { x, y }, minD = Infinity;
    for (const a of areas) {
      const cx = Math.max(a.x, Math.min(x, a.x + a.w));
      const cy = Math.max(a.y, Math.min(y, a.y + a.h));
      const d = (x-cx)**2 + (y-cy)**2;
      if (d < minD) { minD = d; best = { x: cx, y: cy }; }
    }
    return best;
  }

  interactHotspot(hs) {
    const verb = this.currentVerb;
    let useItem = this.selectedItem;

    if (verb === 'use' && useItem && hs.onUseItem) {
      const result = hs.onUseItem(this, useItem);
      if (result !== false) { this.selectedItem = null; return; }
      // onUseItem returned false (unhandled item) — fall through to onUse
    }

    const handlerName = 'on' + verb.charAt(0).toUpperCase() + verb.slice(1);
    if (hs[handlerName]) {
      hs[handlerName](this);
    } else if (verb === 'use' && useItem) {
      this.playError();
      this.showMessage(`You can't use the ${this.inventory.find(i => i.id === useItem)?.name || 'item'} on the ${hs.name}.`);
      this.selectedItem = null;
    } else {
      const defaults = {
        look: `You see nothing special about the ${hs.name}.`,
        take: `You can't take the ${hs.name}.`,
        use: `You can't use that here.`,
        talk: `The ${hs.name} doesn't seem very talkative.`,
        walk: ''
      };
      if (defaults[verb]) {
        if (verb !== 'look') this.playError();
        this.showMessage(defaults[verb]);
      }
    }
  }

  // ── Action Animations ──
  startActionAnim(verb, targetX, targetY, callback) {
    const durations = { look: 0.25, take: 0.35, use: 0.4, talk: 0.3 };
    this.player.actionAnim = {
      type: verb,
      timer: 0,
      duration: durations[verb] || 0.3,
      targetX, targetY,
      callback
    };
    this.player.walking = false;
    this.player.frame = 0;
    // Face the target
    const dx = targetX - this.player.x;
    const dy = targetY - this.player.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      this.player.direction = dx > 0 ? 3 : 1;
    } else {
      this.player.direction = dy > 0 ? 0 : 2;
    }
  }

  drawActionEffect(ctx) {
    const anim = this.player.actionAnim;
    if (!anim) return;
    const px = Math.round(this.player.x);
    const py = Math.round(this.player.y);
    const t = anim.timer / anim.duration;
    const alpha = t < 0.3 ? t / 0.3 : t > 0.7 ? (1 - t) / 0.3 : 1;
    const _prevAlpha = ctx.globalAlpha;

    switch(anim.type) {
      case 'look': {
        // Small eye/search icon above head
        ctx.globalAlpha = alpha * 0.9;
        ctx.fillStyle = '#FFFF88';
        ctx.fillRect(px - 1, py - 30, 3, 3);
        ctx.fillRect(px, py - 27, 1, 2);
        ctx.globalAlpha = _prevAlpha;
        break;
      }
      case 'take': {
        // Reaching hand with sparkle
        const dir = anim.targetX >= px ? 1 : -1;
        const reach = Math.sin(t * Math.PI) * 6;
        const handX = px + dir * (4 + reach);
        const handY = py - 10 - Math.sin(t * Math.PI) * 2;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#EEBB88';
        ctx.fillRect(handX, handY, 3, 2);
        if (t > 0.4 && t < 0.8) {
          const sparkA = Math.sin((t - 0.4) / 0.4 * Math.PI);
          ctx.globalAlpha = sparkA * alpha;
          ctx.fillStyle = '#FFFF88';
          ctx.fillRect(handX + dir * 2, handY - 1, 1, 1);
          ctx.fillRect(handX + dir * 2 - 1, handY, 3, 1);
          ctx.fillRect(handX + dir * 2, handY + 1, 1, 1);
        }
        ctx.globalAlpha = _prevAlpha;
        break;
      }
      case 'use': {
        // Sparkle trail from player toward target
        const udx = anim.targetX - px;
        const udy = anim.targetY - py;
        const udist = Math.sqrt(udx*udx + udy*udy) || 1;
        const maxD = Math.min(udist, 30);
        const n = Math.min(4, Math.ceil(maxD / 8));
        for (let i = 0; i < n; i++) {
          const st = (t * 2 + i * 0.2) % 1;
          const sx = px + (udx / udist) * maxD * st;
          const sy = py - 10 + ((udy + 10) / udist) * maxD * st;
          const sa = Math.sin(st * Math.PI) * alpha;
          ctx.globalAlpha = sa;
          ctx.fillStyle = '#88DDFF';
          ctx.fillRect(Math.round(sx), Math.round(sy), 1, 1);
          ctx.fillRect(Math.round(sx) - 1, Math.round(sy), 3, 1);
          ctx.fillRect(Math.round(sx), Math.round(sy) - 1, 1, 3);
        }
        ctx.globalAlpha = _prevAlpha;
        break;
      }
      case 'talk': {
        // Speech bubble dots
        ctx.fillStyle = '#FFFFFF';
        const bx = px + 5;
        const by = py - 28;
        for (let i = 0; i < 3; i++) {
          if (t > i * 0.15) {
            const dotT = Math.min(1, (t - i * 0.15) * 3);
            const bounce = Math.sin(dotT * Math.PI) * 2;
            ctx.globalAlpha = Math.min(dotT, alpha);
            ctx.fillRect(bx + i * 3, by - bounce, 2, 2);
          }
        }
        ctx.globalAlpha = _prevAlpha;
        break;
      }
    }
  }

  interactNPC(npc) {
    const verb = this.currentVerb;
    const handlerName = 'on' + verb.charAt(0).toUpperCase() + verb.slice(1);

    if (verb === 'use' && this.selectedItem && npc.onUseItem) {
      npc.onUseItem(this, this.selectedItem);
      this.selectedItem = null;
      return;
    }

    if (npc[handlerName]) {
      npc[handlerName](this);
    } else {
      const defaults = {
        look: `You see ${npc.name}.`,
        take: `You can't pick up ${npc.name}!`,
        use: `You can't use that on ${npc.name}.`,
        talk: `${npc.name} has nothing to say right now.`,
        walk: ''
      };
      if (defaults[verb]) {
        if (verb !== 'look') this.playError();
        this.showMessage(defaults[verb]);
      }
    }
  }

  // ── Scene Management ──
  changeScene(sceneId, entryX, entryY) {
    const scene = this.scenes[sceneId];
    if (!scene) { console.error('Scene not found:', sceneId); return; }

    // If already in a scene, do a fade transition
    if (this.currentScene && this._fadeDir === 0) {
      this._fadeDir = 1; // fade out
      this._fadeCallback = () => {
        this._applySceneChange(sceneId, entryX, entryY);
        this._fadeDir = -1; // fade back in
        this._fadeCallback = null;
      };
      return;
    }

    this._applySceneChange(sceneId, entryX, entryY);
  }

  _applySceneChange(sceneId, entryX, entryY) {
    const scene = this.scenes[sceneId];

    this.currentSceneId = sceneId;
    this.currentScene = scene;
    this.player.x = entryX !== undefined ? entryX : 160;
    this.player.y = entryY !== undefined ? entryY : 140;
    this.player.targetX = this.player.x;
    this.player.targetY = this.player.y;
    this.player.walking = false;
    this.player.exitTarget = null;
    this.player.hsTarget = null;
    this.player.pendingAction = null;
    this.player.actionAnim = null;
    this.player.visible = true;

    // Update scene name
    if (this._dom.sceneName) this._dom.sceneName.textContent = scene.name || '';

    // Call scene's onEnter
    if (scene.onEnter) scene.onEnter(this);

    this.playNote(440, 0.05);
    this.playNote(550, 0.05, 0.06);
  }

  // ── Player Update ──
  updatePlayer(dt) {
    const p = this.player;
    if (!p.walking || !p.visible) return;

    const dx = p.targetX - p.x;
    const dy = p.targetY - p.y;
    const dist = Math.sqrt(dx*dx + dy*dy);

    if (dist < 2) {
      p.x = p.targetX;
      p.y = p.targetY;
      p.walking = false;
      p.frame = 0;

      // Check if we reached an exit
      if (p.exitTarget) {
        const ex = p.exitTarget;
        p.exitTarget = null;
        this.changeScene(ex.target, ex.entryX, ex.entryY);
        return;
      }

      // Check if we walked to a hotspot
      if (p.hsTarget) {
        const hs = p.hsTarget;
        p.hsTarget = null;
        if (hs.onArrive) hs.onArrive(this);
        return;
      }

      // Handle pending walk-to-then-act
      if (p.pendingAction) {
        const action = p.pendingAction;
        p.pendingAction = null;
        const target = action.target;
        let tx, ty;
        if (action.type === 'npc') {
          tx = target.x;
          ty = target.y - (target.h || 32) / 2;
        } else {
          tx = target.x + target.w / 2;
          ty = target.y + target.h / 2;
        }
        this.startActionAnim(action.verb, tx, ty, () => {
          // Restore verb/item state from when action was initiated
          this.currentVerb = action.verb;
          this.selectedItem = action.itemId;
          if (action.type === 'npc') {
            this.interactNPC(target);
          } else {
            this.interactHotspot(target);
          }
        });
        return;
      }
      return;
    }

    const mx = (dx / dist) * p.speed * dt;
    const my = (dy / dist) * p.speed * dt;
    p.x += mx;
    p.y += my;

    // Update direction
    if (Math.abs(dx) > Math.abs(dy)) {
      p.direction = dx > 0 ? 3 : 1; // east / west
    } else {
      p.direction = dy > 0 ? 0 : 2; // south / north
    }

    // Walk animation
    p.frameTimer += dt;
    if (p.frameTimer > 0.15) {
      p.frameTimer = 0;
      p.frame = (p.frame + 1) % 4;
    }
  }

  // ── Cutscene ──
  startCutscene(steps) {
    this.cutsceneActive = true;
    this.cutsceneSteps = [...steps];
    this.nextCutsceneStep();
  }

  nextCutsceneStep() {
    if (this.cutsceneSteps.length === 0) {
      this.cutsceneActive = false;
      return;
    }
    const step = this.cutsceneSteps.shift();
    if (step.message) {
      this.showMessage(step.message, step.duration || 3000, () => this.nextCutsceneStep());
    } else if (step.action) {
      step.action(this);
      if (step.delay) {
        setTimeout(() => this.nextCutsceneStep(), step.delay);
      } else {
        this.nextCutsceneStep();
      }
    } else if (step.moveTo) {
      this.player.targetX = step.moveTo.x;
      this.player.targetY = step.moveTo.y;
      this.player.walking = true;
      this.player.exitTarget = null;
      // Poll for arrival (use requestAnimationFrame for efficiency)
      const checkArrival = () => {
        if (!this.player.walking) {
          this.nextCutsceneStep();
        } else {
          requestAnimationFrame(checkArrival);
        }
      };
      requestAnimationFrame(checkArrival);
    }
  }

  // ── Inventory ──
  addItem(id, name, icon, description) {
    if (this.hasItem(id)) return;
    this.inventory.push({ id, name, icon, description });
    this.showMessage(`You picked up: ${name}`);
    this.playNote(660, 0.08);
    this.playNote(880, 0.08, 0.1);
  }

  removeItem(id) {
    this.inventory = this.inventory.filter(i => i.id !== id);
  }

  hasItem(id) {
    return this.inventory.some(i => i.id === id);
  }

  toggleInventory() {
    const panel = this._dom.inventoryPanel;
    if (panel.classList.contains('hidden')) {
      this.renderInventory();
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  }

  renderInventory() {
    const grid = this._dom.inventoryGrid;
    grid.innerHTML = '';

    if (this.inventory.length === 0) {
      grid.innerHTML = '<p style="grid-column: 1/-1; font-size:0.4rem; color:#888;">Your inventory is empty.</p>';
      return;
    }

    this.inventory.forEach(item => {
      const div = document.createElement('div');
      div.className = 'inv-item' + (this.selectedItem === item.id ? ' selected' : '');
      div.innerHTML = `<span class="inv-item-icon">${item.icon}</span><span class="inv-item-name">${item.name}</span>`;
      div.addEventListener('click', () => {
        if (this.currentVerb === 'look') {
          this.showMessage(item.description || `It's a ${item.name}.`);
        } else if (this.currentVerb === 'use') {
          this.selectedItem = item.id;
          this.showMessage(`Using: ${item.name}. Click on something to use it with.`);
          this._dom.inventoryPanel.classList.add('hidden');
        } else {
          this.selectedItem = item.id;
          this.currentVerb = 'use';
          document.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
          document.querySelector('[data-verb="use"]').classList.add('active');
          this.showMessage(`Using: ${item.name}. Click on something to use it with.`);
          this._dom.inventoryPanel.classList.add('hidden');
        }
        this.renderInventory();
      });
      grid.appendChild(div);
    });
  }

  // ── Messages ──
  showMessage(text, duration, callback) {
    this.currentMessage = text;
    this.messageTimer = 0;
    this.messageCallback = callback || null;
    this.updateMessageBar();
    if (!callback && !duration) {
      // Auto-dismiss after calculated time
      duration = Math.max(2000, text.length * 50);
    }
    if (duration) {
      clearTimeout(this._msgTimeout);
      this._msgTimeout = setTimeout(() => {
        if (this.currentMessage === text) {
          this.currentMessage = '';
          this.messageTimer = 0;
          this.updateMessageBar();
          if (this.messageCallback) {
            const cb = this.messageCallback;
            this.messageCallback = null;
            cb();
          }
        }
      }, duration);
    }
  }

  updateMessageBar() {
    const el = this._dom.messageText;
    if (el) el.textContent = this.currentMessage || '';
  }

  // ── Dialog System ──
  showDialog(speaker, text, choices, callback) {
    this.dialogActive = true;
    const panel = this._dom.dialogPanel;
    this._dom.dialogSpeaker.textContent = speaker;
    this._dom.dialogText.textContent = text;

    const choicesDiv = this._dom.dialogChoices;
    choicesDiv.innerHTML = '';

    if (choices && choices.length > 0) {
      choices.forEach((choice, i) => {
        const btn = document.createElement('button');
        btn.className = 'dialog-choice';
        // Support both string choices and {text, action} objects
        const isString = typeof choice === 'string';
        btn.textContent = isString ? choice : choice.text;
        btn.addEventListener('click', () => {
          this.dialogActive = false;
          panel.classList.add('hidden');
          if (!isString && choice.action) choice.action(this);
          if (callback) callback(i);
        });
        choicesDiv.appendChild(btn);
      });
    } else {
      // Simple OK dialog
      const btn = document.createElement('button');
      btn.className = 'dialog-choice';
      btn.textContent = '▸ Continue';
      btn.addEventListener('click', () => {
        this.dialogActive = false;
        panel.classList.add('hidden');
        if (callback) callback(0);
      });
      choicesDiv.appendChild(btn);
    }

    panel.classList.remove('hidden');
  }

  // ── Score ──
  addScore(points, reason) {
    const key = reason || ('_auto_' + points + '_' + this.score);
    if (this.flags['scored_' + key]) return;
    this.flags['scored_' + key] = true;
    this.score += points;
    this._dom.scoreDisplay.textContent = `Score: ${this.score} of ${this.maxScore}`;
    this.showMessage(`♪ +${points} points! ${reason || ''}`);
    this.playNote(523, 0.06);
    this.playNote(659, 0.06, 0.07);
    this.playNote(784, 0.06, 0.14);
  }

  // ── Flags ──
  setFlag(key, value = true) { this.flags[key] = value; }
  getFlag(key) { return this.flags[key]; }

  // ── Death ──
  die(message) {
    // Fairy blessing saves the player once (KQ-specific)
    if (this.getFlag('fairy_blessing') && this.gameConfig && this.gameConfig.id === 'kq') {
      this.setFlag('fairy_blessing', false);
      this.player.walking = false;
      this.player.pendingAction = null;
      this.player.actionAnim = null;
      this.showMessage('A warm glow surrounds you! The fairy\'s blessing intervenes, pulling you back from danger! "That was your one chance, traveler. Be more careful!"');
      this.playNote(523, 0.15);
      this.playNote(659, 0.15, 0.15);
      this.playNote(784, 0.2, 0.3);
      return;
    }
    this.isDead = true;
    this.player.walking = false;
    this.player.pendingAction = null;
    this.player.actionAnim = null;
    this._dom.deathMessage.textContent = message;
    this._dom.deathScreen.classList.remove('hidden');
    this.playNote(200, 0.2);
    this.playNote(150, 0.3, 0.25);
  }

  // ── Victory ──
  win(message) {
    this.hasWon = true;
    this.player.walking = false;
    this._dom.victoryMessage.textContent = message ||
      'King Graham has restored the Crystal of Order! The magical chaos plaguing Daventry has ended, ' +
      'and peace returns to the land. Fumblemore promises to be more careful with his spells... ' +
      'but knowing wizards, that promise probably won\'t last long.';
    this._dom.victoryScore.textContent =
      `Final Score: ${this.score} of ${this.maxScore}`;
    this._dom.victoryScreen.classList.remove('hidden');

    // Victory fanfare
    const notes = [523, 587, 659, 784, 659, 784, 1047];
    notes.forEach((n, i) => this.playNote(n, 0.12, i * 0.13));
  }

  // ── Save / Load ──
  getSaveData() {
    return {
      scene: this.currentSceneId,
      playerX: Math.round(this.player.x),
      playerY: Math.round(this.player.y),
      playerDir: this.player.direction,
      inventory: JSON.parse(JSON.stringify(this.inventory)),
      flags: JSON.parse(JSON.stringify(this.flags)),
      score: this.score,
      timestamp: Date.now()
    };
  }

  loadSaveData(data) {
    this.inventory = data.inventory || [];
    this.flags = data.flags || {};
    this.score = data.score || 0;
    this.isDead = false;
    this.hasWon = false;
    this.currentMessage = '';
    this.dialogActive = false;
    this.cutsceneActive = false;
    this.hideAllOverlays();
    if (this._dom.scoreDisplay) this._dom.scoreDisplay.textContent = `Score: ${this.score} of ${this.maxScore}`;
    this.changeScene(data.scene, data.playerX, data.playerY);
    this.player.direction = data.playerDir || 0;
    this.showMessage('Game restored.');
  }

  startNewGame() {
    this.inventory = [];
    this.flags = {};
    this.score = 0;
    this.isDead = false;
    this.hasWon = false;
    this.currentMessage = '';
    this.dialogActive = false;
    this.cutsceneActive = false;
    this.selectedItem = null;
    this.currentVerb = 'walk';
    document.querySelectorAll('.verb-btn').forEach(b => b.classList.remove('active'));
    document.querySelector('[data-verb="walk"]').classList.add('active');
    this.hideAllOverlays();

    // Reset NPC hidden states
    for (const scene of Object.values(this.scenes)) {
      if (scene.npcs) {
        for (const npc of scene.npcs) {
          if (npc._initialHidden !== undefined) {
            npc.hidden = npc._initialHidden;
          }
        }
      }
    }

    // Use game config for maxScore, start scene, and intro
    const cfg = this.gameConfig || {};
    this.maxScore = cfg.maxScore || 145;
    if (this._dom.scoreDisplay) this._dom.scoreDisplay.textContent = `Score: 0 of ${this.maxScore}`;

    this.changeScene(cfg.startScene || 'throneRoom', cfg.startX || 160, cfg.startY || 135);
    if (cfg.introMessages) {
      this.startCutscene(cfg.introMessages);
    }
  }

  // ── Overlays ──
  hideAllOverlays() {
    const panels = [
      this._dom.inventoryPanel,
      this._dom.dialogPanel,
      this._dom.gameMenu,
      this._dom.saveLoadPanel,
      this._dom.deathScreen,
      this._dom.victoryScreen,
    ];
    for (const panel of panels) {
      if (panel) panel.classList.add('hidden');
    }
  }

  hideOverlay(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('hidden');
  }

  toggleMenu() {
    this._dom.gameMenu.classList.toggle('hidden');
  }

  showSaveLoad(mode) {
    this.hideOverlay('game-menu');
    this._dom.saveLoadTitle.textContent = mode === 'save' ? 'Save Game' : 'Load Game';
    const slotsDiv = this._dom.saveSlots;
    slotsDiv.innerHTML = '';

    for (let i = 1; i <= 5; i++) {
      const saveData = window.AccountManager.getSave(i);
      const slot = document.createElement('div');
      slot.className = 'save-slot';

      if (saveData) {
        const date = new Date(saveData.timestamp);
        slot.innerHTML = `
          <div class="save-slot-info">
            <div class="save-slot-name">Slot ${i}: ${saveData.scene}</div>
            <div class="save-slot-detail">Score: ${saveData.score} | ${date.toLocaleDateString()} ${date.toLocaleTimeString()}</div>
          </div>`;
      } else {
        slot.innerHTML = `<div class="save-slot-info"><div class="save-slot-name">Slot ${i}: Empty</div></div>`;
      }

      slot.addEventListener('click', () => {
        if (mode === 'save') {
          window.AccountManager.saveGame(i, this.getSaveData());
          this.showMessage('Game saved!');
          this.hideOverlay('save-load-panel');
        } else {
          if (saveData) {
            this.loadSaveData(saveData);
            this.hideOverlay('save-load-panel');
          } else {
            this.showMessage('No save in that slot.');
          }
        }
      });

      slotsDiv.appendChild(slot);
    }

    this._dom.saveLoadPanel.classList.remove('hidden');
  }

  // ── Audio (simple retro beeps) ──
  playNote(freq, dur, delay = 0) {
    if (!this.audioCtx) return;
    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      gain.gain.value = 0.06;
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioCtx.currentTime + delay + dur);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start(this.audioCtx.currentTime + delay);
      osc.stop(this.audioCtx.currentTime + delay + dur + 0.05);
      // Clean up nodes after playback to prevent memory leaks
      osc.onended = () => {
        osc.disconnect();
        gain.disconnect();
      };
    } catch(e) { /* ignore audio errors */ }
  }

  playError() {
    this.playNote(130, 0.06);
    this.playNote(100, 0.1, 0.07);
  }

  // ── Main Game Loop ──
  start() {
    // Cancel any existing loop to prevent stacking
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - this.lastTime) / 1000, 0.05);
    this.lastTime = timestamp;

    // Update fade transition
    if (this._fadeDir !== 0) {
      this._fadeAlpha += this._fadeDir * dt * 4; // ~0.25s fade
      if (this._fadeDir === 1 && this._fadeAlpha >= 1) {
        this._fadeAlpha = 1;
        this._fadeDir = 0;
        if (this._fadeCallback) this._fadeCallback();
      } else if (this._fadeDir === -1 && this._fadeAlpha <= 0) {
        this._fadeAlpha = 0;
        this._fadeDir = 0;
      }
    }

    // Update
    if (!this.isDead && !this.hasWon && !this.paused && this._fadeDir === 0) {
      this.updatePlayer(dt);
      this.messageTimer += dt * 1000;

      // Update action animation
      if (this.player.actionAnim) {
        this.player.actionAnim.timer += dt;
        if (this.player.actionAnim.timer >= this.player.actionAnim.duration) {
          const cb = this.player.actionAnim.callback;
          this.player.actionAnim = null;
          if (cb) cb();
        }
      }

      if (this.currentScene && this.currentScene.onUpdate) {
        this.currentScene.onUpdate(this, dt);
      }
    }

    // Always update animation phases
    this.waterPhase += dt;
    this.sparklePhase += dt * 3;

    // Render
    this.render();

    this._rafId = requestAnimationFrame((t) => this.loop(t));
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.VW, this.VH);

    if (!this.currentScene) {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, this.VW, this.VH);
      return;
    }

    // Draw scene background
    if (this.currentScene.draw) {
      this.currentScene.draw(ctx, this);
    }

    // Draw NPCs (with Sierra-style depth scaling)
    if (this.currentScene.npcs) {
      for (const npc of this.currentScene.npcs) {
        if (npc.hidden) continue;
        if (npc.draw) {
          const ns = GFX.depthScale(npc.y);
          ctx.save();
          ctx.translate(npc.x, npc.y);
          ctx.scale(ns, ns);
          ctx.translate(-npc.x, -npc.y);
          npc.draw(ctx, this);
          ctx.restore();
        }
      }
    }

    // Draw player (with Sierra-style depth scaling)
    if (this.player.visible) {
      const px = Math.round(this.player.x);
      const py = Math.round(this.player.y);
      const ps = GFX.depthScale(py);
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(ps, ps);
      ctx.translate(-px, -py);
      const drawChar = (this.gameConfig && this.gameConfig.drawCharacter) || GFX.drawGraham;
      drawChar(ctx, px, py,
        this.player.direction, this.player.walking ? this.player.frame : -1,
        this.player.actionAnim);
      ctx.restore();
    }

    // Draw action animation effects
    if (this.player.actionAnim && this.player.visible) {
      this.drawActionEffect(ctx);
    }

    // Scene transition fade overlay
    if (this._fadeAlpha > 0) {
      ctx.fillStyle = `rgba(0,0,0,${this._fadeAlpha})`;
      ctx.fillRect(0, 0, this.VW, this.VH);
    }
  }
}

// Global engine instance
window.Engine = new GameEngine();
