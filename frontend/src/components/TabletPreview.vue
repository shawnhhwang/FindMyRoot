<template>
  <div class="flex flex-col items-center w-full max-w-[420px] font-serif select-none">
    <!-- 樣式切換與尺寸標尺模式工具列 -->
    <div class="flex items-center justify-between w-full mb-3 bg-[#EFE9DC] p-1.5 rounded-2xl text-xs print:hidden shadow-inner border border-amber-900/10">
      <div class="flex items-center gap-1">
        <button
          type="button"
          @click="styleMode = 'sandalwood'"
          :class="['px-3 py-1.5 rounded-xl font-medium transition-all text-xs flex items-center gap-1', styleMode === 'sandalwood' ? 'bg-[#3B2012] text-amber-100 shadow-sm' : 'text-amber-900 hover:bg-amber-200/50']"
        >
          <span class="w-2 h-2 rounded-full bg-amber-600"></span>
          <span>老紫檀金字</span>
        </button>
        <button
          type="button"
          @click="styleMode = 'ebony'"
          :class="['px-3 py-1.5 rounded-xl font-medium transition-all text-xs flex items-center gap-1', styleMode === 'ebony' ? 'bg-[#181412] text-amber-200 shadow-sm' : 'text-stone-800 hover:bg-stone-200/50']"
        >
          <span class="w-2 h-2 rounded-full bg-stone-500"></span>
          <span>黑檀嵌金</span>
        </button>
        <button
          type="button"
          @click="styleMode = 'rubbing'"
          :class="['px-3 py-1.5 rounded-xl font-medium transition-all text-xs flex items-center gap-1', styleMode === 'rubbing' ? 'bg-white text-gray-900 shadow-sm border border-gray-300' : 'text-gray-700 hover:bg-gray-200']"
        >
          <span class="w-2 h-2 rounded-full bg-red-600"></span>
          <span>宣紙墨拓印稿</span>
        </button>
      </div>

      <!-- 魯班尺吉數標記 (一尺二寸 / 八寸八分) -->
      <span class="text-[11px] text-amber-900/70 font-sans font-medium px-2 py-0.5 rounded bg-amber-100/60 hidden sm:inline-block">
        尺規：一尺二寸 (迎福)
      </span>
    </div>

    <!-- 牌位實體 3D 結構容器 -->
    <div
      class="tablet-grand-wrapper relative w-[310px] sm:w-[330px] flex flex-col items-center transition-all duration-300 print:shadow-none"
    >
      <!-- 頂部：雕花牌頭 (雙龍祥雲龍冠頂蓋) -->
      <div class="relative w-full z-20 flex flex-col items-center">
        <!-- SVG 傳統祥雲螭龍牌頭雕飾 -->
        <svg class="w-full h-14 drop-shadow-md" viewBox="0 0 320 60" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- 牌頭主輪廓 -->
          <path
            d="M20 58 C40 20, 110 5, 160 5 C210 5, 280 20, 300 58 Z"
            :fill="styleMode === 'sandalwood' ? '#381C0F' : (styleMode === 'ebony' ? '#181412' : '#F6F3EC')"
            :stroke="styleMode === 'rubbing' ? '#333333' : '#D4AF37'"
            stroke-width="2"
          />
          <!-- 浮雕如意紋裝飾線 -->
          <path
            d="M60 48 Q100 22 160 22 Q220 22 260 48"
            fill="none"
            :stroke="styleMode === 'rubbing' ? '#666666' : '#C5A059'"
            stroke-width="1.5"
            stroke-dasharray="3 2"
          />
          <!-- 祥雲靈芝捲雲紋 -->
          <circle cx="160" cy="18" r="6" :fill="styleMode === 'rubbing' ? '#A32A2B' : '#E8C56B'" />
          <path d="M140 26 Q160 36 180 26" :stroke="styleMode === 'rubbing' ? '#888' : '#AA800A'" stroke-width="1.5" fill="none" />
        </svg>

        <!-- 牌頭堂號勳章浮雕 -->
        <div
          class="absolute top-4 px-4 py-1 rounded-md border flex items-center justify-center tracking-[0.3em] font-black text-sm"
          :class="[
            styleMode === 'rubbing'
              ? 'bg-white border-gray-400 text-black shadow-none'
              : 'bg-gradient-to-b from-[#2F170D] to-[#1A0C06] border-amber-500/50 gold-text-emboss'
          ]"
        >
          <span>{{ hallName || '堂上' }}</span>
        </div>
      </div>

      <!-- 牌位身柱與內嵌主神牌框 -->
      <div
        class="tablet-main-body relative w-[280px] sm:w-[295px] min-h-[480px] -mt-2 p-5 rounded-md flex flex-col justify-between items-center transition-all"
        :class="{
          'tablet-wood-sandalwood text-amber-100': styleMode === 'sandalwood',
          'tablet-wood-ebony text-amber-100': styleMode === 'ebony',
          'tablet-paper-rubbing text-black': styleMode === 'rubbing'
        }"
      >
        <!-- 左右刻花邊柱框線 -->
        <div
          class="absolute inset-x-2.5 inset-y-2.5 border-2 rounded pointer-events-none"
          :class="styleMode === 'rubbing' ? 'border-dashed border-gray-400' : 'border-[#917135]/40'"
        ></div>

        <!-- 頂部題字：祖德流芳 -->
        <div class="text-[11px] tracking-[0.4em] font-medium pt-1 opacity-80 uppercase flex items-center gap-1">
          <span class="w-1.5 h-1.5 rounded-full" :class="styleMode === 'rubbing' ? 'bg-black' : 'bg-amber-400'"></span>
          <span>祖德流芳</span>
          <span class="w-1.5 h-1.5 rounded-full" :class="styleMode === 'rubbing' ? 'bg-black' : 'bg-amber-400'"></span>
        </div>

        <!-- 牌位三行直排主體 -->
        <div class="flex-1 w-full flex items-center justify-around py-4 vertical-writing text-lg leading-relaxed select-none my-1">
          <!-- 右行：先人生卒干支吉時 -->
          <div
            class="text-[12px] sm:text-[13px] tracking-[0.25em] font-light max-h-[380px] leading-loose"
            :class="styleMode === 'rubbing' ? 'text-gray-800' : 'text-amber-200/90'"
          >
            {{ rightText || '生卒年月日吉時' }}
          </div>

          <!-- 中行：神主主神位 (核心靈魂，字體尊大、合老合生) -->
          <div
            class="text-2xl sm:text-[27px] font-black tracking-[0.25em] mx-1 leading-none"
            :class="styleMode === 'rubbing' ? 'text-black' : 'gold-text-emboss'"
          >
            {{ middleText || '顯考公諱府君之神位' }}
          </div>

          <!-- 左行：陽上孝男裔孫奉祀 -->
          <div
            class="text-[12px] sm:text-[13px] tracking-[0.25em] font-light max-h-[380px] leading-loose"
            :class="styleMode === 'rubbing' ? 'text-gray-800' : 'text-amber-200/90'"
          >
            {{ leftText || '陽上孝男裔孫等奉祀' }}
          </div>
        </div>

        <!-- 牌面底部萬代昌盛銘文與朱砂印記 -->
        <div class="w-full flex items-center justify-between px-2 pt-2 border-t"
             :class="styleMode === 'rubbing' ? 'border-gray-300 text-gray-600' : 'border-amber-600/30 text-amber-300/70'">
          <span class="text-[10px] tracking-widest">世系源流</span>
          <span class="cinnabar-seal text-[9px] px-1 py-0.2">祀典</span>
          <span class="text-[10px] tracking-widest">長發其祥</span>
        </div>
      </div>

      <!-- 底部：須彌蓮花座 (Sumeru Lotus Pedestal) -->
      <div class="w-full flex flex-col items-center -mt-1 z-20">
        <!-- 上階：仰蓮花座紋 -->
        <div
          class="w-[290px] h-6 rounded-t-lg border-t border-x flex items-center justify-center"
          :class="[
            styleMode === 'rubbing'
              ? 'bg-[#F2EDE0] border-gray-400'
              : 'bg-gradient-to-r from-[#2B140B] via-[#482819] to-[#2B140B] border-amber-600/60 shadow-md'
          ]"
        >
          <div class="flex gap-2">
            <span v-for="i in 9" :key="i" class="w-2.5 h-1.5 rounded-full"
                  :class="styleMode === 'rubbing' ? 'bg-gray-400' : 'bg-[#D4AF37]/60'"></span>
          </div>
        </div>

        <!-- 下階：如意須彌底座 -->
        <div
          class="w-[315px] sm:w-[330px] h-7 rounded-b-xl border flex items-center justify-around shadow-xl px-4"
          :class="[
            styleMode === 'rubbing'
              ? 'bg-[#EAE4D5] border-gray-500 text-gray-800'
              : 'bg-gradient-to-b from-[#1C0D07] to-[#0D0503] border-amber-700/80 text-amber-200'
          ]"
        >
          <span class="text-[10px] tracking-[0.2em] font-serif opacity-80">萬代馨香</span>
          <div class="w-8 h-1 bg-[#D4AF37]/40 rounded-full"></div>
          <span class="text-[10px] tracking-[0.2em] font-serif opacity-80">百世流芳</span>
        </div>
      </div>
    </div>

    <!-- 底部：五行生老病死苦動態羅盤儀表 (五象天機校驗) -->
    <div class="w-full mt-5 print:hidden">
      <FiveFateCompass
        :currentCount="middleCount"
        :currentFate="middleFate"
        :advice="middleAdvice"
        @apply-advice="$emit('apply-advice', $event)"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FiveFateCompass from './FiveFateCompass.vue';

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

// 樣式：'sandalwood' (老紫檀), 'ebony' (沉香黑檀), 'rubbing' (宣紙墨拓)
const styleMode = ref('sandalwood');
</script>

<style scoped>
@media print {
  .tablet-grand-wrapper {
    box-shadow: none !important;
  }
}
</style>
