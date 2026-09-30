<template>
  <div class="space-y-4">
    <div class="bg-white p-5 rounded-2xl border border-amber-900/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div>
        <h2 class="text-xl font-bold font-serif text-amber-950 flex items-center gap-2">
          <span>家族世系圖譜</span>
          <span class="text-xs font-normal text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-sans">
            動態互動拓樸
          </span>
        </h2>
        <p class="text-xs text-gray-500 mt-1">
          支援滑鼠拖曳畫布平移、按鈕縮放、點擊節點下方「+/-」展開或收合世系支派。
        </p>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-xs text-gray-500">提示：點擊成員卡片可檢視生平或直接產出神主牌位</span>
      </div>
    </div>

    <!-- 世系圖畫布元件 -->
    <FamilyTree
      ref="treeComponentRef"
      @select-person="selectedPerson = $event"
      @create-tablet="$emit('create-tablet', $event)"
    />

    <!-- 成員生平詳情側邊卡片 / 彈窗 -->
    <div
      v-if="selectedPerson"
      class="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end"
      @click="selectedPerson = null"
    >
      <div
        class="bg-white w-full max-w-md h-full shadow-2xl p-6 overflow-y-auto space-y-5"
        @click.stop
      >
        <div class="flex items-center justify-between border-b pb-3">
          <div class="flex items-center gap-2">
            <span class="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded font-bold font-serif text-xs">
              第 {{ selectedPerson.generation_num }} 世
            </span>
            <h3 class="text-xl font-bold font-serif text-gray-900">
              {{ selectedPerson.last_name }}{{ selectedPerson.first_name }}
            </h3>
          </div>
          <button
            @click="selectedPerson = null"
            class="text-gray-400 hover:text-gray-700"
          >
            &times;
          </button>
        </div>

        <div class="space-y-4 text-xs text-gray-700">
          <div class="grid grid-cols-2 gap-3 bg-amber-50/50 p-3.5 rounded-xl border border-amber-200/50">
            <div>
              <span class="text-gray-400 block mb-0.5">性別 / 行次</span>
              <span class="font-bold text-gray-900">{{ selectedPerson.gender === 'M' ? '男' : '女' }} ‧ {{ selectedPerson.order_in_family || '未記載' }}</span>
            </div>
            <div>
              <span class="text-gray-400 block mb-0.5">派語字輩</span>
              <span class="font-bold text-gray-900">{{ selectedPerson.generation_name || '無' }}</span>
            </div>
            <div>
              <span class="text-gray-400 block mb-0.5">字號</span>
              <span class="font-bold text-gray-900">{{ selectedPerson.courtesy_name || '無' }}</span>
            </div>
            <div>
              <span class="text-gray-400 block mb-0.5">諡號</span>
              <span class="font-bold text-gray-900">{{ selectedPerson.posthumous_name || '無' }}</span>
            </div>
          </div>

          <!-- 生辰 -->
          <div class="border rounded-xl p-3 bg-gray-50/50">
            <div class="font-bold text-amber-950 mb-1">誕辰</div>
            <div v-if="selectedPerson.lunar_birth_date">農曆：{{ selectedPerson.lunar_birth_date }} {{ selectedPerson.birth_time_branch ? selectedPerson.birth_time_branch + '時' : '' }}</div>
            <div v-if="selectedPerson.solar_birth_date" class="text-gray-500">西元：{{ selectedPerson.solar_birth_date }}</div>
          </div>

          <!-- 忌辰 -->
          <div v-if="selectedPerson.isDeceased" class="border rounded-xl p-3 bg-stone-50">
            <div class="font-bold text-stone-900 mb-1">忌辰</div>
            <div v-if="selectedPerson.lunar_death_date">農曆：{{ selectedPerson.lunar_death_date }} {{ selectedPerson.death_time_branch ? selectedPerson.death_time_branch + '時' : '' }}</div>
            <div v-if="selectedPerson.solar_death_date" class="text-gray-500">西元：{{ selectedPerson.solar_death_date }}</div>
            <div v-if="selectedPerson.burial_location" class="mt-2 text-stone-700">
              <span class="font-semibold">穴位葬地：</span>{{ selectedPerson.burial_location }}
            </div>
          </div>

          <!-- 生平 -->
          <div v-if="selectedPerson.biography">
            <div class="font-bold text-gray-900 mb-1 font-serif">生平行誼</div>
            <p class="leading-relaxed text-gray-600 bg-gray-50 p-3 rounded-lg border">
              {{ selectedPerson.biography }}
            </p>
          </div>

          <!-- 底部捷徑按鈕 -->
          <div class="pt-4 flex gap-2">
            <button
              @click="$emit('create-tablet', selectedPerson); selectedPerson = null;"
              class="flex-1 bg-amber-900 hover:bg-amber-950 text-white py-2 rounded-xl font-bold font-serif shadow-sm transition-colors text-center"
            >
              製作此先人神主牌位
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import FamilyTree from '../components/FamilyTree.vue';

defineEmits(['create-tablet']);

const treeComponentRef = ref(null);
const selectedPerson = ref(null);

defineExpose({
  reload: () => {
    if (treeComponentRef.value) {
      treeComponentRef.value.reload();
    }
  }
});
</script>
