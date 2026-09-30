<template>
  <div class="bg-amber-50/50 p-4 rounded-xl border border-amber-200/70 text-sm">
    <div class="flex items-center justify-between mb-3 border-b border-amber-200/50 pb-2">
      <span class="font-bold text-amber-900 flex items-center gap-1.5">
        <slot name="label">生卒日期與時辰</slot>
      </span>
      <div class="inline-flex rounded-lg bg-amber-200/50 p-0.5 text-xs">
        <button
          type="button"
          @click="activeMode = 'solar'"
          :class="['px-3 py-1 rounded-md transition-all font-medium', activeMode === 'solar' ? 'bg-amber-900 text-white shadow-sm' : 'text-amber-900 hover:text-amber-950']"
        >
          西元國曆
        </button>
        <button
          type="button"
          @click="activeMode = 'lunar'"
          :class="['px-3 py-1 rounded-md transition-all font-medium', activeMode === 'lunar' ? 'bg-amber-900 text-white shadow-sm' : 'text-amber-900 hover:text-amber-950']"
        >
          傳統農曆
        </button>
      </div>
    </div>

    <!-- 國曆輸入介面 -->
    <div v-if="activeMode === 'solar'" class="space-y-3">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">國曆日期 (年-月-日)</label>
          <input
            type="date"
            v-model="solarInputDate"
            @change="handleSolarChange"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">出生/逝世時辰</label>
          <select
            v-model="selectedHourBranch"
            @change="handleBranchChange"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white"
          >
            <option value="">未註記 / 吉時</option>
            <option v-for="b in branchHours" :key="b.branch" :value="b.branch">
              {{ b.name }} ({{ b.range }})
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- 農曆輸入介面 -->
    <div v-else class="space-y-3">
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-2">
        <div class="col-span-1">
          <label class="block text-xs font-medium text-gray-700 mb-1">西元年</label>
          <input
            type="number"
            v-model.number="lunarYear"
            @change="handleLunarChange"
            placeholder="如 1988"
            class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-center"
          />
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">農曆月</label>
          <select
            v-model.number="lunarMonth"
            @change="handleLunarChange"
            class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-center"
          >
            <option v-for="m in 12" :key="m" :value="m">{{ m }}月</option>
          </select>
        </div>
        <div>
          <label class="block text-xs font-medium text-gray-700 mb-1">農曆日</label>
          <select
            v-model.number="lunarDay"
            @change="handleLunarChange"
            class="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white text-center"
          >
            <option v-for="d in 30" :key="d" :value="d">{{ d }}日</option>
          </select>
        </div>
        <div class="col-span-3 sm:col-span-1 flex items-end pb-1.5">
          <label class="inline-flex items-center gap-1.5 cursor-pointer text-xs text-amber-900 font-medium">
            <input
              type="checkbox"
              v-model="isLeap"
              @change="handleLunarChange"
              class="w-4 h-4 text-amber-600 rounded border-gray-300 focus:ring-amber-500"
            />
            閏月
          </label>
        </div>
      </div>
      <div>
        <label class="block text-xs font-medium text-gray-700 mb-1">時辰</label>
        <select
          v-model="selectedHourBranch"
          @change="handleBranchChange"
          class="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">未註記 / 吉時</option>
          <option v-for="b in branchHours" :key="b.branch" :value="b.branch">
            {{ b.name }} ({{ b.range }})
          </option>
        </select>
      </div>
    </div>

    <!-- 換算對照預覽列 -->
    <div v-if="calculatedLunarText || solarInputDate" class="mt-3 pt-2.5 border-t border-amber-200/60 flex flex-wrap items-center justify-between gap-2 text-xs">
      <div class="text-amber-950 font-medium flex items-center gap-2">
        <span class="bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-mono text-[11px]">農曆干支</span>
        <span>{{ calculatedLunarText || '尚未換算' }}</span>
        <span v-if="selectedHourBranch" class="text-amber-700 font-semibold">{{ selectedHourBranch }}時</span>
      </div>
      <div v-if="minguoText" class="text-gray-500">
        {{ minguoText }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { Solar, Lunar } from 'lunar-javascript';

const props = defineProps({
  solarDate: { type: String, default: '' },
  lunarDate: { type: String, default: '' },
  isLeap: { type: [Boolean, Number], default: false },
  timeBranch: { type: String, default: '' }
});

const emit = defineEmits(['update:solarDate', 'update:lunarDate', 'update:isLeap', 'update:timeBranch']);

const activeMode = ref('solar');
const solarInputDate = ref(props.solarDate || '');
const lunarYear = ref(1980);
const lunarMonth = ref(1);
const lunarDay = ref(1);
const isLeap = ref(Boolean(props.isLeap));
const selectedHourBranch = ref(props.timeBranch || '');

const calculatedLunarText = ref(props.lunarDate || '');
const minguoText = ref('');

const branchHours = [
  { name: '子時', branch: '子', range: '23:00 - 01:00', hour: 0 },
  { name: '丑時', branch: '丑', range: '01:00 - 03:00', hour: 2 },
  { name: '寅時', branch: '寅', range: '03:00 - 05:00', hour: 4 },
  { name: '卯時', branch: '卯', range: '05:00 - 07:00', hour: 6 },
  { name: '辰時', branch: '辰', range: '07:00 - 09:00', hour: 8 },
  { name: '巳時', branch: '巳', range: '09:00 - 11:00', hour: 10 },
  { name: '午時', branch: '午', range: '11:00 - 13:00', hour: 12 },
  { name: '未時', branch: '未', range: '13:00 - 15:00', hour: 14 },
  { name: '申時', branch: '申', range: '15:00 - 17:00', hour: 16 },
  { name: '酉時', branch: '酉', range: '17:00 - 19:00', hour: 18 },
  { name: '戌時', branch: '戌', range: '19:00 - 21:00', hour: 20 },
  { name: '亥時', branch: '亥', range: '21:00 - 23:00', hour: 22 },
];

function handleSolarChange() {
  if (!solarInputDate.value) {
    calculatedLunarText.value = '';
    minguoText.value = '';
    emit('update:solarDate', '');
    emit('update:lunarDate', '');
    return;
  }

  try {
    const [y, m, d] = solarInputDate.value.split('-').map(Number);
    const solar = Solar.fromYmd(y, m, d);
    const lunar = solar.getLunar();

    lunarYear.value = lunar.getYear();
    lunarMonth.value = Math.abs(lunar.getMonth());
    lunarDay.value = lunar.getDay();
    isLeap.value = lunar.getMonth() < 0;

    const lunarStr = `${lunar.getYearInGanZhi()}年${lunar.getMonth() < 0 ? '閏' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    calculatedLunarText.value = lunarStr;
    minguoText.value = y > 1911 ? `民國 ${y - 1911} 年` : `清朝 / 民前 ${1912 - y} 年`;

    emit('update:solarDate', solarInputDate.value);
    emit('update:lunarDate', lunarStr);
    emit('update:isLeap', isLeap.value ? 1 : 0);
  } catch (err) {
    console.error('國曆換算錯誤:', err);
  }
}

function handleLunarChange() {
  try {
    const m = isLeap.value ? -Math.abs(lunarMonth.value) : Math.abs(lunarMonth.value);
    const lunar = Lunar.fromYmd(lunarYear.value, m, lunarDay.value);
    const solar = lunar.getSolar();

    const y = solar.getYear();
    const mm = String(solar.getMonth()).padStart(2, '0');
    const dd = String(solar.getDay()).padStart(2, '0');
    solarInputDate.value = `${y}-${mm}-${dd}`;

    const lunarStr = `${lunar.getYearInGanZhi()}年${lunar.getMonth() < 0 ? '閏' : ''}${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`;
    calculatedLunarText.value = lunarStr;
    minguoText.value = y > 1911 ? `民國 ${y - 1911} 年` : `清朝 / 民前 ${1912 - y} 年`;

    emit('update:solarDate', solarInputDate.value);
    emit('update:lunarDate', lunarStr);
    emit('update:isLeap', isLeap.value ? 1 : 0);
  } catch (err) {
    console.error('農曆換算錯誤:', err);
  }
}

function handleBranchChange() {
  emit('update:timeBranch', selectedHourBranch.value);
}

watch(() => props.solarDate, (newVal) => {
  if (newVal !== solarInputDate.value) {
    solarInputDate.value = newVal || '';
    if (newVal) handleSolarChange();
  }
});

watch(() => props.timeBranch, (newVal) => {
  selectedHourBranch.value = newVal || '';
});

onMounted(() => {
  if (solarInputDate.value) {
    handleSolarChange();
  } else if (props.lunarDate) {
    calculatedLunarText.value = props.lunarDate;
  }
});
</script>
