<template>
  <div class="relative w-full bg-gradient-to-b from-[#FAF7F0] to-[#F2EDE0] border border-amber-900/15 rounded-2xl p-4 shadow-sm font-serif">
    <!-- 羅盤標題與數理說明 -->
    <div class="flex items-center justify-between pb-2.5 mb-3 border-b border-amber-900/10">
      <div class="flex items-center gap-2">
        <span class="cinnabar-seal text-xs px-1.5 py-0.5">神數</span>
        <span class="font-bold text-xs tracking-wider text-amber-950">五行生老病死苦 ‧ 天機律動羅盤</span>
      </div>
      <div class="text-[11px] text-amber-800/80 font-mono">
        公式：字數 {{ currentCount }} mod 5 = <span class="font-bold text-amber-950 text-xs">{{ currentCount % 5 }}</span>
      </div>
    </div>

    <!-- 羅盤圓環與五象限儀表 -->
    <div class="flex flex-col sm:flex-row items-center justify-around gap-4 py-2">
      <!-- 圓形太極五象盤 -->
      <div class="relative w-36 h-36 flex items-center justify-center shrink-0">
        <!-- 外圈銅紋環 -->
        <div class="absolute inset-0 rounded-full border-2 border-dashed border-amber-800/30"></div>
        <div class="absolute inset-2 rounded-full border border-amber-800/20"></div>

        <!-- 五行節點 (生、老、病、死、苦) -->
        <div
          v-for="phase in phases"
          :key="phase.mod"
          :style="getNodeStyle(phase.angle)"
          class="absolute w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500 shadow-sm"
          :class="[
            activeMod === phase.mod
              ? (phase.isAuspicious
                  ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white ring-4 ring-emerald-300/60 scale-125 z-20 shadow-emerald-700/40'
                  : 'bg-gradient-to-br from-rose-500 to-rose-700 text-white ring-4 ring-rose-300/60 scale-125 z-20 shadow-rose-700/40')
              : (phase.isAuspicious
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300/70 hover:scale-105'
                  : 'bg-stone-50 text-stone-500 border border-stone-200 hover:scale-105')
          ]"
        >
          {{ phase.name }}
        </div>

        <!-- 羅盤中心核心標籤 -->
        <div class="w-14 h-14 rounded-full bg-white border border-amber-900/20 shadow-inner flex flex-col items-center justify-center z-10 text-center">
          <span class="text-[10px] text-gray-400">當前中行</span>
          <span class="text-sm font-bold font-serif" :class="currentFate?.isAuspicious ? 'text-emerald-700' : 'text-rose-700'">
            {{ currentFate?.name || '無' }}
          </span>
        </div>
      </div>

      <!-- 右側：當前卦象吉凶詳解與智慧一鍵調整建議 -->
      <div class="flex-1 w-full space-y-2.5 text-xs">
        <div
          class="p-3 rounded-xl border flex items-start gap-2.5 transition-all"
          :class="currentFate?.isAuspicious ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950' : 'bg-rose-50/70 border-rose-300 text-rose-950'"
        >
          <div
            class="w-6 h-6 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs text-white"
            :class="currentFate?.isAuspicious ? 'bg-emerald-600' : 'bg-rose-600'"
          >
            {{ currentFate?.isAuspicious ? '吉' : '凶' }}
          </div>
          <div class="flex-1 leading-snug">
            <div class="font-bold flex items-center justify-between">
              <span>中行神主共 {{ currentCount }} 字（合「{{ currentFate?.name }}」）</span>
              <span class="text-[11px] font-sans font-semibold px-2 py-0.5 rounded-full"
                    :class="currentFate?.isAuspicious ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'">
                {{ currentFate?.isAuspicious ? '神數合宜' : '待調和' }}
              </span>
            </div>
            <p class="text-[11px] mt-1 opacity-80 leading-relaxed font-sans">
              {{ currentFate?.meaning }}
            </p>
          </div>
        </div>

        <!-- 調字建議按鈕清單 -->
        <div v-if="advice?.status === 'warning' && advice.options && advice.options.length" class="space-y-1.5 pt-1">
          <div class="text-[11px] text-amber-900/90 font-medium flex items-center gap-1">
            <svg class="w-3.5 h-3.5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>推薦調整方案（點選直接補字或減字）：</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            <button
              v-for="opt in advice.options"
              :key="opt.targetCount"
              @click="$emit('apply-advice', opt)"
              type="button"
              class="px-2.5 py-1 bg-white hover:bg-amber-100/80 text-amber-900 border border-amber-300/80 rounded-lg text-xs font-serif font-bold shadow-2xs transition-all hover:scale-102 flex items-center gap-1"
            >
              <span>{{ opt.action }}</span>
              <span class="text-[10px] text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-sans">合「{{ opt.targetFate }}」</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  currentCount: { type: Number, default: 0 },
  currentFate: { type: Object, default: () => ({}) },
  advice: { type: Object, default: () => ({}) }
});

defineEmits(['apply-advice']);

// 五行五神數循環 (0:苦, 1:生, 2:老, 3:病, 4:死)
const phases = [
  { mod: 1, name: '生', angle: -90, isAuspicious: true },   // 正上方
  { mod: 2, name: '老', angle: -18, isAuspicious: true },   // 東北方 (中行首選)
  { mod: 3, name: '病', angle: 54, isAuspicious: false },   // 東南方
  { mod: 4, name: '死', angle: 126, isAuspicious: false },  // 西南方
  { mod: 0, name: '苦', angle: 198, isAuspicious: false },  // 西北方
];

const activeMod = computed(() => {
  return props.currentCount > 0 ? (props.currentCount % 5) : -1;
});

function getNodeStyle(angleDegrees) {
  const radius = 52; // 半徑 px
  const rad = (angleDegrees * Math.PI) / 180;
  const x = Math.round(radius * Math.cos(rad));
  const y = Math.round(radius * Math.sin(rad));
  return {
    transform: `translate(${x}px, ${y}px)`
  };
}
</script>
