<template>
    <ElDialog width="1300px" title="月采购价格预警明细详情" class="dialog-container dialog-table" modal-class="dialog-overlay-custom"
        v-model="detailModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onDetailClosed">
        <div class="tabs-container">
            <ElTabs v-model="detailModel.tabActive">
                <ElTabPane :name="1" label="本月采购明细">
                    <ICurrentMonthTable></ICurrentMonthTable>
                </ElTabPane>
                <ElTabPane :name="2" label="上月采购明细">
                    <ILastMonthTable></ILastMonthTable>
                </ElTabPane>
                <ElTabPane :name="3" label="同地区学校采购明细">
                    <ISameRegionTable></ISameRegionTable>
                </ElTabPane>
            </ElTabs>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="detailModel.visible = false;">取消</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import ICurrentMonthTable from './CurrentMonthTable.vue'
import ILastMonthTable from './LastMonthTable.vue'
import ISameRegionTable from './SameRegionTable.vue'
import { useMonthlyPurchasePriceAuxStore } from '../aux_modules/store';

const MonthlyPurchasePriceAuxStore = useMonthlyPurchasePriceAuxStore();

/** 交互反馈数据 */
const detailModel = reactive({
    visible: false,
    loading: false,
    tabActive: 1,
});

/** 取消 */
const onDetailClosed = () => {
    MonthlyPurchasePriceAuxStore.$patch((state) => {
        state.data = {};
        state.isProcurementDetail = false;
    });
};

/** 监听操作类型 */
watch(() => MonthlyPurchasePriceAuxStore.isProcurementDetail, (boolean) => {
    detailModel.visible = boolean;
});
</script>

<style lang="scss" scoped>
    .tabs-container {
        overflow: hidden;
        :deep(.el-tabs__header) {
            padding-left: 0;
            padding-right: 0;
        }
    }
</style>