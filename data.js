/* ============================================================================
 おもち大戦争 - 1. 敵属性・特殊能力・公式データ定義
 (import/export 不使用・グローバル定義)
============================================================================ */

// 敵の属性マスターデータ
const TRAIT_INFO = {
 white: { label: '白い敵', icon: '⚪', badgeClass: 'bg-stone-100 text-stone-800 border-stone-400' },
 sweet: { label: '甘い敵', icon: '🍰', badgeClass: 'bg-pink-100 text-pink-800 border-pink-400' },
 spicy: { label: '辛口', icon: '🌶️', badgeClass: 'bg-red-100 text-red-800 border-red-400' },
 cold: { label: '冷たい敵', icon: '❄️', badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-400' },
 metal: { label: '硬い敵', icon: '🛡️', badgeClass: 'bg-slate-200 text-slate-900 border-slate-500' },
 all: { label: '全属性', icon: '🌈', badgeClass: 'bg-amber-100 text-amber-900 border-amber-400' }
};

// 特殊能力・妨害マスターデータ
const ABILITY_INFO = {
 strong: { label: 'めっぽう強い', short: 'めっぽう強い(与1.8倍/被0.5倍)', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: false, desc: '対象属性に与ダメ1.8倍・被ダメ0.5倍' },
 massive: { label: '超ダメージ', short: '超ダメージ(与3.5倍)', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: false, desc: '対象属性に与ダメ3.5倍' },
 insane_damage: { label: '極ダメージ', short: '極ダメージ(与5.0倍)', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: false, desc: '対象属性に与ダメ5.0倍' },
 resistant: { label: '打たれ強い', short: '打たれ強い(被0.25倍)', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: false, desc: '対象属性からの被ダメ0.25倍' },
 insane_resist: { label: '超打たれ強い', short: '超打たれ強い(被0.15倍)', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: false, desc: '対象属性からの被ダメ0.15倍' },
 freeze: { label: '動きを止める', short: 'フリーズ妨害', hasDuration: true, hasLevel: false, needsTarget: true, needsChance: true, desc: '対象属性を一定時間完全停止' },
 slow: { label: '動きを遅くする', short: '鈍足妨害', hasDuration: true, hasLevel: false, needsTarget: true, needsChance: true, desc: '対象属性の移動速度を大幅低下' },
 knockback: { label: 'ふっとばす', short: 'ふっとばし妨害', hasDuration: false, hasLevel: false, needsTarget: true, needsChance: true, desc: '対象属性を後方へ吹き飛ばす' },
 wave: { label: '波動攻撃', short: '地面波動攻撃', hasDuration: false, hasLevel: true, needsTarget: false, needsChance: true, desc: '地面を走る衝撃波で奥の敵まで攻撃' },
 surge: { label: '烈波攻撃', short: '烈波攻撃', hasDuration: false, hasLevel: true, needsTarget: false, needsChance: true, desc: '指定位置に持続する光の柱を発生' },
 explosion: { label: '爆波攻撃', short: '爆波攻撃', hasDuration: false, hasLevel: false, needsTarget: false, needsChance: true, desc: '左右に広がる3段階の連続爆発' },
 crit: { label: '会心の一撃', short: 'クリティカル(2.5倍・硬い貫通)', hasDuration: false, hasLevel: false, needsTarget: false, needsChance: true, desc: '硬い敵の装甲を貫通し2.5倍ダメージ' },
 savage_blow: { label: '渾身の一撃', short: '渾身の一撃(3.0倍)', hasDuration: false, hasLevel: false, needsTarget: false, needsChance: true, desc: '確率で3.0倍の強烈な一撃' }
};

// 難易度（数値または旧★文字列）を「★1」「★12」「★100」形式にフォーマット
function formatDifficulty(diff) {
 if (typeof diff === 'number' && !isNaN(diff)) {
 return `★${Math.max(1, Math.floor(diff))}`;
 }
 if (typeof diff === 'string') {
 const trimmed = diff.trim();
 if (/^\d+$/.test(trimmed)) {
 return `★${Math.max(1, parseInt(trimmed, 10))}`;
 }
 const starCount = (trimmed.match(/★/g) || []).length;
 if (starCount > 0) {
 return `★${starCount}`;
 }
 return trimmed || '★1';
 }
 return '★1';
}

// 特殊能力配列を日本語テキストに変換
function formatAbilitiesText(abilities) {
 if (!abilities || abilities.length === 0) return '特殊能力なし';
 const immuneLabels = {
 all_cc: '全妨害無効',
 freeze: '停止無効',
 slow: '鈍足無効',
 knockback: 'ふっとばし無効',
 wave: '波動無効',
 surge: '烈波無効',
 explosion: '爆波無効',
 atk_down: '攻撃力低下無効',
 curse: '呪い無効',
 poison: '毒撃無効'
 };
 return abilities.map(ab => {
 const info = ABILITY_INFO[ab.type];
 if (!info) return '';
 const tr = TRAIT_INFO[ab.target || 'all'] || TRAIT_INFO.all;
 if (ab.type === 'wave') return `${ab.chance || 100}%でLv${ab.level || 1}波動`;
 if (ab.type === 'surge') return `${ab.chance || 100}%でLv${ab.level || 1}烈波`;
 if (ab.type === 'explosion') return `${ab.chance || 100}%で爆波攻撃`;
 if (ab.type === 'crit') return `${ab.chance || 30}%で会心の一撃`;
 if (ab.type === 'savage_blow') return `${ab.chance || 30}%で渾身の一撃`;
 if (ab.type === 'barrier') return `バリア(耐久${ab.barrierHp ?? 1000})`;
 if (ab.type === 'barrier_break') return `${ab.chance || 100}%でバリア破壊`;
 if (ab.type === 'shield') return `シールド(HP${ab.shieldHp ?? 2000})`;
 if (ab.type === 'shield_break') return `${ab.chance || 100}%でシールド破壊`;
 if (ab.type === 'survive') return `${ab.chance || 100}%で1度だけ生き残る`;
 if (ab.type === 'one_hit') return '1回攻撃(使い切り)';
 if (ab.type === 'atk_up') return `攻撃力+${ab.atkUpPct ?? 100}%`;
 if (ab.type === 'immune') return immuneLabels[ab.immuneType || 'all_cc'] || '妨害無効';
 if (ab.type === 'ld_single') return `遠方単体(${ab.ldMin ?? 120}〜${ab.ldMax ?? 320})`;
 if (ab.type === 'ld_area') return `遠方範囲(${ab.ldMin ?? 120}〜${ab.ldMax ?? 320})`;
 if (ab.type === 'omni') return `全方位攻撃(${ab.ldMin ?? -100}〜${ab.ldMax ?? 300})`;

 const targetPrefix = ab.target && ab.target !== 'all' ? `${tr.icon}${tr.label}に` : '全属性に';
 if (ab.type === 'atk_down') {
 return `${targetPrefix}${ab.chance || 100}%で${ab.duration || 3}秒攻撃-${ab.atkDownPct ?? 50}%`;
 }
 if (ab.type === 'poison') {
 return `${targetPrefix}${ab.chance || 100}%で最大HPの${ab.poisonPct ?? 30}%毒撃`;
 }
 if (info.hasDuration) {
 return `${targetPrefix}${ab.chance || 100}%で${ab.duration || 2}秒${info.label}`;
 }
 if (ab.type === 'knockback') {
 return `${targetPrefix}${ab.chance || 100}%で${info.label}`;
 }
 return `${targetPrefix}${info.label}`;
 }).filter(Boolean).join(' ／ ');
}

/* ----------------------------------------------------------------------------
 公式味方キャラクター全27体（基本5・EX5・レア5・激レア5・超激レア5・伝説レア2）
---------------------------------------------------------------------------- */
const DEFAULT_ALLIES = [
 // --- 基本（初期所持5体） ---
 {
 id: 'maru',
 name: '丸もち',
 rarity: '基本',
 shape: 'maru',
 attackAnim: 'default',
 bodyColor: '#fffdf9',
 accessory: 'none',
 scale: 1.0,
 cost: 50,
 cooldown: 1.8,
 hp: 150,
 atk: 30,
 range: 52,
 speed: 84,
 attackInterval: 1.1,
 windup: 0.25,
 kb: 3,
 aoe: false,
 abilities: [],
 desc: 'どこにでもいる普通の丸いおもち。安価で再生産が早く、おもち軍団の突撃隊として前線を支える。'
 },
 {
 id: 'kapikapi',
 name: 'カピカピもち',
 rarity: '基本',
 shape: 'kapikapi',
 attackAnim: 'default',
 bodyColor: '#ede0c8',
 accessory: 'none',
 scale: 1.0,
 cost: 100,
 cooldown: 2.5,
 hp: 560,
 atk: 10,
 range: 45,
 speed: 55,
 attackInterval: 1.6,
 windup: 0.3,
 kb: 2,
 aoe: false,
 abilities: [],
 desc: '乾燥した部屋に3日放置され岩のように硬くなったおもち。攻撃力はほぼ無いが、驚異のタフネスで味方を守る壁役。'
 },
 {
 id: 'isobe',
 name: '磯辺もち',
 rarity: '基本',
 shape: 'isobe',
 attackAnim: 'default',
 bodyColor: '#fef3c7',
 accessory: 'nori',
 scale: 1.0,
 cost: 250,
 cooldown: 4.2,
 hp: 340,
 atk: 98,
 range: 115,
 speed: 75,
 attackInterval: 1.45,
 windup: 0.35,
 kb: 3,
 aoe: true,
 abilities: [],
 desc: '醤油の香ばしい香りをまとった不良おもち。海苔の特攻服を翻し、範囲攻撃で群がるザコ敵を一網打尽にする。'
 },
 {
 id: 'kimo',
 name: 'キモもち',
 rarity: '基本',
 shape: 'kimo',
 attackAnim: 'default',
 bodyColor: '#ffffff',
 accessory: 'none',
 scale: 1.0,
 cost: 400,
 cooldown: 5.8,
 hp: 280,
 atk: 155,
 range: 220,
 speed: 68,
 attackInterval: 1.85,
 windup: 0.4,
 kb: 3,
 aoe: false,
 abilities: [],
 desc: 'なぜか人間のような美脚が生えてしまったおもち。歩き方が非常に気まずいが、長い脚のハイキックは長射程・高火力。'
 },
 {
 id: 'noshimochi',
 name: 'のしもち',
 rarity: '基本',
 shape: 'noshimochi',
 attackAnim: 'default',
 bodyColor: '#fffbeb',
 accessory: 'none',
 scale: 1.0,
 cost: 550,
 cooldown: 7.2,
 hp: 410,
 atk: 185,
 range: 290,
 speed: 45,
 attackInterval: 2.25,
 windup: 0.5,
 kb: 3,
 aoe: true,
 abilities: [],
 desc: '麺棒で極限まで薄く長く伸ばされた巨大な板もち。後方の安全な位置から巨大な板を叩きつけて範囲攻撃を行う。'
 },

 // --- EX（ガチャ非排出・クリア報酬／XP購入／小判購入で獲得 5体） ---
 {
 id: 'ex_kagami_knight',
 name: '鏡餅ナイト',
 rarity: 'EX',
 unlockType: 'koban',
 unlockCost: 3500,
 shape: 'ex_kagami_knight',
 attackAnim: 'lunge',
 bodyColor: '#f8fafc',
 accessory: 'none',
 scale: 1.0,
 cost: 440,
 cooldown: 5.0,
 hp: 960,
 atk: 185,
 range: 95,
 speed: 78,
 attackInterval: 1.4,
 windup: 0.3,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'strong', target: 'white', chance: 100 },
 { type: 'strong', target: 'sweet', chance: 100 }
 ],
 desc: '【EX・小判交換】白銀の餅鎧とみかんの兜を纏う誇り高き騎士。白い敵と甘い敵にめっぽう強く、前線で攻守に活躍する。'
 },
 {
 id: 'ex_botamochi',
 name: 'ぼたもち仙人',
 rarity: 'EX',
 unlockType: 'xp',
 unlockCost: 2200,
 shape: 'ex_botamochi',
 attackAnim: 'beam',
 bodyColor: '#4c1d1b',
 accessory: 'none',
 scale: 1.0,
 cost: 660,
 cooldown: 7.5,
 hp: 680,
 atk: 215,
 range: 255,
 speed: 52,
 attackInterval: 2.1,
 windup: 0.45,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'slow', target: 'all', chance: 60, duration: 2.5 },
 { type: 'wave', target: 'all', chance: 35, level: 2 }
 ],
 desc: '【EX・XP解放】お彼岸の山奥で千年の修行を積んだつぶあんの仙人。あんこ法術の波動で敵全体の足を鈍らせる！'
 },
 {
 id: 'ex_kashiwa',
 name: 'かしわもち剣豪',
 rarity: 'EX',
 unlockType: 'stage',
 unlockStageId: 'stage_3',
 shape: 'ex_kashiwa',
 attackAnim: 'spin',
 bodyColor: '#ffffff',
 accessory: 'none',
 scale: 1.0,
 cost: 530,
 cooldown: 5.8,
 hp: 780,
 atk: 255,
 range: 105,
 speed: 96,
 attackInterval: 1.35,
 windup: 0.28,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'crit', target: 'all', chance: 40 },
 { type: 'barrier_break', target: 'all', chance: 100 }
 ],
 desc: '【EX・第4章クリア報酬】香り高い柏の葉のマントを翻す孤高の剣豪もち。どんなバリアも一刀両断し、40%の会心の一撃を放つ！'
 },
 {
 id: 'ex_mitarashi',
 name: 'みたらし団子三兄弟',
 rarity: 'EX',
 unlockType: 'xp',
 unlockCost: 4800,
 shape: 'ex_mitarashi',
 attackAnim: 'stretch',
 bodyColor: '#fef3c7',
 accessory: 'none',
 scale: 1.0,
 cost: 790,
 cooldown: 8.2,
 hp: 1050,
 atk: 290,
 range: 165,
 speed: 82,
 attackInterval: 1.5,
 windup: 0.32,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'massive', target: 'cold', chance: 100 },
 { type: 'knockback', target: 'cold', chance: 50 }
 ],
 desc: '【EX・XP解放】甘辛い特製タレを纏った息ピッタリの三兄弟。冷たい敵に超ダメージを与え、串刺し突撃で吹き飛ばす！'
 },
 {
 id: 'ex_yakimochi',
 name: '燃える焼きもち番長',
 rarity: 'EX',
 unlockType: 'stage',
 unlockStageId: 'stage_7',
 shape: 'ex_yakimochi',
 attackAnim: 'slam',
 bodyColor: '#fef08a',
 accessory: 'none',
 scale: 1.0,
 cost: 880,
 cooldown: 9.0,
 hp: 1320,
 atk: 340,
 range: 135,
 speed: 74,
 attackInterval: 1.65,
 windup: 0.35,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'massive', target: 'metal', chance: 100 },
 { type: 'crit', target: 'all', chance: 35 },
 { type: 'survive', target: 'all', chance: 100 }
 ],
 desc: '【EX・第8章クリア報酬】七輪の炭火でこんがり膨れ上がった熱血番長！硬い敵への超ダメージ＆会心を持ち、1度だけ根性で生き残る！'
 },

 // --- レア（ガチャ排出70%・ドロップ 5体） ---
 {
 id: 'kinako',
 name: 'きなこもち',
 rarity: 'レア',
 shape: 'kinako',
 attackAnim: 'default',
 bodyColor: '#eab308',
 accessory: 'none',
 scale: 1.0,
 cost: 180,
 cooldown: 3.0,
 hp: 260,
 atk: 68,
 range: 65,
 speed: 128,
 attackInterval: 1.15,
 windup: 0.22,
 kb: 3,
 aoe: false,
 abilities: [
 { type: 'slow', target: 'sweet', chance: 55, duration: 2.5 }
 ],
 desc: '香ばしい黄粉を全身にまぶしたスピードスター。甘いスイーツ系の敵に黄粉を浴びせて喉を渇かせ、動きを遅くする。'
 },
 {
 id: 'yomogi',
 name: 'よもぎもち',
 rarity: 'レア',
 shape: 'yomogi',
 attackAnim: 'default',
 bodyColor: '#4d7c0f',
 accessory: 'none',
 scale: 1.0,
 cost: 320,
 cooldown: 4.8,
 hp: 520,
 atk: 95,
 range: 105,
 speed: 68,
 attackInterval: 1.55,
 windup: 0.35,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'resistant', target: 'cold', chance: 100 },
 { type: 'knockback', target: 'cold', chance: 45 }
 ],
 desc: '春の野原の生命力を宿した草もち。冷たい敵の攻撃をものともせず耐え抜き、力強い体当たりで後方へふっとばす。'
 },
 {
 id: 'oshiruko',
 name: 'おしるこもち',
 rarity: 'レア',
 shape: 'oshiruko',
 attackAnim: 'default',
 bodyColor: '#fffdf9',
 accessory: 'none',
 scale: 1.0,
 cost: 480,
 cooldown: 6.8,
 hp: 310,
 atk: 135,
 range: 245,
 speed: 58,
 attackInterval: 2.0,
 windup: 0.45,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'massive', target: 'spicy', chance: 100 }
 ],
 desc: '熱々の小豆スープ風呂に浸かった優雅なおもち。激辛な敵の辛さを極上の甘みで中和し、超ダメージを与える遠距離砲台。'
 },
 {
 id: 'sakura',
 name: '桜もち',
 rarity: 'レア',
 shape: 'sakura',
 attackAnim: 'default',
 bodyColor: '#f472b6',
 accessory: 'none',
 scale: 1.0,
 cost: 360,
 cooldown: 4.5,
 hp: 460,
 atk: 115,
 range: 95,
 speed: 85,
 attackInterval: 1.45,
 windup: 0.3,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'strong', target: 'sweet', chance: 100 },
 { type: 'knockback', target: 'sweet', chance: 45 }
 ],
 desc: '塩漬けの桜の葉を巻いた風流なおもち。洋菓子などの甘い敵にめっぽう強く、塩気で甘さを引き締めてふっとばす！'
 },
 {
 id: 'abekawa',
 name: '安倍川もち',
 rarity: 'レア',
 shape: 'abekawa',
 attackAnim: 'default',
 bodyColor: '#f59e0b',
 accessory: 'none',
 scale: 1.0,
 cost: 420,
 cooldown: 5.2,
 hp: 350,
 atk: 120,
 range: 80,
 speed: 112,
 attackInterval: 1.1,
 windup: 0.22,
 kb: 3,
 aoe: false,
 abilities: [
 { type: 'massive', target: 'spicy', chance: 100 }
 ],
 desc: '砂糖ときなこを贅沢に重ねがけした静岡生まれの名物もち。激辛な敵に対して圧倒的な超ダメージを叩き出す連撃アタッカー。'
 },

 // --- 激レア（ガチャ排出25%・5体） ---
 {
 id: 'kinchaku',
 name: 'もち巾着',
 rarity: '激レア',
 shape: 'kinchaku',
 attackAnim: 'default',
 bodyColor: '#d97706',
 accessory: 'none',
 scale: 1.0,
 cost: 620,
 cooldown: 8.5,
 hp: 980,
 atk: 175,
 range: 120,
 speed: 52,
 attackInterval: 1.9,
 windup: 0.45,
 kb: 2,
 aoe: true,
 abilities: [
 { type: 'resistant', target: 'all', chance: 100 },
 { type: 'wave', target: 'all', chance: 40, level: 2 }
 ],
 desc: 'おでん界から参戦した重装甲おもち。油揚げの鎧は全属性に打たれ強く、出汁を迸らせながらLv2の波動衝撃波を放つ。'
 },
 {
 id: 'cheese',
 name: 'チーズもち',
 rarity: '激レア',
 shape: 'cheese',
 attackAnim: 'default',
 bodyColor: '#fde047',
 accessory: 'none',
 scale: 1.0,
 cost: 550,
 cooldown: 7.5,
 hp: 430,
 atk: 140,
 range: 165,
 speed: 66,
 attackInterval: 1.85,
 windup: 0.4,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'freeze', target: 'all', chance: 50, duration: 2.2 }
 ],
 desc: 'とろ〜り伸びる濃厚チーズを纏った妨害のスペシャリスト。粘り気たっぷりのチーズ網で全属性の敵の動きを完全に止める。'
 },
 {
 id: 'chikara',
 name: '力もち',
 rarity: '激レア',
 shape: 'chikara',
 attackAnim: 'default',
 bodyColor: '#fff7ed',
 accessory: 'none',
 scale: 1.0,
 cost: 520,
 cooldown: 6.5,
 hp: 580,
 atk: 210,
 range: 75,
 speed: 82,
 attackInterval: 1.4,
 windup: 0.35,
 kb: 3,
 aoe: false,
 abilities: [
 { type: 'crit', target: 'all', chance: 45 },
 { type: 'strong', target: 'metal', chance: 100 }
 ],
 desc: '気合のハチマキを締めた怪力おもち。どんなに硬い装甲の敵も高確率の「会心の一撃」で粉砕する頼れるファイター。'
 },
 {
 id: 'warabi',
 name: 'わらびもち忍者',
 rarity: '激レア',
 shape: 'warabi',
 attackAnim: 'spin',
 bodyColor: '#78350f',
 accessory: 'none',
 scale: 1.0,
 cost: 640,
 cooldown: 7.2,
 hp: 540,
 atk: 195,
 range: 130,
 speed: 145,
 attackInterval: 1.35,
 windup: 0.25,
 kb: 4,
 aoe: true,
 abilities: [
 { type: 'slow', target: 'cold', chance: 75, duration: 3.0 },
 { type: 'crit', target: 'all', chance: 35 }
 ],
 desc: 'プルプルの透明ボディで影のように駆ける隠密もち。冷たい敵の動きを遅くし、きなこ手裏剣で会心の一撃も狙う！'
 },
 {
 id: 'kusa_daifuku',
 name: '豆大福将軍',
 rarity: '激レア',
 shape: 'kusa_daifuku',
 attackAnim: 'slam',
 bodyColor: '#f8fafc',
 accessory: 'none',
 scale: 1.0,
 cost: 750,
 cooldown: 9.0,
 hp: 1180,
 atk: 230,
 range: 110,
 speed: 55,
 attackInterval: 1.85,
 windup: 0.4,
 kb: 3,
 aoe: true,
 abilities: [
 { type: 'resistant', target: 'metal', chance: 100 },
 { type: 'crit', target: 'all', chance: 50 }
 ],
 desc: '硬い赤えんどう豆を全身に埋め込んだ重装大福。硬い敵の攻撃を耐え抜き、50%の高確率会心で鉄壁の敵を粉砕する。'
 },

 // --- 超激レア（ガチャ排出4.5%・5体） ---
 {
 id: 'zunda',
 name: 'ずんだもち',
 rarity: '超激レア',
 shape: 'zunda',
 attackAnim: 'default',
 bodyColor: '#f8fafc',
 accessory: 'zunda',
 scale: 1.0,
 cost: 1050,
 cooldown: 13.0,
 hp: 1550,
 atk: 450,
 range: 175,
 speed: 48,
 attackInterval: 2.6,
 windup: 0.65,
 kb: 4,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'knockback', target: 'all', chance: 65 }
 ],
 desc: '【超激レア】東北から降臨した緑の破壊神。巨大なすり鉢を叩きつけ、周囲の敵をまとめてすり潰し後方へふっとばす。'
 },
 {
 id: 'ichigo_hime',
 name: 'いちご大福姫',
 rarity: '超激レア',
 shape: 'ichigo_hime',
 attackAnim: 'beam',
 bodyColor: '#ffe4e6',
 accessory: 'none',
 scale: 1.0,
 cost: 1150,
 cooldown: 14.0,
 hp: 1280,
 atk: 390,
 range: 210,
 speed: 58,
 attackInterval: 2.35,
 windup: 0.55,
 kb: 3,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'massive', target: 'sweet', chance: 100 },
 { type: 'massive', target: 'cold', chance: 100 },
 { type: 'freeze', target: 'all', chance: 55, duration: 2.4 }
 ],
 desc: '【超激レア】最高級あまおうを戴く和スイーツ界の王女。甘い敵・冷たい敵に超ダメージを与え、華麗なオーラで敵を凍りつかせる。'
 },
 {
 id: 'oshougatsu',
 name: '黄金の鏡餅神・オショウガツ',
 rarity: '超激レア',
 shape: 'oshougatsu',
 attackAnim: 'beam',
 bodyColor: '#facc15',
 accessory: 'mikan',
 scale: 1.0,
 cost: 1400,
 cooldown: 16.5,
 hp: 2100,
 atk: 520,
 range: 265,
 speed: 42,
 attackInterval: 2.9,
 windup: 0.7,
 kb: 4,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'strong', target: 'all', chance: 100 },
 { type: 'wave', target: 'all', chance: 55, level: 4 }
 ],
 desc: '【超激レア】三が日の神力を極めた究極の鏡餅神。全属性にめっぽう強く、神々しい初日の出ビームとともにLv4の超波動を放つ！'
 },
 {
 id: 'kagami_dragon',
 name: '昇龍鏡餅・リュウジン',
 rarity: '超激レア',
 shape: 'kagami_dragon',
 attackAnim: 'lunge',
 bodyColor: '#38bdf8',
 accessory: 'none',
 scale: 1.0,
 cost: 1550,
 cooldown: 18.0,
 hp: 2350,
 atk: 610,
 range: 280,
 speed: 50,
 attackInterval: 3.1,
 windup: 0.75,
 kb: 4,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'massive', target: 'spicy', chance: 100 },
 { type: 'massive', target: 'white', chance: 100 },
 { type: 'wave', target: 'all', chance: 65, level: 5 }
 ],
 desc: '【超激レア】お餅の伸びる力で天へ昇った水龍神。白い敵と辛口に超ダメージを与え、画面端まで届くLv5の龍神波動を放つ！'
 },
 {
 id: 'momo_tengu',
 name: '桃太郎きびだんご神',
 rarity: '超激レア',
 shape: 'momo_tengu',
 attackAnim: 'spin',
 bodyColor: '#fda4af',
 accessory: 'none',
 scale: 1.0,
 cost: 1320,
 cooldown: 15.0,
 hp: 1850,
 atk: 480,
 range: 235,
 speed: 64,
 attackInterval: 2.5,
 windup: 0.55,
 kb: 4,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'freeze', target: 'all', chance: 60, duration: 2.5 },
 { type: 'knockback', target: 'all', chance: 60 },
 { type: 'crit', target: 'all', chance: 40 }
 ],
 desc: '【超激レア】伝説のきびだんごでお供を従えるおとぎ話の英雄もち。フリーズ・ふっとばし・会心の一撃を併せ持つ万能の支配者。'
 },

 // --- 伝説レア（ガチャ排出0.5%・超希少2体） ---
 {
 id: 'legend_amaterasu',
 name: '天照鏡餅神・アマテラス',
 rarity: '伝説レア',
 shape: 'legend_amaterasu',
 attackAnim: 'beam',
 bodyColor: '#fef08a',
 accessory: 'none',
 scale: 1.0,
 cost: 1800,
 cooldown: 22.0,
 hp: 3400,
 atk: 880,
 range: 310,
 speed: 48,
 attackInterval: 3.1,
 windup: 0.75,
 kb: 5,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'massive', target: 'all', chance: 100 },
 { type: 'surge', target: 'all', chance: 100, level: 4, spawnOffset: 180 },
 { type: 'immune', target: 'all', immuneType: 'all_cc' }
 ],
 desc: '【伝説レア】虹色の神光輪と紅白しめ縄を戴く創世の最高神餅！全属性に超ダメージを与え、あらゆる妨害を無効化し神聖な烈波を降臨させる！'
 },
 {
 id: 'legend_galaxy_mochi',
 name: '銀河創世もち・モチノヴァ',
 rarity: '伝説レア',
 shape: 'legend_galaxy_mochi',
 attackAnim: 'meteor',
 bodyColor: '#312e81',
 accessory: 'none',
 scale: 1.0,
 cost: 1650,
 cooldown: 20.0,
 hp: 2950,
 atk: 790,
 range: 285,
 speed: 56,
 attackInterval: 2.85,
 windup: 0.65,
 kb: 4,
 aoe: true,
 isRare: true,
 abilities: [
 { type: 'omni', target: 'all', ldMin: -120, ldMax: 340 },
 { type: 'explosion', target: 'all', chance: 80 },
 { type: 'survive', target: 'all', chance: 100 }
 ],
 desc: '【伝説レア】大宇宙のビッグバンから誕生した星雲もち！前後を包み込む全方位攻撃と3連爆波を放ち、致死ダメージを受けても必ず1度復活する！'
 }
];

/* ----------------------------------------------------------------------------
 公式ライバル敵キャラクター全16体（属性＆特殊能力付き）
---------------------------------------------------------------------------- */
const DEFAULT_ENEMIES = {
 cookie_soldier: {
 id: 'cookie_soldier',
 name: 'クッキー兵',
 trait: 'white',
 tag: 'ザコ',
 shape: 'cookie_soldier',
 bodyColor: '#d97706',
 scale: 1.0,
 hp: 130,
 atk: 24,
 range: 48,
 speed: 80,
 attackInterval: 1.15,
 windup: 0.25,
 kb: 3,
 aoe: false,
 reward: 45,
 abilities: [],
 desc: '焼き菓子軍団の基本歩兵。サクサクと軽快な足取りで押し寄せるが、おもちの粘り気にはやや弱い。'
 },
 potechi_guy: {
 id: 'potechi_guy',
 name: 'ポテチ野郎',
 trait: 'spicy',
 tag: '辛口ザコ',
 shape: 'potechi',
 bodyColor: '#facc15',
 scale: 1.0,
 hp: 185,
 atk: 38,
 range: 55,
 speed: 88,
 attackInterval: 1.1,
 windup: 0.25,
 kb: 3,
 aoe: false,
 reward: 65,
 abilities: [],
 desc: 'ピリ辛スパイスを纏ったスナック兵。素早い連撃でおもちの前線を削ってくる。'
 },
 choco_slime: {
 id: 'choco_slime',
 name: 'チョコスライム',
 trait: 'sweet',
 tag: '甘いタンク',
 shape: 'cream',
 bodyColor: '#5c2d16',
 scale: 1.0,
 hp: 490,
 atk: 48,
 range: 55,
 speed: 52,
 attackInterval: 1.45,
 windup: 0.3,
 kb: 2,
 aoe: false,
 reward: 110,
 abilities: [],
 desc: '濃厚ビター＆スイートなチョコレート塊。高い体力で味方の進軍を食い止める盾役。'
 },
 boss_cooker: {
 id: 'boss_cooker',
 name: '暴走炊飯器',
 trait: 'white',
 tag: '第1章ボス',
 shape: 'boss_cooker',
 bodyColor: '#f1f5f9',
 scale: 1.0,
 hp: 2600,
 atk: 165,
 range: 145,
 speed: 36,
 attackInterval: 2.3,
 windup: 0.55,
 kb: 4,
 aoe: true,
 reward: 500,
 isBoss: true,
 abilities: [
 { type: 'knockback', target: 'all', chance: 40 }
 ],
 desc: '【第1章ボス】「もち米を蒸すのは俺の仕事だ！」と反乱を起こした炊飯器。高圧蒸気でおもちたちを後方へ吹き飛ばす。'
 },
 boss_mikan: {
 id: 'boss_mikan',
 name: '堕落のミカン星人',
 trait: 'sweet',
 tag: '第2章ボス',
 shape: 'boss_mikan',
 bodyColor: '#f97316',
 scale: 1.0,
 hp: 3800,
 atk: 195,
 range: 190,
 speed: 38,
 attackInterval: 2.2,
 windup: 0.5,
 kb: 4,
 aoe: true,
 reward: 650,
 isBoss: true,
 abilities: [
 { type: 'slow', target: 'all', chance: 60, duration: 2.8 }
 ],
 desc: '【第2章ボス】こたつUFOに乗った謎の宇宙人。ぬくぬく光線を浴びせ、おもちたちのやる気と移動速度を奪う。'
 },
 boss_kuromame: {
 id: 'boss_kuromame',
 name: '黒豆将軍',
 trait: 'metal',
 tag: '第3章ボス',
 shape: 'boss_kuromame',
 bodyColor: '#1c1917',
 scale: 1.0,
 hp: 420,
 atk: 260,
 range: 165,
 speed: 35,
 attackInterval: 2.35,
 windup: 0.6,
 kb: 4,
 aoe: true,
 reward: 900,
 isBoss: true,
 abilities: [],
 desc: '【第3章ボス・硬い敵】漆黒の重箱鎧に身を包んだ超硬質ボス！通常攻撃をほぼ弾き返すため、会心の一撃や手数で突破せよ！'
 },
 shortcake_mage: {
 id: 'shortcake_mage',
 name: 'ショートケーキ魔導士',
 trait: 'sweet',
 tag: '第4章ボス',
 shape: 'cake',
 bodyColor: '#fde047',
 scale: 1.0,
 hp: 4600,
 atk: 235,
 range: 225,
 speed: 40,
 attackInterval: 2.2,
 windup: 0.5,
 kb: 4,
 aoe: true,
 reward: 850,
 isBoss: true,
 abilities: [
 { type: 'slow', target: 'all', chance: 40, duration: 2.0 }
 ],
 desc: '【第4章ボス】洋菓子帝国の最高魔導士。遠距離からホイップ魔法弾を降り注がせ、甘い香りで動きを鈍らせる。'
 },
 macaron_cavalry: {
 id: 'macaron_cavalry',
 name: 'マカロン騎兵',
 trait: 'sweet',
 tag: '高速突撃',
 shape: 'macaron_cavalry',
 bodyColor: '#f472b6',
 scale: 1.0,
 hp: 360,
 atk: 95,
 range: 62,
 speed: 145,
 attackInterval: 1.05,
 windup: 0.2,
 kb: 3,
 aoe: false,
 reward: 140,
 abilities: [],
 desc: 'カラフルなマカロン車輪で爆走する突撃騎兵。油断するとあっという間に鏡餅城まで迫ってくる。'
 },
 boss_potechi_bancho: {
 id: 'boss_potechi_bancho',
 name: '激辛ポテチ番長',
 trait: 'spicy',
 tag: '第5章ボス',
 shape: 'boss_potechi_bancho',
 bodyColor: '#dc2626',
 scale: 1.0,
 hp: 5600,
 atk: 290,
 range: 170,
 speed: 42,
 attackInterval: 2.1,
 windup: 0.5,
 kb: 4,
 aoe: true,
 reward: 1000,
 isBoss: true,
 abilities: [
 { type: 'knockback', target: 'all', chance: 65 }
 ],
 desc: '【第5章ボス】駄菓子屋横丁を牛耳る激辛の総長。燃える唐辛子スイングでおもち軍団をまとめて後方へふっとばす。'
 },
 habanero_senbei: {
 id: 'habanero_senbei',
 name: 'ハバネロせんべい',
 trait: 'spicy',
 tag: '波動持ち',
 shape: 'habanero_senbei',
 bodyColor: '#b91c1c',
 scale: 1.0,
 hp: 650,
 atk: 130,
 range: 110,
 speed: 62,
 attackInterval: 1.75,
 windup: 0.35,
 kb: 3,
 aoe: false,
 reward: 190,
 abilities: [
 { type: 'wave', target: 'all', chance: 35, level: 2 }
 ],
 desc: '真っ赤な一味とハバネロを塗りたくった堅焼き煎餅。攻撃時に地面を走る辛い衝撃波（波動）を発生させる難敵。'
 },
 boss_garigari: {
 id: 'boss_garigari',
 name: '氷柱巨人ガリガリ',
 trait: 'cold',
 tag: '第6章ボス',
 shape: 'boss_garigari',
 bodyColor: '#38bdf8',
 scale: 1.0,
 hp: 7200,
 atk: 330,
 range: 185,
 speed: 32,
 attackInterval: 2.4,
 windup: 0.6,
 kb: 3,
 aoe: true,
 reward: 1200,
 isBoss: true,
 abilities: [
 { type: 'freeze', target: 'all', chance: 55, duration: 2.0 }
 ],
 desc: '【第6章ボス】冷凍庫の奥底に眠っていた絶対零度の巨人。冷気パンチを浴びたおもちはカチンコチンに凍りつき動けなくなる！'
 },
 boss_ozouni: {
 id: 'boss_ozouni',
 name: 'お雑煮大魔王',
 trait: 'all',
 tag: '第7章ボス',
 shape: 'boss_ozouni',
 bodyColor: '#18181b',
 scale: 1.0,
 hp: 9800,
 atk: 420,
 range: 220,
 speed: 34,
 attackInterval: 2.5,
 windup: 0.65,
 kb: 5,
 aoe: true,
 reward: 2000,
 isBoss: true,
 abilities: [
 { type: 'wave', target: 'all', chance: 45, level: 3 },
 { type: 'slow', target: 'all', chance: 40, duration: 2.2 },
 { type: 'knockback', target: 'all', chance: 35 }
 ],
 desc: '【第7章ボス】「おもちは雑煮の具材にすぎぬ！」と立ちはだかるお正月界の大魔王。波動・鈍足・ふっとばしを操る強敵！'
 },
 dorayaki_samurai: {
 id: 'dorayaki_samurai',
 name: 'どら焼き侍',
 trait: 'sweet',
 tag: '高火力剣士',
 shape: 'dorayaki_samurai',
 bodyColor: '#92400e',
 scale: 1.0,
 hp: 1100,
 atk: 265,
 range: 85,
 speed: 78,
 attackInterval: 1.45,
 windup: 0.3,
 kb: 3,
 aoe: true,
 reward: 260,
 abilities: [],
 desc: 'ふっくらカステラ盾とつぶあん刀を操る和菓子剣豪。甘い敵だが一撃の斬撃が非常に重く前線を切り裂く。'
 },
 boss_taiyaki: {
 id: 'boss_taiyaki',
 name: '黄金たい焼き大帝',
 trait: 'metal',
 tag: '第8章ボス',
 shape: 'boss_taiyaki',
 bodyColor: '#f59e0b',
 scale: 1.0,
 hp: 820,
 atk: 450,
 range: 200,
 speed: 36,
 attackInterval: 2.4,
 windup: 0.55,
 kb: 4,
 aoe: true,
 reward: 2400,
 isBoss: true,
 abilities: [
 { type: 'wave', target: 'all', chance: 45, level: 3 }
 ],
 desc: '【第8章ボス・硬い敵】カリカリの黄金薄皮装甲を誇る鯛の皇帝！通常ダメージを激減させつつ熱いあんこ波動を放つ超難敵！'
 },
 ice_parfait: {
 id: 'ice_parfait',
 name: '極寒パフェ女王',
 trait: 'cold',
 tag: '第9章ボス',
 shape: 'ice_parfait',
 bodyColor: '#bae6fd',
 scale: 1.0,
 hp: 13500,
 atk: 490,
 range: 255,
 speed: 33,
 attackInterval: 2.45,
 windup: 0.6,
 kb: 4,
 aoe: true,
 reward: 2800,
 isBoss: true,
 abilities: [
 { type: 'freeze', target: 'all', chance: 65, duration: 2.3 },
 { type: 'slow', target: 'all', chance: 75, duration: 3.0 }
 ],
 desc: '【第9章ボス】ガラスの聖杯にそびえ立つ冷菓の女王。超長射程の吹雪スプーンでおもち軍団を氷漬けにする。'
 },
 boss_wagashi_god: {
 id: 'boss_wagashi_god',
 name: 'スイーツゼウス・甘味神',
 trait: 'all',
 tag: '最終★6ボス',
 shape: 'boss_wagashi_god',
 bodyColor: '#fef08a',
 scale: 1.0,
 hp: 18500,
 atk: 620,
 range: 275,
 speed: 35,
 attackInterval: 2.6,
 windup: 0.65,
 kb: 5,
 aoe: true,
 reward: 5000,
 isBoss: true,
 abilities: [
 { type: 'wave', target: 'all', chance: 55, level: 4 },
 { type: 'freeze', target: 'all', chance: 40, duration: 1.8 },
 { type: 'knockback', target: 'all', chance: 50 }
 ],
 desc: '【最終章★6ボス】全おやつ界の頂点に君臨する神々の王！雷撃Lv4波動・凍結・ふっとばしの全てを繰り出す究極のラスボス！'
 }
};

/* ----------------------------------------------------------------------------
 公式ステージ全14章
---------------------------------------------------------------------------- */
const DEFAULT_STAGES = [
 {
 id: 'stage_0',
 category: 'official',
 chapter: '第1章',
 title: '台所・シンク前の攻防',
 difficulty: 1,
 theme: 'kitchen',
 enemyBaseName: '炊飯器城',
 enemyBaseHp: 2000,
 rewardKoban: 250,
 rewardKobanChance: 100,
 rewardXp: 260,
 rewardXpChance: 100,
 rewardTicket: 1,
 rewardTicketChance: 35,
 dropAllyId: 'kinako',
 dropChance: 35,
 spawns: [
 { enemyId: 'cookie_soldier', startTime: 1.0, interval: 3.6, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'potechi_guy', startTime: 8.0, interval: 6.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_cooker', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 75, isBoss: true }
 ]
 },
 {
 id: 'stage_1',
 category: 'official',
 chapter: '第2章',
 title: 'こたつ・ぬくぬく戦線',
 difficulty: 2,
 theme: 'kotatsu',
 enemyBaseName: 'こたつ城',
 enemyBaseHp: 3200,
 rewardKoban: 350,
 rewardKobanChance: 100,
 rewardXp: 400,
 rewardXpChance: 100,
 rewardTicket: 1,
 rewardTicketChance: 40,
 dropAllyId: 'sakura',
 dropChance: 30,
 spawns: [
 { enemyId: 'cookie_soldier', startTime: 1.0, interval: 3.4, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'choco_slime', startTime: 5.0, interval: 7.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'potechi_guy', startTime: 10.0, interval: 5.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_mikan', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 75, isBoss: true }
 ]
 },
 {
 id: 'stage_2',
 category: 'official',
 chapter: '第3章',
 title: 'おせち重箱・黒豆の陣',
 difficulty: 3,
 theme: 'osechi',
 enemyBaseName: '黒豆重箱城',
 enemyBaseHp: 4500,
 rewardKoban: 450,
 rewardKobanChance: 95,
 rewardXp: 540,
 rewardXpChance: 100,
 rewardTicket: 1,
 rewardTicketChance: 45,
 dropAllyId: 'chikara',
 dropChance: 20,
 spawns: [
 { enemyId: 'cookie_soldier', startTime: 1.0, interval: 3.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'choco_slime', startTime: 4.0, interval: 6.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'potechi_guy', startTime: 7.0, interval: 4.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_kuromame', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 78, isBoss: true }
 ]
 },
 {
 id: 'stage_3',
 category: 'official',
 chapter: '第4章',
 title: '洋菓子帝国・生クリーム城',
 difficulty: 3,
 theme: 'sweets',
 enemyBaseName: 'デコレーション城',
 enemyBaseHp: 5600,
 rewardKoban: 550,
 rewardKobanChance: 95,
 rewardXp: 600,
 rewardXpChance: 95,
 rewardTicket: 1,
 rewardTicketChance: 50,
 dropAllyId: 'ex_kashiwa',
 dropChance: 45,
 spawns: [
 { enemyId: 'macaron_cavalry', startTime: 2.0, interval: 4.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'choco_slime', startTime: 4.0, interval: 5.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'shortcake_mage', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 75, isBoss: true }
 ]
 },
 {
 id: 'stage_4',
 category: 'official',
 chapter: '第5章',
 title: '駄菓子屋横丁・激辛ストリート',
 difficulty: 4,
 theme: 'dagashi',
 enemyBaseName: '激辛せんべい城',
 enemyBaseHp: 6800,
 rewardKoban: 650,
 rewardKobanChance: 90,
 rewardXp: 720,
 rewardXpChance: 95,
 rewardTicket: 1,
 rewardTicketChance: 55,
 dropAllyId: 'abekawa',
 dropChance: 30,
 spawns: [
 { enemyId: 'potechi_guy', startTime: 1.0, interval: 3.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', startTime: 7.0, interval: 7.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_potechi_bancho', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 75, isBoss: true }
 ]
 },
 {
 id: 'stage_5',
 category: 'official',
 chapter: '第6章',
 title: '真冬の冷凍庫・絶対零度',
 difficulty: 4,
 theme: 'freezer',
 enemyBaseName: '氷河の製氷皿城',
 enemyBaseHp: 8200,
 rewardKoban: 750,
 rewardKobanChance: 90,
 rewardXp: 800,
 rewardXpChance: 95,
 rewardTicket: 1,
 rewardTicketChance: 60,
 dropAllyId: 'yomogi',
 dropChance: 35,
 spawns: [
 { enemyId: 'cookie_soldier', startTime: 1.0, interval: 2.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'choco_slime', startTime: 4.0, interval: 5.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', startTime: 9.0, interval: 7.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_garigari', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 78, isBoss: true }
 ]
 },
 {
 id: 'stage_6',
 category: 'official',
 chapter: '第7章',
 title: 'お雑煮の深淵・大椀決戦',
 difficulty: 5,
 theme: 'ozouni',
 enemyBaseName: '漆塗り大雑煮椀城',
 enemyBaseHp: 11000,
 rewardKoban: 950,
 rewardKobanChance: 90,
 rewardXp: 1000,
 rewardXpChance: 90,
 rewardTicket: 1,
 rewardTicketChance: 65,
 dropAllyId: 'kinchaku',
 dropChance: 22,
 spawns: [
 { enemyId: 'macaron_cavalry', startTime: 1.5, interval: 4.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', startTime: 5.0, interval: 6.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_kuromame', startTime: 14.0, interval: 28.0, maxCount: 2, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_ozouni', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 80, isBoss: true }
 ]
 },
 {
 id: 'stage_7',
 category: 'official',
 chapter: '第8章',
 title: '黄金たい焼き天守閣',
 difficulty: 5,
 theme: 'osechi',
 enemyBaseName: '黄金鉄板城',
 enemyBaseHp: 13500,
 rewardKoban: 1200,
 rewardKobanChance: 85,
 rewardXp: 1150,
 rewardXpChance: 90,
 rewardTicket: 1,
 rewardTicketChance: 70,
 dropAllyId: 'ex_yakimochi',
 dropChance: 35,
 spawns: [
 { enemyId: 'dorayaki_samurai', startTime: 2.0, interval: 5.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'macaron_cavalry', startTime: 4.0, interval: 4.4, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_taiyaki', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 80, isBoss: true }
 ]
 },
 {
 id: 'stage_8',
 category: 'official',
 chapter: '第9章',
 title: '氷晶パフェの女王宮殿',
 difficulty: 6,
 theme: 'freezer',
 enemyBaseName: 'クリスタルパフェ城',
 enemyBaseHp: 16500,
 rewardKoban: 1500,
 rewardKobanChance: 85,
 rewardXp: 1400,
 rewardXpChance: 90,
 rewardTicket: 2,
 rewardTicketChance: 55,
 dropAllyId: 'warabi',
 dropChance: 25,
 spawns: [
 { enemyId: 'dorayaki_samurai', startTime: 1.5, interval: 4.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', startTime: 5.0, interval: 6.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_garigari', startTime: 15.0, interval: 35.0, maxCount: 2, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'ice_parfait', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 82, isBoss: true }
 ]
 },
 {
 id: 'stage_9',
 category: 'official',
 chapter: '最終決戦',
 title: 'おやつ神殿・甘味ゼウス降臨',
 difficulty: 6,
 theme: 'ozouni',
 enemyBaseName: '天空スイーツ神殿',
 enemyBaseHp: 22000,
 rewardKoban: 2000,
 rewardKobanChance: 100,
 rewardXp: 1800,
 rewardXpChance: 100,
 rewardTicket: 2,
 rewardTicketChance: 75,
 dropAllyId: 'oshougatsu',
 dropChance: 12,
 spawns: [
 { enemyId: 'macaron_cavalry', startTime: 1.0, interval: 4.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'dorayaki_samurai', startTime: 3.5, interval: 5.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_kuromame', startTime: 12.0, interval: 30.0, maxCount: 2, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_wagashi_god', startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 85, isBoss: true }
 ]
 },
 // --- EXステージ ---
 {
 id: 'stage_10',
 category: 'official',
 chapter: 'EX第1章',
 title: '真夜中の電子レンジ迷宮',
 difficulty: 7,
 theme: 'kitchen',
 enemyBaseName: '超電磁オーブン城',
 enemyBaseHp: 28000,
 rewardKoban: 2400,
 rewardKobanChance: 90,
 rewardXp: 2000,
 rewardXpChance: 95,
 rewardTicket: 2,
 rewardTicketChance: 65,
 dropAllyId: 'oshiruko',
 dropChance: 35,
 spawns: [
 { enemyId: 'potechi_guy', magnification: 130, startTime: 1.0, interval: 3.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', magnification: 120, startTime: 4.0, interval: 5.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_cooker', magnification: 140, startTime: 8.0, interval: 26.0, maxCount: 2, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_potechi_bancho', magnification: 130, startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 80, isBoss: true, guardBase: true }
 ]
 },
 {
 id: 'stage_11',
 category: 'official',
 chapter: 'EX第2章',
 title: '極寒のアイスクリーム神殿',
 difficulty: 8,
 theme: 'freezer',
 enemyBaseName: '絶対零度アイスパレス',
 enemyBaseHp: 35000,
 rewardKoban: 3000,
 rewardKobanChance: 85,
 rewardXp: 2500,
 rewardXpChance: 90,
 rewardTicket: 2,
 rewardTicketChance: 70,
 dropAllyId: 'ichigo_hime',
 dropChance: 15,
 spawns: [
 { enemyId: 'macaron_cavalry', magnification: 130, startTime: 1.0, interval: 3.8, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'dorayaki_samurai', magnification: 125, startTime: 3.0, interval: 4.6, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_garigari', magnification: 130, startTime: 10.0, interval: 30.0, maxCount: 2, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'ice_parfait', magnification: 125, startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 85, isBoss: true, guardBase: true }
 ]
 },
 {
 id: 'stage_12',
 category: 'official',
 chapter: 'EX第3章',
 title: '漆黒の重箱・超硬質防衛線',
 difficulty: 9,
 theme: 'osechi',
 enemyBaseName: '不落の三段重箱城',
 enemyBaseHp: 42000,
 rewardKoban: 3600,
 rewardKobanChance: 85,
 rewardXp: 3200,
 rewardXpChance: 90,
 rewardTicket: 3,
 rewardTicketChance: 60,
 dropAllyId: 'zunda',
 dropChance: 15,
 spawns: [
 { enemyId: 'dorayaki_samurai', magnification: 140, startTime: 1.5, interval: 4.2, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_kuromame', magnification: 120, startTime: 4.0, interval: 20.0, maxCount: 3, baseHpTrigger: 100, isBoss: false, guardBase: true },
 { enemyId: 'boss_taiyaki', magnification: 125, startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 80, isBoss: true, guardBase: true }
 ]
 },
 {
 id: 'stage_13',
 category: 'official',
 chapter: '裏・最終決戦',
 title: 'おやつ宇宙の果て・甘味神々の黄昏',
 difficulty: 12,
 theme: 'newyear',
 enemyBaseName: '超次元スイーツ大聖堂',
 enemyBaseHp: 60000,
 rewardKoban: 6000,
 rewardKobanChance: 100,
 rewardXp: 5000,
 rewardXpChance: 100,
 rewardTicket: 3,
 rewardTicketChance: 85,
 dropAllyId: 'kagami_dragon',
 dropChance: 20,
 spawns: [
 { enemyId: 'macaron_cavalry', magnification: 150, startTime: 1.0, interval: 3.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'habanero_senbei', magnification: 145, startTime: 3.0, interval: 5.0, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'dorayaki_samurai', magnification: 145, startTime: 5.0, interval: 4.5, maxCount: 0, baseHpTrigger: 100, isBoss: false },
 { enemyId: 'boss_ozouni', magnification: 130, startTime: 12.0, interval: 40.0, maxCount: 2, baseHpTrigger: 100, isBoss: false, guardBase: true },
 { enemyId: 'boss_wagashi_god', magnification: 135, startTime: 0, interval: 99, maxCount: 1, baseHpTrigger: 85, isBoss: true, guardBase: true }
 ]
 }
];

// 働きもちレベル設定（Lv.1〜Lv.8）
const WORKER_LEVELS = [
 { level: 1, maxMoney: 1500, income: 85, upgradeCost: 100 },
 { level: 2, maxMoney: 2100, income: 148, upgradeCost: 240 },
 { level: 3, maxMoney: 2800, income: 195, upgradeCost: 400 },
 { level: 4, maxMoney: 3600, income: 250, upgradeCost: 700 },
 { level: 5, maxMoney: 4500, income: 250, upgradeCost: 1000 },
 { level: 6, maxMoney: 5600, income: 390, upgradeCost: 1400 },
 { level: 7, maxMoney: 7500, income: 480, upgradeCost: 2000 },
 { level: 8, maxMoney: 10000, income: 600, upgradeCost: null }
];

// トースト通知ヘルパー
function showToast(msg, type = 'info') {
 const container = document.getElementById('toast-container');
 if (!container) return;
 const el = document.createElement('div');
 const bg = type === 'error'
 ? 'bg-rose-600 text-white'
 : type === 'success'
 ? 'bg-emerald-400 text-[#2c1e16]'
 : type === 'rare'
 ? 'bg-gradient-to-r from-amber-300 via-pink-300 to-sky-300 text-[#2c1e16]'
 : 'bg-amber-300 text-[#2c1e16]';
 el.className = `${bg} font-black text-xs sm:text-sm px-4 py-2 rounded-full border-2 border-[#2c1e16] shadow-lg transition-opacity duration-300`;
 el.textContent = msg;
 container.appendChild(el);
 setTimeout(() => {
 el.style.opacity = '0';
 setTimeout(() => el.remove(), 300);
 }, 2400);
}

