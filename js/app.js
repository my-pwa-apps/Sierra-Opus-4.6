/* ============================================
   King's Quest: The Enchanted Isle
   App Bootstrap - Initialization & Screen Flow
   ============================================ */

const App = {
  titlePhase: 0,
  titleAnimId: null,

  init() {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    }

    // Screen transitions
    this.screens = {
      login: document.getElementById('login-screen'),
      title: document.getElementById('title-screen'),
      game: document.getElementById('game-screen'),
    };

    this.setupLogin();
    this.setupTitle();
  },

  showScreen(name) {
    Object.values(this.screens).forEach(s => { s.classList.remove('active'); });
    this.screens[name].classList.add('active');
  },

  // ── Login Screen ──
  setupLogin() {
    const msgEl = document.getElementById('login-message');

    document.getElementById('btn-login').addEventListener('click', () => {
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      const result = AccountManager.login(u, p);
      msgEl.textContent = result.msg;
      msgEl.className = 'login-msg' + (result.ok ? ' success' : '');
      if (result.ok) setTimeout(() => this.showTitle(), 800);
    });

    document.getElementById('btn-register').addEventListener('click', () => {
      const u = document.getElementById('username').value.trim();
      const p = document.getElementById('password').value;
      const result = AccountManager.register(u, p);
      msgEl.textContent = result.msg;
      msgEl.className = 'login-msg' + (result.ok ? ' success' : '');
      if (result.ok) setTimeout(() => this.showTitle(), 800);
    });

    document.getElementById('btn-guest').addEventListener('click', () => {
      AccountManager.loginAsGuest();
      this.showTitle();
    });

    // Enter key
    document.getElementById('password').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById('btn-login').click();
    });
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
      alert(
        "King's Quest: The Enchanted Isle\n" +
        "━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
        "A Sierra On-Line style adventure\n\n" +
        "Story: King Graham must travel to a mysterious\n" +
        "island to find the wizard Fumblemore, who\n" +
        "accidentally shattered the Crystal of Order,\n" +
        "sending all magic haywire!\n\n" +
        "Gameplay Tips:\n" +
        "• Use the verb buttons to interact\n" +
        "• Check your inventory often\n" +
        "• Talk to everyone (twice!)\n" +
        "• SAVE OFTEN (This is a Sierra game!)\n" +
        "• Be careful what you eat or walk into...\n\n" +
        "Score: 145 points possible\n\n" +
        "Built with ♥ in the spirit of classic Sierra adventures"
      );
    });

    document.getElementById('btn-logout').addEventListener('click', () => {
      AccountManager.logout();
      this.stopTitleAnim();
      this.showScreen('login');
    });
  },

  showTitle() {
    this.showScreen('title');
    this.startTitleAnim();

    // Update continue button state
    const btn = document.getElementById('btn-continue');
    const hasSaves = AccountManager.hasSaves();
    btn.style.opacity = hasSaves ? '1' : '0.5';
    btn.style.pointerEvents = hasSaves ? 'auto' : 'auto'; // always clickable for feedback

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

    // Size title canvas to fill screen
    const rect = this.screens.title.getBoundingClientRect();
    canvas.width = 640;
    canvas.height = 400;
    ctx.imageSmoothingEnabled = false;

    const animate = () => {
      this.titlePhase += 0.016;
      GFX.drawTitleScreen(ctx, canvas.width, canvas.height, this.titlePhase);

      // Title text overlay
      ctx.fillStyle = '#DAA520';
      ctx.font = 'bold 28px "Press Start 2P", monospace';
      ctx.textAlign = 'center';
      ctx.fillText("KING'S QUEST", canvas.width/2, canvas.height * 0.22);

      ctx.fillStyle = '#AAD';
      ctx.font = '14px "Press Start 2P", monospace';
      ctx.fillText('The Enchanted Isle', canvas.width/2, canvas.height * 0.28);

      ctx.fillStyle = '#888';
      ctx.font = '8px "Press Start 2P", monospace';
      ctx.fillText('A Sierra On-Line Adventure', canvas.width/2, canvas.height * 0.33);

      this.titleAnimId = requestAnimationFrame(animate);
    };
    animate();
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

    // Only init once - prevent re-binding event listeners
    if (!this._gameInitialized) {
      eng.init('game-canvas');
      this._gameInitialized = true;
    }

    // Register scenes
    eng.scenes = window.GameScenes;

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
  }
};

window.App = App;

// Boot
document.addEventListener('DOMContentLoaded', () => App.init());
