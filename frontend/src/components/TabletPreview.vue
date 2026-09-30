<template>
  <div class="flex flex-col items-center">
    <!-- 樣式切換工具列 -->
    <div class="flex items-center gap-2 mb-4 bg-amber-100/60 p-1.5 rounded-xl text-xs print:hidden">
      <button
        type="button"
        @click="styleMode = 'redwood'"
        :class="['px-3 py-1 rounded-lg font-medium transition-all', styleMode === 'redwood' ? 'bg-amber-900 text-white shadow-sm' : 'text-amber-900 hover:bg-amber-200/50']"
      >
        傳統紅木金字
      </button>
      <button
        type="button"
        @click="styleMode = 'ebony'"
        :class="['px-3 py-1 rounded-lg font-medium transition-all', styleMode === 'ebony' ? 'bg-stone-900 text-white shadow-sm' : 'text-stone-800 hover:bg-stone-200/50']"
      >
        沉香黑檀金字
      </button>
      <button
        type="button"
        @click="styleMode = 'paper'"
        :class="['px-3 py-1 rounded-lg font-medium transition-all', styleMode === 'paper' ? 'bg-white text-gray-900 shadow-sm border border-gray-300' : 'text-gray-700 hover:bg-gray-200']"
      >
        白底列印紙樣
      </button>
    </div>

    <!-- 牌位本體實體外觀容器 -->
    <div
      class="tablet-container relative w-[320px] min-h-[580px] p-6 rounded-2xl flex flex-col items-center justify-between border-4 shadow-2xl transition-all font-serif"
      :class="{
        'tablet-wood-bg border-amber-950 text-amber-100': styleMode === 'redwood',
        'bg-stone-950 border-stone-800 text-amber-200': styleMode === 'ebony',
        'bg-white border-dashed border-gray-400 text-black shadow-none': styleMode === 'paper'
      }"
    >
      <!-- 頂部牌頭雕飾與堂號 -->
      <div class="w-full flex flex-col items-center border-b pb-3"
           :class="styleMode === 'paper' ? 'border-gray-300' : 'border-amber-600/40'">
        <div class="text-xs tracking-[0.3em] font-bold opacity-80 uppercase">
          祖德流芳
        </div>
        <div
          class="text-xl font-bold tracking-[0.4em] mt-1"
          :class="styleMode === 'paper' ? 'text-black' : 'gold-text-emboss'"
        >
          {{ hallName || '堂上' }}
        </div>
      </div>

      <!-- 牌位三行核心內文 (直書排列) -->
      <div class="flex-1 w-full flex items-center justify-around py-6 vertical-writing text-lg leading-relaxed select-none">
        <!-- 右行：生卒時辰 -->
        <div
          class="text-xs sm:text-sm tracking-widest opacity-90 font-light flex items-center"
          :class="styleMode === 'paper' ? 'text-gray-700' : 'text-amber-200/90'"
        >
          {{ rightText || '生卒年日吉時' }}
        </div>

        <!-- 中行：主神主神位 (最重要，字體大，生老病死苦校驗主體) -->
        <div
          class="text-2xl sm:text-3xl font-extrabold tracking-[0.25em] mx-2"
          :class="styleMode === 'paper' ? 'text-black' : 'gold-text-emboss'"
        >
          {{ middleText || '顯考公諱府君之神位' }}
        </div>

        <!-- 左行：陽上裔孫奉祀 -->
        <div
          class="text-xs sm:text-sm tracking-widest opacity-90 font-light flex items-center"
          :class="styleMode === 'paper' ? 'text-gray-700' : 'text-amber-200/90'"
        >
          {{ leftText || '陽上裔孫等奉祀' }}
        </div>
      </div>

      <!-- 牌座底台 -->
      <div
        class="w-full pt-3 border-t text-center text-[10px] tracking-widest opacity-60"
        :class="styleMode === 'paper' ? 'border-gray-300 text-gray-500' : 'border-amber-600/40 text-amber-400'"
      >
        歷代宗親 世系傳家
      </div>
    </div>

    <!-- 即時生老病死苦吉凶檢查徽章與建議 -->
    <div class="mt-6 w-full max-w-[360px] bg-white rounded-xl p-4 border border-amber-900/10 shadow-sm text-xs print:hidden space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-gray-100">
        <span class="font-bold text-gray-800">「兩生合一老」字數驗證</span>
        <span class="text-gray-500">依據傳統神數</span>
      </div>

      <!-- 中行驗證結果 -->
      <div class="p-2.5 rounded-lg border flex items-start gap-2.5"
           :class="middleFate?.isAuspicious ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-rose-50 border-rose-200 text-rose-900'">
        <div class="w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0"
             :class="middleFate?.isAuspicious ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'">
          {{ middleFate?.name || '老' }}
        </div>
        <div class="flex-1">
          <div class="flex items-center justify-between">
            <span class="font-bold font-serif">中行：共 {{ middleCount }} 字 (合「{{ middleFate?.name }}」)</span>
            <span class="font-bold text-[11px] px-1.5 py-0.5 rounded"
                  :class="middleFate?.isAuspicious ? 'bg-emerald-200/70 text-emerald-900' : 'bg-rose-200/70 text-rose-900'">
              {{ middleFate?.isAuspicious ? '吉' : '凶' }}
            </span>
          </div>
          <p class="text-[11px] mt-0.5 opacity-80">{{ middleFate?.meaning }}</p>
          <div v-if="middleAdvice?.status === 'warning'" class="mt-2 text-rose-800 text-[11px]">
            <div>{{ middleAdvice.message }}</div>
            <div class="mt-1 flex flex-wrap gap-1">
              <button
                v-for="opt in middleAdvice.options"
                :key="opt.targetCount"
                @click="$emit('apply-advice', opt)"
                type="button"
                class="bg-white border border-rose-300 text-rose-700 px-1.5 py-0.5 rounded text-[10px] hover:bg-rose-100"
              >
                {{ opt.action }} (合{{ opt.targetFate }})
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 左右行輔助檢視 -->
      <div class="grid grid-cols-2 gap-2 text-[11px]">
        <div class="p-2 bg-gray-50 rounded border border-gray-200">
          <div class="font-semibold text-gray-700">右行生卒：{{ rightCount }} 字</div>
          <div class="text-gray-500">合「{{ rightFate?.name }}」數 ({{ rightFate?.isAuspicious ? '吉' : '凶' }})</div>
        </div>
        <div class="p-2 bg-gray-50 rounded border border-gray-200">
          <div class="font-semibold text-gray-700">左行奉祀：{{ leftCount }} 字</div>
          <div class="text-gray-500">合「{{ leftFate?.name }}」數 ({{ leftFate?.isAuspicious ? '吉' : '凶' }})</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  hallName: { type: String, default: '穎川堂' },
  middleText: { type: String, default: '' },
  rightText: { type: String, default: '' },
  leftText: { type: String, default: '' },
  middleCount: { type: Number, default: 0 },
  rightCount: { type: Number, default: 0 },
  leftCount: { type: Number, default: 0 },
  middleFate: { type: Object, default: () => ({}) },
  rightFate: { type: Object, default: () => ({}) },
  leftFate: { type: Object, default: () => ({}) },
  middleAdvice: { type: Object, default: () => ({}) }
});

defineEmits(['apply-advice']);

const styleMode = ref('redwood');
</script>

<style scoped>
@media print {
  body {
    background: white !important;
  }
  .tablet-container {
    box-shadow: none !important;
    border: 2px solid #000 !important;
    background: white !important;
    color: black !important;
  }
}
</style>
