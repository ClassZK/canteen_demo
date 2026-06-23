<template>
    <ElDialog width="1200px" :title="tableModel.title" class="dialog-container dialog-table" modal-class="dialog-overlay-custom"
        v-model="tableModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @opened="onDetailOpened" @closed="onDetailClosed">
        <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
            <div class="query-container">
                <div class="query-left">
                    <ElForm ref="formRef" :model="tableModel.query">
                        
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="菜品名称" prop="name">
                            <ElInput v-model="tableModel.query.name" maxlength="30" show-word-limit clearable
                                placeholder="菜品名称"></ElInput>
                        </ElFormItem>
                        <ElFormItem label="菜品分类" prop="category">
                            <ElSelect v-model="tableModel.query.category" filterable clearable placeholder="菜品分类">
                                <ElOption v-for="item of DishesTypeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                    </ElForm>
                </div>
                <div class="query-right">
                    <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                    <ElButton class="gray" @click="onTableReset">重置</ElButton>
                </div>
            </div>
            <div class="table-container">
                <ElTable ref="tableRef" height="100%" scrollbar-always-on row-key="id" :data="tableModel.data" @selection-change="onTableSelectionChange" @row-click="onTableRowClick">
                    
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn fixed type="selection" reserve-selection align="center" width="55"></ElTableColumn>
                    <ElTableColumn label="菜品名称" prop="name" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="菜品分类" prop="category" min-width="150" align="center"
                        show-overflow-tooltip>
                        <template #default="scope">
                            {{ onTableDishesTypeFilter(scope.row) }}
                        </template>
                    </ElTableColumn>
                </ElTable>
            </div>
            <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
                @change="onTablePage"></IPage>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="tableModel.visible = false;">取消</ElButton>
                <ElButton type="primary" @click="onConfirm">确定</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { useRecipeWeekAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, Message, DishesTypeList, MealtimeList } from '@/global/const';
import _utils from '@/utils/index';
import { apiDishesTypeList } from '@/api/recipe';

const RecipeWeekAuxStore = useRecipeWeekAuxStore();
const formRef = ref();
const tableRef = ref();

const tableDishesProps: Obj = {
    index: 0,
    data: [],
};

/** 交互反馈数据 */
const tableModel = reactive<{
    visible: boolean,
    vLoading: boolean;
    title: string;
    query: Obj;
    total: number;
    data: Obj[];
    selection: Obj[];
}>({
    visible: false,
    vLoading: false,
    title: '',
    query: {
        page: 1,
        size: 20,
        name: '',
        category: '',
    },
    total: 0,
    data: [],
    selection: [],
});

/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const { success, data, message } = await apiDishesTypeList(tableModel.query);
    if (success) {
        tableModel.data = _utils.getDefaultArray(data.list);
        tableModel.total = data.total;
        onTableSelectionFilter();
    } else {
        Message.warning(message);
    }
    tableModel.vLoading = false;
};

/** 分页 */
const onTablePage = (object: { page: number, size: number; }) => {
    tableModel.query.page = object.page;
    tableModel.query.size = object.size;
    onTableRequest();
};
/** 查询 */
const onTableSearch = () => {
    tableModel.query.page = 1;
    onTableRequest();
};
/** 重置 */
const onTableReset = () => {
    tableModel.query.name = '';
    tableModel.query.category = '';
    formRef.value?.resetFields();
    onTableSearch();
};

const onTableSelectionChange = (array: any) => {
    tableModel.selection = array;
}

const onTableRowClick = (row: Obj) => {
    tableRef.value.toggleRowSelection(row);
};

const onTableDishesTypeFilter = (data: Obj) => {
    if (!data.category) return '';
    const list = String(data.category).split(',');
    const text = list.map((value: string|number) => {
        const object = DishesTypeList[value];
        if (object) {
            return object.name;
        }
    }).join(',');
    return text;
}

const onTableSelectionFilter = async () => {
    const len = tableDishesProps.data.length;
    if (tableDishesProps.index < len) {
        await nextTick();
        for (let i=0; i<len; i++) {
            for (const item of tableModel.data) {
                if (item.id === tableDishesProps.data[i].id) {
                    tableDishesProps.index += 1;
                    tableRef.value.toggleRowSelection(item, true);
                    break;
                }
            }
        };
    }
};

const onDetailOpened = () => {
    const { date, week, mealtime } = RecipeWeekAuxStore.weekChecked;
    if (date && mealtime) {
        tableModel.title = `${date} ${week} ${MealtimeList[mealtime]?.name}`;
        onTableSearch();

        const weekData = JSON.parse(JSON.stringify(RecipeWeekAuxStore.weekData));
        const dataDate = weekData[date];
        const mealtimes = dataDate.mealtimes;
        tableDishesProps.index = 0;
        tableDishesProps.data = mealtimes[mealtime].data;
        onTableSelectionFilter();
    }
    tableModel.vLoading = false;
};

/** 取消 */
const onDetailClosed = () => {
    formRef.value?.resetFields();
    tableModel.title = '';
    tableModel.query.page = 1;
    tableModel.query.name = '';
    tableModel.query.category = '';
    tableModel.data = [];
    RecipeWeekAuxStore.$patch((state) => {
        state.weekChecked = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

const onConfirm = () => {
    if (tableModel.selection.length === 0) {
        Message.warning('请选择菜品');
        return;
    }

    const { date, mealtime } = RecipeWeekAuxStore.weekChecked;
    const weekData = JSON.parse(JSON.stringify(RecipeWeekAuxStore.weekData));
    const dataDate = weekData[date];
    const mealtimes = dataDate.mealtimes;
    const object = mealtimes.find((item: Obj) => item.value === mealtime);
    object.data = tableModel.selection;
    RecipeWeekAuxStore.$patch((state) => {
        state.weekData = weekData;
    });
    tableModel.visible = false;
};

watch(() => RecipeWeekAuxStore.OperationType, (type) => {
    if (type === OperationTypeEnum.handle) {
        tableModel.visible = true;
        tableModel.vLoading = true;
    }
});

</script>

<style lang="scss" scoped></style>
