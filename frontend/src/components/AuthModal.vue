<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
    <div class="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-amber-900/20 overflow-hidden text-gray-800">
      <!-- Modal Header -->
      <div class="bg-gradient-to-r from-amber-950 via-amber-900 to-amber-950 text-white p-5 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-amber-600/30 border border-amber-500/40 flex items-center justify-center font-bold text-amber-300 font-serif">
            宗
          </div>
          <div>
            <h3 class="font-serif font-bold text-base tracking-wide">
              {{ activeTab === 'login' ? '宗親會員登入' : '註冊新族人帳號' }}
            </h3>
            <p class="text-[11px] text-amber-200/70 font-sans">
              {{ activeTab === 'login' ? '登入以享有世系維護與管理員權限' : '建立專屬帳號參與家族族譜維護' }}
            </p>
          </div>
        </div>
        <button
          @click="close"
          class="text-amber-200/80 hover:text-white p-1 rounded-lg hover:bg-white/10"
        >
          &times;
        </button>
      </div>

      <!-- Tab Switcher -->
      <div class="flex border-b border-gray-100 bg-amber-50/50">
        <button
          type="button"
          @click="activeTab = 'login'"
          :class="['flex-1 py-3 text-xs font-serif font-bold transition-all text-center', activeTab === 'login' ? 'border-b-2 border-amber-900 text-amber-950 bg-white' : 'text-gray-500 hover:text-amber-900']"
        >
          登入系統
        </button>
        <button
          type="button"
          @click="activeTab = 'register'"
          :class="['flex-1 py-3 text-xs font-serif font-bold transition-all text-center', activeTab === 'register' ? 'border-b-2 border-amber-900 text-amber-950 bg-white' : 'text-gray-500 hover:text-amber-900']"
        >
          會員註冊
        </button>
      </div>

      <!-- Login Form -->
      <div v-if="activeTab === 'login'" class="p-6 space-y-4">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">使用者帳號</label>
          <input
            v-model="loginForm.username"
            type="text"
            placeholder="請輸入帳號 (如 admin 或 clan_member)"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            @keyup.enter="handleLogin"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">登入密碼</label>
          <input
            v-model="loginForm.password"
            type="password"
            placeholder="請輸入密碼"
            class="w-full px-3 py-2 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            @keyup.enter="handleLogin"
          />
        </div>

        <!-- 快速填入示範帳號 -->
        <div class="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>快速測試填入：</span>
          <div class="space-x-1">
            <button
              type="button"
              @click="quickFill('admin', 'admin123')"
              class="bg-amber-100 text-amber-900 hover:bg-amber-200 px-2 py-0.5 rounded font-medium"
            >
              管理員 (admin)
            </button>
            <button
              type="button"
              @click="quickFill('clan_member', 'user123')"
              class="bg-gray-100 text-gray-700 hover:bg-gray-200 px-2 py-0.5 rounded font-medium"
            >
              一般會員 (clan_member)
            </button>
          </div>
        </div>

        <button
          type="button"
          @click="handleLogin"
          :disabled="isSubmitting"
          class="w-full bg-amber-900 hover:bg-amber-950 text-white py-2.5 rounded-xl font-serif font-bold text-xs shadow transition-all disabled:opacity-50"
        >
          {{ isSubmitting ? '登入驗證中...' : '立即登入' }}
        </button>
      </div>

      <!-- Register Form -->
      <div v-else class="p-6 space-y-3.5">
        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">帳號名稱 <span class="text-red-500">*</span></label>
          <input
            v-model="regForm.username"
            type="text"
            placeholder="英數字組合 (至少 3 字元)"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">族人稱呼 / 姓名 <span class="text-red-500">*</span></label>
          <input
            v-model="regForm.displayName"
            type="text"
            placeholder="如 陳澤遠、三房長孫"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 font-serif"
          />
        </div>

        <div>
          <label class="block text-xs font-semibold text-gray-700 mb-1">電子信箱 (選填)</label>
          <input
            v-model="regForm.email"
            type="email"
            placeholder="如 example@domain.com"
            class="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">設定密碼 <span class="text-red-500">*</span></label>
            <input
              v-model="regForm.password"
              type="password"
              placeholder="至少 6 字元"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label class="block text-xs font-semibold text-gray-700 mb-1">確認密碼 <span class="text-red-500">*</span></label>
            <input
              v-model="regForm.confirmPassword"
              type="password"
              placeholder="再次輸入密碼"
              class="w-full px-3 py-1.5 border border-gray-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        <button
          type="button"
          @click="handleRegister"
          :disabled="isSubmitting"
          class="w-full bg-amber-900 hover:bg-amber-950 text-white py-2.5 rounded-xl font-serif font-bold text-xs shadow transition-all disabled:opacity-50 mt-2"
        >
          {{ isSubmitting ? '註冊中...' : '確認註冊' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { api, setAuthToken } from '../services/api.js';

const props = defineProps({
  isOpen: { type: Boolean, default: false }
});

const emit = defineEmits(['close', 'auth-success']);

const activeTab = ref('login');
const isSubmitting = ref(false);

const loginForm = reactive({
  username: '',
  password: ''
});

const regForm = reactive({
  username: '',
  displayName: '',
  email: '',
  password: '',
  confirmPassword: ''
});

function quickFill(u, p) {
  loginForm.username = u;
  loginForm.password = p;
}

function close() {
  emit('close');
}

async function handleLogin() {
  if (!loginForm.username || !loginForm.password) {
    alert('請填寫帳號與密碼');
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await api.login({
      username: loginForm.username,
      password: loginForm.password
    });
    setAuthToken(res.token);
    emit('auth-success', res.user);
    close();
  } catch (err) {
    alert('登入失敗：' + err.message);
  } finally {
    isSubmitting.value = false;
  }
}

async function handleRegister() {
  if (!regForm.username || !regForm.displayName || !regForm.password) {
    alert('請填寫所有必填欄位');
    return;
  }

  if (regForm.password !== regForm.confirmPassword) {
    alert('兩次輸入之密碼不一致');
    return;
  }

  isSubmitting.value = true;
  try {
    const res = await api.register({
      username: regForm.username,
      displayName: regForm.displayName,
      email: regForm.email,
      password: regForm.password
    });
    setAuthToken(res.token);
    alert('註冊成功！已自動為您登入');
    emit('auth-success', res.user);
    close();
  } catch (err) {
    alert('註冊失敗：' + err.message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>
