<template>
  <div class="space-y-6 font-serif select-none">
    <!-- Studio Header -->
    <div class="ornate-card p-6 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
      <div>
        <div class="flex items-center gap-2">
          <span class="cinnabar-seal text-xs px-2 py-0.5">神主</span>
          <h2 class="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
            <span>祖先牌位工作室</span>
            <span class="text-xs font-sans font-normal bg-amber-100/80 text-amber-900 px-2.5 py-0.5 rounded-full border border-amber-300">
              兩生合一老 ‧ 3D 木雕排版印稿
            </span>
          </h2>
        </div>
        <p class="text-xs text-stone-600 mt-1 max-w-2xl font-sans">
          神主中行文字依天機「生、老、病、死、苦」五字吉數自動校驗，建議落在「老」（7、12、17、22 字）或「生」位。
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="printTablet"
          class="bg-[#241108] hover:bg-black text-amber-100 px-4 py-2 rounded-xl text-xs font-bold font-serif shadow-md hover:shadow-lg transition-all flex items-center gap-2 border border-amber-500/40"
        >
          <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4H7v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/></svg>
          <span>列印排版紙樣</span>
        </button>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- 左側：牌位編輯與配置面板 -->
      <div class="lg:col-span-7 space-y-5 print:hidden">
        <!-- 先人選擇或載入範本 -->
        <div class="ornate-card p-6 rounded-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b">
            <h3 class="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-800"></span>
              <span>選取先人檔案或自訂輸入</span>
            </h3>
            <span class="text-[11px] text-stone-500 font-sans">自動帶入名諱與生卒干支</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">從歷代族人清單載入</label>
              <select
                v-model="selectedMemberId"
                @change="handleSelectMember"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs bg-white focus:ring-2 focus:ring-amber-500 font-serif"
              >
                <option value="">-- 手動輸入或請選擇先人 --</option>
                <option v-for="m in members" :key="m.id" :value="m.id">
                  第 {{ m.generation_num }} 世：{{ m.last_name }}{{ m.first_name }} ({{ m.gender === 'M' ? '考/公' : '妣/孺人' }})
                </option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">堂號 / 郡望徽章</label>
              <input
                v-model="tabletData.hallName"
                type="text"
                placeholder="如 穎川堂、隴西堂"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif font-bold text-amber-900"
              />
            </div>
          </div>

          <div class="flex justify-end pt-1">
            <button
              @click="autoGenerateTemplate"
              class="bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all shadow-2xs flex items-center gap-1.5"
            >
              <span>依禮制重新生成三行標準排版</span>
            </button>
          </div>
        </div>

        <!-- 牌位三行文字修訂 -->
        <div class="ornate-card p-6 rounded-2xl space-y-4">
          <div class="flex items-center justify-between pb-2 border-b">
            <h3 class="font-bold text-sm text-gray-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-800"></span>
              <span>牌位三行文字修撰</span>
            </h3>
            <span class="text-[11px] text-stone-500 font-sans">文字更動即刻連動羅盤演算</span>
          </div>

          <!-- 中行 (神主主位) -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-900 flex items-center gap-1.5">
                <span>中行：神主主位</span>
                <span class="text-[11px] font-sans font-normal text-amber-800">(需合「老」或「生」)</span>
              </label>
              <div class="text-xs font-sans">
                共 <span class="font-bold font-mono text-amber-900 text-sm">{{ valResult.middle?.count || 0 }}</span> 字
                <span
                  class="ml-1 px-2 py-0.5 rounded text-[10px] font-bold font-serif"
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
              class="w-full px-3.5 py-2.5 border-2 border-amber-800/40 rounded-xl font-serif text-base focus:ring-2 focus:ring-amber-500 bg-amber-50/20 font-bold text-gray-950"
              placeholder="例：顯考陳公諱廷玉府君之神位"
            />
            <!-- 快速增補常用字標籤條 -->
            <div class="flex flex-wrap items-center gap-1.5 pt-1 text-[11px] text-stone-600">
              <span class="text-[10px] text-stone-400">快速插入禮制常用字：</span>
              <button
                v-for="w in ['公', '諱', '府君', '之神主', '之神位', '諡', '孺人', '門', '氏']"
                :key="w"
                @click="appendWord(w)"
                type="button"
                class="bg-white hover:bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300/80 shadow-2xs transition-all hover:scale-105"
              >
                +{{ w }}
              </button>
            </div>
          </div>

          <!-- 右行 (生卒吉時) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-900">
                右行：先人生卒吉時
              </label>
              <div class="text-xs text-stone-500 font-sans">
                共 <span class="font-bold font-mono">{{ valResult.right?.count || 0 }}</span> 字
                (合「{{ valResult.right?.fate?.name || '-' }}」)
              </div>
            </div>
            <textarea
              v-model="tabletData.rightText"
              @input="handleTextChange"
              rows="2"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-serif focus:ring-2 focus:ring-amber-500"
              placeholder="例：生於戊辰年三月二十辰時 卒於壬午年七月初四未時"
            ></textarea>
          </div>

          <!-- 左行 (陽上奉祀) -->
          <div class="space-y-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-bold text-gray-900">
                左行：陽上裔孫奉祀
              </label>
              <div class="text-xs text-stone-500 font-sans">
                共 <span class="font-bold font-mono">{{ valResult.left?.count || 0 }}</span> 字
                (合「{{ valResult.left?.fate?.name || '-' }}」)
              </div>
            </div>
            <input
              v-model="tabletData.leftText"
              @input="handleTextChange"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs font-serif focus:ring-2 focus:ring-amber-500"
              placeholder="例：陽上孝男德發 裔孫奉祀"
            />
          </div>

          <div class="pt-3 border-t flex justify-end gap-2">
            <button
              @click="saveTablet"
              class="bg-amber-900 hover:bg-amber-950 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-102 flex items-center gap-1.5"
            >
              <span>儲存神主牌位典藏檔案</span>
            </button>
          </div>
        </div>

        <!-- 歷史存檔牌位展陳匣 -->
        <div v-if="savedTablets.length" class="ornate-card p-6 rounded-2xl space-y-3">
          <h3 class="font-bold text-sm text-gray-900 border-b pb-2 flex items-center gap-2">
            <span class="cinnabar-seal text-[10px] px-1.5 py-0.2">神位匣</span>
            <span>已修編神主牌位清單 ({{ savedTablets.length }})</span>
          </h3>
          <div class="divide-y divide-amber-900/10 max-h-56 overflow-y-auto">
            <div
              v-for="tab in savedTablets"
              :key="tab.id"
              class="py-2.5 flex items-center justify-between hover:bg-amber-50/50 px-2 rounded-xl transition-colors"
            >
              <div>
                <div class="font-bold text-xs text-gray-900">{{ tab.middle_text }}</div>
                <div class="text-[10px] text-stone-500 font-sans">堂號：{{ tab.hall_name || '堂上' }} ‧ 中行 {{ tab.middle_count }} 字 (合{{ tab.middle_fate }})</div>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="loadSavedTablet(tab)"
                  class="text-[11px] text-amber-900 bg-amber-100 hover:bg-amber-200 px-2.5 py-0.5 rounded-lg font-bold transition-colors"
                >
                  載入
                </button>
                <button
                  @click="deleteTablet(tab.id)"
                  class="text-[11px] text-red-600 bg-red-50 hover:bg-red-100 px-2 py-0.5 rounded-lg transition-colors"
                >
                  刪除
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右側：3D 牌位真景渲染與五行羅盤 -->
      <div class="lg:col-span-5 flex justify-center sticky top-24">
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
import { playTabletBlessingSound, playAncestorSelectSound } from '../utils/audio.js';
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
  playTabletBlessingSound();
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
    playAncestorSelectSound();
    validate();
  } catch (err) {
    console.error('格式化先人牌位錯誤:', err);
  }
}

async function autoGenerateTemplate() {
  if (selectedMemberId.value) {
    handleSelectMember();
  } else {
    validate();
  }
}

function handleApplyAdvice(opt) {
  if (opt.targetFate === '老' || opt.targetFate === '生') {
    if (opt.delta === 1) {
      tabletData.middleText += '主';
    } else if (opt.delta === 2) {
      tabletData.middleText += '位主';
    } else if (opt.delta === -1 && tabletData.middleText.length > 3) {
      tabletData.middleText = tabletData.middleText.slice(0, -1);
    }
    playTabletBlessingSound();
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
    playTabletBlessingSound();
    alert('神主牌位排版設定已典藏儲存！');
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
  playAncestorSelectSound();
  validate();
}

async function deleteTablet(id) {
  if (confirm('確定要自神位匣中刪除此牌位紀錄嗎？')) {
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
