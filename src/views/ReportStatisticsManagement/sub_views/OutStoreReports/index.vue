<template>
    <div class="tabs-container fill">
        <ElTabs v-model="tabsModel.active">
            <ElTabPane name="按日期汇总" label="按日期汇总">
                <IDateTable></IDateTable>
            </ElTabPane>
            <ElTabPane name="按食材汇总" label="按食材汇总">
                <IIngredientTable></IIngredientTable>
            </ElTabPane>
            <ElTabPane name="按供应商汇总" label="按供应商汇总">
                <ISupplierTable></ISupplierTable>
            </ElTabPane>
        </ElTabs>
    </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue'
  import IDateTable from './sub_modules/DateTable.vue'
  import IIngredientTable from './sub_modules/IngredientTable.vue'
  import ISupplierTable from './sub_modules/SupplierTable.vue'
  
  const tabsModel = reactive({
    active: '按日期汇总'
  });
</script>

<style lang="scss" scoped>
  
</style>