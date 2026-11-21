/* ============================================================================
 おもち大戦争 - 3. サウンド・手描き＆写真スプライト描画・バトル物理エンジン
 (import/export 不使用・グローバル定義)
============================================================================ */

/* ============================================================================
 追加特殊能力・妨害マスター定義（自己強化／対属性／妨害／射程のメタ情報付き）
============================================================================ */
const EXTENDED_ABILITIES = {
 strong: { short: 'めっぽう強い', label: 'めっぽう強い', desc: '対象属性に与ダメ1.8倍・被ダメ0.5倍', needsTarget: true },
 massive: { short: '超ダメージ', label: '超ダメージ', desc: '対象属性に与ダメ3.5倍', needsTarget: true },
 insane_damage: { short: '極ダメージ', label: '極ダメージ', desc: '対象属性に与ダメ5.0倍', needsTarget: true },
 resistant: { short: '打たれ強い', label: '打たれ強い', desc: '対象属性からの被ダメ0.25倍', needsTarget: true },
 insane_resist: { short: '超打たれ強い', label: '超打たれ強い', desc: '対象属性からの被ダメ0.15倍', needsTarget: true },
 crit: { short: '会心の一撃', label: '会心の一撃', desc: '確率で2.5倍ダメージ（メタル貫通）', needsChance: true },
 savage_blow: { short: '渾身の一撃', label: '渾身の一撃', desc: '確率で3.0倍の強烈な一撃', needsChance: true },
 freeze: { short: '動きを止める', label: '動きを止める', desc: '確率で対象を凍結させる', needsTarget: true, needsChance: true, hasDuration: true },
 slow: { short: '動きを遅くする', label: '動きを遅くする', desc: '確率で対象を鈍足にする', needsTarget: true, needsChance: true, hasDuration: true },
 knockback: { short: 'ふっとばす', label: 'ふっとばす', desc: '確率で対象を後方へふっとばす', needsTarget: true, needsChance: true },
 wave: { short: '波動攻撃', label: '波動攻撃', desc: '確率で前方へ連続衝撃波を放つ', needsChance: true, hasLevel: true },
 surge: { short: '烈波攻撃', label: '烈波攻撃', desc: '指定位置に持続する光の柱を発生', needsChance: true, hasLevel: true, hasOffset: true },
 explosion: { short: '爆波攻撃', label: '爆波攻撃', desc: '左右に広がる3段階の連続爆発(100/70/40%)', needsChance: true },
 barrier: { short: 'バリア', label: 'バリア', desc: '【自分強化】耐久値未満の攻撃と全妨害を無効化', isSelfBuff: true, hasBarrierHp: true },
 barrier_break: { short: 'バリアブレーカー', label: 'バリアブレーカー', desc: '確率で相手のバリアを一撃破壊', needsChance: true },
 shield: { short: 'シールド', label: 'シールド', desc: '【自分強化】耐久値まで全攻撃吸収＆KBで再生', isSelfBuff: true, hasShieldHp: true },
 shield_break: { short: 'シールド破壊', label: 'シールド破壊', desc: '確率で相手のシールドを一撃破壊', needsChance: true },
 ld_single: { short: '遠方単体攻撃', label: '遠方単体攻撃', desc: '指定距離範囲内の1体を狙い撃ち', hasRangeBand: true },
 ld_area: { short: '遠方範囲攻撃', label: '遠方範囲攻撃', desc: '指定距離範囲内の敵すべてを同時攻撃', hasRangeBand: true },
 omni: { short: '全方位攻撃', label: '全方位攻撃', desc: '前後を含む指定距離範囲すべてを攻撃', hasRangeBand: true },
 one_hit: { short: '1回攻撃', label: '1回攻撃', desc: '【自分特性】1回攻撃すると戦場から消える', isSelfBuff: true },
 atk_up: { short: '攻撃力上昇', label: '攻撃力上昇', desc: '【自分強化】自分の攻撃力が指定割合アップする', isSelfBuff: true, hasAtkUpPct: true },
 atk_down: { short: '攻撃力低下', label: '攻撃力低下', desc: '確率で対象の攻撃力をダウンさせる', needsTarget: true, needsChance: true, hasDuration: true, hasAtkDownPct: true },
 survive: { short: '1度だけ生き残る', label: '1度だけ生き残る', desc: '【自分強化】致死ダメージを受けてもHP1で1度耐える', isSelfBuff: true, needsChance: true },
 curse: { short: '呪い', label: '呪い', desc: '確率で対象の妨害・属性効果を無効化', needsTarget: true, needsChance: true, hasDuration: true },
 immune: { short: '妨害無効', label: '妨害無効', desc: '【自分強化】選択した妨害効果を無効化する', isSelfBuff: true, hasImmuneType: true },
 poison: { short: '毒撃', label: '毒撃', desc: '通常攻撃に加えて最大HPの割合ダメージ', needsTarget: true, needsChance: true, hasPoisonPct: true }
};

if (typeof ABILITY_INFO !== 'undefined') {
 Object.assign(ABILITY_INFO, EXTENDED_ABILITIES);
} else {
 window.ABILITY_INFO = { ...EXTENDED_ABILITIES };
}

const IMMUNE_TYPE_LABELS = {
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

/* ============================================================================
 サウンドエンジン（Web Audio API）
============================================================================ */
class SoundEngine {
 constructor() {
 this.ctx = null;
 this.enabled = true;
 }

 init() {
 if (!this.ctx) {
 const AudioCtx = window.AudioContext || window.webkitAudioContext;
 if (AudioCtx) this.ctx = new AudioCtx();
 }
 if (this.ctx && this.ctx.state === 'suspended') {
 this.ctx.resume();
 }
 }

 toggle() {
 this.enabled = !this.enabled;
 if (this.enabled) {
 this.init();
 this.playButton();
 }
 return this.enabled;
 }

 playTone({ freq = 440, endFreq = null, type = 'sine', duration = 0.15, gain = 0.2, delay = 0 }) {
 if (!this.enabled) return;
 this.init();
 if (!this.ctx) return;

 const now = this.ctx.currentTime + delay;
 const osc = this.ctx.createOscillator();
 const vol = this.ctx.createGain();

 osc.type = type;
 osc.frequency.setValueAtTime(freq, now);
 if (endFreq !== null) {
 osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), now + duration);
 }

 vol.gain.setValueAtTime(gain, now);
 vol.gain.exponentialRampToValueAtTime(0.001, now + duration);

 osc.connect(vol);
 vol.connect(this.ctx.destination);

 osc.start(now);
 osc.stop(now + duration + 0.02);
 }

 playButton() {
 this.playTone({ freq: 520, endFreq: 780, type: 'triangle', duration: 0.08, gain: 0.16 });
 }

 playSpawn(isRare = false) {
 this.playTone({ freq: 260, endFreq: 560, type: 'sine', duration: 0.14, gain: 0.2 });
 if (isRare) {
 this.playTone({ freq: 880, endFreq: 1320, type: 'triangle', duration: 0.25, gain: 0.18, delay: 0.06 });
 }
 }

 playHit(heavy = false) {
 if (heavy) {
 this.playTone({ freq: 145, endFreq: 42, type: 'sawtooth', duration: 0.22, gain: 0.22 });
 } else {
 this.playTone({ freq: 240, endFreq: 95, type: 'triangle', duration: 0.08, gain: 0.13 });
 }
 }

 playCrit() {
 this.playTone({ freq: 780, endFreq: 1560, type: 'sawtooth', duration: 0.16, gain: 0.24 });
 this.playTone({ freq: 1174, endFreq: 1760, type: 'triangle', duration: 0.2, gain: 0.2, delay: 0.04 });
 }

 playMetalClang() {
 this.playTone({ freq: 1250, endFreq: 980, type: 'square', duration: 0.07, gain: 0.14 });
 }

 playBarrierBreak() {
 this.playTone({ freq: 1480, endFreq: 420, type: 'sawtooth', duration: 0.18, gain: 0.22 });
 this.playTone({ freq: 2100, endFreq: 880, type: 'triangle', duration: 0.14, gain: 0.18, delay: 0.03 });
 }

 playWave() {
 this.playTone({ freq: 180, endFreq: 420, type: 'sawtooth', duration: 0.18, gain: 0.16 });
 }

 playExplosion() {
 this.playTone({ freq: 130, endFreq: 36, type: 'sawtooth', duration: 0.24, gain: 0.22 });
 }

 playUpgrade() {
 this.playTone({ freq: 523.25, type: 'triangle', duration: 0.1, gain: 0.2, delay: 0 });
 this.playTone({ freq: 659.25, type: 'triangle', duration: 0.1, gain: 0.2, delay: 0.07 });
 this.playTone({ freq: 783.99, type: 'triangle', duration: 0.18, gain: 0.22, delay: 0.14 });
 }

 playMicrowave() {
 this.playTone({ freq: 110, endFreq: 220, type: 'sawtooth', duration: 0.35, gain: 0.22, delay: 0 });
 this.playTone({ freq: 1760, type: 'sine', duration: 0.75, gain: 0.32, delay: 0.28 });
 this.playTone({ freq: 2637, type: 'sine', duration: 0.65, gain: 0.18, delay: 0.28 });
 }

 playGachaSpin() {
 for (let i = 0; i < 6; i++) {
 this.playTone({ freq: 320 + i * 75, type: 'triangle', duration: 0.07, gain: 0.18, delay: i * 0.07 });
 }
 this.playTone({ freq: 1046.5, endFreq: 1567.98, type: 'sine', duration: 0.35, gain: 0.26, delay: 0.44 });
 }

 playBossAlarm() {
 for (let i = 0; i < 3; i++) {
 const offset = i * 0.42;
 this.playTone({ freq: 380, endFreq: 760, type: 'sawtooth', duration: 0.2, gain: 0.22, delay: offset });
 this.playTone({ freq: 760, endFreq: 360, type: 'sawtooth', duration: 0.2, gain: 0.22, delay: offset + 0.2 });
 }
 }

 playVictory() {
 const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
 const times = [0, 0.12, 0.24, 0.36, 0.54, 0.68];
 notes.forEach((n, idx) => {
 this.playTone({
 freq: n,
 type: 'triangle',
 duration: idx === notes.length - 1 ? 0.55 : 0.15,
 gain: 0.24,
 delay: times[idx]
 });
 });
 }

 playDefeat() {
 const notes = [392.0, 369.99, 349.23, 311.13];
 notes.forEach((n, idx) => {
 this.playTone({
 freq: n,
 endFreq: idx === 3 ? 260 : null,
 type: 'sawtooth',
 duration: idx === 3 ? 0.65 : 0.22,
 gain: 0.18,
 delay: idx * 0.24
 });
 });
 }
}

const sound = new SoundEngine();

/* ============================================================================
 全キャラクター＋写真アップロード＋攻撃アニメーション対応・スプライト描画
============================================================================ */
const uploadedImageCache = new Map();

function getCachedImage(dataUrl) {
 if (!dataUrl) return null;
 if (uploadedImageCache.has(dataUrl)) {
 return uploadedImageCache.get(dataUrl);
 }
 const img = new Image();
 img.onload = () => {};
 img.src = dataUrl;
 uploadedImageCache.set(dataUrl, img);
 return img;
}

function drawCharacterSprite(ctx, spec, options = {}) {
 if (typeof spec === 'string') {
 spec = getAllAllies().find(a => a.id === spec) || getAllEnemiesMap()[spec] || DEFAULT_ALLIES[0];
 }
 if (!spec) return;

 const {
 time = 0,
 state = 'WALK',
 animProgress = 0,
 puffScale = 1,
 slowed = false,
 frozen = false
 } = options;

 const shape = spec.shape || spec.id || 'maru';
 const bodyColor = spec.bodyColor || '#fffdf9';
 const accessory = spec.accessory || 'none';
 const customScale = typeof spec.scale === 'number' && !isNaN(spec.scale) ? spec.scale : 1.0;
 const attackAnim = spec.attackAnim || 'default';
 const hasCustomAttackAnim = state === 'ATTACK' && attackAnim !== 'default';
 const isEnemyUnit = spec.reward !== undefined;
 const facing = isEnemyUnit ? 1 : -1;

 ctx.save();
 ctx.scale(puffScale * customScale, puffScale * customScale);
 if (slowed && !frozen) {
 ctx.filter = 'hue-rotate(240deg) saturate(1.5)';
 }

 ctx.lineJoin = 'round';
 ctx.lineCap = 'round';
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 const bob = (state === 'WALK' && !frozen) ? Math.abs(Math.sin(time * 9)) * -6 : 0;
 ctx.translate(0, bob);

 // 足元の影
 ctx.save();
 ctx.translate(0, -bob);
 ctx.fillStyle = 'rgba(44, 30, 22, 0.22)';
 ctx.beginPath();
 ctx.ellipse(0, 4, spec.isBoss ? 44 : 22, 6, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.restore();

 // カスタム攻撃アニメーション変換
 if (hasCustomAttackAnim) {
 if (attackAnim === 'lunge') {
 if (animProgress < 0.42) {
 const pull = animProgress / 0.42;
 ctx.translate(-facing * pull * 14, -pull * 4);
 ctx.rotate(-facing * pull * 0.22);
 } else {
 const dash = Math.sin(((animProgress - 0.42) / 0.58) * Math.PI);
 ctx.translate(facing * dash * 32, -dash * 6);
 ctx.rotate(facing * dash * 0.28);
 }
 } else if (attackAnim === 'stretch') {
 if (animProgress < 0.45) {
 const charge = animProgress / 0.45;
 ctx.scale(1 - charge * 0.22, 1 + charge * 0.24);
 ctx.translate(-facing * charge * 8, 0);
 } else {
 const thrust = Math.sin(((animProgress - 0.45) / 0.55) * Math.PI);
 ctx.translate(facing * thrust * 30, 0);
 ctx.scale(1 + thrust * 1.25, 1 - thrust * 0.3);
 }
 } else if (attackAnim === 'slam') {
 if (animProgress < 0.48) {
 const jump = Math.sin((animProgress / 0.48) * (Math.PI / 2));
 ctx.translate(facing * jump * 14, -jump * 42);
 ctx.rotate(-facing * jump * 0.3);
 } else {
 const drop = (animProgress - 0.48) / 0.52;
 const impact = Math.sin(drop * Math.PI);
 ctx.translate(facing * 18, 0);
 ctx.scale(1 + impact * 0.35, 1 - impact * 0.32);
 }
 } else if (attackAnim === 'spin') {
 const spinPhase = Math.sin(animProgress * Math.PI);
 ctx.translate(facing * spinPhase * 22, -spinPhase * 12);
 ctx.rotate(facing * animProgress * Math.PI * 2);
 } else if (attackAnim === 'beam') {
 const recoil = animProgress > 0.45 ? Math.sin(((animProgress - 0.45) / 0.55) * Math.PI) : 0;
 ctx.translate(-facing * recoil * 10, 0);
 } else if (attackAnim === 'meteor') {
 const hover = Math.sin(animProgress * Math.PI);
 ctx.translate(0, -hover * 18);
 ctx.scale(1 + hover * 0.15, 1 + hover * 0.15);
 }
 }

 const internalState = hasCustomAttackAnim ? 'IDLE' : state;
 const internalProgress = hasCustomAttackAnim ? 0 : animProgress;

 const drawAccessory = (topY) => {
 if (accessory === 'mikan' && shape !== 'oshougatsu' && shape !== 'ex_kagami_knight' && shape !== 'legend_amaterasu') {
 ctx.fillStyle = '#f97316';
 ctx.beginPath();
 ctx.arc(0, topY - 8, 9, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(6, topY - 16, 7, 3, -0.4, 0, Math.PI * 2);
 ctx.fill();
 } else if (accessory === 'crown') {
 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.moveTo(-12, topY);
 ctx.lineTo(-14, topY - 14);
 ctx.lineTo(-5, topY - 7);
 ctx.lineTo(0, topY - 17);
 ctx.lineTo(5, topY - 7);
 ctx.lineTo(14, topY - 14);
 ctx.lineTo(12, topY);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 } else if (accessory === 'nori' && shape !== 'isobe') {
 ctx.fillStyle = '#143322';
 ctx.fillRect(-14, topY + 14, 28, 16);
 ctx.strokeRect(-14, topY + 14, 28, 16);
 } else if (accessory === 'zunda' && shape !== 'zunda') {
 ctx.fillStyle = '#65a30d';
 ctx.beginPath();
 ctx.ellipse(0, topY + 4, 16, 7, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 }
 };

 switch (shape) {
 case 'image': {
 const lunge = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * (spec.reward ? 16 : -16) : 0;
 const tilt = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * (spec.reward ? 0.2 : -0.2) : Math.sin(time * 6) * 0.05;
 ctx.translate(lunge, 0);
 ctx.rotate(tilt);

 const baseSize = spec.isBoss ? 110 : spec.isRare ? 76 : 58;
 const img = getCachedImage(spec.imageData);

 ctx.save();
 ctx.beginPath();
 ctx.roundRect(-baseSize / 2, -baseSize, baseSize, baseSize, 12);
 ctx.clip();

 if (img && img.complete && img.naturalWidth > 0) {
 ctx.drawImage(img, -baseSize / 2, -baseSize, baseSize, baseSize);
 } else {
 ctx.fillStyle = '#e2e8f0';
 ctx.fillRect(-baseSize / 2, -baseSize, baseSize, baseSize);
 ctx.fillStyle = '#475569';
 ctx.font = 'bold 12px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('📷PHOTO', 0, -baseSize / 2);
 }
 ctx.restore();

 ctx.beginPath();
 ctx.roundRect(-baseSize / 2, -baseSize, baseSize, baseSize, 12);
 ctx.stroke();

 drawAccessory(-baseSize);
 break;
 }

 case 'emoji': {
 const lunge = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * (spec.reward ? 16 : -16) : 0;
 const tilt = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * (spec.reward ? 0.25 : -0.25) : Math.sin(time * 6) * 0.06;
 ctx.translate(lunge, 0);
 ctx.rotate(tilt);

 const fontSize = spec.isBoss ? 78 : spec.isRare ? 54 : 40;
 ctx.font = `${fontSize}px sans-serif`;
 ctx.textAlign = 'center';
 ctx.textBaseline = 'bottom';
 ctx.fillText(spec.emoji || '🍡', 0, 4);
 drawAccessory(-fontSize + 6);
 break;
 }

 case 'ex_kagami_knight': {
 const thrust = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -18 : 0;
 ctx.translate(thrust, 0);

 ctx.fillStyle = '#dc2626';
 ctx.beginPath();
 ctx.moveTo(6, -34);
 ctx.quadraticCurveTo(28, -22, 24, -2);
 ctx.lineTo(4, -6);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -14, 22, 14, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.ellipse(0, -32, 16, 12, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#f97316';
 ctx.beginPath();
 ctx.arc(0, -47, 8, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#1e293b';
 ctx.fillRect(-13, -34, 15, 5);
 ctx.fillStyle = '#38bdf8';
 ctx.fillRect(-11, -33, 4, 3);
 ctx.fillRect(-5, -33, 4, 3);

 ctx.fillStyle = '#e2e8f0';
 ctx.beginPath();
 ctx.moveTo(-14, -22);
 ctx.lineTo(-42, -20);
 ctx.lineTo(-14, -15);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 break;
 }

 case 'ex_botamochi': {
 const floatY = Math.sin(time * 3.8) * 4;
 ctx.translate(0, floatY - 4);

 ctx.fillStyle = '#f8fafc';
 ctx.beginPath();
 ctx.ellipse(0, -4, 24, 7, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -24, 20, 18, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.moveTo(-14, -20);
 ctx.quadraticCurveTo(-18, -2, -6, -4);
 ctx.quadraticCurveTo(0, -12, -4, -20);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.strokeStyle = '#ffffff';
 ctx.lineWidth = 2.5;
 ctx.beginPath();
 ctx.moveTo(-15, -30); ctx.lineTo(-8, -28);
 ctx.moveTo(-5, -28); ctx.lineTo(1, -30);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.beginPath();
 ctx.moveTo(-22, 0); ctx.lineTo(-22, -44);
 ctx.stroke();
 ctx.fillStyle = '#a855f7';
 ctx.beginPath();
 ctx.arc(-22, -46, 6, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 break;
 }

 case 'ex_kashiwa': {
 const slash = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -20 : 0;
 ctx.translate(slash, 0);

 ctx.fillStyle = '#15803d';
 ctx.beginPath();
 ctx.moveTo(-16, -8);
 ctx.quadraticCurveTo(4, -38, 22, -26);
 ctx.quadraticCurveTo(26, -6, 12, 0);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(-2, -18, 17, 15, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.moveTo(-14, -21); ctx.lineTo(-8, -19);
 ctx.moveTo(-2, -19); ctx.lineTo(-6, -21);
 ctx.stroke();

 ctx.strokeStyle = '#e2e8f0';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(-14, -14); ctx.lineTo(-36, -34);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;
 break;
 }

 case 'ex_mitarashi': {
 const poke = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -22 : 0;
 ctx.translate(poke, 0);

 ctx.strokeStyle = '#b45309';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(-36, -22); ctx.lineTo(30, -22);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 [-16, 0, 16].forEach((dx) => {
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(dx, -22, 11, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#92400e';
 ctx.beginPath();
 ctx.arc(dx, -25, 9, Math.PI, 0);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(dx - 4, -21, 1.8, 0, Math.PI * 2);
 ctx.arc(dx + 1, -21, 1.8, 0, Math.PI * 2);
 ctx.fill();
 });
 break;
 }

 case 'ex_yakimochi': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -16 : 0;
 ctx.translate(slam, 0);

 ctx.fillStyle = 'rgba(239, 68, 68, 0.75)';
 ctx.beginPath();
 ctx.moveTo(-24, 0);
 ctx.quadraticCurveTo(-28, -42, 0, -48);
 ctx.quadraticCurveTo(28, -42, 24, 0);
 ctx.closePath();
 ctx.fill();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.roundRect(-20, -36, 40, 36, 10);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#92400e';
 ctx.beginPath();
 ctx.ellipse(-4, -24, 9, 5, -0.2, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#dc2626';
 ctx.fillRect(-20, -31, 40, 5);
 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-11, -18, 2.5, 0, Math.PI * 2);
 ctx.arc(-2, -18, 2.5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'legend_amaterasu': {
 const hover = Math.sin(time * 3.5) * 6;
 ctx.translate(0, hover - 8);

 ctx.save();
 ctx.rotate(time * 1.1);
 const grad = ctx.createLinearGradient(-60, -100, 60, 0);
 grad.addColorStop(0, '#f43f5e');
 grad.addColorStop(0.25, '#facc15');
 grad.addColorStop(0.5, '#4ade80');
 grad.addColorStop(0.75, '#38bdf8');
 grad.addColorStop(1, '#c084fc');
 ctx.strokeStyle = grad;
 ctx.lineWidth = 6;
 ctx.beginPath();
 ctx.arc(0, -52, 58, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -22, 40, 20, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.strokeStyle = '#ef4444';
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.moveTo(-34, -34); ctx.quadraticCurveTo(0, -24, 34, -34);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.ellipse(0, -48, 28, 16, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#fb923c';
 ctx.beginPath();
 ctx.arc(0, -72, 14, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#dc2626';
 ctx.beginPath();
 ctx.arc(-11, -48, 3.5, 0, Math.PI * 2);
 ctx.arc(1, -48, 3.5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'legend_galaxy_mochi': {
 const hover = Math.sin(time * 4) * 7;
 ctx.translate(0, hover - 10);

 ctx.save();
 ctx.rotate(-0.25 + Math.sin(time * 2) * 0.08);
 ctx.strokeStyle = '#38bdf8';
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.ellipse(0, -44, 62, 16, 0, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -42, 34, 32, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#fde047';
 ctx.beginPath();
 ctx.arc(-14, -54, 2.5, 0, Math.PI * 2);
 ctx.arc(16, -48, 3, 0, Math.PI * 2);
 ctx.arc(8, -26, 2, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.arc(-12, -42, 4.5, 0, Math.PI * 2);
 ctx.arc(2, -42, 4.5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'maru':
 case 'kinako':
 case 'yomogi': {
 let stretchX = 1, stretchY = 1, offsetX = 0;
 if (internalState === 'ATTACK') {
 if (internalProgress < 0.45) {
 stretchX = 0.82; stretchY = 1.18; offsetX = 6;
 } else {
 const thrust = Math.sin(((internalProgress - 0.45) / 0.55) * Math.PI);
 stretchX = 1 + thrust * 1.15;
 stretchY = 1 - thrust * 0.28;
 offsetX = -thrust * 24;
 }
 }
 ctx.translate(offsetX, 0);
 ctx.scale(stretchX, stretchY);

 const legSwing = state === 'WALK' ? Math.sin(time * 12) * 5 : 0;
 ctx.beginPath();
 ctx.moveTo(-7, -2); ctx.lineTo(-9 + legSwing, 4);
 ctx.moveTo(7, -2); ctx.lineTo(9 - legSwing, 4);
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-20, 0);
 ctx.bezierCurveTo(-22, -26, -12, -32, 0, -32);
 ctx.bezierCurveTo(12, -32, 22, -26, 20, 0);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 if (shape === 'kinako') {
 ctx.fillStyle = '#a16207';
 ctx.beginPath();
 ctx.arc(-6, -24, 1.5, 0, Math.PI * 2);
 ctx.arc(8, -22, 1.8, 0, Math.PI * 2);
 ctx.arc(4, -9, 1.5, 0, Math.PI * 2);
 ctx.arc(-14, -7, 1.5, 0, Math.PI * 2);
 ctx.fill();
 } else if (shape === 'yomogi') {
 ctx.fillStyle = '#bef264';
 ctx.beginPath();
 ctx.ellipse(4, -33, 8, 4, -0.3, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 }

 ctx.fillStyle = '#fca5a5';
 ctx.beginPath();
 ctx.ellipse(-12, -12, 3.5, 2, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-13, -17, 2.3, 0, Math.PI * 2);
 ctx.arc(-4, -17, 2.3, 0, Math.PI * 2);
 ctx.fill();

 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.arc(-10, -13, 2.2, 0, Math.PI);
 ctx.arc(-6, -13, 2.2, 0, Math.PI);
 ctx.stroke();
 drawAccessory(-32);
 break;
 }

 case 'noshimochi': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -0.45 : 0;
 ctx.rotate(slam);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.roundRect(-36, -24, 72, 24, 6);
 ctx.fill();
 ctx.stroke();

 ctx.strokeStyle = '#d6d3d1';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(-12, -22); ctx.lineTo(-12, -2);
 ctx.moveTo(12, -22); ctx.lineTo(12, -2);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-26, -13, 2.3, 0, Math.PI * 2);
 ctx.arc(-18, -13, 2.3, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-24);
 break;
 }

 case 'sakura': {
 const lunge = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -14 : 0;
 ctx.translate(lunge, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -16, 20, 15, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#15803d';
 ctx.beginPath();
 ctx.ellipse(2, -13, 16, 9, -0.2, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-12, -20, 2.2, 0, Math.PI * 2);
 ctx.arc(-5, -20, 2.2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-31);
 break;
 }

 case 'abekawa': {
 const dash = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -18 : 0;
 ctx.translate(dash, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.roundRect(-20, -24, 18, 22, 6);
 ctx.roundRect(2, -26, 18, 24, 6);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.arc(-11, -24, 5, 0, Math.PI * 2);
 ctx.arc(11, -26, 5, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-13, -13, 2, 0, Math.PI * 2);
 ctx.arc(-7, -13, 2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-28);
 break;
 }

 case 'warabi': {
 const slash = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -22 : 0;
 ctx.translate(slash, 0);
 ctx.fillStyle = 'rgba(120, 53, 15, 0.85)';
 ctx.beginPath();
 ctx.moveTo(-18, 0);
 ctx.quadraticCurveTo(-20, -28, 0, -30);
 ctx.quadraticCurveTo(20, -28, 18, 0);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#1e293b';
 ctx.fillRect(-17, -24, 34, 8);
 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.arc(-10, -20, 2.2, 0, Math.PI * 2);
 ctx.arc(-2, -20, 2.2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-30);
 break;
 }

 case 'kusa_daifuku': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -15 : 0;
 ctx.translate(slam, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -20, 25, 21, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#7f1d1d';
 ctx.beginPath();
 ctx.arc(-12, -26, 3.5, 0, Math.PI * 2);
 ctx.arc(6, -28, 3.5, 0, Math.PI * 2);
 ctx.arc(14, -14, 3.5, 0, Math.PI * 2);
 ctx.arc(-15, -10, 3.5, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-11, -18, 2.5, 0, Math.PI * 2);
 ctx.arc(-2, -18, 2.5, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-41);
 break;
 }

 case 'kagami_dragon': {
 const floatY = Math.sin(time * 4) * 6;
 ctx.translate(0, floatY - 8);
 ctx.strokeStyle = bodyColor;
 ctx.lineWidth = 14;
 ctx.beginPath();
 ctx.moveTo(32, -10);
 ctx.bezierCurveTo(10, -55, -25, -20, -12, -62);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.ellipse(-12, -64, 22, 14, -0.2, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.arc(-16, -82, 9, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ef4444';
 ctx.beginPath();
 ctx.arc(-22, -65, 3, 0, Math.PI * 2);
 ctx.arc(-12, -65, 3, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'momo_tengu': {
 const floatY = Math.sin(time * 4.5) * 5;
 ctx.translate(0, floatY - 6);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(0, -34, 26, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.moveTo(0, -60);
 ctx.quadraticCurveTo(-8, -35, 0, -8);
 ctx.stroke();

 ctx.fillStyle = '#ffffff';
 ctx.fillRect(-25, -42, 50, 6);
 ctx.strokeRect(-25, -42, 50, 6);

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-12, -30, 3, 0, Math.PI * 2);
 ctx.arc(-2, -30, 3, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'kapikapi': {
 const tilt = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -0.25 : Math.sin(time * 5) * 0.04;
 ctx.rotate(tilt);

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-22, 2); ctx.lineTo(-24, -18); ctx.lineTo(-14, -34);
 ctx.lineTo(12, -35); ctx.lineTo(23, -20); ctx.lineTo(21, 2);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(-14, -34); ctx.lineTo(-8, -22); ctx.lineTo(-15, -14);
 ctx.moveTo(15, -26); ctx.lineTo(7, -18); ctx.lineTo(11, -9);
 ctx.moveTo(-3, 2); ctx.lineTo(1, -9);
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.fillRect(-14, -20, 4, 3);
 ctx.fillRect(-4, -20, 4, 3);
 ctx.beginPath();
 ctx.moveTo(-12, -12); ctx.lineTo(-3, -12);
 ctx.stroke();
 drawAccessory(-35);
 break;
 }

 case 'isobe': {
 const punch = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -18 : 0;
 ctx.translate(punch, 0);

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -17, 19, 18, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#143322';
 ctx.beginPath();
 ctx.moveTo(-12, -24); ctx.lineTo(16, -24); ctx.lineTo(24, 3); ctx.lineTo(-6, 3);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.strokeStyle = '#fbbf24';
 ctx.lineWidth = 2;
 ctx.beginPath();
 ctx.moveTo(10, -20); ctx.lineTo(14, -2);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.fillStyle = '#78350f';
 ctx.beginPath();
 ctx.moveTo(-6, -32);
 ctx.quadraticCurveTo(-28, -42, -24, -26);
 ctx.quadraticCurveTo(-14, -24, -4, -30);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.moveTo(-16, -21); ctx.lineTo(-9, -18);
 ctx.moveTo(-3, -18); ctx.lineTo(-8, -21);
 ctx.stroke();
 drawAccessory(-35);
 break;
 }

 case 'kimo': {
 const kickAngle = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 1.45 : 0;
 const walkCycle = state === 'WALK' ? Math.sin(time * 8) * 0.45 : 0;

 ctx.save();
 ctx.translate(2, -32);
 ctx.rotate(-walkCycle);
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(0, 0); ctx.lineTo(4, 18); ctx.lineTo(8, 34); ctx.lineTo(0, 35);
 ctx.stroke();
 ctx.restore();

 ctx.save();
 ctx.translate(-3, -32);
 ctx.rotate(walkCycle + kickAngle);
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(0, 0); ctx.lineTo(-4, 18); ctx.lineTo(-2, 34); ctx.lineTo(-11, 35);
 ctx.stroke();
 ctx.restore();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -40, 15, 12, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.ellipse(-8, -42, 2.5, 1.5, 0, 0, Math.PI * 2);
 ctx.ellipse(-1, -42, 2.5, 1.5, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.fillStyle = '#f43f5e';
 ctx.beginPath();
 ctx.ellipse(-5, -36, 3, 1.5, 0, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-52);
 break;
 }

 case 'oshiruko': {
 const splash = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -12 : 0;
 ctx.translate(splash, 0);

 ctx.fillStyle = '#581c1c';
 ctx.beginPath();
 ctx.ellipse(0, -24, 24, 8, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(-6, -28, 12, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-11, -30, 2, 0, Math.PI * 2);
 ctx.arc(-4, -30, 2, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#991b1b';
 ctx.beginPath();
 ctx.moveTo(-25, -24);
 ctx.quadraticCurveTo(-22, -2, -10, -2);
 ctx.lineTo(10, -2);
 ctx.quadraticCurveTo(22, -2, 25, -24);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.fillRect(-10, -2, 20, 5);
 drawAccessory(-40);
 break;
 }

 case 'kinchaku': {
 const bounce = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -15 : 0;
 ctx.translate(bounce, 0);

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-22, 2);
 ctx.quadraticCurveTo(-28, -22, -14, -32);
 ctx.lineTo(14, -32);
 ctx.quadraticCurveTo(28, -22, 22, 2);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#22c55e';
 ctx.fillRect(-16, -35, 32, 6);
 ctx.strokeRect(-16, -35, 32, 6);

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.ellipse(0, -42, 14, 10, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-7, -43, 2.2, 0, Math.PI * 2);
 ctx.arc(0, -43, 2.2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-52);
 break;
 }

 case 'cheese': {
 const stretch = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 16 : 0;
 ctx.translate(-stretch, 0);

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.ellipse(0, -18, 22, 18, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-22, -20);
 ctx.bezierCurveTo(-22, -38, 22, -38, 22, -20);
 ctx.quadraticCurveTo(16, -8, 10, -18);
 ctx.quadraticCurveTo(2, -4, -4, -18);
 ctx.quadraticCurveTo(-14, -6, -22, -20);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-11, -16, 2.2, 0, Math.PI * 2);
 ctx.arc(-3, -16, 2.2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-36);
 break;
 }

 case 'chikara': {
 const punch = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -20 : 0;
 ctx.translate(punch, 0);

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -19, 21, 20, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ef4444';
 ctx.fillRect(-20, -30, 40, 6);
 ctx.strokeRect(-20, -30, 40, 6);

 ctx.beginPath();
 ctx.moveTo(-14, -21); ctx.lineTo(-7, -18);
 ctx.moveTo(-1, -18); ctx.lineTo(-6, -21);
 ctx.stroke();

 ctx.fillStyle = '#fed7aa';
 ctx.beginPath();
 ctx.arc(-22, -16, 8, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 drawAccessory(-39);
 break;
 }

 case 'zunda': {
 const slamAngle = internalState === 'ATTACK'
 ? (internalProgress < 0.5 ? -0.6 : Math.sin(((internalProgress - 0.5) / 0.5) * Math.PI) * 1.3)
 : Math.sin(time * 4) * 0.08;

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -28, 36, 30, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#65a30d';
 ctx.beginPath();
 ctx.moveTo(-34, -30);
 ctx.bezierCurveTo(-36, -56, -15, -62, 0, -62);
 ctx.bezierCurveTo(15, -62, 36, -56, 34, -30);
 ctx.quadraticCurveTo(22, -20, 12, -31);
 ctx.quadraticCurveTo(0, -18, -12, -31);
 ctx.quadraticCurveTo(-24, -20, -34, -30);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#fef08a';
 ctx.beginPath();
 ctx.arc(-15, -24, 4.5, 0, Math.PI * 2);
 ctx.arc(-2, -24, 4.5, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.save();
 ctx.translate(-22, -24);
 ctx.rotate(-slamAngle);
 ctx.fillStyle = '#92400e';
 ctx.beginPath();
 ctx.moveTo(-26, -26); ctx.lineTo(4, -26); ctx.lineTo(-2, -4); ctx.lineTo(-20, -4);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#fde68a';
 ctx.fillRect(-15, -42, 7, 22);
 ctx.strokeRect(-15, -42, 7, 22);
 ctx.restore();
 drawAccessory(-62);
 break;
 }

 case 'ichigo_hime': {
 const floatY = Math.sin(time * 4.5) * 4;
 ctx.translate(0, floatY - 4);

 ctx.fillStyle = '#f43f5e';
 ctx.beginPath();
 ctx.moveTo(-28, 2); ctx.lineTo(-18, -34); ctx.lineTo(18, -34); ctx.lineTo(28, 2);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -24, 24, 22, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#e11d48';
 ctx.beginPath();
 ctx.moveTo(-14, -44);
 ctx.quadraticCurveTo(0, -72, 14, -44);
 ctx.quadraticCurveTo(0, -38, -14, -44);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(0, -43, 12, 4, 0, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(-10, -24, 3, 0, Math.PI * 2);
 ctx.arc(2, -24, 3, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'oshougatsu': {
 const hover = Math.sin(time * 3.5) * 5;
 ctx.translate(0, hover - 6);

 ctx.save();
 ctx.rotate(time * 0.8);
 ctx.strokeStyle = '#f59e0b';
 ctx.lineWidth = 4;
 ctx.setLineDash([10, 8]);
 ctx.beginPath();
 ctx.arc(0, -45, 52, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -20, 38, 20, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.ellipse(0, -46, 27, 16, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ef4444';
 ctx.fillRect(-16, -24, 10, 18);
 ctx.strokeRect(-16, -24, 10, 18);
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(6, -24, 10, 18);
 ctx.strokeRect(6, -24, 10, 18);

 ctx.fillStyle = '#f97316';
 ctx.beginPath();
 ctx.arc(0, -68, 13, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(9, -80, 9, 4, -0.4, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#dc2626';
 ctx.beginPath();
 ctx.arc(-11, -46, 3.5, 0, Math.PI * 2);
 ctx.arc(1, -46, 3.5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 // --- 敵キャラクター専用グラフィック ---
 case 'cookie_soldier': {
 const lunge = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 14 : 0;
 ctx.translate(lunge, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(0, -18, 18, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#3e1f0d';
 ctx.beginPath();
 ctx.arc(-7, -23, 2.5, 0, Math.PI * 2);
 ctx.arc(2, -11, 2.8, 0, Math.PI * 2);
 ctx.arc(-4, -12, 2, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(6, -20, 2.2, 0, Math.PI * 2);
 ctx.arc(12, -20, 2.2, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-36);
 break;
 }

 case 'potechi': {
 const lunge = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 14 : 0;
 ctx.translate(lunge, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -18, 17, 21, 0.15, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(5, -20, 2.3, 0, Math.PI * 2);
 ctx.arc(12, -20, 2.3, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-39);
 break;
 }

 case 'cream': {
 const squish = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 0.25 : Math.sin(time * 7) * 0.06;
 ctx.scale(1 + squish, 1 - squish);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-24, 2);
 ctx.quadraticCurveTo(-26, -24, -4, -32);
 ctx.quadraticCurveTo(4, -42, 10, -34);
 ctx.quadraticCurveTo(26, -24, 24, 2);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.arc(4, -14, 2.5, 0, Math.PI * 2);
 ctx.arc(14, -14, 2.5, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-36);
 break;
 }

 case 'cake': {
 const thrust = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 18 : 0;
 ctx.translate(thrust, 0);
 ctx.fillStyle = bodyColor;
 ctx.fillRect(-30, -44, 60, 44);
 ctx.strokeRect(-30, -44, 60, 44);
 ctx.fillStyle = '#ffffff';
 ctx.fillRect(-30, -28, 60, 12);
 ctx.strokeRect(-30, -28, 60, 12);

 ctx.fillStyle = '#ef4444';
 ctx.beginPath();
 ctx.arc(0, -56, 14, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(10, -36, 3, 0, Math.PI * 2);
 ctx.arc(20, -36, 3, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-70);
 break;
 }

 case 'macaron_cavalry': {
 const tilt = internalState === 'ATTACK' ? 0.25 : Math.sin(time * 16) * 0.08;
 ctx.rotate(tilt);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -26, 20, 9, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.beginPath();
 ctx.ellipse(0, -10, 20, 9, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#fef08a';
 ctx.fillRect(-18, -21, 36, 6);
 ctx.strokeRect(-18, -21, 36, 6);
 drawAccessory(-35);
 break;
 }

 case 'habanero_senbei': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 16 : 0;
 ctx.translate(slam, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(0, -22, 22, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#143322';
 ctx.fillRect(-8, -42, 16, 40);
 ctx.fillStyle = '#fef08a';
 ctx.beginPath();
 ctx.arc(8, -24, 3, 0, Math.PI * 2);
 ctx.arc(15, -24, 3, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-44);
 break;
 }

 case 'dorayaki_samurai': {
 const slash = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 20 : 0;
 ctx.translate(slash, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(0, -24, 24, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#3e1f0d';
 ctx.fillRect(-22, -26, 44, 6);
 ctx.fillStyle = '#e2e8f0';
 ctx.fillRect(16, -46, 5, 34);
 ctx.strokeRect(16, -46, 5, 34);
 drawAccessory(-48);
 break;
 }

 case 'boss_taiyaki': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 22 : 0;
 ctx.translate(slam, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(6, -42, 48, 34, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.beginPath();
 ctx.moveTo(-40, -42); ctx.lineTo(-65, -66); ctx.lineTo(-58, -42); ctx.lineTo(-65, -18);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#2c1e16';
 ctx.beginPath();
 ctx.arc(32, -48, 5, 0, Math.PI * 2);
 ctx.fill();
 drawAccessory(-76);
 break;
 }

 case 'ice_parfait': {
 const hover = Math.sin(time * 4) * 5;
 ctx.translate(0, hover - 4);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-36, -78); ctx.lineTo(36, -78); ctx.lineTo(14, -18); ctx.lineTo(-14, -18);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 ctx.fillRect(-24, -6, 48, 8);
 ctx.strokeRect(-24, -6, 48, 8);
 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.arc(0, -84, 28, Math.PI, 0);
 ctx.fill();
 ctx.stroke();
 ctx.fillStyle = '#f43f5e';
 ctx.beginPath();
 ctx.arc(6, -112, 10, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 break;
 }

 case 'boss_wagashi_god': {
 const hover = Math.sin(time * 3.5) * 6;
 ctx.translate(0, hover - 8);
 ctx.strokeStyle = '#facc15';
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.arc(0, -56, 62, 0, Math.PI * 2);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -50, 44, 42, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ef4444';
 ctx.beginPath();
 ctx.arc(14, -54, 5, 0, Math.PI * 2);
 ctx.arc(28, -54, 5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'boss_cooker': {
 const shake = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI * 4) * 5 : 0;
 ctx.translate(shake, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.roundRect(-44, -68, 88, 70, 18);
 ctx.fill();
 ctx.stroke();

 const lidOpen = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -0.55 : 0;
 ctx.save();
 ctx.translate(-36, -68);
 ctx.rotate(lidOpen);
 ctx.fillStyle = '#cbd5e1';
 ctx.beginPath();
 ctx.roundRect(0, -14, 76, 16, 8);
 ctx.fill();
 ctx.stroke();
 ctx.restore();

 ctx.fillStyle = '#1e293b';
 ctx.fillRect(-16, -48, 46, 22);
 ctx.fillStyle = '#ef4444';
 ctx.font = 'bold 13px sans-serif';
 ctx.fillText('炊飯暴走!', -12, -33);
 break;
 }

 case 'boss_mikan': {
 const hover = Math.sin(time * 5) * 6;
 ctx.translate(0, hover - 8);
 ctx.fillStyle = '#ea580c';
 ctx.beginPath();
 ctx.moveTo(-48, -26); ctx.lineTo(48, -26); ctx.lineTo(58, 4); ctx.lineTo(-58, 4);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#78350f';
 ctx.fillRect(-44, -32, 88, 8);
 ctx.strokeRect(-44, -32, 88, 8);

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.arc(0, -52, 22, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#16a34a';
 ctx.beginPath();
 ctx.arc(0, -74, 6, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 break;
 }

 case 'boss_kuromame': {
 const slam = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -14 : 0;
 ctx.translate(0, slam);
 for (let tier = 0; tier < 3; tier++) {
 const y = -28 - tier * 26;
 ctx.fillStyle = bodyColor;
 ctx.fillRect(-46 + tier * 3, y, 92 - tier * 6, 26);
 ctx.strokeRect(-46 + tier * 3, y, 92 - tier * 6, 26);
 ctx.strokeStyle = '#94a3b8';
 ctx.lineWidth = 2;
 ctx.strokeRect(-42 + tier * 3, y + 4, 84 - tier * 6, 18);
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 3;
 }

 ctx.fillStyle = '#09090b';
 ctx.beginPath();
 ctx.arc(0, -96, 22, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#ffffff';
 ctx.beginPath();
 ctx.ellipse(-8, -104, 6, 3, -0.5, 0, Math.PI * 2);
 ctx.fill();

 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.moveTo(-24, -110); ctx.lineTo(0, -98); ctx.lineTo(24, -110);
 ctx.lineTo(14, -124); ctx.lineTo(0, -112); ctx.lineTo(-14, -124);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();
 break;
 }

 case 'boss_potechi_bancho': {
 const swing = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * 24 : 0;
 ctx.translate(swing, 0);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.ellipse(0, -42, 34, 42, 0.1, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#f97316';
 ctx.beginPath();
 ctx.moveTo(0, -80); ctx.quadraticCurveTo(44, -95, 34, -66); ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#fef08a';
 ctx.beginPath();
 ctx.arc(12, -46, 4, 0, Math.PI * 2);
 ctx.arc(24, -46, 4, 0, Math.PI * 2);
 ctx.fill();
 break;
 }

 case 'boss_garigari': {
 const stomp = internalState === 'ATTACK' ? Math.sin(internalProgress * Math.PI) * -16 : 0;
 ctx.translate(0, stomp);
 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-36, 2); ctx.lineTo(-42, -55); ctx.lineTo(-22, -95);
 ctx.lineTo(20, -95); ctx.lineTo(42, -55); ctx.lineTo(36, 2);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#e0f2fe';
 ctx.beginPath();
 ctx.moveTo(-20, -95); ctx.lineTo(-10, -118); ctx.lineTo(0, -95);
 ctx.lineTo(12, -122); ctx.lineTo(22, -95);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#1e3a8a';
 ctx.fillRect(6, -66, 12, 5);
 ctx.fillRect(22, -66, 10, 5);
 break;
 }

 case 'boss_ozouni': {
 const hover = Math.sin(time * 4) * 5;
 ctx.translate(0, hover - 4);

 ctx.fillStyle = '#f472b6';
 ctx.beginPath();
 ctx.arc(-18, -68, 18, Math.PI, 0);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(16, -74, 18, 8, -0.3, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = bodyColor;
 ctx.beginPath();
 ctx.moveTo(-54, -64);
 ctx.quadraticCurveTo(-48, -6, -22, -6);
 ctx.lineTo(22, -6);
 ctx.quadraticCurveTo(48, -6, 54, -64);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 ctx.strokeStyle = '#facc15';
 ctx.lineWidth = 3;
 ctx.beginPath();
 ctx.moveTo(-48, -52); ctx.lineTo(48, -52);
 ctx.stroke();
 ctx.strokeStyle = '#2c1e16';

 ctx.fillStyle = '#ef4444';
 ctx.beginPath();
 ctx.arc(12, -34, 5, 0, Math.PI * 2);
 ctx.arc(28, -34, 5, 0, Math.PI * 2);
 ctx.fill();
 break;
 }
 }

 // カスタム攻撃アニメーションの専用視覚エフェクト描画
 if (hasCustomAttackAnim) {
 ctx.save();
 if (attackAnim === 'slam' && animProgress >= 0.5) {
 const ringP = (animProgress - 0.5) / 0.5;
 ctx.strokeStyle = `rgba(251, 191, 36, ${1 - ringP})`;
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.ellipse(0, 2, 18 + ringP * 44, 6 + ringP * 12, 0, 0, Math.PI * 2);
 ctx.stroke();
 } else if (attackAnim === 'spin' && animProgress > 0.25 && animProgress < 0.85) {
 ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.arc(0, -22, 34, 0, Math.PI * 1.5);
 ctx.stroke();
 } else if (attackAnim === 'beam') {
 if (animProgress < 0.45) {
 const r = (animProgress / 0.45) * 14;
 ctx.fillStyle = '#facc15';
 ctx.beginPath();
 ctx.arc(facing * 24, -24, r, 0, Math.PI * 2);
 ctx.fill();
 } else {
 const beamAlpha = 1 - ((animProgress - 0.45) / 0.55);
 ctx.fillStyle = isEnemyUnit
 ? `rgba(244, 63, 94, ${beamAlpha * 0.85})`
 : `rgba(56, 189, 248, ${beamAlpha * 0.85})`;
 const bx = facing > 0 ? 18 : -115;
 ctx.fillRect(bx, -32, 97, 16);
 ctx.fillStyle = `rgba(255, 255, 255, ${beamAlpha})`;
 ctx.fillRect(bx, -27, 97, 6);
 }
 } else if (attackAnim === 'meteor' && animProgress >= 0.45) {
 const expP = (animProgress - 0.45) / 0.55;
 const targetX = facing * 48;
 ctx.fillStyle = `rgba(250, 204, 21, ${(1 - expP) * 0.7})`;
 ctx.beginPath();
 ctx.arc(targetX, -20, 14 + expP * 32, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = `rgba(249, 115, 22, ${1 - expP})`;
 ctx.lineWidth = 4;
 ctx.stroke();
 }
 ctx.restore();
 }

 // フリーズ（氷漬け）状態のオーバーレイ描画
 if (frozen) {
 ctx.fillStyle = 'rgba(125, 211, 252, 0.55)';
 ctx.strokeStyle = '#0284c7';
 ctx.lineWidth = 3;
 const size = spec.isBoss ? 52 : 28;
 ctx.beginPath();
 ctx.roundRect(-size, -size * 1.9, size * 2, size * 1.95, 8);
 ctx.fill();
 ctx.stroke();
 }

 ctx.restore();
}

/* ============================================================================
 バトル状態＆戦闘・妨害・波動・烈波・爆波・バリア・シールドロジック
============================================================================ */
const WORLD_WIDTH = 1280;
const WORLD_HEIGHT = 540;
const GROUND_Y = 445;
const ALLY_BASE_X = 1135;
const ENEMY_BASE_X = 145;
const MAX_PARTICLES = 120;
const MAX_TEXTS = 40;
const RANGE_SCALE = 0.55;

let canvasMetrics = { width: 1280, height: 540, dpr: 1 };

let gameState = {
 screen: 'TITLE',
 stageIndex: 0,
 paused: false,
 speedMultiplier: 1,
 gameOver: false,
 victory: false,
 time: 0,
 money: 150,
 workerLevel: 1,
 cannonCharge: 0,
 cannonFiringAnim: 0,
 allyBaseHp: 1200,
 allyBaseMaxHp: 1200,
 enemyBaseHp: 2000,
 enemyBaseMaxHp: 2000,
 baseGuardFlashTimer: 0,
 comboKills: 0,
 comboTimer: 0,
 spawnTrackers: [],
 units: [],
 waves: [],
 surges: [],
 explosions: [],
 attackZones: [],
 particles: [],
 floatingTexts: [],
 shockwaves: [],
 cooldowns: new Array(10).fill(0),
 shakeTime: 0,
 shakeIntensity: 0
};

function isAbilityTriggered(unit, ab) {
 if (!ab) return false;
 const trig = ab.trigger || 'always';
 if (trig === 'always') return true;
 const hpPct = unit.maxHp > 0 ? (unit.hp / unit.maxHp) * 100 : 0;
 const val = Number(ab.triggerValue ?? 50);
 if (trig === 'hp_below') return hpPct <= val;
 if (trig === 'hp_above') return hpPct >= val;
 if (trig === 'after_kb') return (unit.kbCount || 0) >= Math.max(1, val);
 if (trig === 'elapsed_time') return (unit.aliveTime || 0) >= Math.max(0, val);
 return true;
}

function getTriggeredAbilities(unit) {
 return (unit?.spec?.abilities || []).filter(ab => isAbilityTriggered(unit, ab));
}

function isImmuneToEffect(unit, effectType) {
 if (!unit) return false;
 const abs = getTriggeredAbilities(unit);
 for (const ab of abs) {
 if (ab.type === 'immune') {
 const im = ab.immuneType || 'all_cc';
 if (im === 'all_cc' || im === effectType) return true;
 }
 }
 return false;
}

function createBattleUnit(team, spec, x, y, extra = {}) {
 const kbCountMax = Math.max(1, Number(spec.kb) || 3);
 const kbStep = kbCountMax > 1 ? spec.hp / kbCountMax : 0;
 const unit = {
 uid: Math.random(),
 team,
 spec,
 x,
 y,
 hp: spec.hp,
 maxHp: spec.hp,
 kbCount: 0,
 nextKbHp: kbCountMax > 1 ? spec.hp - kbStep : 0,
 state: 'WALK',
 stateTimer: 0,
 hasDealtDamage: false,
 vx: 0,
 vy: 0,
 puffTimer: 0,
 slowTimer: 0,
 freezeTimer: 0,
 curseTimer: 0,
 atkDownTimer: 0,
 atkDownPct: 0,
 surviveUsed: false,
 aliveTime: 0,
 barrierHp: 0,
 barrierMaxHp: 0,
 barrierActivated: false,
 shieldHp: 0,
 shieldMaxHp: 0,
 shieldRegenPct: 0,
 shieldActivated: false,
 announcedTriggers: new Set(),
 guardBase: !!extra.guardBase,
 animOffset: Math.random() * 10
 };

 const abs = spec.abilities || [];
 abs.forEach((ab, idx) => {
 if (ab.type === 'barrier' && !unit.barrierActivated && isAbilityTriggered(unit, ab)) {
 const bhp = Math.max(1, Number(ab.barrierHp) || 1000);
 unit.barrierHp = bhp;
 unit.barrierMaxHp = bhp;
 unit.barrierActivated = true;
 unit.announcedTriggers.add(idx);
 }
 if (ab.type === 'shield' && !unit.shieldActivated && isAbilityTriggered(unit, ab)) {
 const shp = Math.max(1, Number(ab.shieldHp) || 2000);
 unit.shieldHp = shp;
 unit.shieldMaxHp = shp;
 unit.shieldRegenPct = Math.max(0, Math.min(100, Number(ab.regenPct ?? 50)));
 unit.shieldActivated = true;
 unit.announcedTriggers.add(idx);
 }
 if ((ab.trigger || 'always') === 'always') {
 unit.announcedTriggers.add(idx);
 }
 });

 return unit;
}

function isEnemyBaseGuarded() {
 return gameState.units.some(u => u.team === 'ENEMY' && u.hp > 0 && u.guardBase);
}

function resizeBattleCanvas() {
 const container = document.getElementById('canvas-container');
 const canvas = document.getElementById('game-canvas');
 if (!container || !canvas) return;
 const rect = container.getBoundingClientRect();
 if (rect.width <= 0 || rect.height <= 0) return;

 const dpr = Math.min(window.devicePixelRatio || 1, 2);
 canvasMetrics = { width: rect.width, height: rect.height, dpr };
 canvas.width = Math.floor(rect.width * dpr);
 canvas.height = Math.floor(rect.height * dpr);
}

window.addEventListener('resize', resizeBattleCanvas);

function startStage(stageIndex) {
 sound.init();
 sound.playButton();
 ensureExtendedUserStore();

 const stages = getAllStages();
 const stage = stages[stageIndex] || stages[0];
 const rankInfo = getOmochiRankInfo();

 const trackers = (stage.spawns || []).map(sp => ({
 ...sp,
 timer: sp.startTime || 0,
 spawnedCount: 0,
 activated: (sp.baseHpTrigger || 100) >= 100
 }));

 const baseHpBonus = Math.round(1200 * (1 + rankInfo.bonusPct / 100));
 const startMoney = 150 + rankInfo.bonusPct * 5;

 gameState = {
 screen: 'BATTLE',
 stageIndex,
 paused: false,
 speedMultiplier: 1,
 gameOver: false,
 victory: false,
 time: 0,
 money: startMoney,
 workerLevel: 1,
 cannonCharge: 25,
 cannonFiringAnim: 0,
 allyBaseHp: baseHpBonus,
 allyBaseMaxHp: baseHpBonus,
 enemyBaseHp: stage.enemyBaseHp,
 enemyBaseMaxHp: stage.enemyBaseHp,
 baseGuardFlashTimer: 0,
 comboKills: 0,
 comboTimer: 0,
 spawnTrackers: trackers,
 units: [],
 waves: [],
 surges: [],
 explosions: [],
 attackZones: [],
 particles: [],
 floatingTexts: [],
 shockwaves: [],
 cooldowns: new Array(10).fill(0),
 shakeTime: 0,
 shakeIntensity: 0
 };

 const speedBtn = document.getElementById('btn-speed');
 if (speedBtn) {
 speedBtn.textContent = '▶ 1倍速';
 speedBtn.className = 'game-btn bg-cyan-300 hover:bg-cyan-200 text-[#2c1e16] font-black px-2.5 h-9 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm';
 }

 document.getElementById('title-screen')?.classList.add('hidden');
 document.getElementById('battle-screen')?.classList.remove('hidden');
 document.getElementById('pause-modal')?.classList.add('hidden');
 document.getElementById('result-modal')?.classList.add('hidden');
 document.getElementById('boss-warning-overlay')?.classList.add('hidden');

 const hudName = document.getElementById('hud-stage-name');
 if (hudName) {
 const diffLabel = typeof formatDifficulty === 'function'
 ? formatDifficulty(stage.difficulty)
 : `★${Math.max(1, Number(stage.difficulty) || 1)}`;
 hudName.textContent = `${stage.chapter || ''}：${stage.title} (${diffLabel})`;
 }
 resizeBattleCanvas();
 buildUnitSlotsUI();
 updateHUD();
}

function toggleSpeed() {
 if (gameState.gameOver) return;
 sound.playButton();
 gameState.speedMultiplier = gameState.speedMultiplier === 1 ? 2 : 1;
 const speedBtn = document.getElementById('btn-speed');
 if (speedBtn) {
 if (gameState.speedMultiplier === 2) {
 speedBtn.textContent = '⏩ 2倍速';
 speedBtn.className = 'game-btn bg-amber-300 hover:bg-amber-200 text-[#2c1e16] font-black px-2.5 h-9 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm';
 } else {
 speedBtn.textContent = '▶ 1倍速';
 speedBtn.className = 'game-btn bg-cyan-300 hover:bg-cyan-200 text-[#2c1e16] font-black px-2.5 h-9 sm:h-11 rounded-xl flex items-center justify-center text-xs sm:text-sm';
 }
 }
}

function retryStage() {
 startStage(gameState.stageIndex);
}

function nextStage() {
 const stages = getAllStages().filter(s => !s.isTestStage);
 const nextIdx = (gameState.stageIndex + 1) % Math.max(1, stages.length);
 startStage(nextIdx);
}

function returnToTitle() {
 sound.playButton();
 gameState.screen = 'TITLE';
 window.__tempTestStage = null;
 document.getElementById('battle-screen')?.classList.add('hidden');
 document.getElementById('pause-modal')?.classList.add('hidden');
 document.getElementById('result-modal')?.classList.add('hidden');
 document.getElementById('title-screen')?.classList.remove('hidden');
 if (typeof renderStageSelectGrid === 'function') renderStageSelectGrid();
 if (typeof refreshExtendedBadges === 'function') refreshExtendedBadges();
}

function togglePause() {
 if (gameState.gameOver) return;
 sound.playButton();
 gameState.paused = !gameState.paused;
 document.getElementById('pause-modal')?.classList.toggle('hidden', !gameState.paused);
}

function upgradeWorker() {
 if (gameState.paused || gameState.gameOver) return;
 const currentSpec = WORKER_LEVELS[gameState.workerLevel - 1];
 if (!currentSpec || currentSpec.upgradeCost === null) return;
 if (gameState.money < currentSpec.upgradeCost) return;

 gameState.money -= currentSpec.upgradeCost;
 gameState.workerLevel++;
 sound.playUpgrade();

 spawnFloatingText(ALLY_BASE_X - 30, GROUND_Y - 120, `働きもち Lv.${gameState.workerLevel}!`, '#fbbf24');
 updateHUD();
}

function deployUnit(slotIndex) {
 if (gameState.paused || gameState.gameOver) return;
 const deckUnits = getActiveDeckUnits();
 const rawSpec = deckUnits[slotIndex];
 if (!rawSpec) return;
 if (gameState.cooldowns[slotIndex] > 0) return;
 if (gameState.money < rawSpec.cost) return;

 const spec = getEffectiveAllySpec(rawSpec);

 gameState.money -= spec.cost;
 gameState.cooldowns[slotIndex] = spec.cooldown || 2.5;
 sound.playSpawn(spec.isRare);

 const yOffset = (Math.random() - 0.5) * 18;
 const unit = createBattleUnit('ALLY', spec, ALLY_BASE_X - 45, GROUND_Y + yOffset);
 gameState.units.push(unit);

 spawnBurstParticles(ALLY_BASE_X - 45, GROUND_Y - 15, '#ffffff', 8);
 updateHUD();
}

function spawnEnemy(typeKey, customX = ENEMY_BASE_X + 45, magnification = 100, guardBase = false) {
 const enemiesMap = getAllEnemiesMap();
 const baseSpec = enemiesMap[typeKey] || DEFAULT_ENEMIES.cookie_soldier;
 const mult = Math.max(0.01, (Number(magnification) || 100) / 100);
 const spec = mult === 1
 ? baseSpec
 : {
 ...baseSpec,
 hp: Math.max(1, Math.round(baseSpec.hp * mult)),
 atk: Math.max(1, Math.round(baseSpec.atk * mult))
 };

 const yOffset = (Math.random() - 0.5) * 18;
 const unit = createBattleUnit('ENEMY', spec, customX, GROUND_Y + yOffset, { guardBase });
 gameState.units.push(unit);
}

function fireMicrowaveCannon() {
 if (gameState.paused || gameState.gameOver) return;
 if (gameState.cannonCharge < 100) return;

 gameState.cannonCharge = 0;
 gameState.cannonFiringAnim = 0.65;
 sound.playMicrowave();
 triggerShake(0.35, 10);

 spawnFloatingText(ALLY_BASE_X - 60, GROUND_Y - 165, 'レンジでチン！！', '#f472b6');

 for (let i = 0; i < gameState.units.length; i++) {
 const u = gameState.units[i];
 if (u.team === 'ENEMY' && u.hp > 0) {
 const dmg = 170 + gameState.workerLevel * 28;
 applyDamageToUnit(null, u, dmg, { skipNormalKb: true, ignoreMetal: true });
 u.puffTimer = 1.4;
 triggerKnockback(u, -320, -240, true);
 spawnBurstParticles(u.x, u.y - 25, '#f472b6', 10);
 }
 }

 updateHUD();
}

function getEffectiveAttack(unit) {
 let atk = unit.spec.atk || 10;
 const abs = getTriggeredAbilities(unit);
 for (const ab of abs) {
 if (ab.type === 'atk_up') {
 const upPct = Number(ab.atkUpPct ?? 100);
 atk *= (1 + upPct / 100);
 }
 }
 if (unit.atkDownTimer > 0 && unit.atkDownPct > 0) {
 atk *= Math.max(0.05, 1 - unit.atkDownPct / 100);
 }
 return Math.max(1, Math.round(atk));
}

function applyDamageToUnit(attacker, target, baseAtk, opts = {}) {
 if (!target || target.hp <= 0) return;

 const attackerCursed = attacker && attacker.curseTimer > 0;
 const defenderCursed = target.curseTimer > 0;
 const attackerAbilities = attackerCursed ? [] : getTriggeredAbilities(attacker);
 const defenderAbilities = defenderCursed ? [] : getTriggeredAbilities(target);
 const targetTrait = target.spec.trait || 'all';
 const attackerTrait = attacker?.spec?.trait || 'all';

 // 1. バリア判定
 if (target.barrierHp > 0) {
 let brokenByAbility = false;
 for (const ab of attackerAbilities) {
 if (ab.type === 'barrier_break' && Math.random() * 100 < (ab.chance || 100)) {
 brokenByAbility = true;
 break;
 }
 }

 let previewDmg = baseAtk;
 for (const ab of attackerAbilities) {
 if (!ab.target || ab.target === 'all' || ab.target === targetTrait) {
 if (ab.type === 'strong') previewDmg *= 1.8;
 if (ab.type === 'massive') previewDmg *= 3.5;
 if (ab.type === 'insane_damage') previewDmg *= 5.0;
 }
 if (ab.type === 'crit' && Math.random() * 100 < (ab.chance || 30)) previewDmg *= 2.5;
 if (ab.type === 'savage_blow' && Math.random() * 100 < (ab.chance || 30)) previewDmg *= 3.0;
 }

 if (brokenByAbility || previewDmg >= target.barrierHp) {
 target.barrierHp = 0;
 sound.playBarrierBreak();
 spawnFloatingText(target.x, target.y - 62, 'バリア破壊!!', '#38bdf8');
 spawnBurstParticles(target.x, target.y - 28, '#38bdf8', 16);
 } else {
 sound.playMetalClang();
 spawnFloatingText(target.x, target.y - 54, `バリア無効(${target.barrierHp})`, '#7dd3fc');
 }
 return;
 }

 // 2. シールド判定
 if (target.shieldHp > 0) {
 let brokenByAbility = false;
 for (const ab of attackerAbilities) {
 if (ab.type === 'shield_break' && Math.random() * 100 < (ab.chance || 100)) {
 brokenByAbility = true;
 break;
 }
 }

 if (brokenByAbility) {
 target.shieldHp = 0;
 sound.playBarrierBreak();
 spawnFloatingText(target.x, target.y - 62, 'シールド破壊!!', '#c084fc');
 spawnBurstParticles(target.x, target.y - 28, '#c084fc', 16);
 return;
 }

 let shieldDmg = baseAtk;
 for (const ab of attackerAbilities) {
 if (!ab.target || ab.target === 'all' || ab.target === targetTrait) {
 if (ab.type === 'strong') shieldDmg *= 1.8;
 if (ab.type === 'massive') shieldDmg *= 3.5;
 if (ab.type === 'insane_damage') shieldDmg *= 5.0;
 }
 if (ab.type === 'crit' && Math.random() * 100 < (ab.chance || 30)) shieldDmg *= 2.5;
 if (ab.type === 'savage_blow' && Math.random() * 100 < (ab.chance || 30)) shieldDmg *= 3.0;
 }
 shieldDmg = Math.max(1, Math.round(shieldDmg));
 target.shieldHp = Math.max(0, target.shieldHp - shieldDmg);

 if (target.shieldHp <= 0) {
 sound.playBarrierBreak();
 spawnFloatingText(target.x, target.y - 62, 'シールド破壊!!', '#c084fc');
 spawnBurstParticles(target.x, target.y - 28, '#c084fc', 16);
 } else {
 sound.playMetalClang();
 spawnFloatingText(target.x, target.y - 54, `シールド -${shieldDmg}`, '#d8b4fe');
 }
 return;
 }

 // 3. 通常ダメージ計算
 let dmg = baseAtk;
 let isCrit = false;
 let isSavage = false;

 for (const ab of attackerAbilities) {
 if (!ab.target || ab.target === 'all' || ab.target === targetTrait) {
 if (ab.type === 'strong') dmg *= 1.8;
 if (ab.type === 'massive') dmg *= 3.5;
 if (ab.type === 'insane_damage') dmg *= 5.0;
 }
 if (ab.type === 'crit' && !isCrit) {
 if (Math.random() * 100 < (ab.chance || 30)) {
 isCrit = true;
 dmg *= 2.5;
 }
 }
 if (ab.type === 'savage_blow' && !isSavage) {
 if (Math.random() * 100 < (ab.chance || 30)) {
 isSavage = true;
 dmg *= 3.0;
 }
 }
 }

 for (const ab of defenderAbilities) {
 if (!ab.target || ab.target === 'all' || ab.target === attackerTrait) {
 if (ab.type === 'resistant') dmg *= 0.25;
 if (ab.type === 'insane_resist') dmg *= 0.15;
 if (ab.type === 'strong') dmg *= 0.5;
 }
 }

 dmg = Math.max(1, Math.round(dmg));

 if (targetTrait === 'metal' && !isCrit && !opts.ignoreMetal) {
 dmg = Math.max(1, Math.floor(dmg * 0.08));
 sound.playMetalClang();
 spawnFloatingText(target.x, target.y - 45, `カキン! -${dmg}`, '#cbd5e1');
 } else if (isCrit) {
 sound.playCrit();
 spawnFloatingText(target.x, target.y - 54, `CRIT! -${dmg}`, '#facc15');
 spawnBurstParticles(target.x, target.y - 25, '#facc15', 14);
 } else if (isSavage) {
 sound.playCrit();
 spawnFloatingText(target.x, target.y - 54, `渾身!! -${dmg}`, '#fb923c');
 spawnBurstParticles(target.x, target.y - 25, '#fb923c', 14);
 } else {
 spawnFloatingText(target.x, target.y - 45, `-${dmg}`, target.team === 'ALLY' ? '#fb7185' : '#fef08a');
 }

 // 4. 毒撃
 let poisonDmg = 0;
 if (!opts.isSubEffect) {
 for (const ab of attackerAbilities) {
 if (ab.type === 'poison') {
 if (ab.target && ab.target !== 'all' && ab.target !== targetTrait) continue;
 if (Math.random() * 100 < (ab.chance || 100)) {
 if (!isImmuneToEffect(target, 'poison')) {
 const pct = Math.max(1, Number(ab.poisonPct ?? 30));
 poisonDmg += Math.max(1, Math.round(target.maxHp * (pct / 100)));
 }
 }
 }
 }
 }
 if (poisonDmg > 0) {
 spawnFloatingText(target.x, target.y - 68, `毒撃! -${poisonDmg}`, '#a855f7');
 spawnBurstParticles(target.x, target.y - 25, '#a855f7', 10);
 }

 target.hp -= (dmg + poisonDmg);

 // 5. 1度だけ生き残る判定
 if (target.hp <= 0 && !target.surviveUsed) {
 const surviveAb = getTriggeredAbilities(target).find(a => a.type === 'survive');
 if (surviveAb && Math.random() * 100 < (surviveAb.chance || 100)) {
 target.surviveUsed = true;
 target.hp = 1;
 sound.playCrit();
 spawnFloatingText(target.x, target.y - 64, '生き残った!!', '#4ade80');
 spawnBurstParticles(target.x, target.y - 25, '#4ade80', 14);
 return;
 }
 }

 // 6. 撃破判定
 if (target.hp <= 0) {
 const wasGuardBase = target.guardBase;
 target.hp = 0;
 spawnBurstParticles(target.x, target.y - 20, target.team === 'ALLY' ? '#ffffff' : '#facc15', 12);
 if (target.team === 'ENEMY') {
 const worker = WORKER_LEVELS[gameState.workerLevel - 1];
 const reward = target.spec.reward || 45;

 gameState.comboKills = (gameState.comboKills || 0) + 1;
 gameState.comboTimer = 2.2;
 const comboBonus = gameState.comboKills >= 3 ? Math.min(50, (gameState.comboKills - 2) * 8) : 0;

 gameState.money = Math.min(worker.maxMoney, gameState.money + reward + comboBonus);
 spawnFloatingText(
 target.x,
 target.y - 68,
 comboBonus > 0 ? `+${reward}円 (連撃+${comboBonus})` : `+${reward}円`,
 '#4ade80'
 );

 if (wasGuardBase && !isEnemyBaseGuarded()) {
 spawnFloatingText(ENEMY_BASE_X + 40, GROUND_Y - 150, '城のガードが解除された!!', '#4ade80');
 spawnBurstParticles(ENEMY_BASE_X + 20, GROUND_Y - 90, '#4ade80', 18);
 }
 }
 return;
 }

 // 7. 相手への妨害効果付与
 for (const ab of attackerAbilities) {
 if (ab.target && ab.target !== 'all' && ab.target !== targetTrait) continue;
 if (Math.random() * 100 >= (ab.chance || 100)) continue;

 if (ab.type === 'freeze') {
 if (!isImmuneToEffect(target, 'freeze')) {
 target.freezeTimer = Math.max(target.freezeTimer, ab.duration || 2.0);
 spawnFloatingText(target.x, target.y - 66, '凍結!!', '#38bdf8');
 }
 } else if (ab.type === 'slow') {
 if (!isImmuneToEffect(target, 'slow')) {
 target.slowTimer = Math.max(target.slowTimer, ab.duration || 2.5);
 spawnFloatingText(target.x, target.y - 66, '鈍足!', '#c084fc');
 }
 } else if (ab.type === 'knockback') {
 if (!isImmuneToEffect(target, 'knockback')) {
 const backVx = target.team === 'ALLY' ? 210 : -210;
 triggerKnockback(target, backVx, -200);
 spawnFloatingText(target.x, target.y - 66, 'ふっとび!', '#fb923c');
 }
 } else if (ab.type === 'atk_down') {
 if (!isImmuneToEffect(target, 'atk_down')) {
 target.atkDownTimer = Math.max(target.atkDownTimer, ab.duration || 3.0);
 target.atkDownPct = Math.max(target.atkDownPct, Number(ab.atkDownPct ?? 50));
 spawnFloatingText(target.x, target.y - 66, `攻撃低下(-${target.atkDownPct}%)`, '#60a5fa');
 }
 } else if (ab.type === 'curse') {
 if (!isImmuneToEffect(target, 'curse')) {
 target.curseTimer = Math.max(target.curseTimer, ab.duration || 3.0);
 spawnFloatingText(target.x, target.y - 66, '呪い!!', '#9333ea');
 }
 }
 }

 // 8. ダメージ蓄積によるノックバック判定
 const kbMax = Math.max(1, Number(target.spec.kb) || 3);
 if (!opts.skipNormalKb && kbMax > 1 && target.nextKbHp > 0 && target.hp <= target.nextKbHp) {
 const kbStep = target.maxHp / kbMax;
 while (target.nextKbHp > 0 && target.hp <= target.nextKbHp) {
 target.nextKbHp -= kbStep;
 }
 const backwardVx = target.team === 'ALLY' ? 150 : -150;
 triggerKnockback(target, backwardVx, -180);
 }
}

function triggerKnockback(unit, vx, vy, skipKbCount = false) {
 if (!skipKbCount) {
 unit.kbCount = (unit.kbCount || 0) + 1;
 }
 unit.state = 'KNOCKBACK';
 unit.vx = unit.team === 'ALLY' ? Math.abs(vx) : -Math.abs(vx);
 unit.vy = vy;
 unit.stateTimer = 0;

 if (unit.shieldMaxHp > 0 && unit.shieldRegenPct > 0) {
 const regenAmount = Math.max(1, Math.round(unit.shieldMaxHp * (unit.shieldRegenPct / 100)));
 unit.shieldHp = Math.min(unit.shieldMaxHp, Math.max(unit.shieldHp, regenAmount));
 spawnFloatingText(unit.x, unit.y - 68, `シールド再生(${unit.shieldHp})!`, '#c084fc');
 spawnBurstParticles(unit.x, unit.y - 30, '#c084fc', 10);
 }
}

function triggerBossAppearance(bossTypeKey) {
 const enemiesMap = getAllEnemiesMap();
 const bossSpec = enemiesMap[bossTypeKey] || DEFAULT_ENEMIES.boss_cooker;

 sound.playBossAlarm();
 triggerShake(0.65, 14);

 const overlay = document.getElementById('boss-warning-overlay');
 const bossNameEl = document.getElementById('boss-warning-name');
 if (overlay && bossNameEl) {
 bossNameEl.textContent = `${bossSpec.name} があらわれた！`;
 overlay.classList.remove('hidden');
 setTimeout(() => overlay.classList.add('hidden'), 2300);
 }

 gameState.shockwaves.push({
 x: ENEMY_BASE_X + 40,
 y: GROUND_Y - 40,
 radius: 20,
 maxRadius: 950,
 alpha: 1,
 color: '#ef4444'
 });

 gameState.units.forEach(u => {
 if (u.team === 'ALLY' && u.hp > 0) {
 triggerKnockback(u, 320, -250);
 }
 });
}

function triggerShake(duration, intensity) {
 gameState.shakeTime = Math.max(gameState.shakeTime, duration);
 gameState.shakeIntensity = Math.max(gameState.shakeIntensity, intensity);
}

function spawnBurstParticles(x, y, color, count) {
 const room = MAX_PARTICLES - gameState.particles.length;
 const actual = Math.min(count, Math.max(0, room));
 for (let i = 0; i < actual; i++) {
 const angle = Math.random() * Math.PI * 2;
 const speed = 40 + Math.random() * 140;
 gameState.particles.push({
 x,
 y,
 vx: Math.cos(angle) * speed,
 vy: Math.sin(angle) * speed - 60,
 size: 3 + Math.random() * 4.5,
 color,
 life: 0.4 + Math.random() * 0.3,
 maxLife: 0.7
 });
 }
}

function spawnFloatingText(x, y, text, color) {
 if (gameState.floatingTexts.length >= MAX_TEXTS) {
 gameState.floatingTexts.shift();
 }
 gameState.floatingTexts.push({ x, y, text, color, life: 0.9 });
}

function damageEnemyBase(amount, hitX = ENEMY_BASE_X + 20) {
 if (isEnemyBaseGuarded()) {
 gameState.baseGuardFlashTimer = 0.45;
 sound.playMetalClang();
 spawnFloatingText(hitX, GROUND_Y - 125, '城ガード中!!', '#4ade80');
 spawnBurstParticles(ENEMY_BASE_X + 35, GROUND_Y - 75, '#4ade80', 6);
 return;
 }
 gameState.enemyBaseHp = Math.max(0, gameState.enemyBaseHp - amount);
 spawnFloatingText(hitX, GROUND_Y - 110, `-${amount}`, '#fef08a');
 spawnBurstParticles(ENEMY_BASE_X + 35, GROUND_Y - 60, '#f87171', 6);
}

/* ============================================================================
 メイン物理・タイムライン・波動・烈波・爆波アップデート
============================================================================ */
function updateBattle(rawDt) {
 if (gameState.screen !== 'BATTLE' || gameState.paused || gameState.gameOver) return;

 const dt = rawDt * gameState.speedMultiplier;
 gameState.time += dt;

 if (gameState.baseGuardFlashTimer > 0) {
 gameState.baseGuardFlashTimer = Math.max(0, gameState.baseGuardFlashTimer - dt);
 }
 if (gameState.comboTimer > 0) {
 gameState.comboTimer = Math.max(0, gameState.comboTimer - dt);
 if (gameState.comboTimer === 0) gameState.comboKills = 0;
 }

 const worker = WORKER_LEVELS[gameState.workerLevel - 1];

 gameState.money = Math.min(worker.maxMoney, gameState.money + worker.income * dt);
 if (gameState.cannonCharge < 100) {
 gameState.cannonCharge = Math.min(100, gameState.cannonCharge + 4.8 * dt);
 }
 if (gameState.cannonFiringAnim > 0) {
 gameState.cannonFiringAnim = Math.max(0, gameState.cannonFiringAnim - dt);
 }

 for (let i = 0; i < 10; i++) {
 if (gameState.cooldowns[i] > 0) {
 gameState.cooldowns[i] = Math.max(0, gameState.cooldowns[i] - dt);
 }
 }

 const currentBaseHpPct = (gameState.enemyBaseHp / gameState.enemyBaseMaxHp) * 100;
 for (let i = 0; i < gameState.spawnTrackers.length; i++) {
 const tr = gameState.spawnTrackers[i];
 if (!tr.activated) {
 if (currentBaseHpPct <= (tr.baseHpTrigger || 100)) {
 tr.activated = true;
 tr.timer = tr.startTime || 0;
 } else {
 continue;
 }
 }

 if (tr.maxCount > 0 && tr.spawnedCount >= tr.maxCount) continue;

 tr.timer -= dt;
 if (tr.timer <= 0) {
 const wasGuardedBefore = isEnemyBaseGuarded();
 tr.spawnedCount++;
 tr.timer = (tr.interval || 4.0) * (0.9 + Math.random() * 0.2);

 if (tr.isBoss && tr.spawnedCount === 1) {
 triggerBossAppearance(tr.enemyId);
 }
 spawnEnemy(tr.enemyId, ENEMY_BASE_X + 45, tr.magnification ?? 100, !!tr.guardBase);
 if (tr.guardBase && !wasGuardedBefore) {
 spawnFloatingText(ENEMY_BASE_X + 40, GROUND_Y - 150, '🛡️ 城ガード展開!!', '#4ade80');
 }
 }
 }

 for (let i = gameState.units.length - 1; i >= 0; i--) {
 const u = gameState.units[i];
 if (u.hp <= 0) {
 gameState.units.splice(i, 1);
 continue;
 }

 u.aliveTime = (u.aliveTime || 0) + dt;
 if (u.puffTimer > 0) u.puffTimer = Math.max(0, u.puffTimer - dt);
 if (u.slowTimer > 0) u.slowTimer = Math.max(0, u.slowTimer - dt);
 if (u.freezeTimer > 0) u.freezeTimer = Math.max(0, u.freezeTimer - dt);
 if (u.curseTimer > 0) u.curseTimer = Math.max(0, u.curseTimer - dt);
 if (u.atkDownTimer > 0) {
 u.atkDownTimer = Math.max(0, u.atkDownTimer - dt);
 if (u.atkDownTimer === 0) u.atkDownPct = 0;
 }

 const abs = u.spec.abilities || [];
 abs.forEach((ab, abIdx) => {
 if (!isAbilityTriggered(u, ab)) return;
 if (ab.type === 'barrier' && !u.barrierActivated) {
 const bhp = Math.max(1, Number(ab.barrierHp) || 1000);
 u.barrierHp = bhp;
 u.barrierMaxHp = bhp;
 u.barrierActivated = true;
 u.announcedTriggers.add(abIdx);
 spawnFloatingText(u.x, u.y - 62, `バリア展開(${bhp})!`, '#38bdf8');
 } else if (ab.type === 'shield' && !u.shieldActivated) {
 const shp = Math.max(1, Number(ab.shieldHp) || 2000);
 u.shieldHp = shp;
 u.shieldMaxHp = shp;
 u.shieldRegenPct = Math.max(0, Math.min(100, Number(ab.regenPct ?? 50)));
 u.shieldActivated = true;
 u.announcedTriggers.add(abIdx);
 spawnFloatingText(u.x, u.y - 62, `シールド展開(${shp})!`, '#c084fc');
 } else if (!u.announcedTriggers.has(abIdx)) {
 u.announcedTriggers.add(abIdx);
 if (ab.type === 'atk_up') {
 const upPct = Number(ab.atkUpPct ?? 100);
 spawnFloatingText(u.x, u.y - 62, `⚡攻撃力+${upPct}%!!`, '#f87171');
 spawnBurstParticles(u.x, u.y - 25, '#f87171', 12);
 } else {
 const lbl = ABILITY_INFO[ab.type]?.short || '能力発動';
 spawnFloatingText(u.x, u.y - 62, `✨${lbl}発動!`, '#facc15');
 }
 }
 });

 if (u.state === 'KNOCKBACK') {
 u.x += u.vx * dt;
 u.y += u.vy * dt;
 u.vy += 680 * dt;
 u.x = Math.max(ENEMY_BASE_X + 10, Math.min(ALLY_BASE_X - 10, u.x));

 if (u.y >= GROUND_Y) {
 u.y = GROUND_Y;
 u.vx = 0;
 u.vy = 0;
 u.state = 'WALK';
 u.stateTimer = 0;
 }
 continue;
 }

 if (u.freezeTimer > 0) continue;

 const actionDt = u.slowTimer > 0 ? dt * 0.55 : dt;
 const targets = findTargetsInRange(u);

 if (u.state === 'WALK') {
 if (targets.length > 0) {
 u.state = 'WINDUP';
 u.stateTimer = 0;
 u.hasDealtDamage = false;
 } else {
 const speedMult = u.slowTimer > 0 ? 0.45 : 1.0;
 const dir = u.team === 'ALLY' ? -1 : 1;
 u.x += dir * (u.spec.speed || 70) * speedMult * dt;
 }
 } else if (u.state === 'WINDUP') {
 u.stateTimer += actionDt;
 const windup = u.spec.windup || 0.3;
 if (!u.hasDealtDamage && u.stateTimer >= windup) {
 u.hasDealtDamage = true;
 executeAttack(u, targets);
 }
 if (u.stateTimer >= windup + 0.25) {
 u.state = 'COOLDOWN';
 u.stateTimer = 0;
 }
 } else if (u.state === 'COOLDOWN') {
 u.stateTimer += actionDt;
 const waitTime = Math.max(0.2, (u.spec.attackInterval || 1.4) - (u.spec.windup || 0.3) - 0.25);
 if (u.stateTimer >= waitTime) {
 u.state = 'WALK';
 u.stateTimer = 0;
 }
 }
 }

 // 波動
 for (let i = gameState.waves.length - 1; i >= 0; i--) {
 const wv = gameState.waves[i];
 wv.timer -= dt;
 if (wv.timer <= 0) {
 wv.step++;
 if (wv.step > wv.maxSteps) {
 gameState.waves.splice(i, 1);
 continue;
 }
 wv.timer = 0.14;
 const dir = wv.team === 'ALLY' ? -1 : 1;
 const waveX = wv.originX + dir * wv.step * 62;
 if (waveX < ENEMY_BASE_X || waveX > ALLY_BASE_X) {
 gameState.waves.splice(i, 1);
 continue;
 }
 wv.currentX = waveX;
 wv.pillarAlpha = 1.0;
 sound.playWave();

 for (let j = 0; j < gameState.units.length; j++) {
 const target = gameState.units[j];
 if (target.team !== wv.team && target.hp > 0 && Math.abs(target.x - waveX) <= 46) {
 if (!isImmuneToEffect(target, 'wave')) {
 applyDamageToUnit(wv.attacker, target, wv.atk, { skipNormalKb: true, isSubEffect: true });
 }
 }
 }
 }
 if (wv.pillarAlpha > 0) {
 wv.pillarAlpha = Math.max(0, wv.pillarAlpha - dt * 4.5);
 }
 }

 // 烈波
 for (let i = gameState.surges.length - 1; i >= 0; i--) {
 const sg = gameState.surges[i];
 sg.life -= dt;
 sg.tickTimer -= dt;
 if (sg.tickTimer <= 0) {
 sg.tickTimer = 0.26;
 for (let j = 0; j < gameState.units.length; j++) {
 const target = gameState.units[j];
 if (target.team !== sg.team && target.hp > 0 && Math.abs(target.x - sg.x) <= 42) {
 if (!isImmuneToEffect(target, 'surge')) {
 applyDamageToUnit(sg.attacker, target, sg.atk, { skipNormalKb: true, isSubEffect: true });
 }
 }
 }
 }
 if (sg.life <= 0) {
 gameState.surges.splice(i, 1);
 }
 }

 // 爆波
 for (let i = gameState.explosions.length - 1; i >= 0; i--) {
 const ex = gameState.explosions[i];
 ex.timer -= dt;
 if (ex.timer <= 0) {
 ex.stage++;
 if (ex.stage > 2) {
 gameState.explosions.splice(i, 1);
 continue;
 }
 ex.timer = 0.14;
 ex.flashAlpha = 1.0;
 sound.playExplosion();

 const mults = [1.0, 0.7, 0.4];
 const stageAtk = Math.max(1, Math.round(ex.baseAtk * mults[ex.stage]));
 const offsets = ex.stage === 0 ? [0] : [-ex.stage * 58, ex.stage * 58];

 offsets.forEach(off => {
 const bx = ex.originX + off;
 if (bx < ENEMY_BASE_X - 20 || bx > ALLY_BASE_X + 20) return;
 spawnBurstParticles(bx, GROUND_Y - 22, '#f97316', 10);

 for (let j = 0; j < gameState.units.length; j++) {
 const target = gameState.units[j];
 if (target.team !== ex.team && target.hp > 0 && Math.abs(target.x - bx) <= 44) {
 if (!isImmuneToEffect(target, 'explosion')) {
 applyDamageToUnit(ex.attacker, target, stageAtk, { skipNormalKb: true, isSubEffect: true });
 }
 }
 }
 });
 }
 if (ex.flashAlpha > 0) {
 ex.flashAlpha = Math.max(0, ex.flashAlpha - dt * 5.0);
 }
 }

 for (let i = gameState.attackZones.length - 1; i >= 0; i--) {
 const az = gameState.attackZones[i];
 az.life -= dt;
 if (az.life <= 0) gameState.attackZones.splice(i, 1);
 }

 for (let i = gameState.particles.length - 1; i >= 0; i--) {
 const p = gameState.particles[i];
 p.x += p.vx * dt;
 p.y += p.vy * dt;
 p.vy += 320 * dt;
 p.life -= dt;
 if (p.life <= 0) gameState.particles.splice(i, 1);
 }

 for (let i = gameState.floatingTexts.length - 1; i >= 0; i--) {
 const ft = gameState.floatingTexts[i];
 ft.y -= 42 * dt;
 ft.life -= dt;
 if (ft.life <= 0) gameState.floatingTexts.splice(i, 1);
 }

 for (let i = gameState.shockwaves.length - 1; i >= 0; i--) {
 const sw = gameState.shockwaves[i];
 sw.radius += 1100 * dt;
 sw.alpha = Math.max(0, 1 - sw.radius / sw.maxRadius);
 if (sw.radius >= sw.maxRadius) gameState.shockwaves.splice(i, 1);
 }

 if (gameState.shakeTime > 0) {
 gameState.shakeTime = Math.max(0, gameState.shakeTime - dt);
 }

 if (gameState.enemyBaseHp <= 0) {
 gameState.enemyBaseHp = 0;
 endBattle(true);
 } else if (gameState.allyBaseHp <= 0) {
 gameState.allyBaseHp = 0;
 endBattle(false);
 }
}

function getUnitAttackBand(unit) {
 const abs = getTriggeredAbilities(unit);
 const ldAb = abs.find(a => a.type === 'ld_single' || a.type === 'ld_area' || a.type === 'omni');
 const isAlly = unit.team === 'ALLY';

 if (ldAb) {
 const rawMin = Number(ldAb.ldMin ?? (ldAb.type === 'omni' ? -100 : 120));
 const rawMax = Number(ldAb.ldMax ?? 320);
 const lo = Math.min(rawMin, rawMax) * RANGE_SCALE;
 const hi = Math.max(rawMin, rawMax) * RANGE_SCALE;
 return {
 mode: ldAb.type,
 isArea: ldAb.type !== 'ld_single',
 minX: isAlly ? (unit.x - hi) : (unit.x + lo),
 maxX: isAlly ? (unit.x - lo) : (unit.x + hi)
 };
 }

 const range = (unit.spec.range || 55) * RANGE_SCALE;
 return {
 mode: 'normal',
 isArea: !!unit.spec.aoe,
 minX: isAlly ? (unit.x - range) : (unit.x - 16),
 maxX: isAlly ? (unit.x + 16) : (unit.x + range)
 };
}

function findTargetsInRange(unit) {
 const band = getUnitAttackBand(unit);
 const found = [];

 for (let i = 0; i < gameState.units.length; i++) {
 const other = gameState.units[i];
 if (other.team !== unit.team && other.hp > 0) {
 if (other.x >= band.minX && other.x <= band.maxX) {
 found.push({ type: 'UNIT', unit: other, dist: Math.abs(other.x - unit.x) });
 }
 }
 }

 if (unit.team === 'ALLY') {
 if (ENEMY_BASE_X >= band.minX && ENEMY_BASE_X <= band.maxX) {
 found.push({ type: 'BASE', dist: Math.abs(unit.x - ENEMY_BASE_X) });
 }
 } else {
 if (ALLY_BASE_X >= band.minX && ALLY_BASE_X <= band.maxX) {
 found.push({ type: 'BASE', dist: Math.abs(ALLY_BASE_X - unit.x) });
 }
 }

 found.sort((a, b) => a.dist - b.dist);
 if (!band.isArea && found.length > 1) {
 return [found[0]];
 }
 return found;
}

function executeAttack(unit, initialTargets) {
 const targets = findTargetsInRange(unit);
 const finalTargets = targets.length > 0 ? targets : initialTargets;
 const effectiveAtk = getEffectiveAttack(unit);

 const band = getUnitAttackBand(unit);
 if (band.mode !== 'normal') {
 gameState.attackZones.push({
 minX: Math.max(ENEMY_BASE_X - 10, band.minX),
 maxX: Math.min(ALLY_BASE_X + 10, band.maxX),
 team: unit.team,
 life: 0.24,
 maxLife: 0.24
 });
 }

 sound.playHit(unit.spec.aoe || unit.spec.isBoss);
 if (unit.spec.isBoss) triggerShake(0.18, 6);

 finalTargets.forEach(t => {
 if (t.type === 'UNIT') {
 applyDamageToUnit(unit, t.unit, effectiveAtk);
 } else if (t.type === 'BASE') {
 if (unit.team === 'ALLY') {
 damageEnemyBase(effectiveAtk, ENEMY_BASE_X + 20);
 } else {
 gameState.allyBaseHp = Math.max(0, gameState.allyBaseHp - effectiveAtk);
 spawnFloatingText(ALLY_BASE_X - 20, GROUND_Y - 110, `-${effectiveAtk}`, '#fb7185');
 spawnBurstParticles(ALLY_BASE_X - 35, GROUND_Y - 60, '#fb7185', 6);
 }
 }
 });

 const abilities = unit.curseTimer > 0 ? [] : getTriggeredAbilities(unit);
 const dir = unit.team === 'ALLY' ? -1 : 1;

 const waveAb = abilities.find(a => a.type === 'wave');
 if (waveAb && Math.random() * 100 < (waveAb.chance || 100)) {
 gameState.waves.push({
 team: unit.team,
 attacker: unit,
 atk: Math.max(1, Math.round(effectiveAtk * 0.75)),
 originX: unit.x,
 currentX: unit.x,
 step: 0,
 maxSteps: (waveAb.level || 2) + 1,
 timer: 0.04,
 pillarAlpha: 1.0
 });
 }

 const surgeAb = abilities.find(a => a.type === 'surge');
 if (surgeAb && Math.random() * 100 < (surgeAb.chance || 100)) {
 const lv = Math.max(1, Number(surgeAb.level) || 2);
 const offset = Number(surgeAb.spawnOffset ?? 160) * RANGE_SCALE;
 const sx = Math.max(ENEMY_BASE_X + 20, Math.min(ALLY_BASE_X - 20, unit.x + dir * offset));
 gameState.surges.push({
 team: unit.team,
 attacker: unit,
 atk: Math.max(1, Math.round(effectiveAtk * 0.65)),
 x: sx,
 life: 0.45 + lv * 0.25,
 maxLife: 0.45 + lv * 0.25,
 tickTimer: 0.02
 });
 sound.playWave();
 }

 const expAb = abilities.find(a => a.type === 'explosion');
 if (expAb && Math.random() * 100 < (expAb.chance || 100)) {
 const hitTarget = finalTargets.find(t => t.type === 'UNIT');
 const originX = hitTarget ? hitTarget.unit.x : Math.max(ENEMY_BASE_X + 20, Math.min(ALLY_BASE_X - 20, unit.x + dir * 70));
 gameState.explosions.push({
 team: unit.team,
 attacker: unit,
 baseAtk: effectiveAtk,
 originX,
 stage: -1,
 timer: 0.01,
 flashAlpha: 1.0
 });
 }

 if (abilities.some(a => a.type === 'one_hit')) {
 spawnFloatingText(unit.x, unit.y - 58, '使い切り退場!', '#94a3b8');
 spawnBurstParticles(unit.x, unit.y - 25, '#ffffff', 12);
 unit.hp = 0;
 }
}

function endBattle(isVictory) {
 gameState.gameOver = true;
 gameState.victory = isVictory;
 ensureExtendedUserStore();

 const stages = getAllStages();
 const stage = stages[gameState.stageIndex] || stages[0];
 const modal = document.getElementById('result-modal');
 const badgeEl = document.getElementById('result-badge');
 const titleEl = document.getElementById('result-title');
 const descEl = document.getElementById('result-desc');
 const rewardBox = document.getElementById('result-reward-box');
 const nextBtn = document.getElementById('btn-next-stage');

 if (isVictory) {
 sound.playVictory();
 if (badgeEl) {
 badgeEl.textContent = 'VICTORY!';
 badgeEl.className = 'inline-block px-4 py-1 rounded-full font-black text-sm border-2 border-[#2c1e16] mb-2 bg-amber-300 text-[#2c1e16]';
 }
 if (titleEl) {
 titleEl.textContent = '完全勝利！';
 titleEl.className = 'font-title text-3xl sm:text-4xl text-amber-400 text-stroke mb-2';
 }
 if (descEl) descEl.textContent = `${stage.enemyBaseName || '敵城'}を陥落させた！`;

 const firstClear = !stage.isTestStage && !userStore.clearedIds[stage.id];
 if (!stage.isTestStage) {
 userStore.clearedIds[stage.id] = true;
 }

 const kobanChance = stage.rewardKobanChance ?? 100;
 const gotKoban = stage.isTestStage ? 0 : (Math.random() * 100 < kobanChance ? (stage.rewardKoban || 0) : 0);

 const xpChance = stage.rewardXpChance ?? 100;
 const gotXp = stage.isTestStage ? 0 : (Math.random() * 100 < xpChance ? (stage.rewardXp || 300) : 0);

 const ticketChance = stage.rewardTicketChance ?? 100;
 const baseTicket = stage.rewardTicket || 0;
 const gotTicket = stage.isTestStage ? 0 : (baseTicket > 0 && Math.random() * 100 < ticketChance ? baseTicket : 0);

 userStore.koban = (userStore.koban || 0) + gotKoban;
 userStore.xp = (userStore.xp || 0) + gotXp;
 userStore.gachaTickets = (userStore.gachaTickets || 0) + gotTicket;

 let dropMsg = '';
 if (!stage.isTestStage && stage.dropAllyId && Math.random() * 100 < (stage.dropChance || 25)) {
 const dropUnit = getAllAllies().find(a => a.id === stage.dropAllyId);
 if (dropUnit) {
 const isNew = userStore.ownedAllies[dropUnit.id] === undefined;
 if (isNew) {
 userStore.ownedAllies[dropUnit.id] = 0;
 userStore.allyLevels[dropUnit.id] = 1;
 } else {
 userStore.ownedAllies[dropUnit.id] += 1;
 }
 dropMsg = `<div class="mt-2 bg-emerald-200 border-2 border-[#2c1e16] rounded-xl px-3 py-1.5 text-emerald-950 font-black text-xs">🎉 味方ドロップ！「${dropUnit.name}」${isNew ? '初獲得！' : '+1 強化！'}</div>`;
 }
 }

 saveUserStore();

 if (rewardBox) {
 rewardBox.classList.remove('hidden');
 rewardBox.innerHTML = stage.isTestStage
 ? `<div class="font-black text-sm text-cyan-800">🧪 テストプレイクリア！（本番ステージでは報酬が獲得できます）</div>`
 : `
 <div class="font-black text-xs text-amber-800 mb-1">${firstClear ? '🎊 初クリア達成！' : '🏅 クリア報酬獲得！'}</div>
 <div class="flex flex-wrap items-center justify-center gap-2 font-black text-sm text-[#2c1e16]">
 ${gotKoban > 0 ? `<span class="bg-amber-200 px-2.5 py-1 rounded-xl border border-[#2c1e16]">🪙 +${gotKoban} 小判</span>` : ''}
 ${gotXp > 0 ? `<span class="bg-sky-200 px-2.5 py-1 rounded-xl border border-[#2c1e16]">✨ +${gotXp} XP</span>` : ''}
 ${gotTicket > 0 ? `<span class="bg-pink-200 px-2.5 py-1 rounded-xl border border-[#2c1e16]">🎫 +${gotTicket} チケット</span>` : ''}
 ${gotKoban === 0 && gotXp === 0 && gotTicket === 0 ? `<span class="text-xs text-stone-500">今回はアイテムドロップなし</span>` : ''}
 </div>
 ${dropMsg}
 `;
 }
 if (nextBtn) nextBtn.classList.toggle('hidden', !!stage.isTestStage);
 } else {
 sound.playDefeat();
 if (badgeEl) {
 badgeEl.textContent = 'DEFEAT...';
 badgeEl.className = 'inline-block px-4 py-1 rounded-full font-black text-sm border-2 border-[#2c1e16] mb-2 bg-rose-500 text-white';
 }
 if (titleEl) {
 titleEl.textContent = '敗北……';
 titleEl.className = 'font-title text-3xl sm:text-4xl text-rose-500 text-stroke mb-2';
 }
 if (descEl) descEl.textContent = '鏡餅城が食べられてしまった！育成やデッキ編成を見直そう！';
 if (rewardBox) rewardBox.classList.add('hidden');
 if (nextBtn) nextBtn.classList.add('hidden');
 }

 modal?.classList.remove('hidden');
}

/* ============================================================================
 HUD＆バトルフィールド描画
============================================================================ */
function updateHUD() {
 if (gameState.screen !== 'BATTLE') return;

 const worker = WORKER_LEVELS[gameState.workerLevel - 1] || WORKER_LEVELS[0];

 const moneyEl = document.getElementById('hud-money');
 const maxMoneyEl = document.getElementById('hud-max-money');
 if (moneyEl) moneyEl.textContent = Math.floor(gameState.money);
 if (maxMoneyEl) maxMoneyEl.textContent = worker.maxMoney;

 // 敵城・味方城HP表示（index.html の #hud-enemy-hp / #hud-ally-hp に同期）
 const enemyHpEl = document.getElementById('hud-enemy-hp');
 if (enemyHpEl) {
 const guardTag = isEnemyBaseGuarded() ? ' 🛡️' : '';
 enemyHpEl.textContent = `${Math.ceil(gameState.enemyBaseHp)} / ${gameState.enemyBaseMaxHp}${guardTag}`;
 }
 const allyHpEl = document.getElementById('hud-ally-hp');
 if (allyHpEl) {
 allyHpEl.textContent = `${Math.ceil(gameState.allyBaseHp)} / ${gameState.allyBaseMaxHp}`;
 }

 // 働きもちボタン（index.html の #btn-worker / #worker-lv / #worker-cost）
 const workerLvEl = document.getElementById('worker-lv');
 const workerCostEl = document.getElementById('worker-cost');
 const workerBtn = document.getElementById('btn-worker');
 if (workerLvEl) workerLvEl.textContent = `Lv.${gameState.workerLevel}`;
 if (workerCostEl) {
 workerCostEl.textContent = worker.upgradeCost === null ? 'MAX' : `${worker.upgradeCost}円`;
 }
 if (workerBtn) {
 workerBtn.disabled = worker.upgradeCost === null || gameState.money < worker.upgradeCost;
 }

 // 電子レンジ砲（index.html の #btn-cannon / #cannon-fill / #cannon-pct / #cannon-status）
 const pct = Math.floor(gameState.cannonCharge);
 const cannonPctEl = document.getElementById('cannon-pct');
 const cannonFillEl = document.getElementById('cannon-fill');
 const cannonStatusEl = document.getElementById('cannon-status');
 const cannonBtn = document.getElementById('btn-cannon');
 if (cannonPctEl) cannonPctEl.textContent = `${pct}%`;
 if (cannonFillEl) cannonFillEl.style.width = `${pct}%`;
 if (cannonStatusEl) {
 cannonStatusEl.textContent = pct >= 100 ? '🔥 発射OK!!' : 'チャージ中';
 }
 if (cannonBtn) {
 const isReady = pct >= 100;
 cannonBtn.disabled = !isReady;
 cannonBtn.classList.toggle('cannon-ready', isReady);
 }

 // 最大10体の出撃スロットボタン更新
 const deckUnits = getActiveDeckUnits();
 for (let i = 0; i < 10; i++) {
 const spec = deckUnits[i];
 const btn = document.getElementById(`unit-slot-${i}`);
 if (!btn || !spec) continue;

 const cd = gameState.cooldowns[i];
 const cdOverlay = document.getElementById(`unit-cd-overlay-${i}`);
 const cdText = document.getElementById(`unit-cd-text-${i}`);

 if (cd > 0) {
 btn.disabled = true;
 const ratio = Math.min(100, (cd / (spec.cooldown || 2.5)) * 100);
 if (cdOverlay) cdOverlay.style.height = `${ratio}%`;
 if (cdText) {
 cdText.classList.remove('hidden');
 cdText.textContent = cd.toFixed(1);
 }
 } else {
 btn.disabled = gameState.money < spec.cost;
 if (cdOverlay) cdOverlay.style.height = '0%';
 if (cdText) cdText.classList.add('hidden');
 }
 }
}

function drawBattleField(ctx) {
 const { width, height, dpr } = canvasMetrics;
 if (width <= 0 || height <= 0) return;

 const scaleX = width / WORLD_WIDTH;
 const scaleY = height / WORLD_HEIGHT;

 ctx.save();
 ctx.scale(dpr * scaleX, dpr * scaleY);

 if (gameState.shakeTime > 0) {
 const sx = (Math.random() - 0.5) * gameState.shakeIntensity * 2;
 const sy = (Math.random() - 0.5) * gameState.shakeIntensity * 2;
 ctx.translate(sx, sy);
 }

 const stages = getAllStages();
 const stage = stages[gameState.stageIndex] || stages[0];
 drawStageBackground(ctx, stage.theme || 'kitchen');

 // 遠方・全方位攻撃の攻撃範囲フラッシュ帯
 gameState.attackZones.forEach(az => {
 const alpha = (az.life / az.maxLife) * 0.32;
 ctx.fillStyle = az.team === 'ALLY'
 ? `rgba(56, 189, 248, ${alpha})`
 : `rgba(244, 63, 94, ${alpha})`;
 ctx.fillRect(az.minX, GROUND_Y - 76, Math.max(8, az.maxX - az.minX), 76);
 });

 drawEnemyBase(ctx, ENEMY_BASE_X, GROUND_Y, gameState.enemyBaseHp, gameState.enemyBaseMaxHp, stage.enemyBaseName);
 drawAllyBase(ctx, ALLY_BASE_X, GROUND_Y, gameState.allyBaseHp, gameState.allyBaseMaxHp);

 if (gameState.cannonFiringAnim > 0) {
 const alpha = gameState.cannonFiringAnim / 0.65;
 ctx.save();
 ctx.fillStyle = `rgba(244, 114, 182, ${alpha * 0.45})`;
 ctx.fillRect(ENEMY_BASE_X, GROUND_Y - 140, ALLY_BASE_X - ENEMY_BASE_X, 140);
 ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
 ctx.lineWidth = 6;
 ctx.beginPath();
 ctx.moveTo(ALLY_BASE_X - 40, GROUND_Y - 70);
 ctx.lineTo(ENEMY_BASE_X + 20, GROUND_Y - 70);
 ctx.stroke();
 ctx.restore();
 }

 gameState.shockwaves.forEach(sw => {
 ctx.save();
 ctx.strokeStyle = sw.color;
 ctx.globalAlpha = sw.alpha;
 ctx.lineWidth = 8;
 ctx.beginPath();
 ctx.arc(sw.x, sw.y, sw.radius, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();
 });

 const sortedUnits = [...gameState.units].sort((a, b) => a.y - b.y);
 for (let i = 0; i < sortedUnits.length; i++) {
 const u = sortedUnits[i];
 ctx.save();
 ctx.translate(u.x, u.y);

 if (u.state === 'KNOCKBACK') {
 const rot = u.team === 'ALLY' ? 0.35 : -0.35;
 ctx.rotate(rot);
 }

 let visualState = 'WALK';
 let animProgress = 0;
 if (u.state === 'WINDUP') {
 visualState = 'ATTACK';
 animProgress = Math.min(1, u.stateTimer / (u.spec.windup || 0.3));
 } else if (u.state === 'COOLDOWN') {
 visualState = 'IDLE';
 }

 const puffScale = u.puffTimer > 0 ? 1 + Math.sin(u.puffTimer * 18) * 0.22 : 1;

 drawCharacterSprite(ctx, u.spec, {
 time: gameState.time + u.animOffset,
 state: visualState,
 animProgress,
 puffScale,
 slowed: u.slowTimer > 0,
 frozen: u.freezeTimer > 0
 });

 // 城ガード中オーラ
 if (u.guardBase) {
 ctx.save();
 const pulse = 1 + Math.sin(gameState.time * 6) * 0.08;
 ctx.strokeStyle = '#4ade80';
 ctx.lineWidth = 3;
 ctx.setLineDash([6, 4]);
 ctx.beginPath();
 ctx.arc(0, -28, (u.spec.isBoss ? 54 : 30) * pulse, 0, Math.PI * 2);
 ctx.stroke();
 ctx.restore();
 }

 // バリア表示
 if (u.barrierHp > 0) {
 ctx.save();
 ctx.strokeStyle = '#38bdf8';
 ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
 ctx.lineWidth = 3;
 const r = u.spec.isBoss ? 52 : 28;
 ctx.beginPath();
 ctx.arc(0, -26, r, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.restore();
 }

 // シールド表示
 if (u.shieldHp > 0) {
 ctx.save();
 ctx.strokeStyle = '#c084fc';
 ctx.fillStyle = 'rgba(192, 132, 252, 0.22)';
 ctx.lineWidth = 3;
 const r = u.spec.isBoss ? 56 : 32;
 ctx.beginPath();
 ctx.arc(0, -26, r, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();
 ctx.restore();
 }

 // ステータス異常インジケーター
 if (u.curseTimer > 0) {
 ctx.fillStyle = '#9333ea';
 ctx.font = 'bold 12px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('🔮呪', -14, -46);
 }
 if (u.atkDownTimer > 0) {
 ctx.fillStyle = '#3b82f6';
 ctx.font = 'bold 12px sans-serif';
 ctx.textAlign = 'center';
 ctx.fillText('⚔↓', 14, -46);
 }

 // HPバー表示
 if (u.hp < u.maxHp || u.spec.isBoss || u.barrierHp > 0 || u.shieldHp > 0) {
 const barW = u.spec.isBoss ? 86 : 40;
 const barH = u.spec.isBoss ? 9 : 6;
 const topY = u.spec.isBoss ? -125 : -54;
 const ratio = Math.max(0, u.hp / u.maxHp);

 ctx.fillStyle = '#1c1917';
 ctx.fillRect(-barW / 2 - 1, topY - 1, barW + 2, barH + 2);
 ctx.fillStyle = u.team === 'ALLY' ? '#4ade80' : '#f43f5e';
 ctx.fillRect(-barW / 2, topY, barW * ratio, barH);

 if (u.barrierHp > 0 && u.barrierMaxHp > 0) {
 const bRatio = Math.max(0, u.barrierHp / u.barrierMaxHp);
 ctx.fillStyle = '#38bdf8';
 ctx.fillRect(-barW / 2, topY - 5, barW * bRatio, 4);
 }
 if (u.shieldHp > 0 && u.shieldMaxHp > 0) {
 const sRatio = Math.max(0, u.shieldHp / u.shieldMaxHp);
 ctx.fillStyle = '#c084fc';
 ctx.fillRect(-barW / 2, topY - 10, barW * sRatio, 4);
 }
 }

 ctx.restore();
 }

 // 波動エフェクト
 gameState.waves.forEach(wv => {
 if (wv.pillarAlpha > 0) {
 ctx.save();
 const h = 110 * wv.pillarAlpha;
 const grad = ctx.createLinearGradient(wv.currentX, GROUND_Y, wv.currentX, GROUND_Y - h);
 grad.addColorStop(0, wv.team === 'ALLY' ? 'rgba(56, 189, 248, 0.9)' : 'rgba(249, 115, 22, 0.9)');
 grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
 ctx.fillStyle = grad;
 ctx.fillRect(wv.currentX - 24, GROUND_Y - h, 48, h);
 ctx.restore();
 }
 });

 // 烈波（光の柱）エフェクト
 gameState.surges.forEach(sg => {
 ctx.save();
 const flicker = 0.75 + Math.sin(gameState.time * 32) * 0.25;
 const grad = ctx.createLinearGradient(sg.x, GROUND_Y, sg.x, GROUND_Y - 180);
 grad.addColorStop(0, sg.team === 'ALLY' ? `rgba(250, 204, 21, ${0.88 * flicker})` : `rgba(239, 68, 68, ${0.88 * flicker})`);
 grad.addColorStop(0.6, `rgba(255, 255, 255, ${0.65 * flicker})`);
 grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
 ctx.fillStyle = grad;
 ctx.fillRect(sg.x - 28, GROUND_Y - 180, 56, 180);
 ctx.restore();
 });

 // 爆波エフェクト
 gameState.explosions.forEach(ex => {
 if (ex.flashAlpha > 0 && ex.stage >= 0) {
 ctx.save();
 const offsets = ex.stage === 0 ? [0] : [-ex.stage * 58, ex.stage * 58];
 offsets.forEach(off => {
 const bx = ex.originX + off;
 const r = 24 + (1 - ex.flashAlpha) * 28;
 ctx.fillStyle = `rgba(251, 146, 60, ${ex.flashAlpha * 0.75})`;
 ctx.beginPath();
 ctx.arc(bx, GROUND_Y - 26, r, 0, Math.PI * 2);
 ctx.fill();
 ctx.strokeStyle = `rgba(254, 240, 138, ${ex.flashAlpha})`;
 ctx.lineWidth = 4;
 ctx.stroke();
 });
 ctx.restore();
 }
 });

 gameState.particles.forEach(p => {
 ctx.save();
 ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
 ctx.fillStyle = p.color;
 ctx.beginPath();
 ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
 ctx.fill();
 ctx.restore();
 });

 ctx.font = '900 18px "M PLUS Rounded 1c", sans-serif';
 ctx.textAlign = 'center';
 gameState.floatingTexts.forEach(ft => {
 ctx.save();
 ctx.globalAlpha = Math.min(1, ft.life * 1.4);
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;
 ctx.strokeText(ft.text, ft.x, ft.y);
 ctx.fillStyle = ft.color;
 ctx.fillText(ft.text, ft.x, ft.y);
 ctx.restore();
 });

 ctx.restore();
}

function drawStageBackground(ctx, theme) {
 const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
 if (theme === 'kotatsu') {
 skyGrad.addColorStop(0, '#fed7aa');
 skyGrad.addColorStop(1, '#fef3c7');
 } else if (theme === 'osechi') {
 skyGrad.addColorStop(0, '#fde68a');
 skyGrad.addColorStop(1, '#fecaca');
 } else if (theme === 'sweets') {
 skyGrad.addColorStop(0, '#fbcfe8');
 skyGrad.addColorStop(1, '#fef9c3');
 } else if (theme === 'dagashi') {
 skyGrad.addColorStop(0, '#fdba74');
 skyGrad.addColorStop(1, '#fca5a5');
 } else if (theme === 'freezer') {
 skyGrad.addColorStop(0, '#bae6fd');
 skyGrad.addColorStop(1, '#e0f2fe');
 } else if (theme === 'ozouni') {
 skyGrad.addColorStop(0, '#312e81');
 skyGrad.addColorStop(1, '#991b1b');
 } else if (theme === 'newyear') {
 skyGrad.addColorStop(0, '#f43f5e');
 skyGrad.addColorStop(0.5, '#fb923c');
 skyGrad.addColorStop(1, '#fef08a');
 } else {
 skyGrad.addColorStop(0, '#bae6fd');
 skyGrad.addColorStop(1, '#fef9c3');
 }
 ctx.fillStyle = skyGrad;
 ctx.fillRect(0, 0, WORLD_WIDTH, GROUND_Y);

 if (theme === 'newyear') {
 ctx.save();
 ctx.fillStyle = 'rgba(255, 255, 255, 0.35)';
 ctx.beginPath();
 ctx.arc(WORLD_WIDTH / 2, GROUND_Y - 40, 180, Math.PI, 0);
 ctx.fill();
 ctx.restore();
 }

 const groundColors = {
 kotatsu: ['#b45309', '#78350f'],
 osechi: ['#991b1b', '#450a0a'],
 sweets: ['#f472b6', '#be185d'],
 dagashi: ['#d97706', '#92400e'],
 freezer: ['#38bdf8', '#0284c7'],
 ozouni: ['#1c1917', '#09090b'],
 newyear: ['#eab308', '#a16207'],
 kitchen: ['#d97706', '#92400e']
 };
 const [topCol, botCol] = groundColors[theme] || groundColors.kitchen;

 ctx.fillStyle = topCol;
 ctx.fillRect(0, GROUND_Y, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y);
 ctx.fillStyle = botCol;
 ctx.fillRect(0, GROUND_Y + 14, WORLD_WIDTH, WORLD_HEIGHT - GROUND_Y - 14);

 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;
 ctx.beginPath();
 ctx.moveTo(0, GROUND_Y);
 ctx.lineTo(WORLD_WIDTH, GROUND_Y);
 ctx.stroke();
}

function drawAllyBase(ctx, x, y, hp, maxHp) {
 ctx.save();
 ctx.translate(x, y);
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;

 ctx.fillStyle = '#92400e';
 ctx.fillRect(-62, -24, 124, 24);
 ctx.strokeRect(-62, -24, 124, 24);

 ctx.fillStyle = '#fffdf9';
 ctx.beginPath();
 ctx.ellipse(0, -48, 54, 26, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.beginPath();
 ctx.ellipse(0, -84, 38, 20, 0, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#f97316';
 ctx.beginPath();
 ctx.arc(0, -116, 17, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#22c55e';
 ctx.beginPath();
 ctx.ellipse(12, -130, 12, 5, -0.4, 0, Math.PI * 2);
 ctx.fill();
 ctx.stroke();

 const barW = 110;
 const ratio = Math.max(0, hp / maxHp);
 ctx.fillStyle = '#1c1917';
 ctx.fillRect(-barW / 2 - 2, -162, barW + 4, 14);
 ctx.fillStyle = '#4ade80';
 ctx.fillRect(-barW / 2, -160, barW * ratio, 10);

 ctx.fillStyle = '#ffffff';
 ctx.font = '900 13px "M PLUS Rounded 1c", sans-serif';
 ctx.textAlign = 'center';
 ctx.strokeText(`${Math.ceil(hp)} / ${maxHp}`, 0, -168);
 ctx.fillText(`${Math.ceil(hp)} / ${maxHp}`, 0, -168);

 ctx.restore();
}

function drawEnemyBase(ctx, x, y, hp, maxHp, baseName) {
 const guarded = isEnemyBaseGuarded();
 ctx.save();
 ctx.translate(x, y);
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;

 ctx.fillStyle = '#b45309';
 ctx.beginPath();
 ctx.roundRect(-55, -125, 110, 125, [18, 18, 0, 0]);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#f43f5e';
 ctx.fillRect(-55, -92, 110, 18);
 ctx.strokeRect(-55, -92, 110, 18);

 ctx.fillStyle = '#fffbeb';
 ctx.fillRect(-55, -74, 110, 14);
 ctx.strokeRect(-55, -74, 110, 14);

 ctx.fillStyle = '#451a03';
 ctx.beginPath();
 ctx.arc(0, -28, 22, Math.PI, 0);
 ctx.lineTo(22, 0);
 ctx.lineTo(-22, 0);
 ctx.closePath();
 ctx.fill();
 ctx.stroke();

 if (guarded) {
 const flash = gameState.baseGuardFlashTimer > 0 ? 0.55 : 0.25;
 ctx.fillStyle = `rgba(74, 222, 128, ${flash})`;
 ctx.strokeStyle = '#4ade80';
 ctx.lineWidth = 5;
 ctx.beginPath();
 ctx.roundRect(-66, -138, 132, 138, 22);
 ctx.fill();
 ctx.stroke();

 ctx.fillStyle = '#4ade80';
 ctx.font = '900 13px "M PLUS Rounded 1c", sans-serif';
 ctx.textAlign = 'center';
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;
 ctx.strokeText('🛡️ 城ガード展開中', 0, -190);
 ctx.fillText('🛡️ 城ガード展開中', 0, -190);
 }

 const barW = 110;
 const ratio = Math.max(0, hp / maxHp);
 ctx.fillStyle = '#1c1917';
 ctx.fillRect(-barW / 2 - 2, -162, barW + 4, 14);
 ctx.fillStyle = guarded ? '#4ade80' : '#f43f5e';
 ctx.fillRect(-barW / 2, -160, barW * ratio, 10);

 ctx.fillStyle = '#ffffff';
 ctx.font = '900 13px "M PLUS Rounded 1c", sans-serif';
 ctx.textAlign = 'center';
 ctx.strokeStyle = '#2c1e16';
 ctx.lineWidth = 4;
 ctx.strokeText(`${Math.ceil(hp)} / ${maxHp}`, 0, -168);
 ctx.fillText(`${Math.ceil(hp)} / ${maxHp}`, 0, -168);

 ctx.restore();
}

/* ============================================================================
 60FPS メインゲームループ
============================================================================ */
let lastFrameTime = performance.now();

function mainLoop(now) {
 const rawDt = Math.min(0.05, (now - lastFrameTime) / 1000);
 lastFrameTime = now;

 if (typeof updateWorkshopPreview === 'function') {
 updateWorkshopPreview(rawDt);
 }

 if (typeof updateTitleBackgroundParade === 'function') {
 updateTitleBackgroundParade(rawDt);
 }

 if (gameState.screen === 'BATTLE') {
 updateBattle(rawDt);
 updateHUD();

 const canvas = document.getElementById('game-canvas');
 if (canvas) {
 const ctx = canvas.getContext('2d');
 ctx.clearRect(0, 0, canvas.width, canvas.height);
 drawBattleField(ctx);
 }
 }

 requestAnimationFrame(mainLoop);
}

requestAnimationFrame(mainLoop);

