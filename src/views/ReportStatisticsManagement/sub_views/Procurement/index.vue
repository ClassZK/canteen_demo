<template>
  <div class="tabs-container fill">
    <ElTabs v-model="purchasingAuxStore.active">
      <ElTabPane v-for="value in tabList" :key="value.name" :name="value.name" :label="value.label">
        <IIngredientTable v-if="purchasingAuxStore.active === value.name"></IIngredientTable>
      </ElTabPane>
    </ElTabs>
  </div>
</template>

<script lang="ts" setup>
import { reactive } from "vue";
import { usePurchasingAuxStore } from "./aux_modules/store";
import IIngredientTable from "./sub_modules/IngredientTable.vue";
const tabList = [
  {
    name: "semester",
    label: "按学期统计",
  },
  {
    name: "day",
    label: "按日统计",
  },
  {
    name: "week",
    label: "按周统计",
  },
  {
    name: "month",
    label: "按月统计",
  },
];

const purchasingAuxStore = usePurchasingAuxStore();
</script>

<style lang="scss" scoped></style>
