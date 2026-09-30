<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
          <span>宗族設定與資料備份</span>
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          管理堂號、字輩歌詩，並提供整個族譜資料庫的單鍵 JSON 備份與離線還原。
        </p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <!-- 宗族核心設定 -->
      <div class="lg:col-span-7 space-y-5">
        <div class="bg-white p-6 rounded-2xl border border-amber-900/10 shadow-sm space-y-4">
          <h3 class="font-bold text-sm text-gray-800 font-serif border-b pb-2 flex items-center gap-1.5">
            <span>宗族本堂基本資料</span>
          </h3>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">家族 / 宗族全稱</label>
              <input
                v-model="form.family_name"
                type="text"
                placeholder="如 穎川陳氏宗族"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif"
              />
            </div>

            <div>
              <label class="block text-xs font-semibold text-gray-700 mb-1">宗族堂號 / 郡望</label>
              <input
                v-model="form.hall_name"
                type="text"
                placeholder="如 穎川堂、隴西堂"
                class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif font-bold text-amber-900"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">開基始祖姓名</label>
            <input
              v-model="form.progenitor"
              type="text"
              placeholder="如 陳公廷玉"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">世代輩序詩（行輩字輩歌）</label>
            <textarea
              v-model="form.generation_poem"
              rows="2"
              placeholder="如：廷德承世澤 忠孝裕家聲 詩書光祖烈 仁義慶和平"
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif leading-relaxed"
            ></textarea>
            <p class="text-[11px] text-gray-400 mt-1">字輩歌用於族人命名時按世代依序取字，以別尊卑世系。</p>
          </div>

          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">宗族遷徙與世系源流淵源簡介</label>
            <textarea
              v-model="form.description"
              rows="3"
              placeholder="簡記宗族原籍祖籍、渡海拓墾時間、世居地與歷代家風..."
              class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 leading-relaxed"
            ></textarea>
          </div>

          <div class="pt-3 border-t flex justify-end">
            <button
              @click="saveBranchInfo"
              class="bg-amber-900 hover:bg-amber-950 text-white px-5 py-2 rounded-xl text-xs font-serif font-bold shadow-sm transition-all"
            >
              儲存宗族設定
            </button>
          </div>
        </div>

        <!-- 傳統民俗與牌位禮制文化指引 -->
        <div class="bg-amber-50/60 p-6 rounded-2xl border border-amber-200/80 text-xs text-amber-950 space-y-3 font-serif">
          <h4 class="font-bold text-sm text-amber-900 flex items-center gap-1.5 pb-1 border-b border-amber-200">
            <span>禮制民俗小錦囊：「兩生合一老」</span>
          </h4>
          <p class="leading-relaxed">
            神主牌位中行文字講究「生、老、病、死、苦」五字天機神數循環。中行最後一字宜落在「老」字位（最吉，如 7、12、17、22 字）或「生」字位（如 6、11、16、21 字），祈求祖德庇蔭、子孫昌盛，切忌落在「病」、「死」、「苦」之凶位。
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center pt-1 font-sans text-[11px]">
            <div class="bg-emerald-100 text-emerald-900 p-2 rounded-lg font-bold">1, 6, 11, 16 數<br/>生 (吉)</div>
            <div class="bg-emerald-100 text-emerald-900 p-2 rounded-lg font-bold">2, 7, 12, 17 數<br/>老 (吉)</div>
            <div class="bg-rose-100 text-rose-900 p-2 rounded-lg">3, 8, 13, 18 數<br/>病 (凶)</div>
            <div class="bg-rose-100 text-rose-900 p-2 rounded-lg">4, 9, 14, 19 數<br/>死 (凶)</div>
            <div class="bg-rose-100 text-rose-900 p-2 rounded-lg">5, 10, 15, 20 數<br/>苦 (凶)</div>
          </div>
        </div>
      </div>

      <!-- 右側：資料庫備份、還原與重設 -->
      <div class="lg:col-span-5 space-y-5">
        <div class="bg-white p-6 rounded-2xl border border-amber-900/10 shadow-sm space-y-5">
          <h3 class="font-bold text-sm text-gray-800 font-serif border-b pb-2">
            資料庫單鍵備份與匯出
          </h3>
          <p class="text-xs text-gray-500 leading-relaxed">
            系統採用單一檔案 SQLite 資料庫，您可以一鍵將全體族人世系檔案、父母親屬關係鏈與牌位排版設定打包為標準 JSON 格式檔案封存。
          </p>
          <a
            :href="exportUrl"
            download="findroot-family-backup.json"
            class="block w-full text-center bg-amber-800 hover:bg-amber-900 text-white py-2.5 rounded-xl text-xs font-serif font-bold shadow transition-colors"
          >
            下載全庫 JSON 備份檔
          </a>

          <div class="pt-4 border-t space-y-3">
            <h4 class="font-bold text-xs text-gray-800 font-serif">從 JSON 備份檔還原</h4>
            <input
              type="file"
              accept=".json"
              @change="handleFileUpload"
              class="block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100 cursor-pointer"
            />
          </div>

          <div class="pt-4 border-t space-y-3">
            <h4 class="font-bold text-xs text-stone-700 font-serif">示範資料重置</h4>
            <p class="text-[11px] text-stone-500 leading-relaxed">
              若需要重新體驗範例資料，可點擊重置回「穎川陳氏四代世系與示範牌位」。
            </p>
            <button
              @click="handleResetDemo"
              class="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 py-2 rounded-xl text-xs font-serif transition-colors"
            >
              重置為示範族譜種子資料
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue';
import { api } from '../services/api.js';

const emit = defineEmits(['updated-branch']);

const form = reactive({
  family_name: '',
  hall_name: '',
  progenitor: '',
  generation_poem: '',
  description: ''
});

const exportUrl = computed(() => api.exportBackupUrl());

async function loadBranch() {
  try {
    const res = await api.getBranchInfo();
    if (res.data) {
      Object.assign(form, res.data);
    }
  } catch (err) {
    console.error('載入宗族資料失敗:', err);
  }
}

async function saveBranchInfo() {
  try {
    await api.updateBranchInfo({ ...form });
    alert('宗族設定已儲存！');
    emit('updated-branch');
  } catch (err) {
    alert('儲存失敗：' + err.message);
  }
}

async function handleFileUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;

  if (!confirm('匯入備份將會覆寫現有族譜資料，是否確定繼續？')) {
    e.target.value = '';
    return;
  }

  try {
    const text = await file.text();
    const json = JSON.parse(text);
    await api.importBackup(json);
    alert('族譜備份已順利還原！');
    window.location.reload();
  } catch (err) {
    alert('還原失敗：' + err.message);
  }
}

async function handleResetDemo() {
  if (confirm('確定要清除現有資料並重置為示範族譜種子資料嗎？')) {
    try {
      await api.resetDemoData();
      alert('已重置為示範族譜資料！');
      window.location.reload();
    } catch (err) {
      alert('重置失敗：' + err.message);
    }
  }
}

onMounted(() => {
  loadBranch();
});
</script>
