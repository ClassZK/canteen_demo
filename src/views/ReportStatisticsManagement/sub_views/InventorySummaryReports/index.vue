<template>
    <div class="tabs-container fill">
        <ElTabs v-model="tabsModel.active">
            <ElTabPane name="按商品盘存汇总" label="按商品盘存汇总">
                <IIngredientTable></IIngredientTable>
            </ElTabPane>
            <ElTabPane name="按分类盘存汇总" label="按分类盘存汇总">
                <ITypeTable></ITypeTable>
            </ElTabPane>
        </ElTabs>
    </div>
</template>

<script lang="ts" setup>
  import { reactive } from 'vue'
  import IIngredientTable from './sub_modules/IngredientTable.vue'
  import ITypeTable from './sub_modules/TypeTable.vue'
  
  const tabsModel = reactive({
    active: '按商品盘存汇总'
  });
</script>

<style lang="scss" scoped>
  
</style>