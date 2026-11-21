/* ============================================================================
 おもち大戦争 - 大容量セーブ＆ロード＆データ統合システム (IndexedDB + localStorage)
 (import/export 不使用・グローバル定義)
============================================================================ */

const OMOCHI_SAVE_KEY = 'omochi_great_war_save_v2';
const OMOCHI_LEGACY_KEYS = [
 'omochi_great_war_save_v1',
 'omochi_wars_complete_v5',
 'omochi_wars_complete_v4',
 'omochi_wars_complete_v3'
];
const OMOCHI_IDB_NAME = 'OmochiGreatWarDB';
const OMOCHI_IDB_STORE = 'saves';
const OMOCHI_IDB_RECORD_KEY = 'main_save';

const STARTER_ALLY_IDS = ['maru', 'kapikapi', 'isobe', 'kimo', 'noshimochi'];

let lastSavedTimestamp = null;
let lastStoreFingerprint = '';
let lastMeasuredBytes = 0;
let browserQuotaMB = null;

function getInitialUserStoreData() {
 return {
 koban: 1500,
 xp: 500,
 gachaTickets: 1,
 ownedAllies: { maru: 0, kapikapi: 0, isobe: 0, kimo: 0, noshimochi: 0 },
 allyLevels: { maru: 1, kapikapi: 1, isobe: 1, kimo: 1, noshimochi: 1 },
 deckIds: [...STARTER_ALLY_IDS],
 deck: [...STARTER_ALLY_IDS],
 clearedIds: {},
 customAllies: [],
 customEnemies: {},
 customStages: [],
 officialCustomStages: [],
 editedOfficialStages: {},
 editedOfficialAllies: {},
 editedOfficialEnemies: {}
 };
}

// グローバル単一ストア（var で window.userStore と完全共有）
var userStore = getInitialUserStoreData();

function normalizeCustomEnemies(rawEnemies) {
 if (!rawEnemies) return {};
 if (Array.isArray(rawEnemies)) {
 const map = {};
 rawEnemies.forEach(item => {
 if (item && item.id) map[item.id] = { ...item };
 });
 return map;
 }
 if (typeof rawEnemies === 'object') {
 return { ...rawEnemies };
 }
 return {};
}

function mergeWithDefaultStore(raw) {
 const base = getInitialUserStoreData();
 if (!raw || typeof raw !== 'object') return base;

 const rawDeck = Array.isArray(raw.deckIds) && raw.deckIds.length > 0
 ? raw.deckIds
 : (Array.isArray(raw.deck) && raw.deck.length > 0 ? raw.deck : [...base.deckIds]);

 const resolvedDeck = rawDeck.slice(0, 10);
 if (!resolvedDeck.some(Boolean)) {
 resolvedDeck.splice(0, resolvedDeck.length, ...STARTER_ALLY_IDS);
 }

 return {
 ...base,
 ...raw,
 koban: Number.isFinite(Number(raw.koban)) ? Number(raw.koban) : base.koban,
 xp: Number.isFinite(Number(raw.xp)) ? Number(raw.xp) : base.xp,
 gachaTickets: Number.isFinite(Number(raw.gachaTickets)) ? Number(raw.gachaTickets) : base.gachaTickets,
 ownedAllies: { ...base.ownedAllies, ...(raw.ownedAllies || {}) },
 allyLevels: { ...base.allyLevels, ...(raw.allyLevels || {}) },
 deckIds: [...resolvedDeck],
 deck: [...resolvedDeck],
 clearedIds: raw.clearedIds && typeof raw.clearedIds === 'object' ? { ...raw.clearedIds } : {},
 customAllies: Array.isArray(raw.customAllies) ? raw.customAllies : [],
 customEnemies: normalizeCustomEnemies(raw.customEnemies),
 customStages: Array.isArray(raw.customStages) ? raw.customStages : [],
 officialCustomStages: Array.isArray(raw.officialCustomStages) ? raw.officialCustomStages : [],
 editedOfficialStages: raw.editedOfficialStages && typeof raw.editedOfficialStages === 'object' ? raw.editedOfficialStages : {},
 editedOfficialAllies: raw.editedOfficialAllies && typeof raw.editedOfficialAllies === 'object' ? raw.editedOfficialAllies : {},
 editedOfficialEnemies: raw.editedOfficialEnemies && typeof raw.editedOfficialEnemies === 'object' ? raw.editedOfficialEnemies : {}
 };
}

function syncDeckFields(store) {
 if (!store || typeof store !== 'object') return;
 if (Array.isArray(store.deckIds) && store.deckIds.length > 0) {
 store.deckIds = store.deckIds.slice(0, 10);
 store.deck = [...store.deckIds];
 } else if (Array.isArray(store.deck) && store.deck.length > 0) {
 store.deck = store.deck.slice(0, 10);
 store.deckIds = [...store.deck];
 } else {
 store.deckIds = [...STARTER_ALLY_IDS];
 store.deck = [...STARTER_ALLY_IDS];
 }
}

function getUnifiedUserStore() {
 if (!userStore || typeof userStore !== 'object') {
 userStore = getInitialUserStoreData();
 }
 userStore.customEnemies = normalizeCustomEnemies(userStore.customEnemies);
 syncDeckFields(userStore);
 window.userStore = userStore;
 return userStore;
}

function applyLoadedDataToStore(rawParsed) {
 const merged = mergeWithDefaultStore(rawParsed);
 const target = getUnifiedUserStore();
 Object.keys(target).forEach(k => delete target[k]);
 Object.assign(target, merged);
 syncDeckFields(target);
 window.userStore = target;
 window.__omochiLoadedFromStorage = true;
 lastStoreFingerprint = computeStoreFingerprint(target);
}

/* ============================================================================
 IndexedDB（大容量ストレージ）操作ラッパー
============================================================================ */
function openOmochiDB() {
 return new Promise((resolve, reject) => {
 if (!window.indexedDB) {
 reject(new Error('IndexedDB not supported'));
 return;
 }
 const req = indexedDB.open(OMOCHI_IDB_NAME, 1);
 req.onupgradeneeded = (e) => {
 const db = e.target.result;
 if (!db.objectStoreNames.contains(OMOCHI_IDB_STORE)) {
 db.createObjectStore(OMOCHI_IDB_STORE);
 }
 };
 req.onsuccess = () => resolve(req.result);
 req.onerror = () => reject(req.error);
 });
}

async function writeToIndexedDB(dataObj) {
 const db = await openOmochiDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(OMOCHI_IDB_STORE, 'readwrite');
 const store = tx.objectStore(OMOCHI_IDB_STORE);
 store.put(dataObj, OMOCHI_IDB_RECORD_KEY);
 tx.oncomplete = () => { db.close(); resolve(true); };
 tx.onerror = () => { db.close(); reject(tx.error); };
 });
}

async function readFromIndexedDB() {
 const db = await openOmochiDB();
 return new Promise((resolve, reject) => {
 const tx = db.transaction(OMOCHI_IDB_STORE, 'readonly');
 const store = tx.objectStore(OMOCHI_IDB_STORE);
 const req = store.get(OMOCHI_IDB_RECORD_KEY);
 req.onsuccess = () => { db.close(); resolve(req.result || null); };
 req.onerror = () => { db.close(); reject(req.error); };
 });
}

async function clearIndexedDB() {
 try {
 const db = await openOmochiDB();
 await new Promise((resolve) => {
 const tx = db.transaction(OMOCHI_IDB_STORE, 'readwrite');
 tx.objectStore(OMOCHI_IDB_STORE).delete(OMOCHI_IDB_RECORD_KEY);
 tx.oncomplete = () => { db.close(); resolve(); };
 tx.onerror = () => { db.close(); resolve(); };
 });
 } catch (_) {}
}

/* ============================================================================
 起動時ロード（localStorage即時復元 ＋ IndexedDB大容量データ復元）
============================================================================ */
function loadUserStoreSync() {
 try {
 let jsonStr = localStorage.getItem(OMOCHI_SAVE_KEY);
 if (!jsonStr) {
 for (const k of OMOCHI_LEGACY_KEYS) {
 const legacy = localStorage.getItem(k);
 if (legacy) { jsonStr = legacy; break; }
 }
 }
 if (jsonStr) {
 const parsed = JSON.parse(jsonStr);
 applyLoadedDataToStore(parsed);
 lastMeasuredBytes = new Blob([jsonStr]).size;
 return true;
 }
 } catch (err) {
 console.warn('localStorage読み込みスキップ:', err);
 }
 getUnifiedUserStore();
 return false;
}

async function hydrateFromIndexedDB() {
 try {
 const idbData = await readFromIndexedDB();
 if (idbData && typeof idbData === 'object') {
 applyLoadedDataToStore(idbData);
 lastMeasuredBytes = new Blob([JSON.stringify(idbData)]).size;
 refreshAllGameViewsAfterLoad();
 } else if (window.__omochiLoadedFromStorage) {
 await writeToIndexedDB(getUnifiedUserStore());
 }
 } catch (err) {
 console.warn('IndexedDB復元エラー:', err);
 }
 estimateBrowserQuota();
}

function refreshAllGameViewsAfterLoad() {
 sanitizeDeckAndOwned();
 updateKobanUI();
 refreshExtendedBadges();
 if (typeof renderStageSelectGrid === 'function') renderStageSelectGrid();
 if (typeof buildUnitSlotsUI === 'function') buildUnitSlotsUI();
 updateSaveModalLabels();
}

function ensureExtendedUserStore() {
 const store = getUnifiedUserStore();
 if (!window.__omochiStoreBooted) {
 window.__omochiStoreBooted = true;
 loadUserStoreSync();
 }
 return store;
}

window.loadUserStore = function () {
 return loadUserStoreSync();
};

/* ============================================================================
 セーブ実行（IndexedDBフル保存 ＋ localStorage軽量ミラー）
============================================================================ */
function createLightweightMirror(fullStore) {
 const stripImg = (item) => (!item || !item.imageData) ? item : { ...item, imageData: '' };
 const strippedEnemies = {};
 Object.keys(fullStore.customEnemies || {}).forEach(k => {
 strippedEnemies[k] = stripImg(fullStore.customEnemies[k]);
 });
 return {
 ...fullStore,
 customAllies: (fullStore.customAllies || []).map(stripImg),
 customEnemies: strippedEnemies
 };
}

function saveUserStore(showToastFlag = false) {
 try {
 const store = getUnifiedUserStore();
 syncDeckFields(store);
 const snapshot = JSON.parse(JSON.stringify(store));
 const fullJson = JSON.stringify(snapshot);
 lastMeasuredBytes = new Blob([fullJson]).size;
 lastStoreFingerprint = computeStoreFingerprint(store);

 writeToIndexedDB(snapshot).catch(err => console.error('IndexedDB書き込みエラー:', err));

 try {
 if (lastMeasuredBytes < 3.5 * 1024 * 1024) {
 localStorage.setItem(OMOCHI_SAVE_KEY, fullJson);
 } else {
 localStorage.setItem(OMOCHI_SAVE_KEY, JSON.stringify(createLightweightMirror(snapshot)));
 }
 } catch (_) {}

 lastSavedTimestamp = new Date();
 updateSaveModalLabels();
 updateKobanUI();
 if (showToastFlag === true) {
 showSaveToast('💾 セーブしました');
 }
 return true;
 } catch (err) {
 console.error('セーブ処理エラー:', err);
 showSaveToast('⚠️ セーブに失敗しました', true);
 return false;
 }
}

/* ============================================================================
 公式＆カスタム統合データ取得・EXキャラ購入・ランク計算
============================================================================ */
function getAllAllies() {
 const store = getUnifiedUserStore();
 const defaults = typeof DEFAULT_ALLIES !== 'undefined' ? DEFAULT_ALLIES : [];
 const map = new Map();
 defaults.forEach(a => {
 const edited = store.editedOfficialAllies?.[a.id];
 const merged = edited ? { ...a, ...edited, id: a.id } : { ...a };
 map.set(a.id, { ...merged, isDefaultOfficial: true, isEditedOfficial: !!edited });
 });
 (store.customAllies || []).forEach(ca => {
 if (ca && ca.id) map.set(ca.id, { ...ca, isDefaultOfficial: false });
 });
 return Array.from(map.values());
}

function getAllEnemiesMap() {
 const store = getUnifiedUserStore();
 const defaults = typeof DEFAULT_ENEMIES !== 'undefined' ? DEFAULT_ENEMIES : {};
 const merged = {};
 Object.keys(defaults).forEach(k => {
 const base = defaults[k];
 const edited = store.editedOfficialEnemies?.[k];
 merged[k] = edited
 ? { ...base, ...edited, id: k, isDefaultOfficial: true, isEditedOfficial: true }
 : { ...base, id: k, isDefaultOfficial: true, isEditedOfficial: false };
 });
 const ceObj = normalizeCustomEnemies(store.customEnemies);
 Object.keys(ceObj).forEach(k => {
 if (ceObj[k]) merged[k] = { ...ceObj[k], id: k, isDefaultOfficial: false };
 });
 return merged;
}

function getAllStages() {
 const store = getUnifiedUserStore();
 const defaults = typeof DEFAULT_STAGES !== 'undefined' ? DEFAULT_STAGES : [];
 const officialBase = defaults.map(st => {
 const edited = store.editedOfficialStages?.[st.id];
 const target = edited ? { ...st, ...edited, id: st.id } : { ...st };
 return { ...target, category: 'official', isOfficial: true, isDefaultOfficial: true, isEditedOfficial: !!edited };
 });

 const officialCustom = (store.officialCustomStages || []).map(st => ({
 ...st,
 category: 'official',
 isOfficial: true,
 isDefaultOfficial: false
 }));

 const customList = (store.customStages || []).map(st => ({
 ...st,
 category: 'custom',
 isOfficial: false,
 isDefaultOfficial: false
 }));

 const list = [...officialBase, ...officialCustom, ...customList];
 if (window.__tempTestStage) {
 list.push({ ...window.__tempTestStage, isTestStage: true });
 }
 return list;
}

function unlockExAlly(allyId) {
 const store = getUnifiedUserStore();
 const spec = getAllAllies().find(a => a.id === allyId);
 if (!spec || spec.rarity !== 'EX') {
 showToast('対象のEXキャラが見つかりません', 'error');
 return false;
 }
 if (store.ownedAllies[allyId] !== undefined) {
 showToast(`「${spec.name}」はすでに仲間にいます！`);
 return false;
 }

 const method = spec.unlockType || spec.unlockMethod || 'koban';
 const cost = Math.max(0, Number(spec.unlockCost) || 0);

 if (method === 'koban') {
 if ((store.koban || 0) < cost) {
 showToast(`🪙 小判が足りません！（必要: ${cost}枚）`, 'error');
 return false;
 }
 store.koban -= cost;
 } else if (method === 'xp') {
 if ((store.xp || 0) < cost) {
 showToast(`✨ XPが足りません！（必要: ${cost} XP）`, 'error');
 return false;
 }
 store.xp -= cost;
 } else if (method === 'stage') {
 const targetStageId = spec.unlockStageId || '';
 if (!targetStageId || !store.clearedIds?.[targetStageId]) {
 const targetStage = getAllStages().find(s => s.id === targetStageId);
 const label = targetStage ? `${targetStage.chapter || ''}「${targetStage.title}」` : '指定ステージ';
 showToast(`🏆 ${label} をクリアすると獲得できます！`, 'error');
 return false;
 }
 } else {
 showToast('このEXキャラはステージクリア報酬で入手できます！', 'error');
 return false;
 }

 store.ownedAllies[allyId] = 0;
 if (!store.allyLevels[allyId]) {
 store.allyLevels[allyId] = 1;
 }
 saveUserStore(false);
 updateKobanUI();
 if (typeof sound !== 'undefined') sound.playUpgrade();
 showToast(`🎉 EXキャラ「${spec.name}」を獲得しました！`, 'rare');
 return true;
}

function sanitizeDeckAndOwned() {
 const store = getUnifiedUserStore();
 const allAllies = getAllAllies();
 const validIds = new Set(allAllies.map(a => a.id));

 STARTER_ALLY_IDS.forEach(baseId => {
 if (validIds.has(baseId) && store.ownedAllies[baseId] === undefined) {
 store.ownedAllies[baseId] = 0;
 }
 });

 const src = Array.isArray(store.deckIds) ? store.deckIds : (store.deck || []);
 const cleaned = [];
 for (let i = 0; i < 10; i++) {
 const id = src[i];
 if (id && validIds.has(id) && store.ownedAllies[id] !== undefined) {
 cleaned.push(id);
 } else {
 cleaned.push(null);
 }
 }
 if (!cleaned.some(Boolean)) {
 const ownedIds = Object.keys(store.ownedAllies).filter(id => validIds.has(id));
 ownedIds.slice(0, 5).forEach((id, i) => { cleaned[i] = id; });
 }
 store.deckIds = [...cleaned];
 store.deck = [...cleaned];
}

function getAllyLevel(allyId) {
 const store = getUnifiedUserStore();
 const lv = Number(store.allyLevels?.[allyId]) || 1;
 return Math.max(1, Math.min(30, Math.floor(lv)));
}

function getOmochiRankInfo() {
 const store = getUnifiedUserStore();
 const ownedIds = Object.keys(store.ownedAllies || {});
 let totalLv = 0;
 ownedIds.forEach(id => {
 totalLv += getAllyLevel(id) + Math.max(0, Number(store.ownedAllies[id]) || 0);
 });
 const rank = Math.max(1, Math.floor(totalLv / 3) + 1);
 const bonusPct = Math.min(30, (rank - 1) * 2);
 return { rank, totalLv, ownedCount: ownedIds.length, bonusPct };
}

function getEffectiveAllySpec(spec) {
 if (!spec || spec._effectiveApplied) return spec;
 const store = getUnifiedUserStore();
 const lv = getAllyLevel(spec.id);
 const plusLv = Math.max(0, Number(store.ownedAllies?.[spec.id]) || 0);
 const { bonusPct } = getOmochiRankInfo();

 const lvMult = 1 + (lv - 1) * 0.08;
 const plusMult = 1 + plusLv * 0.05;
 const rankMult = 1 + bonusPct / 100;
 const totalMult = lvMult * plusMult * rankMult;

 return {
 ...spec,
 _effectiveApplied: true,
 level: lv,
 plusLv,
 hp: Math.max(10, Math.round((spec.hp || 100) * totalMult)),
 atk: Math.max(1, Math.round((spec.atk || 10) * totalMult))
 };
}

function getActiveDeckUnits() {
 sanitizeDeckAndOwned();
 const store = getUnifiedUserStore();
 const all = getAllAllies();
 const map = new Map(all.map(u => [u.id, u]));
 const units = [];
 for (let i = 0; i < 10; i++) {
 const id = store.deckIds[i];
 units.push(id && map.has(id) ? getEffectiveAllySpec(map.get(id)) : null);
 }
 return units;
}

function updateKobanUI() {
 const store = getUnifiedUserStore();
 const k = Math.floor(store.koban || 0);
 const titleEl = document.getElementById('title-koban-count');
 const gachaEl = document.getElementById('gacha-koban-display');
 if (titleEl) titleEl.textContent = k;
 if (gachaEl) gachaEl.textContent = k;
 refreshExtendedBadges();
}

function refreshExtendedBadges() {
 const store = getUnifiedUserStore();
 const rankInfo = getOmochiRankInfo();
 const k = Math.floor(store.koban || 0);
 const xp = Math.floor(store.xp || 0);
 const tk = Math.floor(store.gachaTickets || 0);

 const setTxt = (id, val) => {
 const el = document.getElementById(id);
 if (el) el.textContent = val;
 };
 setTxt('title-koban-count', k);
 setTxt('title-xp-count', xp);
 setTxt('title-ticket-count', tk);
 setTxt('title-rank-num', rankInfo.rank);
 setTxt('title-rank-bonus', `+${rankInfo.bonusPct}%`);
 setTxt('gacha-koban-display', k);
 setTxt('gacha-ticket-display', tk);
}

/* ============================================================================
 変更自動検知オートセーブ
============================================================================ */
function computeStoreFingerprint(s) {
 if (!s) return '';
 const clearedKeys = Object.keys(s.clearedIds || {}).sort().join(',');
 const ownedStr = Object.entries(s.ownedAllies || {}).map(([k, v]) => `${k}:${v}`).sort().join(',');
 const lvStr = Object.entries(s.allyLevels || {}).map(([k, v]) => `${k}:${v}`).sort().join(',');
 const deckArr = Array.isArray(s.deckIds) ? s.deckIds : (s.deck || []);
 const deckStr = deckArr.join(',');
 const cStage = (s.customStages || []).length + ':' + (s.officialCustomStages || []).length;
 const cUnit = (s.customAllies || []).length + ':' + Object.keys(s.customEnemies || {}).length;
 const eOff = Object.keys(s.editedOfficialStages || {}).length
 + ':' + Object.keys(s.editedOfficialAllies || {}).length
 + ':' + Object.keys(s.editedOfficialEnemies || {}).length;

 return [
 Math.floor(s.koban || 0),
 Math.floor(s.xp || 0),
 Math.floor(s.gachaTickets || 0),
 clearedKeys,
 ownedStr,
 lvStr,
 deckStr,
 cStage,
 cUnit,
 eOff
 ].join('|');
}

loadUserStoreSync();
hydrateFromIndexedDB();

setInterval(() => {
 const s = getUnifiedUserStore();
 syncDeckFields(s);
 const fp = computeStoreFingerprint(s);
 if (fp && fp !== lastStoreFingerprint) {
 saveUserStore(false);
 }
}, 1500);

document.addEventListener('visibilitychange', () => {
 if (document.visibilityState === 'hidden') saveUserStore(false);
});
window.addEventListener('pagehide', () => saveUserStore(false));
window.addEventListener('beforeunload', () => saveUserStore(false));

/* ============================================================================
 容量計測＆トースト表示
============================================================================ */
let saveToastTimer = null;

function showSaveToast(message, isError = false) {
 let toast = document.getElementById('omochi-save-toast');
 if (!toast) {
 toast = document.createElement('div');
 toast.id = 'omochi-save-toast';
 document.body.appendChild(toast);
 }
 toast.className = `fixed bottom-3 right-3 z-[60] px-3 py-1.5 rounded-xl border-2 border-[#2c1e16] font-black text-xs shadow-lg transition-opacity duration-300 pointer-events-none ${
 isError ? 'bg-rose-500 text-white' : 'bg-[#2c1e16]/90 text-amber-300'
 }`;
 toast.textContent = message;
 toast.style.opacity = '1';

 if (saveToastTimer) clearTimeout(saveToastTimer);
 saveToastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 1600);
}

async function estimateBrowserQuota() {
 try {
 if (navigator.storage && navigator.storage.estimate) {
 const est = await navigator.storage.estimate();
 if (est && est.quota) {
 browserQuotaMB = Math.round(est.quota / (1024 * 1024));
 updateSaveModalLabels();
 }
 }
 } catch (_) {}
}

function formatByteSize(bytes) {
 if (bytes >= 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
 return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatQuotaLabel() {
 if (!browserQuotaMB) return '約 500 MB以上（IndexedDB大容量）';
 if (browserQuotaMB >= 1024) return `約 ${(browserQuotaMB / 1024).toFixed(1)} GB（IndexedDB大容量）`;
 return `約 ${browserQuotaMB} MB（IndexedDB大容量）`;
}

function formatSavedTime(dateObj) {
 if (!dateObj) return '起動時ロード済み';
 const h = String(dateObj.getHours()).padStart(2, '0');
 const m = String(dateObj.getMinutes()).padStart(2, '0');
 const s = String(dateObj.getSeconds()).padStart(2, '0');
 return `${h}:${m}:${s}`;
}

function updateSaveModalLabels() {
 const timeEl = document.getElementById('save-modal-last-time');
 if (timeEl) timeEl.textContent = formatSavedTime(lastSavedTimestamp);
 const sizeEl = document.getElementById('save-modal-size');
 if (sizeEl) sizeEl.textContent = `${formatByteSize(lastMeasuredBytes)} / ${formatQuotaLabel()}`;
}

/* ============================================================================
 バックアップ書き出し（JSON）・復元（JSON）・初期化・モーダル
============================================================================ */
function exportSaveFile() {
 const store = getUnifiedUserStore();
 saveUserStore(false);
 const exportObj = {
 app: 'OmochiGreatWar',
 version: 2,
 exportedAt: new Date().toISOString(),
 data: store
 };
 const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' });
 const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
 const dateTag = new Date().toISOString().slice(0, 10).replace(/-/g, '');
 a.href = url;
 a.download = `omochi_wars_save_${dateTag}.json`;
 document.body.appendChild(a);
 a.click();
 document.body.removeChild(a);
 URL.revokeObjectURL(url);
 showSaveToast('📤 セーブファイルを書き出しました');
}

function importSaveFile(event) {
 const file = event?.target?.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = (e) => {
 try {
 const parsed = JSON.parse(e.target.result);
 const rawStore = parsed && parsed.data ? parsed.data : parsed;
 if (!rawStore || typeof rawStore !== 'object' || (!rawStore.ownedAllies && !rawStore.deck && !rawStore.deckIds)) {
 alert('⚠️ 正しい『おもち大戦争』のセーブファイルではありません。');
 return;
 }
 if (!confirm('現在のセーブデータを上書きして、選択したファイルを復元しますか？')) return;
 applyLoadedDataToStore(rawStore);
 saveUserStore(false);
 refreshAllGameViewsAfterLoad();
 renderSaveModalBody();
 if (typeof sound !== 'undefined') sound.playUpgrade();
 alert('✅ セーブデータの復元が完了しました！');
 } catch (err) {
 console.error(err);
 alert('⚠️ ファイルの読み込みに失敗しました。');
 } finally {
 event.target.value = '';
 }
 };
 reader.readAsText(file);
}

async function resetAllSaveData() {
 if (!confirm('【警告】小判・XP・育成レベル・クリア状況・自作キャラ＆ステージをすべて初期化しますか？\n（この操作は取り消せません）')) return;
 if (!confirm('本当によろしいですか？初期状態に戻ります。')) return;

 localStorage.removeItem(OMOCHI_SAVE_KEY);
 OMOCHI_LEGACY_KEYS.forEach(k => localStorage.removeItem(k));
 await clearIndexedDB();

 const fresh = getInitialUserStoreData();
 const target = getUnifiedUserStore();
 Object.keys(target).forEach(k => delete target[k]);
 Object.assign(target, fresh);
 syncDeckFields(target);
 window.userStore = target;

 saveUserStore(false);
 refreshAllGameViewsAfterLoad();
 renderSaveModalBody();
 if (typeof sound !== 'undefined') sound.playButton();
 alert('🔄 セーブデータを初期状態にリセットしました。');
}

function ensureSaveModalDOM() {
 let modal = document.getElementById('save-manage-modal');
 if (!modal) {
 modal = document.createElement('div');
 modal.id = 'save-manage-modal';
 document.body.appendChild(modal);
 }
 modal.className = 'hidden fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-2 sm:p-4';
 modal.onclick = (e) => { if (e.target === modal) closeSaveModal(); };

 if (!document.getElementById('save-manage-body')) {
 modal.innerHTML = `
 <div class="bg-[#fffdf7] border-4 border-[#2c1e16] rounded-3xl w-full max-w-lg flex flex-col shadow-2xl overflow-hidden">
 <div class="bg-amber-300 border-b-4 border-[#2c1e16] px-4 py-3 flex items-center justify-between">
 <h2 class="font-title text-xl font-black text-[#2c1e16]">💾 大容量セーブ＆データ管理</h2>
 <button type="button" onclick="closeSaveModal()" class="bg-white text-[#2c1e16] border-2 border-[#2c1e16] w-9 h-9 rounded-xl font-black text-lg hover:bg-rose-200">✕</button>
 </div>
 <div id="save-manage-body" class="p-4 space-y-3 text-xs sm:text-sm text-[#2c1e16]"></div>
 </div>
 `;
 }
}

function openSaveModal() {
 ensureSaveModalDOM();
 if (typeof sound !== 'undefined') sound.playButton();
 renderSaveModalBody();
 document.getElementById('save-manage-modal').classList.remove('hidden');
}

function closeSaveModal() {
 if (typeof sound !== 'undefined') sound.playButton();
 const modal = document.getElementById('save-manage-modal');
 if (modal) modal.classList.add('hidden');
}

function renderSaveModalBody() {
 const body = document.getElementById('save-manage-body');
 if (!body) return;
 const store = getUnifiedUserStore();

 const clearedCount = Object.keys(store.clearedIds || {}).length;
 const ownedCount = Object.keys(store.ownedAllies || {}).length;
 const customTotal = (store.customStages?.length || 0)
 + (store.officialCustomStages?.length || 0)
 + (store.customAllies?.length || 0)
 + Object.keys(store.customEnemies || {}).length;

 body.innerHTML = `
 <div class="bg-amber-50 border-2 border-[#2c1e16] rounded-2xl p-3 space-y-1.5 font-bold">
 <div class="flex justify-between">
 <span class="text-stone-600">保存エンジン:</span>
 <span class="text-emerald-700 font-black">● IndexedDB 大容量オートセーブ稼働中</span>
 </div>
 <div class="flex justify-between">
 <span class="text-stone-600">最終保存時刻:</span>
 <span id="save-modal-last-time" class="font-black">${formatSavedTime(lastSavedTimestamp)}</span>
 </div>
 <div class="flex justify-between">
 <span class="text-stone-600">使用データ容量:</span>
 <span id="save-modal-size" class="font-black">${formatByteSize(lastMeasuredBytes)} / ${formatQuotaLabel()}</span>
 </div>
 <div class="border-t border-amber-200 pt-1.5 mt-1.5 flex justify-between text-xs">
 <span>クリア数: <b>${clearedCount}</b></span>
 <span>所持キャラ: <b>${ownedCount}体</b></span>
 <span>工房作成数: <b>${customTotal}件</b></span>
 </div>
 </div>

 <button type="button" onclick="saveUserStore(true); renderSaveModalBody();"
 class="game-btn w-full bg-emerald-400 hover:bg-emerald-300 text-[#2c1e16] border-3 border-[#2c1e16] py-2.5 rounded-2xl font-black text-sm shadow">
 💾 今すぐ手動でセーブする
 </button>

 <div class="bg-sky-50 border-2 border-[#2c1e16] rounded-2xl p-3 space-y-2">
 <div class="font-black text-xs text-sky-950">📦 バックアップ・別端末への引き継ぎ</div>
 <div class="grid grid-cols-2 gap-2">
 <button type="button" onclick="exportSaveFile()"
 class="game-btn bg-sky-300 hover:bg-sky-200 border-2 border-[#2c1e16] py-2 rounded-xl font-black text-xs">
 📤 ファイルに書き出し
 </button>
 <label class="game-btn cursor-pointer bg-indigo-300 hover:bg-indigo-200 border-2 border-[#2c1e16] py-2 rounded-xl font-black text-xs text-center flex items-center justify-center">
 📥 ファイルから復元
 <input type="file" accept=".json,application/json" onchange="importSaveFile(event)" class="hidden">
 </label>
 </div>
 </div>

 <div class="pt-1 border-t border-stone-200 flex justify-end">
 <button type="button" onclick="resetAllSaveData()"
 class="bg-rose-100 hover:bg-rose-200 text-rose-800 border border-rose-400 px-3 py-1.5 rounded-xl font-black text-xs">
 🗑 セーブデータを初期化
 </button>
 </div>
 `;
}

