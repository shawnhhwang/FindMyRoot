<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6">
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full border border-amber-900/20 overflow-hidden flex flex-col max-h-[92vh]">
      <!-- Header -->
      <div class="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white px-6 py-4 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300">
            {{ isEdit ? '修' : '增' }}
          </div>
          <h3 class="text-lg font-bold tracking-wide font-serif">
            {{ isEdit ? '修訂族人生平檔案' : '登錄新族人世系檔案' }}
          </h3>
        </div>
        <button
          @click="close"
          class="text-amber-200/80 hover:text-white rounded-lg p-1.5 hover:bg-white/10 transition-colors"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Form Body -->
      <div class="p-6 overflow-y-auto space-y-6 flex-1 text-gray-800">
        <!-- 基本名諱與輩份 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-200">
            <span>壹、宗族名諱與行輩</span>
          </h4>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">姓氏 <span class="text-red-500">*</span></label>
              <input
                v-model="form.last_name"
                type="text"
                placeholder="如 陳"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">名字 <span class="text-red-500">*</span></label>
              <input
                v-model="form.first_name"
                type="text"
                placeholder="如 廷玉"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
                required
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">性別 <span class="text-red-500">*</span></label>
              <select
                v-model="form.gender"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                <option value="M">男 (考/公)</option>
                <option value="F">女 (妣/孺人)</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">字輩 / 派語</label>
              <input
                v-model="form.generation_name"
                type="text"
                placeholder="如 廷、德、承"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">世數 (第幾代)</label>
              <input
                v-model.number="form.generation_num"
                type="number"
                min="1"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">行次 / 排行</label>
              <input
                v-model="form.order_in_family"
                type="text"
                placeholder="如 長男、次女"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">字號 / 別名</label>
              <input
                v-model="form.courtesy_name"
                type="text"
                placeholder="如 溫如、文彬"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">諡號 (逝後名號)</label>
              <input
                v-model="form.posthumous_name"
                type="text"
                placeholder="如 純厚、端肅"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 父母與配偶親屬關係鏈結 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-200">
            <span>貳、父母世系與配偶關聯</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">生身父親</label>
              <select
                v-model="form.father_id"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                <option value="">未指定 / 開基始祖</option>
                <option
                  v-for="p in availableFathers"
                  :key="p.id"
                  :value="p.id"
                >
                  第 {{ p.generation_num }} 世：{{ p.last_name }}{{ p.first_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">生身母親</label>
              <select
                v-model="form.mother_id"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                <option value="">未指定</option>
                <option
                  v-for="p in availableMothers"
                  :key="p.id"
                  :value="p.id"
                >
                  第 {{ p.generation_num }} 世：{{ p.last_name }}{{ p.first_name }}
                </option>
              </select>
            </div>
            <div v-if="!isEdit">
              <label class="block text-xs font-semibold text-gray-700 mb-1">配偶 (可選)</label>
              <select
                v-model="form.spouse_id"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm bg-white"
              >
                <option value="">暫不綁定</option>
                <option
                  v-for="p in availableSpouses"
                  :key="p.id"
                  :value="p.id"
                >
                  第 {{ p.generation_num }} 世：{{ p.last_name }}{{ p.first_name }} ({{ p.gender === 'M' ? '男' : '女' }})
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- 生日 (國農曆換算) -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-200">
            <span>參、誕生誕辰 (支援國農曆雙向換算與時辰八字)</span>
          </h4>
          <LunarDatePicker
            v-model:solarDate="form.solar_birth_date"
            v-model:lunarDate="form.lunar_birth_date"
            v-model:isLeap="form.is_birth_leap"
            v-model:timeBranch="form.birth_time_branch"
          >
            <template #label>生辰日與時辰</template>
          </LunarDatePicker>
        </div>

        <!-- 卒日 (國農曆換算) -->
        <div>
          <div class="flex items-center justify-between mb-3 pb-1 border-b border-gray-200">
            <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
              <span>肆、仙逝吉日與安葬位址</span>
            </h4>
            <label class="inline-flex items-center gap-1.5 text-xs text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                v-model="isDeceased"
                class="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
              />
              已仙逝 / 卒
            </label>
          </div>

          <div v-if="isDeceased" class="space-y-3">
            <LunarDatePicker
              v-model:solarDate="form.solar_death_date"
              v-model:lunarDate="form.lunar_death_date"
              v-model:isLeap="form.is_death_leap"
              v-model:timeBranch="form.death_time_branch"
            >
              <template #label>忌辰日與時辰</template>
            </LunarDatePicker>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">安葬地、穴位與堪輿座向</label>
              <input
                v-model="form.burial_location"
                type="text"
                placeholder="如 觀音山龍形示範墓園 坐北朝南"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
              />
            </div>
          </div>
        </div>

        <!-- 生平簡傳與備註 -->
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-amber-900 mb-3 flex items-center gap-1.5 pb-1 border-b border-gray-200">
            <span>伍、生平行誼與事略</span>
          </h4>
          <textarea
            v-model="form.biography"
            rows="3"
            placeholder="紀錄先人求學歷程、事業官職、家族拓墾與功績貢獻..."
            class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 text-sm"
          ></textarea>
        </div>
      </div>

      <!-- Footer Buttons -->
      <div class="bg-gray-50 px-6 py-3.5 border-t border-gray-200 flex items-center justify-end gap-3">
        <button
          type="button"
          @click="close"
          class="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
        >
          取消
        </button>
        <button
          type="button"
          @click="handleSubmit"
          :disabled="isSubmitting"
          class="px-5 py-2 text-sm font-bold text-white bg-amber-900 hover:bg-amber-950 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <span v-if="isSubmitting">儲存中...</span>
          <span v-else>{{ isEdit ? '更新存檔' : '確認登錄' }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import LunarDatePicker from './LunarDatePicker.vue';

const props = defineProps({
  isOpen: { type: Boolean, default: false },
  memberData: { type: Object, default: null },
  allMembers: { type: Array, default: () => [] }
});

const emit = defineEmits(['close', 'save']);

const isEdit = computed(() => Boolean(props.memberData && props.memberData.id));
const isSubmitting = ref(false);
const isDeceased = ref(false);

const defaultForm = {
  id: '',
  last_name: '陳',
  first_name: '',
  gender: 'M',
  generation_name: '',
  generation_num: 1,
  order_in_family: '',
  courtesy_name: '',
  posthumous_name: '',
  father_id: '',
  mother_id: '',
  spouse_id: '',
  solar_birth_date: '',
  lunar_birth_date: '',
  is_birth_leap: 0,
  birth_time_branch: '',
  solar_death_date: '',
  lunar_death_date: '',
  is_death_leap: 0,
  death_time_branch: '',
  burial_location: '',
  biography: '',
  notes: ''
};

const form = ref({ ...defaultForm });

const availableFathers = computed(() => {
  return props.allMembers.filter(m => m.gender === 'M' && m.id !== form.value.id);
});

const availableMothers = computed(() => {
  return props.allMembers.filter(m => m.gender === 'F' && m.id !== form.value.id);
});

const availableSpouses = computed(() => {
  return props.allMembers.filter(m => m.id !== form.value.id);
});

watch(() => props.memberData, (data) => {
  if (data) {
    form.value = {
      ...defaultForm,
      ...data,
      father_id: data.father?.id || '',
      mother_id: data.mother?.id || ''
    };
    isDeceased.value = Boolean(data.solar_death_date || data.lunar_death_date);
  } else {
    form.value = { ...defaultForm };
    isDeceased.value = false;
  }
}, { immediate: true });

function close() {
  emit('close');
}

async function handleSubmit() {
  if (!form.value.first_name || !form.value.last_name) {
    alert('請填寫完整姓名');
    return;
  }

  if (!isDeceased.value) {
    form.value.solar_death_date = '';
    form.value.lunar_death_date = '';
    form.value.death_time_branch = '';
    form.value.burial_location = '';
  }

  isSubmitting.value = true;
  try {
    emit('save', { ...form.value });
  } finally {
    isSubmitting.value = false;
  }
}
</script>
