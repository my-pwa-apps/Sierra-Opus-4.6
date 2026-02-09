/* ============================================
   Sierra Tribute Collection
   Save Manager - Name-based save/load system
   Per-game save storage with shared identity
   ============================================ */

const AccountManager = {
  currentUser: null,
  gamePrefix: 'kq',

  setGamePrefix(prefix) {
    this.gamePrefix = prefix || 'kq';
  },

  // ── Set Player Name ──
  setName(name) {
    this.currentUser = name.trim().toLowerCase();
    localStorage.setItem('sierra_last_player', this.currentUser);
    localStorage.setItem('sierra_display_name_' + this.currentUser, name.trim());
  },

  getLastPlayer() {
    return localStorage.getItem('sierra_last_player') || localStorage.getItem('kq_last_player') || '';
  },

  _getUserKey() {
    return this.currentUser ? `${this.gamePrefix}_user_${this.currentUser}` : `${this.gamePrefix}_guest`;
  },

  _getUserData() {
    try { return JSON.parse(localStorage.getItem(this._getUserKey()) || '{}'); }
    catch { return {}; }
  },

  _setUserData(data) {
    localStorage.setItem(this._getUserKey(), JSON.stringify(data));
  },

  getDisplayName() {
    if (!this.currentUser) return 'Adventurer';
    return localStorage.getItem('sierra_display_name_' + this.currentUser) || localStorage.getItem('kq_display_name_' + this.currentUser) || this.currentUser;
  },

  // ── Save Game ──
  saveGame(slot, saveData) {
    const userData = this._getUserData();
    if (!userData.saves) userData.saves = {};
    userData.saves[`slot_${slot}`] = saveData;
    userData.lastSave = saveData;
    this._setUserData(userData);
  },

  loadGame(slot) {
    const userData = this._getUserData();
    return userData.saves?.[`slot_${slot}`] || null;
  },

  getSave(slot) {
    return this.loadGame(slot);
  },

  getLastSave() {
    const userData = this._getUserData();
    return userData.lastSave || null;
  },

  hasSaves() {
    const userData = this._getUserData();
    if (!userData.saves) return false;
    return Object.values(userData.saves).some(s => s !== null);
  }
};

window.AccountManager = AccountManager;
