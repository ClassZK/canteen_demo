<template>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="query-container">
            <div class="query-left">
                <ElForm ref="formRef" :model="tableModel.query">
                    
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食谱名称" prop="recipe_name">
                        <ElInput v-model="tableModel.query.recipe_name" maxlength="10" show-word-limit clearable
                            placeholder="食谱名称"></ElInput>
                    </ElFormItem>
                </ElForm>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                <ElButton class="gray" @click="onTableReset">重置</ElButton>
            </div>
        </div>
        <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="配餐对象" prop="object_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="食谱名称" prop="recipe_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="食谱时间" prop="食谱时间" min-width="200" align="center"
                    show-overflow-tooltip>
                    <template #default="scope">
                        {{ scope.row.date_start }} 至 {{ scope.row.date_end }}
                    </template>
                </ElTableColumn>
                <ElTableColumn label="年龄范围" prop="age_range" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="创建人" prop="creator" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="创建时间" prop="create_time" min-width="160" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn fixed="right" label="操作" width="120" align="center">
                    <template #default="scope">
                        <div class="handle">
                            <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
                            <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
                        </div>
                    </template>
                </ElTableColumn>
            </ElTable>
        </div>
        <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
            @change="onTablePage"></IPage>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useCanteenRecipeAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, Message } from '@/global/const';
import _utils from '@/utils/index';
import { apiRecipeList, apiRecipeDelete } from '@/api/recipe';

const CanteenRecipeAuxStore = useCanteenRecipeAuxStore();
const formRef = ref();

/** 交互反馈数据 */
const tableModel = reactive({
    vLoading: false,
    query: {
        page: 1,
        size: 20,
        recipe_name: '',
    },
    total: 0,
    data: [],
});

/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const { success, data, message } = await apiRecipeList(tableModel.query);
    if (success) {
        tableModel.data = data.list;
        tableModel.total = data.total;
    } else {
        Message.warning(message);
    }
    tableModel.vLoading = false;
};
onTableRequest();

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
    formRef.value?.resetFields();
    onTableSearch();
};
/** 新增 */
const onTableAdd = () => {
    CanteenRecipeAuxStore.$patch((state) => {
        state.OperationType = OperationTypeEnum.add;
    });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
    CanteenRecipeAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.update;
    });
};
/** 详情 */
const onTableDetail = (data: Obj) => {
    CanteenRecipeAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.detail;
    });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
    ElMessageBox.alert(`确定删除食谱 ${data.recipe_name} 吗？`, '温馨提示', {
        confirmButtonText: '确定',
        showCancelButton: true,
        cancelButtonText: '取消',
        draggable: true,
        type: 'warning',
        customClass: 'message-box-custom',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                const { success, message } = await apiRecipeDelete({
                    id: data.id
                });
                if (success) {
                    done();
                    onTableRequest();
                    Message.success(`食谱 ${data.recipe_name} 删除成功`);
                } else {
                    Message.warning(message);
                }
                // instance.confirmButtonLoading = false;
            } else {
                done();
            }
        },
    }).then(() => { }).catch(() => { });
};

watch(() => CanteenRecipeAuxStore.refresh, () => {
    onTableRequest();
});

</script>

<style lang="scss" scoped></style>