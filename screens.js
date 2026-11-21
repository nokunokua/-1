/* ============================================================================
 おもち大戦争 - 4. ステージ選択・戦闘スロット・XP育成・EX獲得・福引ガチャ・デッキ・図鑑
 (import/export 不使用・グローバル定義)
============================================================================ */

let currentStageCategory = 'official';
let stageSearchKeyword = '';
let currentDexTab = 'allies';
let currentUpgradeTab = 'upgrade';
let editingDeckIds = [];
let selectedDeckSlotIdx = 0;

/* ----------------------------------------------------------------------------
 0. サウンド切替＆タイトル背景パレードアニメーション
---------------------------------------------------------------------------- */
function toggleSound() {
 const enabled = sound.toggle();
 const iconTitle = document.getElementById('sound-icon-title');
 const labelTitle = document.getElementById('sound-label-title');
 const iconBattle = document.getElementById('sound-icon-battle');

 if (iconTitle) iconTitle.textContent = enabled ? '🔊' : '🔇';
 if (labelTitle) labelTitle.textContent = enabled ? '音ON' : '音OFF';
 if (iconBattle) iconBattle.textContent = enabled ? '🔊' : '🔇';
}

const titleParadeUnits = [
 { id: 'maru', x: 180, speed: 42 },
 { id: 'kinako', x: 380, speed: 58 },
 { id: 'isobe', x: 580, speed: 46 },
 { id: 'sakura', x: 780, speed: 50 },
 { id: 'ichigo_hime', x: 980, speed: 40 },
 { id: 'oshougatsu', x: 1180, speed: 35 }
];
let titleParadeTime = 0;

function updateTitleBackgroundParade(dt) {
 if (gameState.screen !== 'TITLE') return;
 const cvs = document.getElementById('title-bg-canvas');
 if (!cvs) return;

 const rect = cvs.getBoundingClientRect();
 if (rect.width > 0 && rect.height > 0 && (cvs.width !== Math.floor(rect.width) || cvs.height !== Math.floor(rect.height))) {
 cvs.width = Math.floor(rect.width);
 cvs.height = Math.floor(rect.height);
 }

 titleParadeTime += dt;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);

 const groundY = cvs.height - 32;
 ctx.fillStyle = 'rgba(217, 119, 6, 0.25)';
 ctx.fillRect(0, groundY, cvs.width, 32);

 titleParadeUnits.forEach((p, idx) => {
 p.x -= p.speed * dt;
 if (p.x < -80) p.x = cvs.width + 80;
 ctx.save();
 ctx.translate(p.x, groundY);
 ctx.scale(1.1, 1.1);
 drawCharacterSprite(ctx, p.id, { time: titleParadeTime + idx, state: 'WALK' });
 ctx.restore();
 });
}

/* ----------------------------------------------------------------------------
 1. タイトル画面：カテゴリ別ステージ選択（公式 / 自作 / すべて）＆検索
---------------------------------------------------------------------------- */
function switchStageCategory(cat) {
 sound.playButton();
 currentStageCategory = cat || 'official';

 ['official', 'custom', 'all'].forEach(key => {
 const btn = document.getElementById(`cat-tab-${key}`);
 if (!btn) return;
 if (key === currentStageCategory) {
 btn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-[#2c1e16] text-amber-300 border-2 border-[#2c1e16]';
 } else {
 btn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-white text-[#2c1e16] border-2 border-[#2c1e16] hover:bg-amber-100';
 }
 });

 renderStageSelectGrid();
}

function setStageSearchKeyword(val) {
 stageSearchKeyword = String(val || '').trim().toLowerCase();
 renderStageSelectGrid();
}

function renderStageSelectGrid() {
 const grid = document.getElementById('stage-select-grid');
 if (!grid) return;

 const allStages = getAllStages().filter(s => !s.isTestStage);
 const filtered = allStages
 .map((st, globalIdx) => ({ st, globalIdx }))
 .filter(({ st }) => {
 if (currentStageCategory === 'official' && !st.isOfficial) return false;
 if (currentStageCategory === 'custom' && st.isOfficial) return false;
 if (stageSearchKeyword) {
 const hay = `${st.chapter || ''} ${st.title || ''} ${st.enemyBaseName || ''}`.toLowerCase();
 if (!hay.includes(stageSearchKeyword)) return false;
 }
 return true;
 });

 const countLabel = document.getElementById('stage-count-label');
 if (countLabel) {
 countLabel.textContent = `表示: ${filtered.length}件`;
 }

 const badgeColors = [
 'bg-emerald-300', 'bg-amber-300', 'bg-slate-300', 'bg-pink-300',
 'bg-orange-400 text-white', 'bg-cyan-300', 'bg-purple-400 text-white',
 'bg-yellow-400', 'bg-sky-300', 'bg-rose-500 text-white',
 'bg-indigo-400 text-white', 'bg-teal-300', 'bg-stone-700 text-white',
 'bg-gradient-to-r from-amber-300 via-pink-400 to-indigo-400 text-white'
 ];

 if (filtered.length === 0) {
 grid.innerHTML = `
 <div class="col-span-full bg-white/85 border-3 border-dashed border-[#2c1e16] rounded-2xl p-6 text-center">
 <div class="font-black text-base text-[#2c1e16] mb-1">
 ${stageSearchKeyword ? '検索条件に一致するステージがありません' : 'まだ自作ステージがありません！'}
 </div>
 <div class="text-xs font-bold text-stone-600 mb-3">「🛠️ 大工房」からオリジナルの敵・ステージを作成して保存できます！</div>
 <button onclick="openWorkshop('stage')" class="game-btn bg-purple-400 text-white font-black px-4 py-2 rounded-xl text-xs">
 🛠️ ステージ大工房を開く
 </button>
 </div>
 `;
 return;
 }

 const allAllies = getAllAllies();
 const allyMap = new Map(allAllies.map(a => [a.id, a]));

 grid.innerHTML = filtered.map(({ st, globalIdx }) => {
 const isCleared = !!userStore.clearedIds[st.id];
 const badgeClass = st.isOfficial
 ? (badgeColors[globalIdx % badgeColors.length] || 'bg-amber-300')
 : 'bg-purple-400 text-white';

 const diffLabel = typeof formatDifficulty === 'function'
 ? formatDifficulty(st.difficulty)
 : `★${Math.max(1, Number(st.difficulty) || 1)}`;

 const dropAlly = st.dropAllyId ? allyMap.get(st.dropAllyId) : null;
 const dropTag = dropAlly
 ? `<span class="text-[10px] font-black bg-emerald-100 text-emerald-900 border border-emerald-400 px-1.5 py-0.5 rounded">🎁 ${dropAlly.name}</span>`
 : '';

 return `
 <button onclick="startStage(${globalIdx})"
 class="game-btn relative bg-white hover:bg-amber-50 p-3 rounded-2xl text-left flex flex-col justify-between transition">
 ${isCleared ? '<span class="absolute -top-2 -right-2 bg-emerald-400 text-[#2c1e16] text-[10px] font-black px-2 py-0.5 rounded-full border-2 border-[#2c1e16] shadow">CLEAR!</span>' : ''}
 <div>
 <div class="flex items-center justify-between gap-1 mb-1">
 <span class="${badgeClass} text-[10px] font-black px-2 py-0.5 rounded-md border border-[#2c1e16] truncate max-w-[68%]">
 ${st.chapter || (st.isOfficial ? '公式' : '自作')}
 </span>
 <span class="text-amber-500 font-black text-xs shrink-0">${diffLabel}</span>
 </div>
 <div class="font-black text-sm text-[#2c1e16] leading-snug mb-1 line-clamp-1">${st.title}</div>
 </div>
 <div class="space-y-1">
 <div class="text-[10px] font-bold text-stone-500 flex items-center justify-between">
 <span>🏰 敵城HP: ${st.enemyBaseHp}</span>
 <span class="text-amber-700 font-black">🪙${st.rewardKoban} / ✨${st.rewardXp || 300}XP</span>
 </div>
 ${dropTag ? `<div>${dropTag}</div>` : ''}
 </div>
 </button>
 `;
 }).join('');
}

/* ----------------------------------------------------------------------------
 2. 戦闘画面：最大10体ユニット出撃スロット構築（#unit-slots）
---------------------------------------------------------------------------- */
function buildUnitSlotsUI() {
 const container = document.getElementById('unit-slots');
 if (!container) return;

 const deckUnits = getActiveDeckUnits();
 container.innerHTML = deckUnits.map((rawSpec, idx) => {
 if (!rawSpec) {
 return `
 <div class="bg-stone-800/70 border-2 border-dashed border-stone-500 rounded-xl p-1 flex flex-col items-center justify-center opacity-50">
 <span class="text-[10px] font-black text-stone-300">空き枠</span>
 </div>
 `;
 }
 const spec = getEffectiveAllySpec(rawSpec);
 const keyHint = idx === 9 ? '0' : String(idx + 1);
 const plusBadge = spec.plusLv > 0
 ? `<span class="text-[8px] font-black bg-amber-300 text-[#2c1e16] px-1 rounded leading-tight">+${spec.plusLv}</span>`
 : '';
 const lvBadge = `<span class="text-[8px] font-black bg-sky-200 text-sky-950 px-1 rounded leading-tight">Lv.${spec.level}</span>`;

 return `
 <button id="unit-slot-${idx}" onclick="deployUnit(${idx})"
 class="slot-btn-compact relative bg-amber-50 hover:bg-white rounded-xl p-1 flex flex-col items-center justify-between overflow-hidden select-none">
 <div class="w-full flex justify-between items-center px-0.5">
 <span class="text-[9px] font-black bg-[#2c1e16] text-amber-300 px-1 rounded leading-tight">${keyHint}</span>
 <div class="flex items-center gap-0.5">${lvBadge}${plusBadge}</div>
 </div>
 <canvas id="slot-preview-${idx}" width="64" height="50" class="w-10 h-8 sm:w-11 sm:h-9 object-contain"></canvas>
 <div class="w-full text-center leading-none">
 <div class="text-[9px] font-black text-[#2c1e16] truncate">${spec.name}</div>
 <div class="text-[10px] font-black text-amber-700">${spec.cost}円</div>
 </div>
 <div id="unit-cd-overlay-${idx}" class="cooldown-overlay" style="height: 0%;"></div>
 <span id="unit-cd-text-${idx}" class="hidden absolute inset-0 flex items-center justify-center text-white font-black text-xs drop-shadow"></span>
 </button>
 `;
 }).join('');

 deckUnits.forEach((spec, idx) => {
 if (!spec) return;
 const cvs = document.getElementById(`slot-preview-${idx}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 4);
 const fitScale = spec.isBoss ? 0.42 : (spec.isRare ? 0.56 : 0.72);
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, spec, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
}

/* ----------------------------------------------------------------------------
 3. XPレベルアップ育成＆EXキャラ獲得モーダル（#upg-tab-upgrade / #upg-tab-ex）
---------------------------------------------------------------------------- */
function getUpgradeCostForLevel(lv, rarity) {
 const mult = rarity === '伝説レア' ? 2.4 : rarity === '超激レア' ? 1.8 : rarity === '激レア' ? 1.4 : rarity === 'EX' ? 1.3 : 1.0;
 return Math.round((120 + lv * lv * 35) * mult);
}

function openUpgradeModal(tab = 'upgrade') {
 sound.playButton();
 ensureExtendedUserStore();
 currentUpgradeTab = tab === 'ex' ? 'ex' : 'upgrade';
 syncUpgradeModalTabUI();
 renderUpgradeList();
 document.getElementById('upgrade-modal')?.classList.remove('hidden');
}

function switchUpgradeModalTab(tab) {
 sound.playButton();
 currentUpgradeTab = tab === 'ex' ? 'ex' : 'upgrade';
 syncUpgradeModalTabUI();
 renderUpgradeList();
}

function syncUpgradeModalTabUI() {
 const upBtn = document.getElementById('upg-tab-upgrade');
 const exBtn = document.getElementById('upg-tab-ex');
 if (upBtn && exBtn) {
 if (currentUpgradeTab === 'upgrade') {
 upBtn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-[#2c1e16] text-amber-300 border-2 border-[#2c1e16]';
 exBtn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-white text-[#2c1e16] border-2 border-[#2c1e16] hover:bg-amber-100';
 } else {
 exBtn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-[#2c1e16] text-amber-300 border-2 border-[#2c1e16]';
 upBtn.className = 'px-3 py-1 rounded-xl font-black text-xs sm:text-sm bg-white text-[#2c1e16] border-2 border-[#2c1e16] hover:bg-amber-100';
 }
 }
}

function closeUpgradeModal() {
 sound.playButton();
 document.getElementById('upgrade-modal')?.classList.add('hidden');
 if (typeof refreshExtendedBadges === 'function') refreshExtendedBadges();
}

function upgradeAllyUnit(allyId) {
 ensureExtendedUserStore();
 const allAllies = getAllAllies();
 const spec = allAllies.find(a => a.id === allyId);
 if (!spec) return;

 const currentLv = getAllyLevel(allyId);
 if (currentLv >= 30) {
 showToast('すでに最大レベル（Lv.30）です！', 'info');
 return;
 }
 const cost = getUpgradeCostForLevel(currentLv, spec.rarity);
 if ((userStore.xp || 0) < cost) {
 showToast('XPが足りません！ステージをクリアしてXPを集めよう！', 'error');
 return;
 }

 userStore.xp -= cost;
 userStore.allyLevels[allyId] = currentLv + 1;
 saveUserStore();
 sound.playUpgrade();

 const newRank = getOmochiRankInfo();
 showToast(`⬆️ ${spec.name} が Lv.${currentLv + 1} にアップ！（おもちランク ${newRank.rank}）`, 'success');
 renderUpgradeList();
}

function handleUnlockExClick(allyId) {
 if (unlockExAlly(allyId)) {
 renderUpgradeList();
 }
}

function renderUpgradeList() {
 ensureExtendedUserStore();
 refreshExtendedBadges();

 const summaryBar = document.getElementById('upgrade-summary-bar');
 if (summaryBar) {
 const rankInfo = getOmochiRankInfo();
 summaryBar.innerHTML = `
 <span>✨ 所持XP: <b class="text-sky-700">${Math.floor(userStore.xp || 0)}</b></span>
 <span>🪙 所持小判: <b class="text-amber-700">${Math.floor(userStore.koban || 0)}</b></span>
 <span>👑 おもちランク: <b class="text-rose-700">${rankInfo.rank}</b> (全味方HP/ATK <b>+${rankInfo.bonusPct}%</b>)</span>
 `;
 }

 const listEl = document.getElementById('upgrade-units-grid');
 if (!listEl) return;

 const allAllies = getAllAllies();

 // --- EXキャラ獲得タブ ---
 if (currentUpgradeTab === 'ex') {
 const exAllies = allAllies.filter(a => a.rarity === 'EX');
 if (exAllies.length === 0) {
 listEl.innerHTML = `<div class="col-span-full text-center font-black text-stone-500 py-8">EXキャラクターが登録されていません</div>`;
 return;
 }

 const allStages = getAllStages();
 const stageMap = new Map(allStages.map(s => [s.id, s]));

 listEl.innerHTML = exAllies.map(raw => {
 const isOwned = userStore.ownedAllies[raw.id] !== undefined;
 const spec = getEffectiveAllySpec(raw);
 const method = raw.unlockType || raw.unlockMethod || 'koban';
 const cost = Math.max(0, Number(raw.unlockCost) || 0);

 let conditionBadge = '';
 let actionHtml = '';

 if (isOwned) {
 conditionBadge = `<span class="text-[10px] font-black bg-emerald-400 text-[#2c1e16] border border-[#2c1e16] px-2 py-0.5 rounded-full">✅ 獲得済み (Lv.${spec.level})</span>`;
 actionHtml = `
 <button onclick="switchUpgradeModalTab('upgrade')"
 class="game-btn w-full py-2 rounded-xl font-black text-xs bg-emerald-200 hover:bg-emerald-300 text-[#2c1e16] border-2 border-[#2c1e16]">
 ⬆️ XP育成タブで強化する
 </button>
 `;
 } else if (method === 'koban') {
 const canBuy = (userStore.koban || 0) >= cost;
 conditionBadge = `<span class="text-[10px] font-black bg-amber-200 text-amber-950 border border-amber-500 px-2 py-0.5 rounded-full">🪙 小判購入限定</span>`;
 actionHtml = `
 <button onclick="handleUnlockExClick('${raw.id}')" ${canBuy ? '' : 'disabled'}
 class="game-btn w-full py-2 rounded-xl font-black text-xs ${canBuy ? 'bg-amber-400 hover:bg-amber-300 text-[#2c1e16]' : 'bg-stone-200 text-stone-500 opacity-70'}">
 🪙 ${cost}小判 で仲間にする
 </button>
 `;
 } else if (method === 'xp') {
 const canBuy = (userStore.xp || 0) >= cost;
 conditionBadge = `<span class="text-[10px] font-black bg-sky-200 text-sky-950 border border-sky-500 px-2 py-0.5 rounded-full">✨ XP解放限定</span>`;
 actionHtml = `
 <button onclick="handleUnlockExClick('${raw.id}')" ${canBuy ? '' : 'disabled'}
 class="game-btn w-full py-2 rounded-xl font-black text-xs ${canBuy ? 'bg-sky-400 hover:bg-sky-300 text-[#2c1e16]' : 'bg-stone-200 text-stone-500 opacity-70'}">
 ✨ ${cost} XP で解放する
 </button>
 `;
 } else if (method === 'stage') {
 const targetSt = stageMap.get(raw.unlockStageId);
 const isCleared = !!(raw.unlockStageId && userStore.clearedIds?.[raw.unlockStageId]);
 const stLabel = targetSt ? `${targetSt.chapter || ''}「${targetSt.title}」` : '指定ステージ';
 conditionBadge = `<span class="text-[10px] font-black bg-purple-200 text-purple-950 border border-purple-500 px-2 py-0.5 rounded-full">🏆 クリア報酬</span>`;
 actionHtml = `
 <button onclick="handleUnlockExClick('${raw.id}')" ${isCleared ? '' : 'disabled'}
 class="game-btn w-full py-2 rounded-xl font-black text-xs ${isCleared ? 'bg-emerald-400 hover:bg-emerald-300 text-[#2c1e16]' : 'bg-stone-200 text-stone-500 opacity-75'}">
 ${isCleared ? `🎁 ${stLabel} クリア報酬を受け取る！` : `🔒 ${stLabel} クリアで解放`}
 </button>
 `;
 } else {
 conditionBadge = `<span class="text-[10px] font-black bg-purple-200 text-purple-950 border border-purple-500 px-2 py-0.5 rounded-full">🎁 ステージドロップ</span>`;
 actionHtml = `
 <div class="w-full py-2 rounded-xl font-black text-xs text-center bg-stone-200 text-stone-600 border border-stone-400">
 対象ステージのクリアドロップで入手
 </div>
 `;
 }

 return `
 <div class="bg-amber-50/90 border-3 border-[#2c1e16] rounded-2xl p-3 flex flex-col justify-between gap-2 shadow">
 <div class="flex items-center gap-3">
 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-1 shrink-0">
 <canvas id="ex-preview-${raw.id}" width="72" height="64" class="w-16 h-14 object-contain"></canvas>
 </div>
 <div class="min-w-0 flex-1">
 <div class="flex items-center gap-1.5 flex-wrap mb-1">
 <span class="text-[10px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full border border-[#2c1e16]">EX</span>
 ${conditionBadge}
 </div>
 <div class="font-black text-sm sm:text-base text-[#2c1e16] truncate">${raw.name}</div>
 <div class="text-[10px] font-bold text-stone-600 mt-0.5">
 HP:${spec.hp} / 攻撃:${spec.atk} / コスト:${spec.cost}円
 </div>
 <div class="text-[10px] font-black text-indigo-700 truncate mt-0.5">
 ${formatAbilitiesText(spec.abilities)}
 </div>
 </div>
 </div>
 <p class="text-[11px] font-bold text-stone-700 leading-snug bg-white/80 rounded-xl p-2 border border-amber-200">
 ${raw.desc || ''}
 </p>
 ${actionHtml}
 </div>
 `;
 }).join('');

 exAllies.forEach(raw => {
 const cvs = document.getElementById(`ex-preview-${raw.id}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 6);
 ctx.scale(0.82, 0.82);
 drawCharacterSprite(ctx, raw, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
 return;
 }

 // --- XPレベルアップ育成タブ ---
 const ownedList = allAllies.filter(a => userStore.ownedAllies[a.id] !== undefined);

 listEl.innerHTML = ownedList.map(raw => {
 const spec = getEffectiveAllySpec(raw);
 const lv = spec.level;
 const plus = spec.plusLv;
 const isMax = lv >= 30;
 const cost = getUpgradeCostForLevel(lv, spec.rarity);
 const canAfford = !isMax && (userStore.xp || 0) >= cost;

 return `
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 flex items-center justify-between gap-3 shadow-sm">
 <div class="flex items-center gap-3 min-w-0">
 <canvas id="upg-preview-${raw.id}" width="72" height="64" class="w-16 h-14 bg-amber-50 rounded-xl border-2 border-[#2c1e16] shrink-0"></canvas>
 <div class="min-w-0">
 <div class="flex items-center gap-1.5 flex-wrap">
 <span class="font-black text-sm sm:text-base text-[#2c1e16] truncate">${raw.name}</span>
 <span class="text-[10px] font-black bg-sky-200 text-sky-950 px-1.5 py-0.5 rounded border border-[#2c1e16]">Lv.${lv}${plus > 0 ? `+${plus}` : ''}</span>
 </div>
 <div class="text-[11px] font-bold text-stone-600 mt-0.5">
 HP: <span class="text-emerald-700 font-black">${spec.hp}</span> ／ 攻撃: <span class="text-rose-700 font-black">${spec.atk}</span>
 </div>
 <div class="text-[10px] font-bold text-indigo-700 truncate mt-0.5">
 ${formatAbilitiesText(spec.abilities)}
 </div>
 </div>
 </div>
 <button onclick="upgradeAllyUnit('${raw.id}')" ${canAfford ? '' : 'disabled'}
 class="game-btn shrink-0 px-3 py-2 rounded-xl font-black text-xs text-center ${isMax ? 'bg-amber-300 text-[#2c1e16]' : (canAfford ? 'bg-emerald-400 hover:bg-emerald-300 text-[#2c1e16]' : 'bg-stone-200 text-stone-500 opacity-65')}">
 ${isMax ? 'MAX Lv.30' : `<div>⬆️ レベルUP</div><div class="text-[10px]">✨ ${cost} XP</div>`}
 </button>
 </div>
 `;
 }).join('');

 ownedList.forEach(raw => {
 const cvs = document.getElementById(`upg-preview-${raw.id}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 6);
 const fitScale = raw.isBoss ? 0.52 : (raw.isRare ? 0.68 : 0.85);
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, raw, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
}


/* ----------------------------------------------------------------------------
 4. 福引ガチャモーダル ＆ 全画面リザルト画面
---------------------------------------------------------------------------- */
let lastGachaResults = [];
let selectedGachaIdx = 0;
let gachaSpinTimer = null;
let gachaResultTimer = null;

function getGachaBallInfo(rarity) {
  if (rarity === '伝説レア') {
    return {
      icon: '🌈',
      name: '🌈 虹玉',
      color: '#f43f5e',
      badge: 'bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 text-white',
      cardStyle: 'bg-gradient-to-br from-rose-100 via-amber-100 to-sky-100 border-rose-500',
      screenBg: 'from-rose-950/95 via-amber-950/95 to-indigo-950/95'
    };
  }
  if (rarity === '超激レア') {
    return {
      icon: '🟡',
      name: '🟡 金玉',
      color: '#facc15',
      badge: 'bg-amber-400 text-[#2c1e16]',
      cardStyle: 'bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100 border-amber-500',
      screenBg: 'from-amber-950/95 via-stone-900/95 to-orange-950/95'
    };
  }
  if (rarity === '激レア') {
    return {
      icon: '🔴',
      name: '🔴 赤玉',
      color: '#ef4444',
      badge: 'bg-purple-600 text-white',
      cardStyle: 'bg-gradient-to-b from-purple-50 to-white border-purple-500',
      screenBg: 'from-stone-900/95 via-purple-950/95 to-stone-900/95'
    };
  }
  return {
    icon: '⚪',
    name: '⚪ 白玉',
    color: '#ffffff',
    badge: 'bg-sky-200 text-sky-950',
    cardStyle: 'bg-white border-[#2c1e16]',
    screenBg: 'from-stone-900/95 via-amber-950/90 to-stone-900/95'
  };
}

function drawGachaMachine(angle = 0, glowColor = '#facc15', poppedBallColor = null) {
  const cvs = document.getElementById('gacha-canvas');
  if (!cvs) return;
  const ctx = cvs.getContext('2d');
  ctx.clearRect(0, 0, cvs.width, cvs.height);

  const cx = cvs.width / 2;
  const cy = cvs.height / 2 + 12;

  ctx.strokeStyle = '#2c1e16';
  ctx.lineWidth = 4;
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(cx - 58, cy + 54);
  ctx.lineTo(cx - 34, cy);
  ctx.lineTo(cx + 34, cy);
  ctx.lineTo(cx + 58, cy + 54);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(cx, cy - 12);
  ctx.rotate(angle);
  ctx.fillStyle = glowColor;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    const rx = Math.cos(a) * 52;
    const ry = Math.sin(a) * 52;
    if (i === 0) ctx.moveTo(rx, ry);
    else ctx.lineTo(rx, ry);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = '#fffbeb';
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  if (poppedBallColor) {
    ctx.save();
    const bx = cx + 48;
    const by = cy + 28;
    ctx.fillStyle = poppedBallColor;
    ctx.strokeStyle = '#2c1e16';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(bx, by, 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(bx - 6, by - 6, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function openGachaModal() {
  sound.playButton();
  ensureExtendedUserStore();
  updateKobanUI();
  drawGachaMachine(0, '#fde047', null);
  const resultsGrid = document.getElementById('gacha-results-grid');
  if (resultsGrid) {
    resultsGrid.innerHTML = '<div class="col-span-full text-center font-black text-stone-500 py-8">小判またはガチャチケットで強力なおもちを仲間にしよう！</div>';
  }
  document.getElementById('gacha-modal')?.classList.remove('hidden');
}

function closeGachaModal() {
  sound.playButton();
  if (gachaSpinTimer) clearInterval(gachaSpinTimer);
  if (gachaResultTimer) clearTimeout(gachaResultTimer);
  closeGachaResultScreen(true);
  document.getElementById('gacha-modal')?.classList.add('hidden');
}

// 試し引き用小判補充（index.html の onclick="addFreeKoban()" に対応）
function addFreeKoban(amount = 10000) {
  ensureExtendedUserStore();
  const addVal = (typeof amount === 'number' && !isNaN(amount) && amount > 0) ? amount : 10000;
  userStore.koban = (userStore.koban || 0) + addVal;

  saveUserStore(false);
  updateKobanUI();

  const altGachaEl = document.getElementById('gacha-koban-count');
  if (altGachaEl) altGachaEl.textContent = Math.floor(userStore.koban);

  if (typeof sound !== 'undefined') sound.playUpgrade();
  showToast('🪙 試し引き用小判 +' + addVal.toLocaleString() + '枚 を補充しました！', 'success');
}

const addTestKoban = addFreeKoban;

function rollGachaWithTicket() {
  rollGacha(1, true);
}

// 全画面リザルトオーバーレイを自動生成
function ensureGachaResultScreen() {
  let screen = document.getElementById('gacha-result-screen');
  if (screen) return screen;

  screen = document.createElement('div');
  screen.id = 'gacha-result-screen';
  screen.style.zIndex = '9999';
  screen.className = 'hidden fixed inset-0 bg-stone-950/95 backdrop-blur-sm flex flex-col items-center justify-between p-3 sm:p-5 overflow-y-auto';
  document.body.appendChild(screen);
  return screen;
}

function closeGachaResultScreen(silent = false) {
  if (!silent && typeof sound !== 'undefined') sound.playButton();
  const screen = document.getElementById('gacha-result-screen');
  if (screen) screen.classList.add('hidden');
  updateKobanUI();
}

function selectGachaResultCard(idx) {
  if (!lastGachaResults[idx]) return;
  sound.playButton();
  selectedGachaIdx = idx;
  renderGachaResultScreen();
}

function renderGachaResultScreen() {
  if (!lastGachaResults || lastGachaResults.length === 0) return;

  const screen = ensureGachaResultScreen();
  const rarityRank = { '伝説レア': 4, '超激レア': 3, '激レア': 2, 'レア': 1 };
  const sortedByRarity = [...lastGachaResults].sort(
    (a, b) => (rarityRank[b.unit.rarity] || 0) - (rarityRank[a.unit.rarity] || 0)
  );
  const topHit = sortedByRarity[0];
  const topBall = getGachaBallInfo(topHit.unit.rarity);

  // 背景色を最高レア度に合わせて変更
  screen.className = 'fixed inset-0 bg-gradient-to-b ' + topBall.screenBg + ' backdrop-blur-sm flex flex-col items-center justify-between p-3 sm:p-5 overflow-y-auto';

  // レア度ごとの獲得数集計
  const counts = { '伝説レア': 0, '超激レア': 0, '激レア': 0, 'レア': 0 };
  let newCount = 0;
  lastGachaResults.forEach(r => {
    if (counts[r.unit.rarity] !== undefined) counts[r.unit.rarity]++;
    if (r.isNew) newCount++;
  });

  const summaryList = [];
  if (counts['伝説レア'] > 0) summaryList.push('<span class="bg-gradient-to-r from-rose-500 via-amber-400 to-indigo-500 text-white px-2.5 py-1 rounded-full border border-white/40">🌈 伝説レア ×' + counts['伝説レア'] + '</span>');
  if (counts['超激レア'] > 0) summaryList.push('<span class="bg-amber-400 text-[#2c1e16] px-2.5 py-1 rounded-full border border-[#2c1e16]">🟡 超激レア ×' + counts['超激レア'] + '</span>');
  if (counts['激レア'] > 0) summaryList.push('<span class="bg-purple-600 text-white px-2.5 py-1 rounded-full border border-white/30">🔴 激レア ×' + counts['激レア'] + '</span>');
  if (counts['レア'] > 0) summaryList.push('<span class="bg-sky-200 text-sky-950 px-2.5 py-1 rounded-full border border-[#2c1e16]">⚪ レア ×' + counts['レア'] + '</span>');
  if (newCount > 0) summaryList.push('<span class="bg-rose-500 text-white px-2.5 py-1 rounded-full border border-white/40">✨ NEW ×' + newCount + '</span>');

  const isSingle = lastGachaResults.length === 1;
  const gridClass = isSingle
    ? 'grid grid-cols-1 max-w-md w-full mx-auto my-auto'
    : 'grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3 max-w-5xl w-full mx-auto my-auto';

  const cardsHtml = lastGachaResults.map((res, idx) => {
    const u = res.unit;
    const ball = getGachaBallInfo(u.rarity);
    const isSelected = idx === selectedGachaIdx;
    const ringClass = (!isSingle && isSelected) ? 'ring-4 ring-amber-300 scale-[1.03]' : 'hover:scale-[1.02]';
    const badgeStatus = res.isNew
      ? '<span class="bg-rose-500 text-white text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full">NEW!</span>'
      : '<span class="bg-emerald-300 text-[#2c1e16] text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full">+' + res.plusLv + '</span>';

    const cvsSize = isSingle ? 'width="160" height="135" class="w-36 h-32 my-2"' : 'width="104" height="88" class="w-20 h-16 sm:w-24 sm:h-20 my-1"';
    const nameSize = isSingle ? 'text-lg sm:text-xl' : 'text-xs sm:text-sm';

    return `
      <button type="button" onclick="selectGachaResultCard(${idx})"
        class="${ball.cardStyle} ${ringClass} border-4 rounded-2xl p-2.5 sm:p-3 flex flex-col items-center justify-between text-center shadow-xl transition cursor-pointer">
        <div class="w-full flex items-center justify-between gap-1">
          <span class="${ball.badge} text-[10px] sm:text-xs font-black px-2 py-0.5 rounded-full border border-[#2c1e16]">
            ${ball.icon} ${u.rarity}
          </span>
          ${badgeStatus}
        </div>
        <canvas id="gacha-screen-cvs-${idx}" ${cvsSize}></canvas>
        <div class="w-full">
          <div class="font-black ${nameSize} text-[#2c1e16] truncate">${u.name}</div>
          <div class="text-[10px] font-bold text-stone-600">コスト ${u.cost}円</div>
        </div>
      </button>
    `;
  }).join('');

  // 選択中キャラの詳細情報バー
  const selectedRes = lastGachaResults[selectedGachaIdx] || topHit;
  const selSpec = getEffectiveAllySpec(selectedRes.unit);
  const selBall = getGachaBallInfo(selSpec.rarity);

  const currentKoban = Math.floor(userStore.koban || 0);
  const currentTickets = Math.floor(userStore.gachaTickets || 0);

  screen.innerHTML = `
    <div class="w-full max-w-5xl mx-auto text-center space-y-2 pt-1">
      <div class="inline-block bg-amber-400 text-[#2c1e16] font-black text-xs sm:text-sm px-4 py-1 rounded-full border-2 border-[#2c1e16] shadow">
        🎊 福引結果発表（全${lastGachaResults.length}体獲得） 🎊
      </div>
      <div class="flex flex-wrap items-center justify-center gap-1.5 text-xs font-black">
        ${summaryList.join('')}
      </div>
    </div>

    <div class="${gridClass} py-3">
      ${cardsHtml}
    </div>

    <div class="w-full max-w-5xl mx-auto space-y-2.5 pb-1">
      <div class="bg-white/95 border-3 border-[#2c1e16] rounded-2xl px-3.5 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2 shadow-lg">
        <div class="flex flex-wrap items-center gap-2 text-left">
          <span class="${selBall.badge} text-xs font-black px-2.5 py-0.5 rounded-full border border-[#2c1e16]">${selBall.icon} ${selSpec.rarity}</span>
          <span class="font-black text-sm sm:text-base text-[#2c1e16]">${selSpec.name}</span>
          <span class="text-xs font-black text-stone-700">❤️HP:${selSpec.hp} ／ ⚔️攻撃:${selSpec.atk} ／ 💴${selSpec.cost}円</span>
        </div>
        <div class="text-xs font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-200">
          ✨ ${formatAbilitiesText(selSpec.abilities)}
        </div>
      </div>

      <div class="flex flex-wrap items-center justify-center gap-2.5">
        <button type="button" onclick="rollGacha(1, false)"
          class="bg-amber-400 hover:bg-amber-300 active:translate-y-0.5 text-[#2c1e16] font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl border-3 border-[#2c1e16] shadow-md cursor-pointer">
          🪙 もう1回 (1,000小判)
        </button>
        <button type="button" onclick="rollGacha(10, false)"
          class="bg-gradient-to-r from-amber-400 to-orange-400 hover:brightness-105 active:translate-y-0.5 text-[#2c1e16] font-black text-xs sm:text-sm px-4 py-2.5 rounded-2xl border-3 border-[#2c1e16] shadow-md cursor-pointer">
          🔥 もう10連 (10,000小判)
        </button>
        <button type="button" onclick="closeGachaResultScreen()"
          class="bg-emerald-500 hover:bg-emerald-400 active:translate-y-0.5 text-white font-black text-sm sm:text-base px-6 py-2.5 rounded-2xl border-3 border-[#2c1e16] shadow-md cursor-pointer">
          ✔ OK（戻る）
        </button>
      </div>
      <div class="text-center text-xs font-black text-amber-200">
        所持小判: ${currentKoban.toLocaleString()}枚 ／ ガチャチケット: ${currentTickets}枚
      </div>
    </div>
  `;

  screen.classList.remove('hidden');

  // 全員分のキャラ画像をキャンバスに描画
  lastGachaResults.forEach((res, idx) => {
    const cvs = document.getElementById('gacha-screen-cvs-' + idx);
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    ctx.clearRect(0, 0, cvs.width, cvs.height);
    ctx.save();
    ctx.translate(cvs.width / 2, cvs.height - 8);
    const baseScale = isSingle ? 1.35 : 0.95;
    const unitScale = res.unit.isBoss ? 0.65 : (res.unit.isRare ? 0.85 : 1.0);
    ctx.scale(baseScale * unitScale, baseScale * unitScale);
    drawCharacterSprite(ctx, res.unit, { time: 0.4, state: 'IDLE' });
    ctx.restore();
  });
}

function rollGacha(count, useTicket = false) {
  ensureExtendedUserStore();

  if (useTicket) {
    const currentTickets = Math.floor(userStore.gachaTickets || 0);
    if (currentTickets < count) {
      showToast('ガチャチケットが足りません！ステージ報酬で手に入れよう！', 'error');
      return;
    }
    const ok = confirm(
      '🎫 ガチャチケット ' + count + '枚 を消費して福引を引きますか？\n' +
      '（所持チケット: ' + currentTickets + '枚 → ' + (currentTickets - count) + '枚）'
    );
    if (!ok) return;

    userStore.gachaTickets = currentTickets - count;
  } else {
    const cost = count * 1000;
    const currentKoban = Math.floor(userStore.koban || 0);
    if (currentKoban < cost) {
      showToast('小判が足りません！（必要: ' + cost.toLocaleString() + '枚）', 'error');
      return;
    }
    const ok = confirm(
      '🪙 小判 ' + cost.toLocaleString() + '枚 を消費して福引（' + count + '回）を引きますか？\n' +
      '（所持小判: ' + currentKoban.toLocaleString() + '枚 → ' + (currentKoban - cost).toLocaleString() + '枚）'
    );
    if (!ok) return;

    userStore.koban = currentKoban - cost;
  }

  saveUserStore();
  updateKobanUI();
  sound.playGachaSpin();

  if (gachaSpinTimer) clearInterval(gachaSpinTimer);
  if (gachaResultTimer) clearTimeout(gachaResultTimer);

  // 連続ガチャ時は一度リザルト画面を閉じて福引機の回転を見せる
  closeGachaResultScreen(true);

  const resultsGrid = document.getElementById('gacha-results-grid');
  if (resultsGrid) {
    resultsGrid.innerHTML = '<div class="col-span-full text-center font-black text-amber-700 text-base py-10 animate-pulse">ガラガラガラ……ポンッ！！</div>';
  }

  let spinStep = 0;
  gachaSpinTimer = setInterval(() => {
    spinStep++;
    drawGachaMachine(spinStep * 0.75, '#fb923c', null);
    if (spinStep >= 8) clearInterval(gachaSpinTimer);
  }, 55);

  const allAllies = getAllAllies();
  const legendRarePool = allAllies.filter(u => u.rarity === '伝説レア');
  const ultraRarePool = allAllies.filter(u => u.rarity === '超激レア');
  const superRarePool = allAllies.filter(u => u.rarity === '激レア');
  const rarePool = allAllies.filter(u => u.rarity === 'レア');

  const results = [];
  for (let i = 0; i < count; i++) {
    const r = Math.random();
    let pool = rarePool;
    const isGuaranteedSlot = count === 10 && i === 9;

    if (r < 0.005 && legendRarePool.length > 0) {
      pool = legendRarePool;
    } else if (r < 0.05 && ultraRarePool.length > 0) {
      pool = ultraRarePool;
    } else if ((isGuaranteedSlot || r < 0.30) && superRarePool.length > 0) {
      pool = superRarePool;
    }

    if (!pool || pool.length === 0) {
      pool = rarePool.length > 0 ? rarePool : allAllies.filter(u => u.rarity !== 'EX');
    }
    const picked = pool[Math.floor(Math.random() * pool.length)];
    const isNew = userStore.ownedAllies[picked.id] === undefined;
    if (isNew) {
      userStore.ownedAllies[picked.id] = 0;
      userStore.allyLevels[picked.id] = 1;
    } else {
      userStore.ownedAllies[picked.id] += 1;
    }
    results.push({ unit: picked, isNew, plusLv: userStore.ownedAllies[picked.id] });
  }

  saveUserStore();

  gachaResultTimer = setTimeout(() => {
    lastGachaResults = results;

    const rarityRank = { '伝説レア': 4, '超激レア': 3, '激レア': 2, 'レア': 1 };
    let bestIdx = 0;
    let bestScore = -1;
    results.forEach((res, idx) => {
      const sc = (rarityRank[res.unit.rarity] || 0) * 10 + (res.isNew ? 1 : 0);
      if (sc > bestScore) {
        bestScore = sc;
        bestIdx = idx;
      }
    });
    selectedGachaIdx = bestIdx;

    const bestUnit = results[bestIdx].unit;
    const bestBall = getGachaBallInfo(bestUnit.rarity);

    if (bestUnit.rarity === '伝説レア') {
      sound.playVictory();
      drawGachaMachine(0, '#f43f5e', bestBall.color);
    } else if (bestUnit.rarity === '超激レア') {
      sound.playVictory();
      drawGachaMachine(0, '#facc15', bestBall.color);
    } else {
      drawGachaMachine(0, '#fde047', bestBall.color);
    }

    // 全画面の結果画面へ切り替え
    renderGachaResultScreen();
  }, 480);
}



/* ----------------------------------------------------------------------------
 5. 10体デッキ編成モーダル（#deck-current-slots / #deck-available-list）
---------------------------------------------------------------------------- */
function openDeckModal() {
 sound.playButton();
 ensureExtendedUserStore();
 editingDeckIds = new Array(10).fill(null);
 for (let i = 0; i < 10; i++) {
 editingDeckIds[i] = userStore.deckIds[i] || null;
 }
 selectedDeckSlotIdx = 0;
 renderDeckModal();
 document.getElementById('deck-modal')?.classList.remove('hidden');
}

function closeDeckModal() {
 sound.playButton();
 document.getElementById('deck-modal')?.classList.add('hidden');
}

function selectDeckSlot(idx) {
 sound.playButton();
 selectedDeckSlotIdx = idx;
 renderDeckModal();
}

function clearSelectedDeckSlot() {
 sound.playButton();
 if (editingDeckIds.filter(Boolean).length <= 1 && editingDeckIds[selectedDeckSlotIdx]) {
 showToast('最低1体はデッキに残す必要があります！', 'error');
 return;
 }
 editingDeckIds[selectedDeckSlotIdx] = null;
 commitDeckChanges();
 renderDeckModal();
}

function autoFillDeck() {
 sound.playUpgrade();
 ensureExtendedUserStore();
 const owned = getAllAllies()
 .filter(a => userStore.ownedAllies[a.id] !== undefined)
 .map(a => getEffectiveAllySpec(a))
 .sort((a, b) => (b.hp + b.atk * 3) - (a.hp + a.atk * 3));

 const nextDeck = new Array(10).fill(null);
 owned.slice(0, 10).forEach((u, i) => { nextDeck[i] = u.id; });
 editingDeckIds = nextDeck;
 commitDeckChanges();
 renderDeckModal();
 showToast('⚡ 強力なおもちを自動編成しました！', 'success');
}

function assignUnitToDeck(unitId) {
 sound.playButton();
 const existingIdx = editingDeckIds.indexOf(unitId);
 if (existingIdx !== -1 && existingIdx !== selectedDeckSlotIdx) {
 editingDeckIds[existingIdx] = editingDeckIds[selectedDeckSlotIdx];
 }
 editingDeckIds[selectedDeckSlotIdx] = unitId;

 commitDeckChanges();

 const nextEmpty = editingDeckIds.findIndex(id => !id);
 if (nextEmpty !== -1) {
 selectedDeckSlotIdx = nextEmpty;
 }
 renderDeckModal();
}

function commitDeckChanges() {
 if (!editingDeckIds.some(Boolean)) return;
 userStore.deckIds = [...editingDeckIds];
 userStore.deck = [...editingDeckIds];
 saveUserStore();
}

function renderDeckModal() {
 const slotsContainer = document.getElementById('deck-current-slots');
 const ownedContainer = document.getElementById('deck-available-list');
 if (!slotsContainer || !ownedContainer) return;

 const allAllies = getAllAllies();
 const allyMap = new Map(allAllies.map(a => [a.id, a]));

 slotsContainer.innerHTML = editingDeckIds.map((id, idx) => {
 const raw = id ? allyMap.get(id) : null;
 const spec = raw ? getEffectiveAllySpec(raw) : null;
 const isSelected = idx === selectedDeckSlotIdx;
 const borderStyle = isSelected
 ? 'border-amber-500 ring-4 ring-amber-300 bg-amber-50'
 : 'border-[#2c1e16] bg-white hover:bg-amber-50/60';

 if (!spec) {
 return `
 <div onclick="selectDeckSlot(${idx})"
 class="cursor-pointer border-3 border-dashed ${borderStyle} rounded-2xl p-2 flex flex-col items-center justify-center min-h-[88px]">
 <span class="text-[10px] font-black text-stone-400">枠 ${idx + 1}</span>
 <span class="text-xs font-black text-stone-500 mt-1">＋ 選択</span>
 </div>
 `;
 }

 return `
 <div onclick="selectDeckSlot(${idx})"
 class="relative cursor-pointer border-3 ${borderStyle} rounded-2xl p-1.5 flex flex-col items-center justify-between min-h-[88px]">
 <div class="w-full flex justify-between items-center">
 <span class="text-[9px] font-black bg-[#2c1e16] text-amber-300 px-1.5 rounded">枠${idx + 1}</span>
 <span class="text-[9px] font-black text-amber-700">${spec.cost}円</span>
 </div>
 <canvas id="deck-slot-cvs-${idx}" width="64" height="50" class="w-11 h-9 my-0.5"></canvas>
 <div class="text-[10px] font-black text-[#2c1e16] truncate w-full text-center">${spec.name}</div>
 </div>
 `;
 }).join('');

 const ownedAllies = allAllies.filter(a => userStore.ownedAllies[a.id] !== undefined);
 ownedContainer.innerHTML = ownedAllies.map(raw => {
 const spec = getEffectiveAllySpec(raw);
 const inDeckIdx = editingDeckIds.indexOf(spec.id);
 const isEquipped = inDeckIdx !== -1;

 return `
 <button onclick="assignUnitToDeck('${spec.id}')"
 class="game-btn relative ${isEquipped ? 'bg-emerald-100 border-emerald-600' : 'bg-white'} rounded-2xl p-2 flex flex-col items-center text-center">
 ${isEquipped ? `<span class="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 rounded">枠${inDeckIdx + 1}</span>` : ''}
 <span class="self-start text-[9px] font-black bg-amber-200 text-[#2c1e16] px-1.5 rounded">${spec.rarity}</span>
 <canvas id="deck-owned-cvs-${spec.id}" width="72" height="58" class="w-14 h-11 my-0.5"></canvas>
 <div class="font-black text-xs text-[#2c1e16] truncate w-full">${spec.name}</div>
 <div class="text-[10px] font-bold text-stone-600">Lv.${spec.level}${spec.plusLv > 0 ? `+${spec.plusLv}` : ''} / ${spec.cost}円</div>
 </button>
 `;
 }).join('');

 editingDeckIds.forEach((id, idx) => {
 if (!id) return;
 const spec = allyMap.get(id);
 const cvs = document.getElementById(`deck-slot-cvs-${idx}`);
 if (!spec || !cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 5);
 const fitScale = spec.isBoss ? 0.45 : (spec.isRare ? 0.6 : 0.78);
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, spec, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });

 ownedAllies.forEach(spec => {
 const cvs = document.getElementById(`deck-owned-cvs-${spec.id}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 5);
 const fitScale = spec.isBoss ? 0.48 : (spec.isRare ? 0.65 : 0.82);
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, spec, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
}

/* ----------------------------------------------------------------------------
 6. おもち図鑑モーダル（#encyclopedia-modal / #tab-allies / #tab-enemies / #encyclopedia-list）
---------------------------------------------------------------------------- */
function openEncyclopedia(tab = 'allies') {
 sound.playButton();
 ensureExtendedUserStore();
 switchEncyclopediaTab(tab === 'enemies' ? 'enemies' : 'allies', true);
 document.getElementById('encyclopedia-modal')?.classList.remove('hidden');
}

function closeEncyclopedia() {
 sound.playButton();
 document.getElementById('encyclopedia-modal')?.classList.add('hidden');
}

function switchEncyclopediaTab(tab, silent = false) {
 if (!silent) sound.playButton();
 currentDexTab = tab === 'enemies' ? 'enemies' : 'allies';

 const allyBtn = document.getElementById('tab-allies');
 const enemyBtn = document.getElementById('tab-enemies');
 if (allyBtn && enemyBtn) {
 if (currentDexTab === 'allies') {
 allyBtn.className = 'px-4 py-1.5 rounded-xl font-black text-sm bg-[#2c1e16] text-amber-300 border-2 border-[#2c1e16]';
 enemyBtn.className = 'px-4 py-1.5 rounded-xl font-black text-sm bg-white text-[#2c1e16] border-2 border-[#2c1e16]';
 } else {
 enemyBtn.className = 'px-4 py-1.5 rounded-xl font-black text-sm bg-[#2c1e16] text-amber-300 border-2 border-[#2c1e16]';
 allyBtn.className = 'px-4 py-1.5 rounded-xl font-black text-sm bg-white text-[#2c1e16] border-2 border-[#2c1e16]';
 }
 }
 renderDexGrid();
}

// 互換エイリアス
const openDexModal = openEncyclopedia;
const closeDexModal = closeEncyclopedia;
const switchDexTab = switchEncyclopediaTab;

function renderDexGrid() {
 const grid = document.getElementById('encyclopedia-list');
 if (!grid) return;

 if (currentDexTab === 'allies') {
 const allAllies = getAllAllies();
 grid.innerHTML = allAllies.map((raw, idx) => {
 const isOwned = userStore.ownedAllies[raw.id] !== undefined;
 const spec = getEffectiveAllySpec(raw);
 const abilityStr = formatAbilitiesText(spec.abilities);
 const statusBadge = isOwned
 ? `<span class="text-[10px] font-black bg-emerald-300 text-[#2c1e16] px-2 py-0.5 rounded-full border border-[#2c1e16]">Lv.${spec.level}${spec.plusLv > 0 ? `+${spec.plusLv}` : ''}</span>`
 : `<span class="text-[10px] font-black bg-stone-300 text-stone-700 px-2 py-0.5 rounded-full">未所持</span>`;

 return `
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 flex flex-col justify-between shadow-sm ${isOwned ? '' : 'opacity-75'}">
 <div>
 <div class="flex items-center justify-between gap-1 mb-1">
 <span class="text-[10px] font-black bg-amber-200 text-[#2c1e16] px-2 py-0.5 rounded-full border border-[#2c1e16]">${spec.rarity}</span>
 ${statusBadge}
 </div>
 <div class="flex items-center gap-3 my-1.5">
 <canvas id="dex-ally-cvs-${idx}" width="84" height="72" class="w-20 h-16 bg-amber-50 rounded-xl border-2 border-[#2c1e16] shrink-0"></canvas>
 <div class="min-w-0">
 <div class="font-black text-base text-[#2c1e16] truncate">${spec.name}</div>
 <div class="text-[11px] font-bold text-stone-600 mt-0.5">
 コスト:${spec.cost}円 / 射程:${spec.range}
 </div>
 <div class="text-[11px] font-bold text-stone-600">
 HP:${spec.hp} / 攻撃:${spec.atk}
 </div>
 </div>
 </div>
 <div class="bg-indigo-50 border border-indigo-200 rounded-xl px-2 py-1 text-[10px] font-black text-indigo-900 mb-1.5">
 ✨ ${abilityStr}
 </div>
 </div>
 <p class="text-[11px] font-bold text-stone-700 leading-relaxed bg-amber-50/70 rounded-xl p-2 border border-amber-200">
 ${spec.desc || 'オリジナルのおもちキャラクター。'}
 </p>
 </div>
 `;
 }).join('');

 allAllies.forEach((spec, idx) => {
 const cvs = document.getElementById(`dex-ally-cvs-${idx}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 6);
 const fitScale = spec.isBoss ? 0.55 : (spec.isRare ? 0.72 : 0.9);
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, spec, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
 } else {
 const enemiesList = Object.values(getAllEnemiesMap());
 grid.innerHTML = enemiesList.map((e, idx) => {
 const tr = TRAIT_INFO[e.trait || 'white'] || TRAIT_INFO.white;
 const abilityStr = formatAbilitiesText(e.abilities);

 return `
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 flex flex-col justify-between shadow-sm">
 <div>
 <div class="flex items-center justify-between gap-1 mb-1">
 <span class="${tr.badgeClass} text-[10px] font-black px-2 py-0.5 rounded-full border">${tr.icon} ${tr.label}</span>
 <span class="text-[10px] font-black bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">${e.tag || '敵キャラ'}</span>
 </div>
 <div class="flex items-center gap-3 my-1.5">
 <canvas id="dex-enemy-cvs-${idx}" width="84" height="72" class="w-20 h-16 bg-rose-50 rounded-xl border-2 border-[#2c1e16] shrink-0"></canvas>
 <div class="min-w-0">
 <div class="font-black text-base text-[#2c1e16] truncate">${e.name}</div>
 <div class="text-[11px] font-bold text-stone-600 mt-0.5">
 HP:${e.hp} / 攻撃:${e.atk}
 </div>
 <div class="text-[11px] font-bold text-stone-600">
 射程:${e.range} / 撃破:${e.reward || 50}円
 </div>
 </div>
 </div>
 <div class="bg-rose-50 border border-rose-200 rounded-xl px-2 py-1 text-[10px] font-black text-rose-900 mb-1.5">
 ⚠️ ${abilityStr}
 </div>
 </div>
 <p class="text-[11px] font-bold text-stone-700 leading-relaxed bg-stone-50 rounded-xl p-2 border border-stone-200">
 ${e.desc || 'スイーツ軍団のライバルキャラクター。'}
 </p>
 </div>
 `;
 }).join('');

 enemiesList.forEach((e, idx) => {
 const cvs = document.getElementById(`dex-enemy-cvs-${idx}`);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);
 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 6);
 const fitScale = e.isBoss ? 0.5 : 0.85;
 ctx.scale(fitScale, fitScale);
 drawCharacterSprite(ctx, e, { time: 0.4, state: 'IDLE' });
 ctx.restore();
 });
 }
}

/* ----------------------------------------------------------------------------
 7. 初期セットアップ＆キーボードショートカット
---------------------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
 ensureExtendedUserStore();
 updateKobanUI();
 renderStageSelectGrid();
});

window.addEventListener('keydown', (e) => {
 if (gameState.screen !== 'BATTLE') return;
 if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') {
 togglePause();
 return;
 }
 if (e.key >= '1' && e.key <= '9') {
 deployUnit(parseInt(e.key, 10) - 1);
 } else if (e.key === '0') {
 deployUnit(9);
 }
});

