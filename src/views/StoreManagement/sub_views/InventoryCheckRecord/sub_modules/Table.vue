<template>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="query-container">
            <div class="query-left">
                <ElForm ref="formRef" :model="tableModel.query">
                    
          <IPlatformOrgFilter></IPlatformOrgFilter><!-- <ElFormItem label="盘点人姓名" prop="keyword">
                        <ElInput v-model="tableModel.query.keyword" maxlength="10" show-word-limit clearable
                            placeholder="盘点人姓名"></ElInput>
                    </ElFormItem> -->
                </ElForm>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                <!-- <ElButton class="gray" @click="onTableReset">重置</ElButton> -->
            </div>
        </div>
        <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="盘点人" prop="user_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="联系电话" prop="user_phone" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="盘点时间" prop="created_at" min-width="160" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn fixed="right" label="操作" width="100" align="center">
                    <template #default="scope">
                        <div class="handle">
                            <ElButton type="primary" link @click="onTableDetail(scope.row)">盘点详情</ElButton>
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
import { ref, reactive } from 'vue';
import { OperationTypeEnum, Message } from '@/global/const';
import { useInventoryCheckRecordAuxStore } from '../aux_modules/store';
import _utils from '@/utils/index';
import { apiInventoryCheckUserList } from '@/api/warehouse';

const InventoryCheckRecordAuxStore = useInventoryCheckRecordAuxStore();
const formRef = ref();

/** 交互反馈数据 */
const tableModel = reactive<{
    vLoading: boolean;
    query: Obj;
    total: number;
    data: Obj[];
}>({
    vLoading: false,
    query: {
        page: 1,
        size: 20,
        keyword: '',
    },
    total: 0,
    data: [],
});

/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const { success, data, message } = await apiInventoryCheckUserList(tableModel.query);
    if (success) {
        tableModel.data = _utils.getDefaultArray(data.list);
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
const onTableDetail = (data: Obj) => {
    InventoryCheckRecordAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.detail;
    });
};

</script>

<style lang="scss" scoped></style>