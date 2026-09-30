<template>
  <div class="min-h-screen flex flex-col bg-[#F9F7F2] font-sans antialiased text-gray-800">
    <!-- 頂部主導覽 -->
    <Navbar
      :activeTab="activeTab"
      :hallName="branchInfo.hall_name"
      @update:activeTab="handleNavigate"
      @open-add-member="openAddModal"
    />

    <!-- 主要內容區域 -->
    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <!-- 宗族總覽看板 -->
      <DashboardView
        v-if="activeTab === 'dashboard'"
        :branchInfo="branchInfo"
        :members="members"
        @navigate="handleNavigate"
        @open-add-member="openAddModal"
        @create-tablet="handleCreateTablet"
      />

      <!-- 族人世系名冊 (CRUD) -->
      <MemberListView
        v-else-if="activeTab === 'members'"
        :members="members"
        @open-add-member="openAddModal"
        @edit-member="openEditModal"
        @delete-member="handleDeleteMember"
        @create-tablet="handleCreateTablet"
      />

      <!-- 家族世系樹狀圖譜 -->
      <TreeView
        v-else-if="activeTab === 'tree'"
        ref="treeViewRef"
        @create-tablet="handleCreateTablet"
      />

      <!-- 祖先牌位工作室 (兩生合一老與列印稿) -->
      <TabletStudioView
        v-else-if="activeTab === 'tablet'"
        :members="members"
        :defaultMember="targetTabletMember"
      />

      <!-- 宗族設定與備份還原 -->
      <SettingsView
        v-else-if="activeTab === 'settings'"
        @updated-branch="loadBranchInfo"
      />
    </main>

    <!-- 族人檔案編輯/新增彈窗 -->
    <MemberModal
      :isOpen="isModalOpen"
      :memberData="editingMember"
      :allMembers="members"
      @close="isModalOpen = false"
      @save="handleSaveMember"
    />

    <!-- 頁尾 -->
    <footer class="bg-stone-900 text-stone-400 py-6 border-t border-stone-800 text-xs font-serif print:hidden mt-auto">
      <div class="max-w-7xl mx-auto px-4 text-center space-y-1">
        <p>尋根系統 (FindRoot) ‧ 祖先牌位格式整理與族譜世系數位化管理工具</p>
        <p class="text-stone-500 font-sans text-[11px]">支援農曆國曆干支八字時辰雙向換算 ‧ 遵循「兩生合一老」神主字數規範</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { api } from './services/api.js';

import Navbar from './components/Navbar.vue';
import MemberModal from './components/MemberModal.vue';

import DashboardView from './views/DashboardView.vue';
import MemberListView from './views/MemberListView.vue';
import TreeView from './views/TreeView.vue';
import TabletStudioView from './views/TabletStudioView.vue';
import SettingsView from './views/SettingsView.vue';

const activeTab = ref('dashboard');
const branchInfo = ref({});
const members = ref([]);

const isModalOpen = ref(false);
const editingMember = ref(null);
const targetTabletMember = ref(null);

const treeViewRef = ref(null);

async function loadBranchInfo() {
  try {
    const res = await api.getBranchInfo();
    branchInfo.value = res.data || {};
  } catch (err) {
    console.error('載入宗族資訊失敗:', err);
  }
}

async function loadMembers() {
  try {
    const res = await api.getMembers();
    members.value = res.data || [];
  } catch (err) {
    console.error('載入族人清單失敗:', err);
  }
}

function handleNavigate(tab) {
  activeTab.value = tab;
}

function openAddModal() {
  editingMember.value = null;
  isModalOpen.value = true;
}

async function openEditModal(person) {
  try {
    const res = await api.getMemberById(person.id);
    editingMember.value = res.data;
    isModalOpen.value = true;
  } catch (err) {
    alert('讀取成員詳情失敗：' + err.message);
  }
}

async function handleSaveMember(data) {
  try {
    if (data.id) {
      await api.updateMember(data.id, data);
      alert('族人資料更新成功！');
    } else {
      await api.createMember(data);
      alert('族人登錄成功！');
    }
    isModalOpen.value = false;
    await loadMembers();
    if (treeViewRef.value) {
      treeViewRef.value.reload();
    }
  } catch (err) {
    alert('儲存失敗：' + err.message);
  }
}

async function handleDeleteMember(id) {
  try {
    await api.deleteMember(id);
    alert('族人資料已刪除');
    await loadMembers();
    if (treeViewRef.value) {
      treeViewRef.value.reload();
    }
  } catch (err) {
    alert('刪除失敗：' + err.message);
  }
}

function handleCreateTablet(person) {
  targetTabletMember.value = person;
  activeTab.value = 'tablet';
}

onMounted(() => {
  loadBranchInfo();
  loadMembers();
});
</script>
