/**
 * 古典雅樂音效引擎 (基於 Web Audio API 純程式合成古琴/磬鐘餘韻)
 * 供典藏級互動體驗點綴，純內建無需載入外部音檔
 */

let audioCtx = null;
let isSoundEnabled = false;

function getAudioContext() {
  if (!audioCtx && typeof window !== 'undefined') {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function toggleSound() {
  isSoundEnabled = !isSoundEnabled;
  if (isSoundEnabled) {
    playChime(528); // 啟動時播放宮音示意
  }
  return isSoundEnabled;
}

export function getSoundStatus() {
  return isSoundEnabled;
}

/**
 * 播放五音微風琴鈴餘韻 (宮: 523Hz, 商: 587Hz, 角: 659Hz, 徵: 784Hz, 羽: 880Hz)
 */
export function playChime(freq = 523, duration = 1.6) {
  if (!isSoundEnabled) return;
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    // 擬真古代銅磬/古箏弦音
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    // 微弱泛音泛光
    osc.frequency.exponentialRampToValueAtTime(freq * 0.998, ctx.currentTime + duration);

    // 敲擊音頭 (Attack) 與緩慢幽遠釋放 (Decay & Release)
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    // 瀏覽器若受靜音原則限制則靜默忽略
  }
}

export function playAncestorSelectSound() {
  playChime(659, 1.8); // 角音 (清雅悠長)
}

export function playTabletBlessingSound() {
  playChime(784, 2.2); // 徵音 (圓滿祥和)
}
