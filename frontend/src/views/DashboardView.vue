<template>
  <div class="space-y-8 font-serif select-none">
    <!-- 宗族殿堂崇祀旗幟橫幅 (Heritage Hall Grand Hero Banner) -->
    <div class="relative bg-gradient-to-r from-[#241108] via-[#3D1E10] to-[#241108] text-white rounded-3xl p-6 sm:p-10 shadow-2xl border-2 border-amber-600/30 overflow-hidden">
      <!-- 背景巨幅堂號書法水印 -->
      <div class="absolute -right-6 -bottom-10 opacity-10 text-[200px] sm:text-[260px] font-calligraphy text-amber-200 pointer-events-none select-none">
        {{ branchInfo.hall_name ? branchInfo.hall_name[0] : '族' }}
      </div>

      <!-- 兩側古典門風對聯 (Traditional Clan Couplets - Hidden on small screens) -->
      <div class="hidden xl:flex absolute right-12 top-8 vertical-writing text-xs text-amber-300/80 font-calligraphy tracking-[0.4em] bg-black/30 border border-amber-600/30 p-3 rounded-lg">
        祖功宗德流芳千古遠 ‧ 子孝孫賢世澤百世長
      </div>

      <div class="relative z-10 max-w-3xl space-y-4">
        <!-- 頂部堂號勳章與開基始祖標籤 -->
        <div class="flex flex-wrap items-center gap-2 text-xs">
          <div class="cinnabar-seal text-xs px-2.5 py-1">
            堂號：{{ branchInfo.hall_name || '堂上' }}
          </div>
          <div class="bg-amber-500/20 border border-amber-400/40 text-amber-200 px-3 py-1 rounded-full font-serif flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            <span>開基始祖：{{ branchInfo.progenitor || '開基一世祖' }}</span>
          </div>
          <span class="text-amber-300/60 font-mono text-[11px]">
            已修編傳承至第 {{ maxGeneration }} 世
          </span>
        </div>

        <!-- 宗族全稱與書法標題 -->
        <h1 class="text-3xl sm:text-4xl lg:text-5xl font-black tracking-wider text-amber-50 font-serif leading-tight">
          <span class="gold-foil-shimmer">{{ branchInfo.family_name || '宗族族譜與神主世系長卷' }}</span>
        </h1>

        <p class="text-amber-100/80 text-xs sm:text-sm leading-relaxed max-w-2xl font-light">
          {{ branchInfo.description || '慎終追遠，民德歸厚。數位典藏歷代先人神主世系，整合農曆國曆干支轉換與傳統牌位規範。' }}
        </p>

        <!-- 世代輩序歌詩 (金絲卷軸卡片) -->
        <div v-if="branchInfo.generation_poem" class="mt-4 bg-black/40 border border-amber-500/40 rounded-2xl p-4 sm:p-5 backdrop-blur-xs relative group">
          <div class="flex items-center justify-between text-[11px] uppercase tracking-widest text-amber-400 font-bold mb-2">
            <span class="flex items-center gap-1.5">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>世系輩序詩（行輩歌）</span>
            </span>
            <span class="text-amber-300/60 font-mono">傳家宗訓</span>
          </div>
          <div class="font-calligraphy text-lg sm:text-2xl text-amber-100 tracking-[0.25em] font-medium leading-relaxed">
            {{ branchInfo.generation_poem }}
          </div>
        </div>
      </div>
    </div>

    <!-- 典藏數據統計儀表 (玉牒四樞統計卡) -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
      <!-- 總登錄人數 -->
      <div class="ornate-card p-5 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-1">
        <div>
          <div class="text-[11px] text-stone-500 font-bold tracking-wider">世系登錄總人口</div>
          <div class="text-2xl sm:text-3xl font-black text-amber-950 font-serif mt-1">
            {{ members.length }} <span class="text-xs font-normal text-stone-500">位</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-300/60 text-amber-900 flex items-center justify-center font-bold text-xl font-calligraphy">
          丁
        </div>
      </div>

      <!-- 世代代數 -->
      <div class="ornate-card p-5 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-1">
        <div>
          <div class="text-[11px] text-stone-500 font-bold tracking-wider">歷代傳承世數</div>
          <div class="text-2xl sm:text-3xl font-black text-amber-950 font-serif mt-1">
            {{ maxGeneration }} <span class="text-xs font-normal text-stone-500">世</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-amber-100/70 border border-amber-300/60 text-amber-900 flex items-center justify-center font-bold text-xl font-calligraphy">
          代
        </div>
      </div>

      <!-- 已故先祖 -->
      <div class="ornate-card p-5 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-1">
        <div>
          <div class="text-[11px] text-stone-500 font-bold tracking-wider">列位先祖 (已仙逝)</div>
          <div class="text-2xl sm:text-3xl font-black text-stone-800 font-serif mt-1">
            {{ deceasedCount }} <span class="text-xs font-normal text-stone-500">位</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-stone-100 border border-stone-300 text-stone-700 flex items-center justify-center font-bold text-xl font-calligraphy">
          祀
        </div>
      </div>

      <!-- 健在裔孫 -->
      <div class="ornate-card p-5 rounded-2xl flex items-center justify-between transition-all hover:-translate-y-1">
        <div>
          <div class="text-[11px] text-stone-500 font-bold tracking-wider">裔孫子嗣 (健在昌盛)</div>
          <div class="text-2xl sm:text-3xl font-black text-emerald-800 font-serif mt-1">
            {{ livingCount }} <span class="text-xs font-normal text-stone-500">位</span>
          </div>
        </div>
        <div class="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 flex items-center justify-center font-bold text-xl font-calligraphy">
          昌
        </div>
      </div>
    </div>

    <!-- 核心功能快捷入口與先人名冊展陳 -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 左側：三大核心功能快捷入口 -->
      <div class="lg:col-span-5 ornate-card rounded-2xl p-6 space-y-4">
        <div class="flex items-center justify-between border-b pb-2">
          <div class="flex items-center gap-2">
            <span class="cinnabar-seal text-[11px] px-1.5 py-0.2">典藏</span>
            <h3 class="font-bold text-sm text-gray-900">核心修譜與祭祀入口</h3>
          </div>
          <span class="text-[11px] text-gray-400">一鍵直達</span>
        </div>

        <div class="space-y-3">
          <!-- 世系圖快捷 -->
          <div
            @click="$emit('navigate', 'tree')"
            class="p-4 rounded-xl border border-amber-900/15 bg-gradient-to-r from-[#FCFAF5] to-[#F5EFE4] hover:border-amber-500 cursor-pointer transition-all hover:scale-101 flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 text-sm group-hover:text-amber-800 flex items-center gap-1.5">
                <span>家族世系圖譜長卷</span>
                <span class="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded font-sans">動態拓樸</span>
              </div>
              <div class="text-[11px] text-stone-500 mt-0.5">平移縮放、直系尋根溯源、展開收合支派</div>
            </div>
            <span class="text-amber-800 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>

          <!-- 牌位工作室快捷 -->
          <div
            @click="$emit('navigate', 'tablet')"
            class="p-4 rounded-xl border border-amber-900/15 bg-gradient-to-r from-[#FCFAF5] to-[#F5EFE4] hover:border-amber-500 cursor-pointer transition-all hover:scale-101 flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 text-sm group-hover:text-amber-800 flex items-center gap-1.5">
                <span>祖先牌位工作室</span>
                <span class="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-sans">兩生合一老</span>
              </div>
              <div class="text-[11px] text-stone-500 mt-0.5">神主字數天機校驗、3D 老紫檀/黑檀直書排版輸出</div>
            </div>
            <span class="text-amber-800 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>

          <!-- AI 助手快捷 -->
          <div
            @click="$emit('navigate', 'ai')"
            class="p-4 rounded-xl border border-amber-900/15 bg-gradient-to-r from-[#FCFAF5] to-[#F5EFE4] hover:border-amber-500 cursor-pointer transition-all hover:scale-101 flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 text-sm group-hover:text-amber-800 flex items-center gap-1.5">
                <span>AI 禮制智慧問答顧問</span>
                <span class="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.2 rounded font-sans">動態資料庫感知</span>
              </div>
              <div class="text-[11px] text-stone-500 mt-0.5">解答「兩生合一老」字數疑難、男女神主稱謂與曆法八字</div>
            </div>
            <span class="text-amber-800 font-bold group-hover:translate-x-1 transition-transform">&rarr;</span>
          </div>
        </div>
      </div>

      <!-- 右側：歷代宗親先祖名錄簡冊 -->
      <div class="lg:col-span-7 ornate-card rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b pb-2 mb-3">
            <div class="flex items-center gap-2">
              <span class="cinnabar-seal text-[11px] px-1.5 py-0.2">先祖</span>
              <h3 class="font-bold text-sm text-gray-900">歷代先人神主世系名錄</h3>
            </div>
            <button
              @click="$emit('navigate', 'members')"
              class="text-xs text-amber-900 hover:underline font-bold"
            >
              檢視全體族人名冊 &rarr;
            </button>
          </div>

          <!-- 先人列表清單 -->
          <div class="divide-y divide-amber-900/10">
            <div
              v-for="p in ancestorsList.slice(0, 5)"
              :key="p.id"
              class="py-3 flex items-center justify-between hover:bg-amber-50/50 px-2 rounded-xl transition-colors"
            >
              <div class="flex items-center gap-3">
                <span class="text-[10px] font-serif font-bold bg-[#EFE9DC] text-amber-950 px-2 py-0.5 rounded border border-amber-900/10">
                  第 {{ p.generation_num }} 世
                </span>
                <div>
                  <div class="font-serif font-bold text-sm text-gray-950 flex items-center gap-1.5">
                    <span>{{ p.last_name }}{{ p.first_name }}</span>
                    <span v-if="p.courtesy_name" class="text-xs font-normal text-stone-500">({{ p.courtesy_name }})</span>
                    <span v-if="p.posthumous_name" class="text-[10px] text-amber-800 bg-amber-50 px-1 rounded">諡 {{ p.posthumous_name }}</span>
                  </div>
                  <div class="text-[11px] text-stone-500 font-mono mt-0.5">
                    {{ p.lunar_birth_date ? '生：' + p.lunar_birth_date : '' }}
                    {{ p.lunar_death_date ? ' ‧ 卒：' + p.lunar_death_date : '' }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="$emit('create-tablet', p)"
                  class="text-xs font-serif text-white bg-amber-900 hover:bg-amber-950 px-3 py-1 rounded-lg transition-colors font-medium shadow-2xs"
                >
                  牌位排版
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t text-[11px] text-stone-500 flex items-center justify-between">
          <span>共典藏 {{ ancestorsList.length }} 位已仙逝列位先祖</span>
          <button @click="$emit('open-add-member')" class="text-amber-900 hover:underline font-bold">
            + 登錄新先人或裔孫
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  branchInfo: { type: Object, default: () => ({}) },
  members: { type: Array, default: () => [] }
});

defineEmits(['navigate', 'open-add-member', 'create-tablet']);

const maxGeneration = computed(() => {
  if (!props.members.length) return 0;
  return Math.max(...props.members.map(m => m.generation_num || 1));
});

const deceasedCount = computed(() => {
  return props.members.filter(m => Boolean(m.solar_death_date || m.lunar_death_date)).length;
});

const livingCount = computed(() => {
  return props.members.length - deceasedCount.value;
});

const ancestorsList = computed(() => {
  return props.members.filter(m => Boolean(m.solar_death_date || m.lunar_death_date));
});
</script>
