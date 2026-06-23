<template>
    <ElDialog width="1300px" title="【xxx】食材溯源明细表" class="dialog-container dialog-table" modal-class="dialog-overlay-custom"
        v-model="detailModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @open="onDetailOpen" @closed="onDetailClosed">
        <div class="layout-table" v-loading="tableModel.loading" element-loading-text="数据加载中">
            <div class="table-container">
                <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                    <ElTableColumn label="操作人" prop="操作人" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="操作类型" prop="操作类型" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="操作时间" prop="操作时间" min-width="160" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="库存数量" prop="库存数量" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="入库量" prop="入库量" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="出库量" prop="出库量" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                </ElTable>
            </div>
            <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
                @change="onTablePage"></IPage>
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
import { useIngredientStoreAuxStore } from '../aux_modules/store';
import { Message } from '@/global/const';

const IngredientStoreAuxStore = useIngredientStoreAuxStore();

/** 交互反馈数据 */
const detailModel = reactive({
    visible: false,
    loading: false,
    data: {}
});

/** 交互反馈数据 */
const tableModel = reactive({
    loading: false,
    vLoading: false,
    query: {
        page: 1,
        size: 20,
    },
    total: 0,
    data: [],
});

/** 请求 */
const onTableRequest = async () => {
    tableModel.loading = true;
    // const { success, data, message } = await apiUserList(tableModel.query);
    // if (success) {
    //     tableModel.data = data.list;
    //     tableModel.total = data.total;
    // } else {
    //     Message.warning(message);
    // }
    tableModel.loading = false;
};

/** 分页 */
const onTablePage = (object: { page: number, size: number; }) => {
    tableModel.query.page = object.page;
    tableModel.query.size = object.size;
    onTableRequest();
};

const onDetailOpen = () => {
    onTableRequest();
};

/** 取消 */
const onDetailClosed = () => {
    IngredientStoreAuxStore.$patch((state) => {
        state.ingredientSourceData = {};
        state.ingredientSourceVisible = false;
    });
};

/** 监听操作类型 */
watch(() => IngredientStoreAuxStore.ingredientSourceData, (data) => {
    detailModel.data = data;
}, {
    deep: true
});
watch(() => IngredientStoreAuxStore.ingredientSourceVisible, (boolean) => {
    if (boolean) {
        detailModel.visible = true;
    }
});
</script>

<style lang="scss" scoped>

</style>