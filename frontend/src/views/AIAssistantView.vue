<template>
  <div class="h-[calc(100vh-140px)] min-h-[600px] flex flex-col lg:flex-row gap-5">
    <!-- 左側：常見問題 FAQ 快速查詢與知識庫分類 -->
    <div class="w-full lg:w-80 bg-white rounded-2xl border border-amber-900/10 shadow-sm p-5 flex flex-col shrink-0 overflow-hidden">
      <div class="pb-3 border-b border-gray-100 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-7 h-7 rounded-lg bg-amber-800 text-white flex items-center justify-center font-bold text-xs font-serif">
            問
          </div>
          <h3 class="font-bold font-serif text-sm text-gray-900">禮制知識庫 FAQ</h3>
        </div>
        <span class="text-[11px] text-gray-400">點擊直接提問</span>
      </div>

      <!-- FAQ 問題清單 -->
      <div class="flex-1 overflow-y-auto divide-y divide-gray-100 pr-1 mt-2 space-y-2">
        <div
          v-for="(faq, idx) in faqList"
          :key="idx"
          @click="askPresetQuestion(faq.question)"
          class="pt-2 text-left cursor-pointer group hover:bg-amber-50/50 p-2 rounded-xl transition-all"
        >
          <div class="text-[10px] font-bold uppercase text-amber-800/80 mb-0.5 font-serif">
            {{ faq.category }}
          </div>
          <div class="text-xs text-gray-700 font-medium group-hover:text-amber-950 leading-snug">
            {{ faq.question }}
          </div>
        </div>
      </div>

      <!-- 底部 AI 引擎模式狀態 -->
      <div class="pt-3 border-t border-gray-100 mt-auto text-[11px] text-gray-500 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>{{ aiConfig.hasApiKey ? '外部 LLM 連線中' : '內建專家知識庫' }}</span>
        </div>
        <button
          v-if="isAdmin"
          @click="showConfigModal = true"
          class="text-amber-900 hover:underline font-serif text-[11px]"
        >
          配置 API
        </button>
      </div>
    </div>

    <!-- 右側：AI 互動聊天視窗 -->
    <div class="flex-1 bg-white rounded-2xl border border-amber-900/10 shadow-sm flex flex-col overflow-hidden">
      <!-- 聊天頂部抬頭 -->
      <div class="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white px-6 py-3.5 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-400/40 flex items-center justify-center font-bold text-amber-300 font-serif text-sm">
            智
          </div>
          <div>
            <h3 class="font-serif font-bold text-sm tracking-wide flex items-center gap-2">
              <span>尋根系統 AI 智慧助手</span>
              <span class="text-[10px] font-sans font-normal bg-amber-600/40 text-amber-200 border border-amber-400/30 px-2 py-0.5 rounded-full">
                {{ aiConfig.model_name || '禮制專家' }}
              </span>
            </h3>
            <p class="text-[10px] text-amber-200/70 font-sans">
              精通「兩生合一老」牌位神數 ‧ 國農曆干支換算 ‧ 家族世系解答
            </p>
          </div>
        </div>

        <button
          @click="clearChat"
          class="text-xs text-amber-200 hover:text-white px-2.5 py-1 rounded-lg hover:bg-white/10 transition-colors font-serif"
        >
          清空對話
        </button>
      </div>

      <!-- 對話氣泡流容器 -->
      <div ref="chatContainerRef" class="flex-1 p-5 overflow-y-auto space-y-4 bg-amber-50/20">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['flex', msg.role === 'user' ? 'justify-end' : 'justify-start']"
        >
          <div
            :class="[
              'max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-sm font-sans',
              msg.role === 'user'
                ? 'bg-amber-900 text-white rounded-tr-none'
                : 'bg-white text-gray-800 border border-amber-900/10 rounded-tl-none font-serif'
            ]"
          >
            <!-- 角色抬頭 -->
            <div class="text-[10px] mb-1 font-sans opacity-70 flex items-center justify-between gap-4">
              <span>{{ msg.role === 'user' ? '我' : 'AI 助手' }}</span>
              <span v-if="msg.category" class="bg-amber-100 text-amber-900 px-1.5 py-0.2 rounded text-[9px] font-medium">
                {{ msg.category }}
              </span>
            </div>

            <!-- 內容本體 (支援換行與重點格式) -->
            <div class="whitespace-pre-wrap leading-relaxed text-[13px] tracking-wide" v-html="formatMessage(msg.content)"></div>

            <!-- 建議後續問題標籤 -->
            <div v-if="msg.suggestions && msg.suggestions.length" class="mt-3 pt-2.5 border-t border-gray-100 flex flex-wrap gap-1.5 font-sans">
              <span class="text-[10px] text-gray-400 self-center">推薦提問：</span>
              <button
                v-for="sug in msg.suggestions"
                :key="sug"
                @click="askPresetQuestion(sug)"
                type="button"
                class="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full text-[11px] transition-colors"
              >
                {{ sug }} &rarr;
              </button>
            </div>
          </div>
        </div>

        <div v-if="isThinking" class="flex justify-start">
          <div class="bg-white border border-gray-200 rounded-2xl rounded-tl-none p-3.5 shadow-sm text-xs text-gray-500 flex items-center gap-2 font-serif">
            <span class="w-2 h-2 rounded-full bg-amber-800 animate-ping"></span>
            <span>AI 助手正在考據禮制典籍與宗族資料庫...</span>
          </div>
        </div>
      </div>

      <!-- 快捷引導提問條 -->
      <div class="px-5 py-2 bg-amber-50/50 border-t border-amber-900/10 flex items-center gap-2 overflow-x-auto text-[11px]">
        <span class="text-gray-400 whitespace-nowrap">常見問題：</span>
        <button
          v-for="quick in ['什麼是兩生合一老？', '本宗族開基祖是誰？', '查詢宗族統計概況', '男考神主怎麼寫？', '十二時辰對照表']"
          :key="quick"
          @click="askPresetQuestion(quick)"
          class="bg-white border border-gray-200 hover:border-amber-400 text-gray-700 hover:text-amber-900 px-2.5 py-1 rounded-full whitespace-nowrap shadow-2xs transition-all"
        >
          {{ quick }}
        </button>
      </div>

      <!-- 底部輸入列 -->
      <div class="p-4 bg-white border-t border-gray-100 flex items-center gap-3">
        <input
          v-model="inputQuery"
          @keyup.enter="handleSendMessage"
          type="text"
          placeholder="請輸入任何關於祖先牌位、字數吉凶、農曆國曆換算或家族成員的提問..."
          class="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          :disabled="isThinking"
        />
        <button
          @click="handleSendMessage"
          :disabled="isThinking || !inputQuery.trim()"
          class="bg-amber-900 hover:bg-amber-950 text-white px-5 py-2.5 rounded-xl font-serif font-bold text-xs shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
        >
          <span>發送</span>
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
        </button>
      </div>
    </div>

    <!-- AI 配置彈窗 (管理員專用) -->
    <div v-if="showConfigModal" class="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl text-gray-800">
        <div class="flex items-center justify-between border-b pb-2">
          <h3 class="font-serif font-bold text-base text-gray-900">AI 服務連線配置</h3>
          <button @click="showConfigModal = false" class="text-gray-400 hover:text-gray-700">&times;</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label class="block font-semibold mb-1">AI 服務模式</label>
            <select v-model="configForm.provider" class="w-full px-3 py-1.5 border rounded-lg bg-white">
              <option value="builtin">內建專家知識庫 (免 API Key，完全離線)</option>
              <option value="openai">OpenAI 相容介面 (如 OpenAI, DeepSeek, Ollama)</option>
            </select>
          </div>

          <div v-if="configForm.provider === 'openai'" class="space-y-2.5">
            <div>
              <label class="block font-semibold mb-1">API Key</label>
              <input v-model="configForm.api_key" type="password" placeholder="sk-..." class="w-full px-3 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label class="block font-semibold mb-1">Base URL (可選，預設官方 OpenAI)</label>
              <input v-model="configForm.base_url" type="text" placeholder="如 https://api.deepseek.com/v1" class="w-full px-3 py-1.5 border rounded-lg" />
            </div>
            <div>
              <label class="block font-semibold mb-1">模型名稱 (Model Name)</label>
              <input v-model="configForm.model_name" type="text" placeholder="如 gpt-4o-mini 或 deepseek-chat" class="w-full px-3 py-1.5 border rounded-lg" />
            </div>
          </div>
        </div>

        <div class="pt-3 border-t flex justify-end gap-2 text-xs">
          <button @click="showConfigModal = false" class="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">取消</button>
          <button @click="saveAIConfig" class="px-5 py-2 bg-amber-900 text-white font-bold rounded-lg hover:bg-amber-950">儲存配置</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, nextTick } from 'vue';
import { api } from '../services/api.js';

const props = defineProps({
  currentUser: { type: Object, default: null }
});

const isAdmin = ref(false);
const chatContainerRef = ref(null);
const inputQuery = ref('');
const isThinking = ref(false);
const faqList = ref([]);
const showConfigModal = ref(false);

const aiConfig = reactive({
  provider: 'builtin',
  model_name: 'FindRoot 內建專家知識庫',
  hasApiKey: false,
  base_url: ''
});

const configForm = reactive({
  provider: 'builtin',
  api_key: '',
  base_url: '',
  model_name: 'gpt-4o-mini'
});

const messages = ref([
  {
    role: 'assistant',
    content: `您好！我是「**尋根系統 AI 智慧助手**」。

我可以為您解答：
- **祖先牌位禮制**：「兩生合一老」字數計算、男考女妣標準格式、堂號淵源。
- **國農曆與干支八字**：生卒西元與農曆雙向換算、十二時辰吉凶對照。
- **本宗族世系歷史**：開基祖是誰？目前登錄了幾代先人？查詢特定族人生平。

請隨時點選左側 FAQ 或在下方輸入問題！`,
    suggestions: ['什麼是兩生合一老？', '本宗族開基祖是誰？', '男考神主怎麼寫？', '查詢宗族統計概況']
  }
]);

async function loadFaq() {
  try {
    const res = await api.getFaqList();
    faqList.value = res.data || [];
  } catch (err) {
    console.error('載入 FAQ 失敗:', err);
  }
}

async function loadAIConfig() {
  try {
    const res = await api.getAIConfig();
    Object.assign(aiConfig, res.data);
    configForm.provider = res.data.provider;
    configForm.base_url = res.data.base_url || '';
    configForm.model_name = res.data.model_name || 'gpt-4o-mini';
  } catch (err) {
    console.error('載入 AI 設定失敗:', err);
  }
}

async function saveAIConfig() {
  try {
    await api.updateAIConfig(configForm);
    alert('AI 服務設定已更新！');
    showConfigModal.value = false;
    loadAIConfig();
  } catch (err) {
    alert('更新失敗：' + err.message);
  }
}

function askPresetQuestion(q) {
  inputQuery.value = q;
  handleSendMessage();
}

async function handleSendMessage() {
  const q = inputQuery.value.trim();
  if (!q || isThinking.value) return;

  // 加入使用者訊息
  messages.value.push({ role: 'user', content: q });
  inputQuery.value = '';
  isThinking.value = true;
  scrollToBottom();

  try {
    const res = await api.chatWithLLM({
      message: q,
      history: messages.value.slice(-6).map(m => ({ role: m.role, content: m.content }))
    });

    messages.value.push({
      role: 'assistant',
      content: res.data.reply,
      suggestions: res.data.suggestions,
      category: res.data.category
    });
  } catch (err) {
    messages.value.push({
      role: 'assistant',
      content: `抱歉，回答時發生錯誤：${err.message}`
    });
  } finally {
    isThinking.value = false;
    scrollToBottom();
  }
}

function clearChat() {
  messages.value = [
    {
      role: 'assistant',
      content: '對話紀錄已清空。請問有什麼關於牌位規範或族譜世系的問題需要解答嗎？',
      suggestions: ['什麼是兩生合一老？', '本宗族開基祖是誰？', '男考神主怎麼寫？']
    }
  ];
}

function formatMessage(text = '') {
  // 簡易 Markdown 轉換為 HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code class="bg-amber-100/60 text-amber-900 px-1 py-0.5 rounded text-[11px] font-mono">$1</code>')
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-amber-700/50 pl-3 my-1.5 italic text-gray-600 bg-amber-50/50 py-1 rounded-r">$1</blockquote>');
}

function scrollToBottom() {
  nextTick(() => {
    if (chatContainerRef.value) {
      chatContainerRef.value.scrollTop = chatContainerRef.value.scrollHeight;
    }
  });
}

onMounted(() => {
  isAdmin.value = props.currentUser?.role === 'admin';
  loadFaq();
  loadAIConfig();
});
</script>
