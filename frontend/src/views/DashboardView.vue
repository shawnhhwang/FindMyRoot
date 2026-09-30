<template>
  <div class="space-y-6">
    <!-- 宗族大堂旗幟卡片 -->
    <div class="bg-gradient-to-r from-amber-950 via-[#3a2211] to-amber-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-800/40 relative overflow-hidden">
      <div class="absolute -right-8 -bottom-8 opacity-10 text-[180px] font-serif font-black select-none pointer-events-none">
        {{ branchInfo.hall_name ? branchInfo.hall_name[0] : '族' }}
      </div>

      <div class="relative z-10 max-w-3xl">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-serif mb-4">
          <span>堂號：{{ branchInfo.hall_name || '堂上' }}</span>
          <span class="w-1 h-1 rounded-full bg-amber-400"></span>
          <span>開基祖：{{ branchInfo.progenitor || '開基始祖' }}</span>
        </div>
        <h2 class="text-2xl sm:text-3xl font-serif font-black tracking-wider text-amber-50 mb-3">
          {{ branchInfo.family_name || '宗族族譜與牌位管理系統' }}
        </h2>
        <p class="text-amber-200/80 text-sm leading-relaxed mb-6 font-light">
          {{ branchInfo.description || '慎終追遠，民德歸厚。數位典藏歷代祖先神主世系，整合農曆國曆干支轉換與傳統牌位規範。' }}
        </p>

        <!-- 字輩歌 / 行輩詩卡片 -->
        <div v-if="branchInfo.generation_poem" class="bg-black/30 border border-amber-500/30 rounded-2xl p-4">
          <div class="text-[11px] uppercase tracking-widest text-amber-400 font-bold mb-1 font-serif">
            世代輩序詩（行輩歌）
          </div>
          <div class="font-serif text-base sm:text-lg text-amber-100 tracking-[0.2em] font-medium">
            {{ branchInfo.generation_poem }}
          </div>
        </div>
      </div>
    </div>

    <!-- 數據概況統計卡 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500 font-medium">宗族登錄總人數</div>
          <div class="text-2xl sm:text-3xl font-bold font-serif text-amber-950 mt-1">{{ members.length }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
          人
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500 font-medium">世系統計代數</div>
          <div class="text-2xl sm:text-3xl font-bold font-serif text-amber-950 mt-1">{{ maxGeneration }} 世</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-lg font-serif">
          代
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500 font-medium">歷代祖先 (已故)</div>
          <div class="text-2xl sm:text-3xl font-bold font-serif text-stone-700 mt-1">{{ deceasedCount }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center font-bold text-lg font-serif">
          先
        </div>
      </div>

      <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex items-center justify-between">
        <div>
          <div class="text-xs text-gray-500 font-medium">裔孫子嗣 (健在)</div>
          <div class="text-2xl sm:text-3xl font-bold font-serif text-emerald-700 mt-1">{{ livingCount }}</div>
        </div>
        <div class="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-lg font-serif">
          昌
        </div>
      </div>
    </div>

    <!-- 快捷功能與近期先人列表 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 快捷入口 -->
      <div class="bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm space-y-4">
        <h3 class="font-bold text-base text-gray-900 font-serif border-b pb-2 flex items-center justify-between">
          <span>核心功能快捷</span>
        </h3>
        <div class="space-y-3">
          <button
            @click="$emit('navigate', 'tree')"
            class="w-full text-left p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 font-serif text-sm group-hover:text-amber-900">檢視家族世系樹</div>
              <div class="text-xs text-amber-800/70">直系與旁系世系分支樹狀動態縮放展開</div>
            </div>
            <span class="text-amber-800 font-bold">&rarr;</span>
          </button>

          <button
            @click="$emit('navigate', 'tablet')"
            class="w-full text-left p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 font-serif text-sm group-hover:text-amber-900">祖先牌位工作室</div>
              <div class="text-xs text-amber-800/70">兩生合一老字數校驗與直書排版輸出</div>
            </div>
            <span class="text-amber-800 font-bold">&rarr;</span>
          </button>

          <button
            @click="$emit('open-add-member')"
            class="w-full text-left p-3.5 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 transition-all flex items-center justify-between group"
          >
            <div>
              <div class="font-bold text-amber-950 font-serif text-sm group-hover:text-amber-900">登錄新族人或雙親</div>
              <div class="text-xs text-amber-800/70">支援國曆農曆雙向換算與時辰八字標註</div>
            </div>
            <span class="text-amber-800 font-bold">&rarr;</span>
          </button>
        </div>
      </div>

      <!-- 歷代先人列表 -->
      <div class="lg:col-span-2 bg-white rounded-2xl p-6 border border-amber-900/10 shadow-sm flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between border-b pb-2 mb-4">
            <h3 class="font-bold text-base text-gray-900 font-serif">歷代宗親先祖名錄</h3>
            <button
              @click="$emit('navigate', 'members')"
              class="text-xs text-amber-800 hover:underline font-medium"
            >
              查看全體名冊 &rarr;
            </button>
          </div>

          <div class="divide-y divide-gray-100 overflow-hidden">
            <div
              v-for="p in ancestorsList.slice(0, 5)"
              :key="p.id"
              class="py-3 flex items-center justify-between hover:bg-gray-50/80 px-2 rounded-lg transition-colors"
            >
              <div class="flex items-center gap-3">
                <span class="text-xs font-serif font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  第 {{ p.generation_num }} 世
                </span>
                <div>
                  <div class="font-serif font-bold text-sm text-gray-900 flex items-center gap-1.5">
                    <span>{{ p.last_name }}{{ p.first_name }}</span>
                    <span v-if="p.courtesy_name" class="text-xs font-normal text-gray-500">({{ p.courtesy_name }})</span>
                  </div>
                  <div class="text-[11px] text-gray-500 font-mono">
                    {{ p.lunar_birth_date ? '生：' + p.lunar_birth_date : '' }}
                    {{ p.lunar_death_date ? ' ‧ 卒：' + p.lunar_death_date : '' }}
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-2">
                <button
                  @click="$emit('create-tablet', p)"
                  class="text-xs font-serif text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-md transition-colors font-medium"
                >
                  排版牌位
                </button>
              </div>
            </div>
          </div>
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
