<template>
  <div class="space-y-5">
    <!-- Header & Filtering -->
    <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 class="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
          <span>宗族世系名冊</span>
          <span class="text-xs font-sans font-normal bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            共 {{ filteredMembers.length }} 位
          </span>
        </h2>
        <p class="text-xs text-gray-500 mt-1">完整登錄族人名諱、字輩、生卒年月日時辰與安葬穴位。</p>
      </div>

      <!-- 搜尋與篩選條件 -->
      <div class="flex flex-wrap items-center gap-2.5">
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜尋姓名或字輩..."
          class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 w-36 sm:w-48 bg-gray-50/50"
        />

        <select
          v-model="selectedGeneration"
          class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">全部世代</option>
          <option v-for="g in availableGenerations" :key="g" :value="g">
            第 {{ g }} 世
          </option>
        </select>

        <select
          v-model="selectedGender"
          class="px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">全部性別</option>
          <option value="M">男 (考/嗣)</option>
          <option value="F">女 (妣/孺人)</option>
        </select>

        <button
          @click="$emit('open-add-member')"
          class="bg-amber-900 hover:bg-amber-950 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold font-serif flex items-center gap-1 shadow-sm transition-all"
        >
          <span>+ 登錄新族人</span>
        </button>
      </div>
    </div>

    <!-- 成員名冊表格 -->
    <div class="bg-white rounded-2xl border border-amber-900/10 shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs text-gray-700">
          <thead class="bg-amber-950/5 font-serif text-amber-950 uppercase border-b border-amber-900/10">
            <tr>
              <th scope="col" class="px-5 py-3.5">世代 / 字輩</th>
              <th scope="col" class="px-5 py-3.5">姓名 / 別號</th>
              <th scope="col" class="px-5 py-3.5">性別 / 排行</th>
              <th scope="col" class="px-5 py-3.5">誕辰 (農曆 / 國曆)</th>
              <th scope="col" class="px-5 py-3.5">忌辰 (農曆 / 國曆)</th>
              <th scope="col" class="px-5 py-3.5">安葬位址</th>
              <th scope="col" class="px-5 py-3.5 text-right">操作管理</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
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
              <td class="px-5 py-3.5 text-right whitespace-nowrap space-x-1.5">
                <button
                  @click="$emit('create-tablet', p)"
                  class="text-amber-900 hover:bg-amber-100 px-2 py-1 rounded font-serif text-[11px] font-medium transition-colors"
                >
                  牌位
                </button>
                <button
                  @click="$emit('edit-member', p)"
                  class="text-blue-700 hover:bg-blue-50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                >
                  修訂
                </button>
                <button
                  @click="handleDelete(p)"
                  class="text-red-600 hover:bg-red-50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                >
                  刪除
                </button>
              </td>
            </tr>

            <tr v-if="!filteredMembers.length">
              <td colspan="7" class="text-center py-12 text-gray-400 font-serif">
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

const props = defineProps({
  members: { type: Array, default: () => [] }
});

const emit = defineEmits(['open-add-member', 'edit-member', 'delete-member', 'create-tablet']);

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
