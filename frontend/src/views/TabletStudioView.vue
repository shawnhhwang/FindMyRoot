<template>
  <div class="space-y-6">
    <!-- Studio Header -->
    <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
      <div>
        <h2 class="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
          <span>祖先牌位工作室</span>
          <span class="text-xs font-sans font-normal bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
            兩生合一老 ‧ 直排雕刻印稿
          </span>
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          中行神主依傳統「生、老、病、死、苦」五字吉數自動校驗，建議落在「老」（7、12、17、22 字）或「生」位。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="printTablet"
          class="bg-gray-800 hover:bg-black text-white px-3.5 py-1.5 rounded-xl text-xs font-bold font-serif shadow-sm transition-all flex items-center gap-1.5"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          <span>列印排版紙樣</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 左側：牌位編輯與配置面板 -->
      <div class="lg:col-span-7 space-y-5 print:hidden">
        <!-- 先人選擇或載入已存牌位 -->
        <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-2 border-b">
            <h3 class="font-bold text-sm text-gray-800 font-serif">選擇先人或載入範本</h3>
            <span class="text-xs text-gray-500">可快速帶入名諱生卒</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">從族人清單選取</label>
              <select
                v-model="selectedMemberId"
                @change="handleSelectMember"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-amber-500 font-serif"
              >
                <option value="">-- 手動輸入或請選擇先人 --</option>
                <option v-for="m in members" :key="m.id" :value="m.id">
                  第 {{ m.generation_num }} 世：{{ m.last_name }}{{ m.first_name }} ({{ m.gender === 'M' ? '考' : '妣' }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">堂號 / 郡望</label>
              <input
                v-model="tabletData.hallName"
                type="text"
                placeholder="如 穎川堂、隴西堂"
                class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 font-serif"
              />
            </div>
          </div>

          <div class="flex justify-end">
            <button
              @click="autoGenerateTemplate"
              class="bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs px-3 py-1.5 rounded-lg font-serif font-bold transition-colors"
            >
              依禮制重新生成標準三行牌位格式
            </button>
          </div>
        </div>

        <!-- 牌位內文即時編輯 -->
        <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm space-y-4">
          <div class="flex items-center justify-between pb-2 border-b">
            <h3 class="font-bold text-sm text-gray-800 font-serif">牌位三行文字修訂</h3>
            <span class="text-xs text-gray-500">輸入即時計算字數與吉凶</span>
          </div>

          <!-- 中行 (神位核心) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-800 font-serif flex items-center gap-1.5">
                <span>中行：神主主位</span>
                <span class="text-[11px] font-sans font-normal text-amber-800">(需合「老」或「生」)</span>
              </label>
              <div class="text-xs">
                共 <span class="font-bold font-mono text-amber-900 text-sm">{{ valResult.middle?.count || 0 }}</span> 字
                <span
                  class="ml-1 px-1.5 py-0.5 rounded text-[10px] font-bold"
                  :class="valResult.middle?.fate?.isAuspicious ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'"
                >
                  合「{{ valResult.middle?.fate?.name || '-' }}」({{ valResult.middle?.fate?.isAuspicious ? '吉' : '凶' }})
                </span>
              </div>
            </div>
            <input
              v-model="tabletData.middleText"
              @input="handleTextChange"
              type="text"
              class="w-full px-3 py-2 border-2 border-amber-800/40 rounded-xl font-serif text-base focus:ring-2 focus:ring-amber-500 bg-amber-50/20"
              placeholder="例：顯考陳公諱廷玉府君之神位"
            />
            <!-- 快速增補常用字標籤 -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-gray-500">
              <span class="text-[10px]">快速插入常用字：</span>
              <button
                v-for="w in ['公', '諱', '府君', '之神主', '之神位', '諡', '孺人']"
                :key="w"
                @click="appendWord(w)"
                type="button"
                class="bg-gray-100 hover:bg-amber-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200"
              >
                +{{ w }}
              </button>
            </div>
          </div>

          <!-- 右行 (生卒吉時) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-800 font-serif">
                右行：先人生卒吉時
              </label>
              <div class="text-xs text-gray-500">
                共 <span class="font-bold font-mono">{{ valResult.right?.count || 0 }}</span> 字
                (合「{{ valResult.right?.fate?.name || '-' }}」)
              </div>
            </div>
            <textarea
              v-model="tabletData.rightText"
              @input="handleTextChange"
              rows="2"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-serif focus:ring-2 focus:ring-amber-500"
              placeholder="例：生於戊辰年三月二十辰時 卒於壬午年七月初四未時"
            ></textarea>
          </div>

          <!-- 左行 (陽上奉祀) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-800 font-serif">
                左行：陽上裔孫奉祀
              </label>
              <div class="text-xs text-gray-500">
                共 <span class="font-bold font-mono">{{ valResult.left?.count || 0 }}</span> 字
                (合「{{ valResult.left?.fate?.name || '-' }}」)
              </div>
            </div>
            <input
              v-model="tabletData.leftText"
              @input="handleTextChange"
              type="text"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-serif focus:ring-2 focus:ring-amber-500"
              placeholder="例：陽上孝男德發 裔孫奉祀"
            />
          </div>

          <div class="pt-3 border-t flex justify-end gap-2">
            <button
              @click="saveTablet"
              class="bg-amber-900 hover:bg-amber-950 text-white px-5 py-2 rounded-xl text-xs font-serif font-bold shadow-sm transition-all"
            >
              儲存此神主牌位
            </button>
          </div>
        </div>

        <!-- 歷史存檔牌位清單 -->
        <div v-if="savedTablets.length" class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm space-y-3">
          <h3 class="font-bold text-sm text-gray-800 font-serif border-b pb-2">已儲存神主牌位清單 ({{ savedTablets.length }})</h3>
          <div class="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            <div
              v-for="tab in savedTablets"
              :key="tab.id"
              class="py-2.5 flex items-center justify-between hover:bg-gray-50 px-2 rounded-lg transition-colors"
            >
              <div>
                <div class="font-bold font-serif text-xs text-gray-900">{{ tab.middle_text }}</div>
                <div class="text-[10px] text-gray-500">堂號：{{ tab.hall_name || '堂上' }} ‧ 中行 {{ tab.middle_count }} 字 (合{{ tab.middle_fate }})</div>
              </div>
              <div class="flex items-center gap-1.5">
                <button
                  @click="loadSavedTablet(tab)"
                  class="text-[11px] text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded font-serif"
                >
                  載入
                </button>
                <button
                  @click="deleteTablet(tab.id)"
                  class="text-[11px] text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：直書牌位模擬與實體列印稿預覽 -->
      <div class="lg:col-span-5 flex justify-center">
        <TabletPreview
          :hallName="tabletData.hallName"
          :middleText="tabletData.middleText"
          :rightText="tabletData.rightText"
          :leftText="tabletData.leftText"
          :middleCount="valResult.middle?.count || 0"
          :rightCount="valResult.right?.count || 0"
          :leftCount="valResult.left?.count || 0"
          :middleFate="valResult.middle?.fate"
          :rightFate="valResult.right?.fate"
          :leftFate="valResult.left?.fate"
          :middleAdvice="valResult.middle?.advice"
          @apply-advice="handleApplyAdvice"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from 'vue';
import { api } from '../services/api.js';
import TabletPreview from '../components/TabletPreview.vue';

const props = defineProps({
  members: { type: Array, default: () => [] },
  defaultMember: { type: Object, default: null }
});

const selectedMemberId = ref('');
const savedTablets = ref([]);

const tabletData = reactive({
  id: '',
  personId: '',
  hallName: '穎川堂',
  middleText: '顯考陳公諱廷玉府君之神位',
  rightText: '生於戊辰年三月二十辰時 卒於壬午年七月初四未時',
  leftText: '陽上孝男德發 裔孫奉祀'
});

const valResult = reactive({
  middle: null,
  right: null,
  left: null
});

async function validate() {
  try {
    const res = await api.validateTablet({
      middleText: tabletData.middleText,
      rightText: tabletData.rightText,
      leftText: tabletData.leftText
    });
    valResult.middle = res.data.middle;
    valResult.right = res.data.right;
    valResult.left = res.data.left;
  } catch (err) {
    console.error('驗證牌位字數錯誤:', err);
  }
}

function handleTextChange() {
  validate();
}

function appendWord(word) {
  tabletData.middleText += word;
  validate();
}

async function handleSelectMember() {
  if (!selectedMemberId.value) return;
  try {
    const res = await api.formatTablet({ personId: selectedMemberId.value });
    const d = res.data;
    tabletData.personId = selectedMemberId.value;
    tabletData.hallName = d.hallName || tabletData.hallName;
    tabletData.middleText = d.middleText;
    tabletData.rightText = d.rightText;
    tabletData.leftText = d.leftText;
    validate();
  } catch (err) {
    console.error('格式化先人牌位錯誤:', err);
  }
}

async function autoGenerateTemplate() {
  if (selectedMemberId.value) {
    handleSelectMember();
  } else {
    // 依當前字樣重新檢驗
    validate();
  }
}

function handleApplyAdvice(opt) {
  // 自動依據建議調整字詞
  if (opt.targetFate === '老' || opt.targetFate === '生') {
    if (opt.delta === 1) {
      tabletData.middleText += '主';
    } else if (opt.delta === 2) {
      tabletData.middleText += '位主';
    } else if (opt.delta === -1 && tabletData.middleText.length > 3) {
      tabletData.middleText = tabletData.middleText.slice(0, -1);
    }
    validate();
  }
}

async function saveTablet() {
  try {
    await api.saveTabletRecord({
      id: tabletData.id || undefined,
      person_id: tabletData.personId || null,
      hall_name: tabletData.hallName,
      middle_text: tabletData.middleText,
      right_text: tabletData.rightText,
      left_text: tabletData.leftText
    });
    alert('神主牌位排版設定已儲存！');
    loadSavedList();
  } catch (err) {
    alert('儲存失敗：' + err.message);
  }
}

async function loadSavedList() {
  try {
    const res = await api.getTabletRecords();
    savedTablets.value = res.data || [];
  } catch (err) {
    console.error('載入已存牌位錯誤:', err);
  }
}

function loadSavedTablet(tab) {
  tabletData.id = tab.id;
  tabletData.personId = tab.person_id;
  tabletData.hallName = tab.hall_name;
  tabletData.middleText = tab.middle_text;
  tabletData.rightText = tab.right_text;
  tabletData.leftText = tab.left_text;
  validate();
}

async function deleteTablet(id) {
  if (confirm('確定要刪除此牌位紀錄嗎？')) {
    try {
      await api.deleteTabletRecord(id);
      loadSavedList();
    } catch (err) {
      alert('刪除失敗：' + err.message);
    }
  }
}

function printTablet() {
  window.print();
}

watch(() => props.defaultMember, (m) => {
  if (m) {
    selectedMemberId.value = m.id;
    handleSelectMember();
  }
}, { immediate: true });

onMounted(() => {
  validate();
  loadSavedList();
});
</script>
