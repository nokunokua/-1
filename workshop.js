/* ============================================================================
 おもち大戦争 - 5. ステージ・味方・敵 大工房エディタ（見た目・トリガー・性能フル編集）
 (import/export 不使用・グローバル定義)
============================================================================ */

let currentWorkshopTab = 'stage';
let workshopPreviewTime = 0;
let workshopPreviewAnimMode = 'WALK';

let stageDraft = null;
let allyDraft = null;
let enemyDraft = null;

const ALLY_SHAPES = [
 { value: 'maru', label: '丸もち' },
 { value: 'kapikapi', label: 'カピカピもち' },
 { value: 'isobe', label: '磯辺焼き番長' },
 { value: 'kimo', label: 'キモもち（美脚）' },
 { value: 'noshimochi', label: 'のしもち（板状）' },
 { value: 'kinako', label: 'きなこもち' },
 { value: 'yomogi', label: 'よもぎもち' },
 { value: 'oshiruko', label: 'おしるこ椀' },
 { value: 'sakura', label: '桜もち' },
 { value: 'abekawa', label: '安倍川もち' },
 { value: 'kinchaku', label: 'もち巾着' },
 { value: 'cheese', label: 'チーズもち' },
 { value: 'chikara', label: '力もち' },
 { value: 'warabi', label: 'わらびもち忍者' },
 { value: 'kusa_daifuku', label: '豆大福将軍' },
 { value: 'zunda', label: 'ずんだ破壊神' },
 { value: 'ichigo_hime', label: 'いちご大福姫' },
 { value: 'oshougatsu', label: '黄金鏡餅神' },
 { value: 'kagami_dragon', label: '昇龍鏡餅' },
 { value: 'momo_tengu', label: '桃太郎きびだんご' },
 { value: 'ex_kagami_knight', label: '【EX】鏡餅ナイト' },
 { value: 'ex_botamochi', label: '【EX】ぼたもち仙人' },
 { value: 'ex_kashiwa', label: '【EX】かしわもち剣豪' },
 { value: 'ex_mitarashi', label: '【EX】みたらし団子三兄弟' },
 { value: 'ex_yakimochi', label: '【EX】燃える焼きもち番長' },
 { value: 'legend_amaterasu', label: '【伝説】天照鏡餅神' },
 { value: 'legend_galaxy_mochi', label: '【伝説】銀河創世もち' },
 { value: 'emoji', label: '✨ 絵文字スタンプ' },
 { value: 'image', label: '📷 アップロード画像' }
];

const ENEMY_SHAPES = [
 { value: 'cookie_soldier', label: 'クッキー兵' },
 { value: 'potechi', label: 'ポテチ野郎' },
 { value: 'cream', label: 'チョコスライム' },
 { value: 'macaron_cavalry', label: 'マカロン騎兵' },
 { value: 'habanero_senbei', label: 'ハバネロせんべい' },
 { value: 'dorayaki_samurai', label: 'どら焼き侍' },
 { value: 'cake', label: 'ショートケーキ魔導士' },
 { value: 'boss_cooker', label: '暴走炊飯器' },
 { value: 'boss_mikan', label: 'ミカン星人UFO' },
 { value: 'boss_kuromame', label: '黒豆将軍' },
 { value: 'boss_potechi_bancho', label: '激辛ポテチ番長' },
 { value: 'boss_garigari', label: '氷柱巨人ガリガリ' },
 { value: 'boss_ozouni', label: 'お雑煮大魔王' },
 { value: 'boss_taiyaki', label: '黄金たい焼き大帝' },
 { value: 'ice_parfait', label: '極寒パフェ女王' },
 { value: 'boss_wagashi_god', label: '甘味神スイーツゼウス' },
 { value: 'emoji', label: '✨ 絵文字スタンプ' },
 { value: 'image', label: '📷 アップロード画像' }
];

const ACCESSORY_OPTIONS = [
 { value: 'none', label: 'なし' },
 { value: 'mikan', label: '🍊 乗せみかん' },
 { value: 'crown', label: '👑 黄金の王冠' },
 { value: 'nori', label: '⬛ 焼き海苔巻き' },
 { value: 'zunda', label: '🟢 ずんだ餡のせ' }
];

const ATTACK_ANIM_OPTIONS = [
 { value: 'default', label: '標準（キャラ固有モーション）' },
 { value: 'lunge', label: '💨 突進タックル' },
 { value: 'stretch', label: '🍡 おもち超伸縮パンチ' },
 { value: 'slam', label: '💥 大ジャンプ叩きつけ' },
 { value: 'spin', label: '🌀 高速スピン斬り' },
 { value: 'beam', label: '⚡ エネルギービーム照射' },
 { value: 'meteor', label: '☄️ 天罰メテオ爆発' }
];

const ABILITY_TRIGGER_OPTIONS = [
 { value: 'always', label: '常時発動（最初から有効）', hasVal: false },
 { value: 'hp_below', label: 'HPが指定％以下の時', hasVal: true, unit: '%以下', def: 50 },
 { value: 'hp_above', label: 'HPが指定％以上の時', hasVal: true, unit: '%以上', def: 70 },
 { value: 'after_kb', label: '指定回数ノックバック後', hasVal: true, unit: '回以上', def: 1 },
 { value: 'elapsed_time', label: '出撃から指定秒数経過後', hasVal: true, unit: '秒後', def: 10 }
];

const ABILITY_CATALOG = Object.keys(ABILITY_INFO || {}).map(k => ({
 key: k,
 label: ABILITY_INFO[k].label,
 desc: ABILITY_INFO[k].desc,
 isSelfBuff: !!ABILITY_INFO[k].isSelfBuff
}));

/* ----------------------------------------------------------------------------
 1. ドラフト初期化ヘルパー
---------------------------------------------------------------------------- */
function createDefaultStageDraft(category = 'custom') {
 return {
 editingId: null,
 isOfficialSlot: category === 'official',
 chapter: category === 'official' ? 'EX特別章' : '自作ステージ',
 title: 'オリジナルおもち大決戦',
 difficulty: 3,
 theme: 'kitchen',
 enemyBaseName: 'スイーツ要塞城',
 enemyBaseHp: 5000,
 rewardKoban: 600,
 rewardKobanChance: 100,
 rewardXp: 500,
 rewardXpChance: 100,
 rewardTicket: 1,
 rewardTicketChance: 50,
 dropAllyId: '',
 dropChance: 25,
 spawns: [
 { enemyId: 'cookie_soldier', magnification: 100, startTime: 1.0, interval: 3.5, maxCount: 0, baseHpTrigger: 100, isBoss: false, guardBase: false },
 { enemyId: 'boss_cooker', magnification: 100, startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 75, isBoss: true, guardBase: false }
 ]
 };
}

function createDefaultAllyDraft() {
 return {
 editingId: null,
 isOfficial: false,
 name: 'カスタム大福もち',
 rarity: '激レア',
 shape: 'maru',
 attackAnim: 'default',
 emoji: '🍡',
 imageData: '',
 bodyColor: '#fffdf9',
 accessory: 'mikan',
 scale: 1.0,
 cost: 450,
 cooldown: 5.5,
 hp: 650,
 atk: 160,
 range: 120,
 speed: 75,
 attackInterval: 1.5,
 windup: 0.35,
 kb: 3,
 aoe: true,
 abilities: [],
 desc: '大工房で誕生したオリジナルおもち戦士！'
 };
}

function createDefaultEnemyDraft() {
 return {
 editingId: null,
 isOfficial: false,
 name: 'カスタム魔王スイーツ',
 trait: 'sweet',
 tag: 'オリジナル敵',
 isBoss: false,
 shape: 'cake',
 attackAnim: 'default',
 emoji: '🍰',
 imageData: '',
 bodyColor: '#f472b6',
 accessory: 'crown',
 scale: 1.0,
 hp: 1800,
 atk: 140,
 range: 110,
 speed: 60,
 attackInterval: 1.7,
 windup: 0.35,
 kb: 3,
 aoe: true,
 reward: 220,
 abilities: [],
 desc: '大工房で生み出された強力なライバルキャラクター！'
 };
}

/* ----------------------------------------------------------------------------
 2. モーダル開閉＆タブ切替（openWorkshop / closeWorkshop 対応）
---------------------------------------------------------------------------- */
function openWorkshop(tab = 'stage') {
 sound.playButton();
 ensureExtendedUserStore();
 if (!stageDraft) stageDraft = createDefaultStageDraft('custom');
 if (!allyDraft) allyDraft = createDefaultAllyDraft();
 if (!enemyDraft) enemyDraft = createDefaultEnemyDraft();

 switchWorkshopTab(tab, true);
 document.getElementById('workshop-modal')?.classList.remove('hidden');
}

function closeWorkshop() {
 sound.playButton();
 document.getElementById('workshop-modal')?.classList.add('hidden');
 if (typeof renderStageSelectGrid === 'function') renderStageSelectGrid();
 if (typeof refreshExtendedBadges === 'function') refreshExtendedBadges();
}

// 互換エイリアス
const openWorkshopModal = openWorkshop;
const closeWorkshopModal = closeWorkshop;

function switchWorkshopTab(tab, silent = false) {
 if (!silent) sound.playButton();
 currentWorkshopTab = tab;

 const tabs = ['stage', 'ally', 'enemy', 'manage'];
 tabs.forEach(t => {
 const btn = document.getElementById(`ws-tab-${t}`);
 if (!btn) return;
 if (t === tab) {
 btn.className = 'py-2 rounded-xl font-black border-2 border-[#2c1e16] bg-[#2c1e16] text-amber-300 shrink-0';
 } else {
 btn.className = 'py-2 rounded-xl font-black border-2 border-[#2c1e16] bg-white text-[#2c1e16] hover:bg-amber-100 shrink-0';
 }
 });

 renderWorkshopContent();
}



function updateWorkshopPreview(dt) {
 workshopPreviewTime += dt;
 const modal = document.getElementById('workshop-modal');
 if (!modal || modal.classList.contains('hidden')) return;

 if (currentWorkshopTab === 'ally' && allyDraft) {
 drawWorkshopUnitPreview('ws-ally-preview-canvas', allyDraft);
 } else if (currentWorkshopTab === 'enemy' && enemyDraft) {
 drawWorkshopUnitPreview('ws-enemy-preview-canvas', enemyDraft);
 }
}

function drawWorkshopUnitPreview(canvasId, spec) {
 const cvs = document.getElementById(canvasId);
 if (!cvs) return;
 const ctx = cvs.getContext('2d');
 ctx.clearRect(0, 0, cvs.width, cvs.height);

 ctx.fillStyle = '#fef3c7';
 ctx.fillRect(0, cvs.height - 18, cvs.width, 18);
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(0, cvs.height - 18);
 ctx.lineTo(cvs.width, cvs.height - 18);
 ctx.stroke();

 ctx.save();
 ctx.translate(cvs.width / 2, cvs.height - 20);
 const baseFit = spec.isBoss ? 0.85 : 1.15;
 ctx.scale(baseFit, baseFit);

 const animProgress = workshopPreviewAnimMode === 'ATTACK'
 ? (workshopPreviewTime * 1.1) % 1
 : 0;

 drawCharacterSprite(ctx, spec, {
 time: workshopPreviewTime,
 state: workshopPreviewAnimMode,
 animProgress
 });
 ctx.restore();
}

function handleWorkshopImageUpload(event, targetKind) {
 const file = event.target.files?.[0];
 if (!file) return;

 const reader = new FileReader();
 reader.onload = (e) => {
 const img = new Image();
 img.onload = () => {
 const maxDim = 180;
 let w = img.width;
 let h = img.height;
 if (w > maxDim || h > maxDim) {
 if (w > h) {
 h = Math.round((h * maxDim) / w);
 w = maxDim;
 } else {
 w = Math.round((w * maxDim) / h);
 h = maxDim;
 }
 }
 const off = document.createElement('canvas');
 off.width = w;
 off.height = h;
 const octx = off.getContext('2d');
 octx.drawImage(img, 0, 0, w, h);
 const dataUrl = off.toDataURL('image/png', 0.85);

 if (targetKind === 'ally' && allyDraft) {
 allyDraft.imageData = dataUrl;
 allyDraft.shape = 'image';
 } else if (targetKind === 'enemy' && enemyDraft) {
 enemyDraft.imageData = dataUrl;
 enemyDraft.shape = 'image';
 }
 renderWorkshopContent();
 showToast('画像を読み込みました！', 'success');
 };
 img.src = e.target.result;
 };
 reader.readAsDataURL(file);
}

/* ----------------------------------------------------------------------------
 3. メイン描画ディスパッチャ
---------------------------------------------------------------------------- */
function renderWorkshopContent() {
 const body = document.getElementById('workshop-body');
 if (!body) return;

 if (currentWorkshopTab === 'stage') {
 renderStageEditor(body);
 } else if (currentWorkshopTab === 'ally') {
 renderAllyEditor(body);
 } else if (currentWorkshopTab === 'enemy') {
 renderEnemyEditor(body);
 } else {
 renderManageList(body);
 }
}

/* ----------------------------------------------------------------------------
 4. ステージ工房エディタ（★1〜数値自由入力・個別確率ドロップ対応）
---------------------------------------------------------------------------- */
function renderStageEditor(body) {
 const enemiesMap = getAllEnemiesMap();
 const enemyOptions = Object.values(enemiesMap).map(e =>
 `<option value="${e.id}">${e.name} (HP:${e.hp} / 攻撃:${e.atk})</option>`
 ).join('');

 const allAllies = getAllAllies();
 const allyDropOptions = `<option value="">なし（ドロップなし）</option>` + allAllies.map(a =>
 `<option value="${a.id}">${a.name} [${a.rarity}]</option>`
 ).join('');

 const themes = [
 { value: 'kitchen', label: '台所・シンク前' },
 { value: 'kotatsu', label: 'こたつ・ぬくぬく戦線' },
 { value: 'osechi', label: 'おせち重箱・黒豆の陣' },
 { value: 'sweets', label: '洋菓子帝国・生クリーム' },
 { value: 'dagashi', label: '駄菓子屋横丁・激辛' },
 { value: 'freezer', label: '真冬の冷凍庫・絶対零度' },
 { value: 'ozouni', label: 'お雑煮の深淵・大椀' },
 { value: 'newyear', label: '初日の出・神殿' }
 ];

 const diffNum = typeof stageDraft.difficulty === 'number'
 ? stageDraft.difficulty
 : Math.max(1, (String(stageDraft.difficulty || '').match(/★/g) || []).length || 3);

 body.innerHTML = `
 <div class="space-y-4">
 <div class="bg-amber-50 border-3 border-[#2c1e16] rounded-2xl p-3 sm:p-4">
 <div class="flex flex-wrap items-center justify-between gap-2 mb-3">
 <h3 class="font-black text-base sm:text-lg text-[#2c1e16]">
 🏰 ステージ基本設定 ${stageDraft.editingId ? '<span class="text-xs bg-sky-200 px-2 py-0.5 rounded-full border border-[#2c1e16]">編集中</span>' : ''}
 </h3>
 <div class="flex gap-1.5">
 <button onclick="stageDraft = createDefaultStageDraft('custom'); renderWorkshopContent();" class="bg-stone-200 hover:bg-stone-300 text-[#2c1e16] font-black text-xs px-2.5 py-1 rounded-lg border border-[#2c1e16]">新規リセット</button>
 </div>
 </div>

 <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold">
 <div>
 <label class="block font-black mb-1">保存先ジャンル</label>
 <select onchange="stageDraft.isOfficialSlot = (this.value === 'official')" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 <option value="custom" ${!stageDraft.isOfficialSlot ? 'selected' : ''}>🎨 自作ステージ一覧へ保存</option>
 <option value="official" ${stageDraft.isOfficialSlot ? 'selected' : ''}>🏆 公式ステージ一覧へ追加・上書き</option>
 </select>
 </div>
 <div>
 <label class="block font-black mb-1">章タイトル・ラベル</label>
 <input type="text" value="${escapeHtml(stageDraft.chapter)}" oninput="stageDraft.chapter = this.value"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 </div>
 <div>
 <label class="block font-black mb-1">ステージ名</label>
 <input type="text" value="${escapeHtml(stageDraft.title)}" oninput="stageDraft.title = this.value"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 </div>

 <div>
 <label class="block font-black mb-1">背景テーマ</label>
 <select onchange="stageDraft.theme = this.value" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 ${themes.map(t => `<option value="${t.value}" ${stageDraft.theme === t.value ? 'selected' : ''}>${t.label}</option>`).join('')}
 </select>
 </div>
 <div>
 <label class="block font-black mb-1">難易度 ★数値（1〜999自由入力）</label>
 <div class="flex items-center gap-1.5">
 <span class="font-black text-amber-500 text-base">★</span>
 <input type="number" min="1" max="9999" value="${diffNum}"
 oninput="stageDraft.difficulty = Math.max(1, parseInt(this.value) || 1)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 </div>
 </div>
 <div>
 <label class="block font-black mb-1">敵城の名前 / 敵城HP</label>
 <div class="flex gap-1.5">
 <input type="text" value="${escapeHtml(stageDraft.enemyBaseName)}" oninput="stageDraft.enemyBaseName = this.value"
 class="w-3/5 bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1.5 font-black">
 <input type="number" min="500" max="999999" step="500" value="${stageDraft.enemyBaseHp}" oninput="stageDraft.enemyBaseHp = Math.max(100, parseInt(this.value)||1000)"
 class="w-2/5 bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1.5 font-black">
 </div>
 </div>
 </div>

 <div class="mt-3 pt-3 border-t-2 border-amber-200">
 <div class="font-black text-xs text-amber-950 mb-2">🎁 クリア報酬＆個別ドロップ確率設定</div>
 <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs font-bold">
 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-2">
 <label class="block font-black text-[11px] mb-1">🪙 小判 枚数 / ドロップ確率%</label>
 <div class="flex gap-1">
 <input type="number" min="0" max="99999" step="50" value="${stageDraft.rewardKoban}"
 oninput="stageDraft.rewardKoban = Math.max(0, parseInt(this.value)||0)"
 class="w-3/5 bg-amber-50 border border-[#2c1e16] rounded-lg px-2 py-1 font-black" title="小判枚数">
 <div class="flex items-center w-2/5 gap-0.5">
 <input type="number" min="0" max="100" value="${stageDraft.rewardKobanChance ?? 100}"
 oninput="stageDraft.rewardKobanChance = Math.min(100, Math.max(0, parseInt(this.value)||0))"
 class="w-full bg-amber-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black" title="ドロップ確率%">
 <span class="text-[10px] font-black">%</span>
 </div>
 </div>
 </div>

 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-2">
 <label class="block font-black text-[11px] mb-1">✨ 経験値XP / ドロップ確率%</label>
 <div class="flex gap-1">
 <input type="number" min="0" max="99999" step="50" value="${stageDraft.rewardXp}"
 oninput="stageDraft.rewardXp = Math.max(0, parseInt(this.value)||0)"
 class="w-3/5 bg-sky-50 border border-[#2c1e16] rounded-lg px-2 py-1 font-black" title="XP量">
 <div class="flex items-center w-2/5 gap-0.5">
 <input type="number" min="0" max="100" value="${stageDraft.rewardXpChance ?? 100}"
 oninput="stageDraft.rewardXpChance = Math.min(100, Math.max(0, parseInt(this.value)||0))"
 class="w-full bg-sky-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black" title="ドロップ確率%">
 <span class="text-[10px] font-black">%</span>
 </div>
 </div>
 </div>

 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-2">
 <label class="block font-black text-[11px] mb-1">🎫 ガチャチケ枚数 / 確率%</label>
 <div class="flex gap-1">
 <input type="number" min="0" max="99" value="${stageDraft.rewardTicket || 0}"
 oninput="stageDraft.rewardTicket = Math.max(0, parseInt(this.value)||0)"
 class="w-3/5 bg-pink-50 border border-[#2c1e16] rounded-lg px-2 py-1 font-black" title="チケット枚数">
 <div class="flex items-center w-2/5 gap-0.5">
 <input type="number" min="0" max="100" value="${stageDraft.rewardTicketChance ?? 100}"
 oninput="stageDraft.rewardTicketChance = Math.min(100, Math.max(0, parseInt(this.value)||0))"
 class="w-full bg-pink-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black" title="ドロップ確率%">
 <span class="text-[10px] font-black">%</span>
 </div>
 </div>
 </div>

 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-2">
 <label class="block font-black text-[11px] mb-1">🎉 ドロップ味方キャラ / 確率%</label>
 <div class="flex gap-1">
 <select onchange="stageDraft.dropAllyId = this.value" class="w-3/5 bg-emerald-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black text-[11px]">
 ${allyDropOptions}
 </select>
 <div class="flex items-center w-2/5 gap-0.5">
 <input type="number" min="0" max="100" value="${stageDraft.dropChance || 25}"
 oninput="stageDraft.dropChance = Math.min(100, Math.max(0, parseInt(this.value)||0))"
 class="w-full bg-emerald-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black" title="キャラドロップ確率%">
 <span class="text-[10px] font-black">%</span>
 </div>
 </div>
 </div>
 </div>
 </div>
 </div>

 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 sm:p-4">
 <div class="flex items-center justify-between mb-2">
 <h3 class="font-black text-base text-[#2c1e16]">👾 敵の出現タイムライン設定</h3>
 <button onclick="addStageSpawnRow()" class="game-btn bg-emerald-400 hover:bg-emerald-300 text-[#2c1e16] font-black text-xs px-3 py-1.5 rounded-xl">
 ＋ 出現パターン追加
 </button>
 </div>

 <div class="space-y-2">
 ${stageDraft.spawns.map((sp, idx) => `
 <div class="bg-stone-50 border-2 border-[#2c1e16] rounded-xl p-2.5 grid grid-cols-2 sm:grid-cols-9 gap-2 items-center text-xs font-bold">
 <div class="col-span-2 sm:col-span-2">
 <label class="block text-[10px] font-black text-stone-500">敵キャラクター</label>
 <select onchange="stageDraft.spawns[${idx}].enemyId = this.value" class="w-full bg-white border border-[#2c1e16] rounded-lg px-2 py-1 font-black">
 ${enemyOptions}
 </select>
 </div>
 <div>
 <label class="block text-[10px] font-black text-indigo-700">強さ倍率(%)</label>
 <input type="number" min="10" max="5000" step="10" value="${sp.magnification ?? 100}"
 oninput="stageDraft.spawns[${idx}].magnification = Math.max(10, parseInt(this.value)||100)"
 class="w-full bg-indigo-50 border border-[#2c1e16] rounded-lg px-2 py-1 font-black text-indigo-950">
 </div>
 <div>
 <label class="block text-[10px] font-black text-stone-500">初回出現(秒)</label>
 <input type="number" min="0" max="300" step="0.5" value="${sp.startTime}" oninput="stageDraft.spawns[${idx}].startTime = parseFloat(this.value)||0"
 class="w-full bg-white border border-[#2c1e16] rounded-lg px-2 py-1 font-black">
 </div>
 <div>
 <label class="block text-[10px] font-black text-stone-500">間隔(秒)</label>
 <input type="number" min="0.5" max="120" step="0.5" value="${sp.interval}" oninput="stageDraft.spawns[${idx}].interval = Math.max(0.5, parseFloat(this.value)||3)"
 class="w-full bg-white border border-[#2c1e16] rounded-lg px-2 py-1 font-black">
 </div>
 <div>
 <label class="block text-[10px] font-black text-stone-500">総数(0=無限)</label>
 <input type="number" min="0" max="99" value="${sp.maxCount}" oninput="stageDraft.spawns[${idx}].maxCount = Math.max(0, parseInt(this.value)||0)"
 class="w-full bg-white border border-[#2c1e16] rounded-lg px-2 py-1 font-black">
 </div>
 <div>
 <label class="block text-[10px] font-black text-stone-500">敵城HP%以下</label>
 <input type="number" min="1" max="100" value="${sp.baseHpTrigger}" oninput="stageDraft.spawns[${idx}].baseHpTrigger = Math.min(100, Math.max(1, parseInt(this.value)||100))"
 class="w-full bg-white border border-[#2c1e16] rounded-lg px-2 py-1 font-black">
 </div>
 <div class="flex flex-col gap-1 justify-center">
 <label class="flex items-center gap-1 cursor-pointer">
 <input type="checkbox" ${sp.isBoss ? 'checked' : ''} onchange="stageDraft.spawns[${idx}].isBoss = this.checked" class="w-3.5 h-3.5 accent-rose-600">
 <span class="font-black text-rose-700 text-[11px]">BOSS演出</span>
 </label>
 <label class="flex items-center gap-1 cursor-pointer" title="生存中は敵城へのダメージを無効化します">
 <input type="checkbox" ${sp.guardBase ? 'checked' : ''} onchange="stageDraft.spawns[${idx}].guardBase = this.checked" class="w-3.5 h-3.5 accent-emerald-600">
 <span class="font-black text-emerald-700 text-[11px]">🛡️城ガード</span>
 </label>
 </div>
 <div class="flex items-center justify-end">
 <button onclick="removeStageSpawnRow(${idx})" class="bg-rose-500 text-white font-black px-2 py-1 rounded-lg text-[10px] hover:bg-rose-400">削除</button>
 </div>
 </div>
 `).join('')}
 </div>
 </div>

 <div class="flex flex-wrap gap-3 justify-end">
 <button onclick="testPlayStageDraft()" class="game-btn bg-cyan-300 hover:bg-cyan-200 text-[#2c1e16] font-black px-5 py-2.5 rounded-2xl text-sm">
 ▶️ このステージをテストプレイ
 </button>
 <button onclick="saveStageDraft()" class="game-btn bg-amber-400 hover:bg-amber-300 text-[#2c1e16] font-black px-6 py-2.5 rounded-2xl text-sm">
 💾 ステージを保存する
 </button>
 </div>
 </div>
 `;

 const dropSelect = body.querySelector('select[onchange="stageDraft.dropAllyId = this.value"]');
 if (dropSelect) dropSelect.value = stageDraft.dropAllyId || '';
 stageDraft.spawns.forEach((sp, idx) => {
 const sel = body.querySelector(`select[onchange="stageDraft.spawns[${idx}].enemyId = this.value"]`);
 if (sel) sel.value = sp.enemyId;
 });
}

function addStageSpawnRow() {
 sound.playButton();
 stageDraft.spawns.push({
 enemyId: 'cookie_soldier',
 magnification: 100,
 startTime: 5.0,
 interval: 4.5,
 maxCount: 0,
 baseHpTrigger: 100,
 isBoss: false,
 guardBase: false
 });
 renderWorkshopContent();
}

function removeStageSpawnRow(idx) {
 if (stageDraft.spawns.length <= 1) {
 showToast('最低1つの敵出現設定が必要です！', 'error');
 return;
 }
 sound.playButton();
 stageDraft.spawns.splice(idx, 1);
 renderWorkshopContent();
}

function buildStageFromDraft(idOverride) {
 const isOfficial = !!stageDraft.isOfficialSlot;
 return {
 id: idOverride || stageDraft.editingId || `${isOfficial ? 'official_custom' : 'custom_stage'}_${Date.now()}`,
 category: isOfficial ? 'official' : 'custom',
 isOfficial,
 chapter: stageDraft.chapter || (isOfficial ? '特別章' : '自作ステージ'),
 title: stageDraft.title || 'オリジナルステージ',
 difficulty: Math.max(1, Number(stageDraft.difficulty) || 3),
 theme: stageDraft.theme || 'kitchen',
 enemyBaseName: stageDraft.enemyBaseName || '敵城',
 enemyBaseHp: Math.max(500, Number(stageDraft.enemyBaseHp) || 5000),
 rewardKoban: Math.max(0, Number(stageDraft.rewardKoban) || 0),
 rewardKobanChance: Math.min(100, Math.max(0, Number(stageDraft.rewardKobanChance ?? 100))),
 rewardXp: Math.max(0, Number(stageDraft.rewardXp) || 0),
 rewardXpChance: Math.min(100, Math.max(0, Number(stageDraft.rewardXpChance ?? 100))),
 rewardTicket: Math.max(0, Number(stageDraft.rewardTicket) || 0),
 rewardTicketChance: Math.min(100, Math.max(0, Number(stageDraft.rewardTicketChance ?? 100))),
 dropAllyId: stageDraft.dropAllyId || '',
 dropChance: Math.min(100, Math.max(0, Number(stageDraft.dropChance) || 25)),
 spawns: stageDraft.spawns.map(s => ({
 enemyId: s.enemyId,
 magnification: Math.max(10, Number(s.magnification) || 100),
 startTime: Number(s.startTime) || 0,
 interval: Math.max(0.5, Number(s.interval) || 3),
 maxCount: Math.max(0, Number(s.maxCount) || 0),
 baseHpTrigger: Math.min(100, Math.max(1, Number(s.baseHpTrigger) || 100)),
 isBoss: !!s.isBoss,
 guardBase: !!s.guardBase
 }))
 };
}

function saveStageDraft() {
 ensureExtendedUserStore();
 const built = buildStageFromDraft();

 if (built.isOfficial) {
 const isDefaultOfficial = DEFAULT_STAGES.some(s => s.id === built.id);
 if (isDefaultOfficial) {
 userStore.editedOfficialStages[built.id] = built;
 } else {
 const idx = userStore.officialCustomStages.findIndex(s => s.id === built.id);
 if (idx !== -1) userStore.officialCustomStages[idx] = built;
 else userStore.officialCustomStages.push(built);
 }
 } else {
 const idx = userStore.customStages.findIndex(s => s.id === built.id);
 if (idx !== -1) userStore.customStages[idx] = built;
 else userStore.customStages.push(built);
 }

 saveUserStore();
 sound.playUpgrade();
 showToast(`ステージ「${built.title}」を保存しました！`, 'success');
 stageDraft = createDefaultStageDraft(built.isOfficial ? 'official' : 'custom');
 renderWorkshopContent();
}

function testPlayStageDraft() {
 const temp = buildStageFromDraft('temp_test_stage');
 window.__tempTestStage = temp;
 const allStages = getAllStages();
 const testIdx = allStages.findIndex(s => s.id === 'temp_test_stage');
 document.getElementById('workshop-modal')?.classList.add('hidden');
 startStage(testIdx !== -1 ? testIdx : 0);
}

/* ----------------------------------------------------------------------------
 5. 味方・敵 共通の見た目＆能力＆トリガー条件エディタ生成
---------------------------------------------------------------------------- */
function renderCharacterVisualEditor(draft, draftVarName, shapesList, kind) {
 return `
 <div class="bg-amber-50 border-3 border-[#2c1e16] rounded-2xl p-3 flex flex-col items-center">
 <div class="font-black text-xs text-[#2c1e16] mb-1.5">👁️ リアルタイム見た目プレビュー</div>
 <canvas id="ws-${kind}-preview-canvas" width="210" height="155"
 class="bg-white border-3 border-[#2c1e16] rounded-2xl shadow-inner mb-2"></canvas>

 <div class="flex gap-1.5 mb-3">
 <button type="button" onclick="workshopPreviewAnimMode = 'IDLE'" class="px-2 py-0.5 rounded-lg bg-stone-200 hover:bg-stone-300 font-black text-[10px] border border-[#2c1e16]">待機</button>
 <button type="button" onclick="workshopPreviewAnimMode = 'WALK'" class="px-2 py-0.5 rounded-lg bg-sky-200 hover:bg-sky-300 font-black text-[10px] border border-[#2c1e16]">歩行</button>
 <button type="button" onclick="workshopPreviewAnimMode = 'ATTACK'" class="px-2 py-0.5 rounded-lg bg-rose-200 hover:bg-rose-300 font-black text-[10px] border border-[#2c1e16]">⚔️ 攻撃アニメ</button>
 </div>

 <div class="w-full space-y-2 text-xs font-bold">
 <div>
 <label class="block font-black text-[11px] mb-0.5">見た目ベース形状</label>
 <select onchange="${draftVarName}.shape = this.value; renderWorkshopContent();" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black">
 ${shapesList.map(s => `<option value="${s.value}" ${draft.shape === s.value ? 'selected' : ''}>${s.label}</option>`).join('')}
 </select>
 </div>

 <div>
 <label class="block font-black text-[11px] mb-0.5">⚔️ 攻撃アニメーション</label>
 <select onchange="${draftVarName}.attackAnim = this.value; workshopPreviewAnimMode = 'ATTACK'; renderWorkshopContent();" class="w-full bg-rose-50 border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black text-rose-950">
 ${ATTACK_ANIM_OPTIONS.map(a => `<option value="${a.value}" ${(draft.attackAnim || 'default') === a.value ? 'selected' : ''}>${a.label}</option>`).join('')}
 </select>
 </div>

 ${draft.shape === 'image' ? `
 <div class="bg-sky-100 border-2 border-sky-500 rounded-xl p-2">
 <label class="block font-black text-[11px] text-sky-950 mb-1">📷 写真・イラスト画像を選択</label>
 <input type="file" accept="image/*" onchange="handleWorkshopImageUpload(event, '${kind}')" class="w-full text-[11px]">
 </div>
 ` : ''}

 ${draft.shape === 'emoji' ? `
 <div>
 <label class="block font-black text-[11px] mb-0.5">絵文字入力（1〜2文字）</label>
 <input type="text" maxlength="4" value="${escapeHtml(draft.emoji || '🍡')}" oninput="${draftVarName}.emoji = this.value"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black text-center text-lg">
 </div>
 ` : ''}

 <div class="grid grid-cols-2 gap-2">
 <div>
 <label class="block font-black text-[11px] mb-0.5">体の色</label>
 <input type="color" value="${draft.bodyColor || '#fffdf9'}" oninput="${draftVarName}.bodyColor = this.value"
 class="w-full h-8 bg-white border-2 border-[#2c1e16] rounded-xl cursor-pointer">
 </div>
 <div>
 <label class="block font-black text-[11px] mb-0.5">装飾パーツ</label>
 <select onchange="${draftVarName}.accessory = this.value" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black">
 ${ACCESSORY_OPTIONS.map(a => `<option value="${a.value}" ${draft.accessory === a.value ? 'selected' : ''}>${a.label}</option>`).join('')}
 </select>
 </div>
 </div>

 <div>
 <label class="block font-black text-[11px] mb-0.5">表示サイズ倍率: ${Number(draft.scale || 1).toFixed(2)}倍</label>
 <input type="range" min="0.5" max="2.0" step="0.05" value="${draft.scale || 1.0}"
 oninput="${draftVarName}.scale = parseFloat(this.value); this.previousElementSibling.textContent = '表示サイズ倍率: ' + parseFloat(this.value).toFixed(2) + '倍';"
 class="w-full accent-amber-500">
 </div>
 </div>
 </div>
 `;
}

function renderAbilityListEditor(draft, draftVarName) {
 const traits = Object.keys(TRAIT_INFO);
 return `
 <div class="bg-indigo-50/70 border-2 border-[#2c1e16] rounded-2xl p-2.5">
 <div class="flex items-center justify-between mb-1.5">
 <span class="font-black text-xs text-indigo-950">✨ 特殊能力・妨害・バリア・烈波・トリガー設定</span>
 <button type="button" onclick="addDraftAbility('${draftVarName}')" class="bg-indigo-500 hover:bg-indigo-400 text-white font-black text-[10px] px-2.5 py-1 rounded-lg border border-[#2c1e16]">
 ＋ 能力を追加
 </button>
 </div>

 ${draft.abilities.length === 0 ? '<div class="text-[11px] font-bold text-stone-500">特殊能力なし（標準攻撃のみ）</div>' : ''}

 <div class="space-y-2">
 ${draft.abilities.map((ab, idx) => {
 const info = ABILITY_INFO[ab.type] || ABILITY_INFO.strong;
 const trigOpt = ABILITY_TRIGGER_OPTIONS.find(t => t.value === (ab.trigger || 'always')) || ABILITY_TRIGGER_OPTIONS[0];

 return `
 <div class="bg-white border-2 border-[#2c1e16] rounded-xl p-2 space-y-1.5 text-[11px] font-bold">
 <div class="flex flex-wrap gap-1.5 items-center">
 <select onchange="changeDraftAbilityType('${draftVarName}', ${idx}, this.value)" class="bg-amber-50 border border-[#2c1e16] rounded-lg px-2 py-1 font-black text-xs">
 ${ABILITY_CATALOG.map(c => `<option value="${c.key}" ${ab.type === c.key ? 'selected' : ''}>${c.label}</option>`).join('')}
 </select>

 ${info.needsTarget ? `
 <select onchange="${draftVarName}.abilities[${idx}].target = this.value" class="bg-white border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black">
 ${traits.map(tk => `<option value="${tk}" ${(ab.target || 'all') === tk ? 'selected' : ''}>対:${TRAIT_INFO[tk].label}</option>`).join('')}
 </select>
 ` : ''}

 ${info.needsChance ? `
 <span class="flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
 確率<input type="number" min="1" max="100" value="${ab.chance || 50}" oninput="${draftVarName}.abilities[${idx}].chance = Math.min(100, Math.max(1, parseInt(this.value)||50))" class="w-11 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">%
 </span>
 ` : ''}

 ${info.hasDuration ? `
 <span class="flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
 時間<input type="number" min="0.5" max="15" step="0.5" value="${ab.duration || 2.5}" oninput="${draftVarName}.abilities[${idx}].duration = parseFloat(this.value)||2" class="w-11 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">秒
 </span>
 ` : ''}

 ${info.hasLevel ? `
 <span class="flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
 Lv<input type="number" min="1" max="10" value="${ab.level || 2}" oninput="${draftVarName}.abilities[${idx}].level = Math.min(10, Math.max(1, parseInt(this.value)||2))" class="w-10 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 </span>
 ` : ''}

 ${info.hasOffset ? `
 <span class="flex items-center gap-0.5 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300">
 発生距離<input type="number" min="-200" max="600" step="20" value="${ab.spawnOffset ?? 160}" oninput="${draftVarName}.abilities[${idx}].spawnOffset = parseInt(this.value)||160" class="w-14 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 </span>
 ` : ''}

 ${info.hasBarrierHp ? `
 <span class="flex items-center gap-0.5 bg-sky-100 px-1.5 py-0.5 rounded border border-sky-400">
 バリア耐久HP<input type="number" min="1" max="999999" step="100" value="${ab.barrierHp ?? 1000}" oninput="${draftVarName}.abilities[${idx}].barrierHp = Math.max(1, parseInt(this.value)||1000)" class="w-20 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 </span>
 ` : ''}

 ${info.hasShieldHp ? `
 <span class="flex items-center gap-0.5 bg-purple-100 px-1.5 py-0.5 rounded border border-purple-400">
 シールドHP<input type="number" min="1" max="999999" step="100" value="${ab.shieldHp ?? 2000}" oninput="${draftVarName}.abilities[${idx}].shieldHp = Math.max(1, parseInt(this.value)||2000)" class="w-20 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 再生<input type="number" min="0" max="100" value="${ab.regenPct ?? 50}" oninput="${draftVarName}.abilities[${idx}].regenPct = Math.min(100, Math.max(0, parseInt(this.value)||0))" class="w-11 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">%
 </span>
 ` : ''}

 ${info.hasRangeBand ? `
 <span class="flex items-center gap-0.5 bg-cyan-100 px-1.5 py-0.5 rounded border border-cyan-400">
 感知射程<input type="number" min="-400" max="800" step="10" value="${ab.ldMin ?? (ab.type === 'omni' ? -100 : 120)}" oninput="${draftVarName}.abilities[${idx}].ldMin = parseInt(this.value)||0" class="w-14 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">〜
 <input type="number" min="10" max="1000" step="10" value="${ab.ldMax ?? 320}" oninput="${draftVarName}.abilities[${idx}].ldMax = parseInt(this.value)||300" class="w-14 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 </span>
 ` : ''}

 ${info.hasAtkUpPct ? `
 <span class="flex items-center gap-0.5 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-400">
 攻撃力+<input type="number" min="10" max="1000" step="10" value="${ab.atkUpPct ?? 100}" oninput="${draftVarName}.abilities[${idx}].atkUpPct = Math.max(1, parseInt(this.value)||100)" class="w-14 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">%
 </span>
 ` : ''}

 ${info.hasAtkDownPct ? `
 <span class="flex items-center gap-0.5 bg-blue-100 px-1.5 py-0.5 rounded border border-blue-400">
 攻撃力-<input type="number" min="5" max="95" step="5" value="${ab.atkDownPct ?? 50}" oninput="${draftVarName}.abilities[${idx}].atkDownPct = Math.min(95, Math.max(5, parseInt(this.value)||50))" class="w-12 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">%
 </span>
 ` : ''}

 ${info.hasPoisonPct ? `
 <span class="flex items-center gap-0.5 bg-fuchsia-100 px-1.5 py-0.5 rounded border border-fuchsia-400">
 最大HPの<input type="number" min="1" max="100" value="${ab.poisonPct ?? 30}" oninput="${draftVarName}.abilities[${idx}].poisonPct = Math.min(100, Math.max(1, parseInt(this.value)||30))" class="w-12 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">%毒
 </span>
 ` : ''}

 ${info.hasImmuneType ? `
 <select onchange="${draftVarName}.abilities[${idx}].immuneType = this.value" class="bg-emerald-50 border border-[#2c1e16] rounded-lg px-1.5 py-1 font-black">
 ${Object.keys(IMMUNE_TYPE_LABELS || {}).map(ik => `<option value="${ik}" ${(ab.immuneType || 'all_cc') === ik ? 'selected' : ''}>${IMMUNE_TYPE_LABELS[ik]}</option>`).join('')}
 </select>
 ` : ''}

 <button type="button" onclick="removeDraftAbility('${draftVarName}', ${idx})" class="ml-auto bg-rose-500 text-white px-2 py-0.5 rounded font-black text-[10px]">✕</button>
 </div>

 <div class="flex flex-wrap items-center gap-1.5 bg-amber-50/90 border border-amber-300 rounded-lg px-2 py-1">
 <span class="text-[10px] font-black text-amber-950">🎯 発動条件:</span>
 <select onchange="changeDraftAbilityTrigger('${draftVarName}', ${idx}, this.value)" class="bg-white border border-[#2c1e16] rounded px-1.5 py-0.5 font-black text-[10px]">
 ${ABILITY_TRIGGER_OPTIONS.map(tr => `<option value="${tr.value}" ${(ab.trigger || 'always') === tr.value ? 'selected' : ''}>${tr.label}</option>`).join('')}
 </select>
 ${trigOpt.hasVal ? `
 <span class="flex items-center gap-0.5 text-[10px] font-black">
 <input type="number" min="1" max="999" value="${ab.triggerValue ?? trigOpt.def}"
 oninput="${draftVarName}.abilities[${idx}].triggerValue = Math.max(1, parseInt(this.value)||${trigOpt.def})"
 class="w-12 border border-[#2c1e16] rounded px-1 py-0.5 font-black bg-white">
 ${trigOpt.unit}
 </span>
 ` : ''}
 <span class="text-[10px] text-stone-500 ml-auto">${info.desc}</span>
 </div>
 </div>
 `;
 }).join('')}
 </div>
 </div>
 `;
}

function addDraftAbility(draftVarName) {
 sound.playButton();
 const targetDraft = draftVarName === 'allyDraft' ? allyDraft : enemyDraft;
 targetDraft.abilities.push({
 type: 'strong',
 target: 'all',
 chance: 100,
 duration: 2.5,
 level: 2,
 trigger: 'always',
 triggerValue: 50
 });
 renderWorkshopContent();
}

function changeDraftAbilityType(draftVarName, idx, newType) {
 const targetDraft = draftVarName === 'allyDraft' ? allyDraft : enemyDraft;
 const prev = targetDraft.abilities[idx] || {};
 targetDraft.abilities[idx] = {
 ...prev,
 type: newType,
 target: prev.target || 'all',
 chance: prev.chance ?? 60,
 duration: prev.duration ?? 2.5,
 level: prev.level ?? 2,
 barrierHp: prev.barrierHp ?? 1000,
 shieldHp: prev.shieldHp ?? 2000,
 regenPct: prev.regenPct ?? 50,
 spawnOffset: prev.spawnOffset ?? 160,
 ldMin: newType === 'omni' ? -100 : (prev.ldMin ?? 120),
 ldMax: prev.ldMax ?? 320,
 atkUpPct: prev.atkUpPct ?? 100,
 atkDownPct: prev.atkDownPct ?? 50,
 poisonPct: prev.poisonPct ?? 30,
 immuneType: prev.immuneType ?? 'all_cc'
 };
 renderWorkshopContent();
}

function changeDraftAbilityTrigger(draftVarName, idx, newTrigger) {
 const targetDraft = draftVarName === 'allyDraft' ? allyDraft : enemyDraft;
 const trigOpt = ABILITY_TRIGGER_OPTIONS.find(t => t.value === newTrigger);
 targetDraft.abilities[idx].trigger = newTrigger;
 if (trigOpt && trigOpt.hasVal) {
 targetDraft.abilities[idx].triggerValue = trigOpt.def;
 }
 renderWorkshopContent();
}

function removeDraftAbility(draftVarName, idx) {
 sound.playButton();
 const targetDraft = draftVarName === 'allyDraft' ? allyDraft : enemyDraft;
 targetDraft.abilities.splice(idx, 1);
 renderWorkshopContent();
}

/* ----------------------------------------------------------------------------
 6. 味方キャラ工房エディタ
---------------------------------------------------------------------------- */
function renderAllyEditor(body) {
 const rarities = ['基本', 'EX', 'レア', '激レア', '超激レア', '伝説レア'];
 body.innerHTML = `
 <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div>
 ${renderCharacterVisualEditor(allyDraft, 'allyDraft', ALLY_SHAPES, 'ally')}
 </div>

 <div class="lg:col-span-2 space-y-3">
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 sm:p-4 space-y-3">
 <div class="flex items-center justify-between">
 <h3 class="font-black text-base text-[#2c1e16]">
 🍡 味方おもちステータス設定 ${allyDraft.editingId ? '<span class="text-xs bg-sky-200 px-2 py-0.5 rounded-full border border-[#2c1e16]">編集中</span>' : ''}
 </h3>
 <button type="button" onclick="allyDraft = createDefaultAllyDraft(); renderWorkshopContent();" class="bg-stone-200 hover:bg-stone-300 text-[#2c1e16] font-black text-xs px-2.5 py-1 rounded-lg border border-[#2c1e16]">新規リセット</button>
 </div>

 <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
 <div class="col-span-2">
 <label class="block font-black mb-0.5">キャラクター名</label>
 <input type="text" value="${escapeHtml(allyDraft.name)}" oninput="allyDraft.name = this.value"
 class="w-full bg-amber-50 border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">レア度</label>
 <select onchange="allyDraft.rarity = this.value" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1.5 font-black">
 ${rarities.map(r => `<option value="${r}" ${allyDraft.rarity === r ? 'selected' : ''}>${r}</option>`).join('')}
 </select>
 </div>

 <div>
 <label class="block font-black mb-0.5">出撃コスト (円)</label>
 <input type="number" min="10" max="9999" step="10" value="${allyDraft.cost}" oninput="allyDraft.cost = Math.max(10, parseInt(this.value)||100)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">再生産時間 (秒)</label>
 <input type="number" min="0.5" max="60" step="0.5" value="${allyDraft.cooldown}" oninput="allyDraft.cooldown = Math.max(0.5, parseFloat(this.value)||2)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃タイプ</label>
 <select onchange="allyDraft.aoe = (this.value === 'true')" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black">
 <option value="false" ${!allyDraft.aoe ? 'selected' : ''}>単体攻撃</option>
 <option value="true" ${allyDraft.aoe ? 'selected' : ''}>範囲攻撃 (AoE)</option>
 </select>
 </div>

 <div>
 <label class="block font-black mb-0.5">体力 (HP)</label>
 <input type="number" min="10" max="999999" step="50" value="${allyDraft.hp}" oninput="allyDraft.hp = Math.max(10, parseInt(this.value)||100)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃力 (ATK)</label>
 <input type="number" min="1" max="99999" step="10" value="${allyDraft.atk}" oninput="allyDraft.atk = Math.max(1, parseInt(this.value)||10)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">射程距離</label>
 <input type="number" min="20" max="700" step="10" value="${allyDraft.range}" oninput="allyDraft.range = Math.max(20, parseInt(this.value)||60)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>

 <div>
 <label class="block font-black mb-0.5">移動速度</label>
 <input type="number" min="10" max="300" step="5" value="${allyDraft.speed}" oninput="allyDraft.speed = Math.max(10, parseInt(this.value)||60)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃間隔 (秒)</label>
 <input type="number" min="0.2" max="15" step="0.1" value="${allyDraft.attackInterval}" oninput="allyDraft.attackInterval = Math.max(0.2, parseFloat(this.value)||1.2)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">ノックバック回数</label>
 <input type="number" min="1" max="20" value="${allyDraft.kb}" oninput="allyDraft.kb = Math.max(1, parseInt(this.value)||3)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 </div>

 ${renderAbilityListEditor(allyDraft, 'allyDraft')}

 <div class="text-xs font-bold">
 <label class="block font-black mb-0.5">図鑑説明文</label>
 <input type="text" value="${escapeHtml(allyDraft.desc)}" oninput="allyDraft.desc = this.value"
 class="w-full bg-stone-50 border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-bold">
 </div>
 </div>

 <div class="flex justify-end">
 <button type="button" onclick="saveAllyDraft()" class="game-btn bg-emerald-400 hover:bg-emerald-300 text-[#2c1e16] font-black px-6 py-2.5 rounded-2xl text-sm">
 💾 味方キャラを保存する（デッキ＆図鑑に即反映）
 </button>
 </div>
 </div>
 </div>
 `;
}

function saveAllyDraft() {
 ensureExtendedUserStore();
 const id = allyDraft.editingId || `custom_ally_${Date.now()}`;
 const isDefaultOfficial = DEFAULT_ALLIES.some(a => a.id === id);

 const newUnit = {
 id,
 name: allyDraft.name || 'オリジナルもち',
 rarity: allyDraft.rarity || '激レア',
 shape: allyDraft.shape || 'maru',
 attackAnim: allyDraft.attackAnim || 'default',
 emoji: allyDraft.emoji || '🍡',
 imageData: allyDraft.imageData || '',
 bodyColor: allyDraft.bodyColor || '#fffdf9',
 accessory: allyDraft.accessory || 'none',
 scale: Number(allyDraft.scale) || 1.0,
 cost: Math.max(10, Number(allyDraft.cost) || 300),
 cooldown: Math.max(0.5, Number(allyDraft.cooldown) || 3),
 hp: Math.max(10, Number(allyDraft.hp) || 300),
 atk: Math.max(1, Number(allyDraft.atk) || 50),
 range: Math.max(20, Number(allyDraft.range) || 80),
 speed: Math.max(10, Number(allyDraft.speed) || 70),
 attackInterval: Math.max(0.2, Number(allyDraft.attackInterval) || 1.3),
 windup: Math.max(0.05, Number(allyDraft.windup) || 0.3),
 kb: Math.max(1, Number(allyDraft.kb) || 3),
 aoe: !!allyDraft.aoe,
 isRare: ['超激レア', '伝説レア'].includes(allyDraft.rarity),
 abilities: JSON.parse(JSON.stringify(allyDraft.abilities || [])),
 desc: allyDraft.desc || '大工房で誕生したオリジナルおもち！'
 };

 if (isDefaultOfficial) {
 userStore.editedOfficialAllies[id] = newUnit;
 } else {
 const idx = userStore.customAllies.findIndex(a => a.id === id);
 if (idx !== -1) userStore.customAllies[idx] = newUnit;
 else userStore.customAllies.push(newUnit);
 }

 if (userStore.ownedAllies[id] === undefined) {
 userStore.ownedAllies[id] = 0;
 userStore.allyLevels[id] = 1;
 }
 saveUserStore();
 sound.playUpgrade();
 showToast(`味方「${newUnit.name}」を保存しました！`, 'success');
 allyDraft = createDefaultAllyDraft();
 renderWorkshopContent();
}

/* ----------------------------------------------------------------------------
 7. 敵キャラ工房エディタ
---------------------------------------------------------------------------- */
function renderEnemyEditor(body) {
 const traits = Object.keys(TRAIT_INFO);
 body.innerHTML = `
 <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
 <div>
 ${renderCharacterVisualEditor(enemyDraft, 'enemyDraft', ENEMY_SHAPES, 'enemy')}
 </div>

 <div class="lg:col-span-2 space-y-3">
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3 sm:p-4 space-y-3">
 <div class="flex items-center justify-between">
 <h3 class="font-black text-base text-[#2c1e16]">
 👾 敵キャラステータス設定 ${enemyDraft.editingId ? '<span class="text-xs bg-sky-200 px-2 py-0.5 rounded-full border border-[#2c1e16]">編集中</span>' : ''}
 </h3>
 <button type="button" onclick="enemyDraft = createDefaultEnemyDraft(); renderWorkshopContent();" class="bg-stone-200 hover:bg-stone-300 text-[#2c1e16] font-black text-xs px-2.5 py-1 rounded-lg border border-[#2c1e16]">新規リセット</button>
 </div>

 <div class="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs font-bold">
 <div class="col-span-2">
 <label class="block font-black mb-0.5">敵キャラクター名</label>
 <input type="text" value="${escapeHtml(enemyDraft.name)}" oninput="enemyDraft.name = this.value"
 class="w-full bg-rose-50 border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">敵の属性</label>
 <select onchange="enemyDraft.trait = this.value" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1.5 font-black">
 ${traits.map(tk => `<option value="${tk}" ${enemyDraft.trait === tk ? 'selected' : ''}>${TRAIT_INFO[tk].icon} ${TRAIT_INFO[tk].label}</option>`).join('')}
 </select>
 </div>

 <div>
 <label class="block font-black mb-0.5">体力 (HP)</label>
 <input type="number" min="10" max="9999999" step="100" value="${enemyDraft.hp}" oninput="enemyDraft.hp = Math.max(10, parseInt(this.value)||500)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃力 (ATK)</label>
 <input type="number" min="1" max="99999" step="10" value="${enemyDraft.atk}" oninput="enemyDraft.atk = Math.max(1, parseInt(this.value)||50)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">撃破獲得お金 (円)</label>
 <input type="number" min="10" max="99999" step="10" value="${enemyDraft.reward}" oninput="enemyDraft.reward = Math.max(10, parseInt(this.value)||100)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>

 <div>
 <label class="block font-black mb-0.5">射程距離</label>
 <input type="number" min="20" max="700" step="10" value="${enemyDraft.range}" oninput="enemyDraft.range = Math.max(20, parseInt(this.value)||60)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">移動速度</label>
 <input type="number" min="10" max="300" step="5" value="${enemyDraft.speed}" oninput="enemyDraft.speed = Math.max(10, parseInt(this.value)||60)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃間隔 (秒)</label>
 <input type="number" min="0.2" max="15" step="0.1" value="${enemyDraft.attackInterval}" oninput="enemyDraft.attackInterval = Math.max(0.2, parseFloat(this.value)||1.5)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>

 <div>
 <label class="block font-black mb-0.5">ノックバック回数</label>
 <input type="number" min="1" max="20" value="${enemyDraft.kb}" oninput="enemyDraft.kb = Math.max(1, parseInt(this.value)||3)"
 class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2.5 py-1 font-black">
 </div>
 <div>
 <label class="block font-black mb-0.5">攻撃範囲</label>
 <select onchange="enemyDraft.aoe = (this.value === 'true')" class="w-full bg-white border-2 border-[#2c1e16] rounded-xl px-2 py-1 font-black">
 <option value="false" ${!enemyDraft.aoe ? 'selected' : ''}>単体攻撃</option>
 <option value="true" ${enemyDraft.aoe ? 'selected' : ''}>範囲攻撃 (AoE)</option>
 </select>
 </div>
 <div class="flex items-end pb-1">
 <label class="flex items-center gap-1.5 cursor-pointer">
 <input type="checkbox" ${enemyDraft.isBoss ? 'checked' : ''} onchange="enemyDraft.isBoss = this.checked" class="w-4 h-4 accent-rose-600">
 <span class="font-black text-rose-700">ボス級サイズ扱い</span>
 </label>
 </div>
 </div>

 ${renderAbilityListEditor(enemyDraft, 'enemyDraft')}

 <div class="text-xs font-bold">
 <label class="block font-black mb-0.5">敵図鑑説明文</label>
 <input type="text" value="${escapeHtml(enemyDraft.desc)}" oninput="enemyDraft.desc = this.value"
 class="w-full bg-stone-50 border-2 border-[#2c1e16] rounded-xl px-2.5 py-1.5 font-bold">
 </div>
 </div>

 <div class="flex justify-end">
 <button type="button" onclick="saveEnemyDraft()" class="game-btn bg-rose-500 hover:bg-rose-400 text-white font-black px-6 py-2.5 rounded-2xl text-sm">
 💾 敵キャラを保存する（ステージ工房＆図鑑に即反映）
 </button>
 </div>
 </div>
 </div>
 `;
}

function saveEnemyDraft() {
 ensureExtendedUserStore();
 const id = enemyDraft.editingId || `custom_enemy_${Date.now()}`;
 const isDefaultOfficial = !!DEFAULT_ENEMIES[id];

 const newEnemy = {
 id,
 name: enemyDraft.name || 'オリジナル敵',
 trait: enemyDraft.trait || 'sweet',
 tag: enemyDraft.isBoss ? 'カスタムBOSS' : 'オリジナル敵',
 isBoss: !!enemyDraft.isBoss,
 shape: enemyDraft.shape || 'cake',
 attackAnim: enemyDraft.attackAnim || 'default',
 emoji: enemyDraft.emoji || '🍰',
 imageData: enemyDraft.imageData || '',
 bodyColor: enemyDraft.bodyColor || '#f472b6',
 accessory: enemyDraft.accessory || 'none',
 scale: Number(enemyDraft.scale) || 1.0,
 hp: Math.max(10, Number(enemyDraft.hp) || 1000),
 atk: Math.max(1, Number(enemyDraft.atk) || 100),
 range: Math.max(20, Number(enemyDraft.range) || 80),
 speed: Math.max(10, Number(enemyDraft.speed) || 60),
 attackInterval: Math.max(0.2, Number(enemyDraft.attackInterval) || 1.5),
 windup: Math.max(0.05, Number(enemyDraft.windup) || 0.35),
 kb: Math.max(1, Number(enemyDraft.kb) || 3),
 aoe: !!enemyDraft.aoe,
 reward: Math.max(10, Number(enemyDraft.reward) || 150),
 abilities: JSON.parse(JSON.stringify(enemyDraft.abilities || [])),
 desc: enemyDraft.desc || '大工房で生み出されたライバルキャラクター！'
 };

 if (isDefaultOfficial) {
 userStore.editedOfficialEnemies[id] = newEnemy;
 } else {
 userStore.customEnemies[id] = newEnemy;
 }

 saveUserStore();
 sound.playUpgrade();
 showToast(`敵キャラ「${newEnemy.name}」を保存しました！`, 'success');
 enemyDraft = createDefaultEnemyDraft();
 renderWorkshopContent();
}

/* ----------------------------------------------------------------------------
 8. 保存済み管理・編集・削除一覧（公式ステージ＆公式キャラも編集・初期化可能）
---------------------------------------------------------------------------- */
function renderManageList(body) {
 ensureExtendedUserStore();
 const allStages = getAllStages().filter(s => !s.isTestStage);
 const allAllies = getAllAllies();
 const allEnemies = Object.values(getAllEnemiesMap());

 body.innerHTML = `
 <div class="space-y-4 text-xs font-bold">
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3">
 <h3 class="font-black text-sm text-[#2c1e16] mb-2">🏰 全ステージ一覧（公式ステージ・自作ステージの編集・削除）</h3>
 <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
 ${allStages.map(st => {
 const diffLabel = typeof formatDifficulty === 'function' ? formatDifficulty(st.difficulty) : `★${st.difficulty}`;
 return `
 <div class="flex items-center justify-between bg-amber-50 border border-[#2c1e16] rounded-xl px-3 py-1.5 gap-2">
 <div class="min-w-0">
 <span class="text-[10px] font-black px-1.5 py-0.5 rounded mr-1 ${st.isOfficial ? 'bg-amber-300' : 'bg-purple-400 text-white'}">${st.isOfficial ? '公式' : '自作'}</span>
 ${st.isEditedOfficial ? '<span class="text-[10px] font-black bg-sky-200 px-1.5 py-0.5 rounded mr-1">改変済</span>' : ''}
 <span class="font-black text-[#2c1e16]">${st.chapter}：${st.title}</span>
 <span class="text-stone-500 ml-1">(${diffLabel} / 敵城HP:${st.enemyBaseHp})</span>
 </div>
 <div class="flex gap-1.5 shrink-0">
 <button onclick="editSavedStage('${st.id}')" class="bg-sky-300 text-[#2c1e16] font-black px-2.5 py-1 rounded-lg border border-[#2c1e16]">編集</button>
 ${st.isDefaultOfficial
 ? (st.isEditedOfficial ? `<button onclick="deleteSavedStage('${st.id}')" class="bg-stone-300 text-[#2c1e16] font-black px-2 py-1 rounded-lg border border-[#2c1e16]">初期戻し</button>` : '')
 : `<button onclick="deleteSavedStage('${st.id}')" class="bg-rose-500 text-white font-black px-2 py-1 rounded-lg">削除</button>`
 }
 </div>
 </div>
 `;
 }).join('')}
 </div>
 </div>

 <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3">
 <h3 class="font-black text-sm text-[#2c1e16] mb-2">🍡 味方キャラクター一覧（公式・自作の編集）</h3>
 <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
 ${allAllies.map(a => `
 <div class="flex items-center justify-between bg-emerald-50 border border-[#2c1e16] rounded-xl px-2.5 py-1.5 gap-1">
 <div class="min-w-0 truncate">
 <span class="text-[9px] font-black px-1 rounded ${a.isDefaultOfficial ? 'bg-amber-200' : 'bg-emerald-300'}">${a.isDefaultOfficial ? '公式' : '自作'}</span>
 ${a.isEditedOfficial ? '<span class="text-[9px] font-black bg-sky-200 px-1 rounded">改</span>' : ''}
 <span class="font-black ml-0.5">${a.name}</span>
 <span class="text-[10px] text-stone-500">(${a.rarity})</span>
 </div>
 <div class="flex gap-1 shrink-0">
 <button onclick="editSavedAlly('${a.id}')" class="bg-sky-300 text-[#2c1e16] font-black px-2 py-0.5 rounded border border-[#2c1e16]">編集</button>
 ${a.isDefaultOfficial
 ? (a.isEditedOfficial ? `<button onclick="deleteSavedAlly('${a.id}')" class="bg-stone-300 text-[#2c1e16] font-black px-1.5 py-0.5 rounded border border-[#2c1e16]">戻す</button>` : '')
 : `<button onclick="deleteSavedAlly('${a.id}')" class="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded">削除</button>`
 }
 </div>
 </div>
 `).join('')}
 </div>
 </div>

 <div class="bg-white border-3 border-[#2c1e16] rounded-2xl p-3">
 <h3 class="font-black text-sm text-[#2c1e16] mb-2">👾 敵キャラクター一覧（公式・自作の編集）</h3>
 <div class="space-y-1.5 max-h-60 overflow-y-auto pr-1">
 ${allEnemies.map(e => `
 <div class="flex items-center justify-between bg-rose-50 border border-[#2c1e16] rounded-xl px-2.5 py-1.5 gap-1">
 <div class="min-w-0 truncate">
 <span class="text-[9px] font-black px-1 rounded ${e.isDefaultOfficial ? 'bg-amber-200' : 'bg-rose-300'}">${e.isDefaultOfficial ? '公式' : '自作'}</span>
 ${e.isEditedOfficial ? '<span class="text-[9px] font-black bg-sky-200 px-1 rounded">改</span>' : ''}
 <span class="font-black ml-0.5">${e.name}</span>
 <span class="text-[10px] text-stone-500">(HP:${e.hp})</span>
 </div>
 <div class="flex gap-1 shrink-0">
 <button onclick="editSavedEnemy('${e.id}')" class="bg-sky-300 text-[#2c1e16] font-black px-2 py-0.5 rounded border border-[#2c1e16]">編集</button>
 ${e.isDefaultOfficial
 ? (e.isEditedOfficial ? `<button onclick="deleteSavedEnemy('${e.id}')" class="bg-stone-300 text-[#2c1e16] font-black px-1.5 py-0.5 rounded border border-[#2c1e16]">戻す</button>` : '')
 : `<button onclick="deleteSavedEnemy('${e.id}')" class="bg-rose-500 text-white font-black px-1.5 py-0.5 rounded">削除</button>`
 }
 </div>
 </div>
 `).join('')}
 </div>
 </div>
 </div>
 </div>
 `;
}

function editSavedStage(id) {
 const found = getAllStages().find(s => s.id === id);
 if (!found) return;
 stageDraft = JSON.parse(JSON.stringify(found));
 stageDraft.editingId = found.id;
 stageDraft.isOfficialSlot = !!found.isOfficial;
 stageDraft.rewardKobanChance = stageDraft.rewardKobanChance ?? 100;
 stageDraft.rewardXpChance = stageDraft.rewardXpChance ?? 100;
 stageDraft.rewardTicketChance = stageDraft.rewardTicketChance ?? 100;
 stageDraft.spawns = (stageDraft.spawns || []).map(s => ({
 ...s,
 magnification: s.magnification ?? 100,
 guardBase: !!s.guardBase
 }));
 switchWorkshopTab('stage');
}

function deleteSavedStage(id) {
 if (DEFAULT_STAGES.some(s => s.id === id)) {
 delete userStore.editedOfficialStages[id];
 saveUserStore();
 showToast('公式ステージを初期設定に戻しました');
 renderWorkshopContent();
 return;
 }
 userStore.customStages = userStore.customStages.filter(s => s.id !== id);
 userStore.officialCustomStages = userStore.officialCustomStages.filter(s => s.id !== id);
 saveUserStore();
 showToast('ステージを削除しました');
 renderWorkshopContent();
}

function editSavedAlly(id) {
 const found = getAllAllies().find(a => a.id === id);
 if (!found) return;
 allyDraft = JSON.parse(JSON.stringify(found));
 allyDraft.editingId = found.id;
 allyDraft.attackAnim = allyDraft.attackAnim || 'default';
 allyDraft.abilities = (allyDraft.abilities || []).map(ab => ({
 ...ab,
 trigger: ab.trigger || 'always',
 triggerValue: ab.triggerValue ?? 50
 }));
 switchWorkshopTab('ally');
}

function deleteSavedAlly(id) {
 if (DEFAULT_ALLIES.some(a => a.id === id)) {
 delete userStore.editedOfficialAllies[id];
 saveUserStore();
 showToast('公式味方キャラを初期設定に戻しました');
 renderWorkshopContent();
 return;
 }
 userStore.customAllies = userStore.customAllies.filter(a => a.id !== id);
 delete userStore.ownedAllies[id];
 userStore.deckIds = userStore.deckIds.map(d => (d === id ? null : d));
 saveUserStore();
 showToast('自作味方キャラを削除しました');
 renderWorkshopContent();
}

function editSavedEnemy(id) {
 const found = getAllEnemiesMap()[id];
 if (!found) return;
 enemyDraft = JSON.parse(JSON.stringify(found));
 enemyDraft.editingId = found.id;
 enemyDraft.attackAnim = enemyDraft.attackAnim || 'default';
 enemyDraft.abilities = (enemyDraft.abilities || []).map(ab => ({
 ...ab,
 trigger: ab.trigger || 'always',
 triggerValue: ab.triggerValue ?? 50
 }));
 switchWorkshopTab('enemy');
}

function deleteSavedEnemy(id) {
 if (DEFAULT_ENEMIES[id]) {
 delete userStore.editedOfficialEnemies[id];
 saveUserStore();
 showToast('公式敵キャラを初期設定に戻しました');
 renderWorkshopContent();
 return;
 }
 delete userStore.customEnemies[id];
 saveUserStore();
 showToast('自作敵キャラを削除しました');
 renderWorkshopContent();
}

function escapeHtml(str) {
 return String(str || '')
 .replace(/&/g, '&amp;')
 .replace(/</g, '&lt;')
 .replace(/>/g, '&gt;')
 .replace(/"/g, '&quot;');
}

