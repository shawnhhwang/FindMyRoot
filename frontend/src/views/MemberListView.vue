<template>
  <div class="space-y-5">
    <!-- Header & Filtering -->
    <div class="bg-white/95 backdrop-blur-xs p-6 rounded-2xl border border-amber-900/15 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ornate-card">
      <div>
        <div class="flex items-center gap-2.5">
          <span class="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-800 to-amber-950 text-amber-200 flex items-center justify-center font-bold text-xs font-serif shadow-inner border border-amber-600/40">牒</span>
          <h2 class="text-xl font-bold font-serif text-stone-900 flex items-center gap-2">
            <span>宗族玉牒世系名冊</span>
            <span class="text-xs font-serif font-normal bg-amber-100 text-amber-900 border border-amber-300/40 px-2.5 py-0.5 rounded-full">
              共錄 {{ filteredMembers.length }} 位先祖裔孫
            </span>
          </h2>
        </div>
        <p class="text-xs text-stone-500 font-serif mt-1.5 pl-10.5">詳記太祖先民世系源流、昭穆排行、生卒年月干支吉辰與長眠福地。</p>
      </div>

      <!-- 搜尋與篩選條件 -->
      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜尋先祖姓名、字輩、號..."
          class="px-3.5 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 w-40 sm:w-52 bg-stone-50/60 font-serif"
        />

        <select
          v-model="selectedGeneration"
          class="px-3.5 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-serif"
        >
          <option value="">全部昭穆世代</option>
          <option v-for="g in availableGenerations" :key="g" :value="g">
            第 {{ g }} 世
          </option>
        </select>

        <select
          v-model="selectedGender"
          class="px-3.5 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white font-serif"
        >
          <option value="">全部男女</option>
          <option value="M">男考 (顯考/嗣男)</option>
          <option value="F">女妣 (顯妣/孺人)</option>
        </select>

        <button
          @click="$emit('open-add-member')"
          class="bg-gradient-to-r from-amber-800 to-amber-950 hover:from-amber-700 hover:to-amber-900 text-white px-4 py-2 rounded-xl text-xs font-bold font-serif flex items-center gap-1.5 shadow-sm transition-all border border-amber-700/50"
        >
          <span>+ 登錄新宗親</span>
        </button>
      </div>
    </div>

    <!-- 成員名冊表格 -->
    <div class="bg-white/95 backdrop-blur-xs rounded-2xl border border-amber-900/15 shadow-sm overflow-hidden ornate-card">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-stone-700 font-serif">
          <thead class="bg-gradient-to-r from-stone-900 via-amber-950 to-stone-900 text-amber-100 uppercase border-b border-amber-800/40">
            <tr>
              <th scope="col" class="px-5 py-4 tracking-wider">世代 / 昭穆</th>
              <th scope="col" class="px-5 py-4 tracking-wider">尊諱名號</th>
              <th scope="col" class="px-5 py-4 tracking-wider">男女 / 行位</th>
              <th scope="col" class="px-5 py-4 tracking-wider">誕辰 (農曆干支 / 國曆)</th>
              <th scope="col" class="px-5 py-4 tracking-wider">仙逝 (農曆干支 / 國曆)</th>
              <th scope="col" class="px-5 py-4 tracking-wider">安葬福地</th>
              <th scope="col" class="px-5 py-4 text-right tracking-wider">儀禮操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-amber-900/5">
            <tr
              v-for="p in filteredMembers"
              :key="p.id"
              class="hover:bg-amber-50/40 transition-colors"
            >
              <!-- 世代 -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <span class="font-bold text-amber-900 font-serif bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                  第 {{ p.generation_num }} 世
                </span>
                <span v-if="p.generation_name" class="ml-1 text-gray-500 font-serif">
                  「{{ p.generation_name }}」
                </span>
              </td>

              <!-- 姓名與號 -->
              <td class="px-5 py-3.5">
                <div class="font-bold text-gray-900 font-serif text-sm flex items-center gap-1.5">
                  <span>{{ p.last_name }}{{ p.first_name }}</span>
                  <span v-if="p.courtesy_name" class="text-xs font-normal text-gray-500">({{ p.courtesy_name }})</span>
                </div>
                <div v-if="p.posthumous_name" class="text-[11px] text-stone-500">
                  諡號：{{ p.posthumous_name }}
                </div>
              </td>

              <!-- 性別 / 排行 -->
              <td class="px-5 py-3.5 whitespace-nowrap">
                <div class="flex items-center gap-1.5">
                  <span
                    class="w-2 h-2 rounded-full"
                    :class="p.gender === 'M' ? 'bg-amber-700' : 'bg-rose-500'"
                  ></span>
                  <span>{{ p.gender === 'M' ? '男' : '女' }}</span>
                  <span v-if="p.order_in_family" class="text-gray-400">‧ {{ p.order_in_family }}</span>
                </div>
              </td>

              <!-- 誕生 -->
              <td class="px-5 py-3.5 font-mono">
                <div v-if="p.lunar_birth_date" class="font-medium text-amber-950">
                  {{ p.lunar_birth_date }}
                  <span v-if="p.birth_time_branch" class="text-amber-800 text-[10px]">({{ p.birth_time_branch }}時)</span>
                </div>
                <div v-if="p.solar_birth_date" class="text-[11px] text-gray-400">
                  {{ p.solar_birth_date }}
                </div>
                <span v-if="!p.lunar_birth_date && !p.solar_birth_date" class="text-gray-300">-</span>
              </td>

              <!-- 仙逝 -->
              <td class="px-5 py-3.5 font-mono">
                <template v-if="p.lunar_death_date || p.solar_death_date">
                  <div v-if="p.lunar_death_date" class="font-medium text-stone-700">
                    {{ p.lunar_death_date }}
                    <span v-if="p.death_time_branch" class="text-stone-500 text-[10px]">({{ p.death_time_branch }}時)</span>
                  </div>
                  <div v-if="p.solar_death_date" class="text-[11px] text-gray-400">
                    {{ p.solar_death_date }}
                  </div>
                </template>
                <span v-else class="text-emerald-700 font-serif bg-emerald-50 px-2 py-0.5 rounded text-[11px]">
                  健在
                </span>
              </td>

              <!-- 安葬位址 -->
              <td class="px-5 py-3.5 max-w-[180px] truncate" :title="p.burial_location || ''">
                {{ p.burial_location || '-' }}
              </td>

              <!-- 操作 -->
              <td class="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5 font-serif">
                <button
                  @click="handleCreateTablet(p)"
                  class="bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300/60 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shadow-2xs"
                >
                  刻立神位
                </button>
                <button
                  @click="$emit('edit-member', p)"
                  class="bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                >
                  修訂
                </button>
                <button
                  @click="handleDelete(p)"
                  class="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all"
                >
                  除名
                </button>
              </td>
            </tr>

            <tr v-if="!filteredMembers.length">
              <td colspan="7" class="text-center py-12 text-stone-400 font-serif">
                無符合篩選條件之成員資料
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { playAncestorSelectSound } from '../utils/audio.js';

const props = defineProps({
  members: { type: Array, default: () => [] }
});

const emit = defineEmits(['open-add-member', 'edit-member', 'delete-member', 'create-tablet']);

function handleCreateTablet(p) {
  playAncestorSelectSound();
  emit('create-tablet', p);
}

const searchKeyword = ref('');
const selectedGeneration = ref('');
const selectedGender = ref('');

const availableGenerations = computed(() => {
  const gens = new Set(props.members.map(m => m.generation_num).filter(Boolean));
  return Array.from(gens).sort((a, b) => a - b);
});

const filteredMembers = computed(() => {
  return props.members.filter(m => {
    if (searchKeyword.value) {
      const kw = searchKeyword.value.trim().toLowerCase();
      const fullName = `${m.last_name}${m.first_name}`.toLowerCase();
      const courtesy = (m.courtesy_name || '').toLowerCase();
      const genName = (m.generation_name || '').toLowerCase();
      if (!fullName.includes(kw) && !courtesy.includes(kw) && !genName.includes(kw)) {
        return false;
      }
    }

    if (selectedGeneration.value && m.generation_num !== Number(selectedGeneration.value)) {
      return false;
    }

    if (selectedGender.value && m.gender !== selectedGender.value) {
      return false;
    }

    return true;
  });
});

function handleDelete(person) {
  if (confirm(`確定要刪除族人「${person.last_name}${person.first_name}」嗎？若已有子女將無法直接刪除。`)) {
    emit('delete-member', person.id);
  }
}
</script>
