<template>
    <div class="layout-container">
        <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
            <div class="query-container">
                <div class="query-left">
                    <ElForm ref="formRef" :model="tableModel.query">
                        <ElFormItem>
                            <ElButton icon="back" @click="onBack">返回</ElButton>
                        </ElFormItem>
                        <ElFormItem label="公告标题" prop="title">
                            <ElInput v-model="tableModel.query.title" maxlength="30" show-word-limit clearable
                                placeholder="公告标题"></ElInput>
                        </ElFormItem>
                    </ElForm>
                </div>
                <div class="query-right">
                    <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                    <ElButton class="gray" @click="onTableReset">重置</ElButton>
                    <!-- <ElButton type="primary" @click="onTableAdd">新增</ElButton> -->
                </div>
            </div>
            <div class="table-container">
                <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                    <ElTableColumn label="公告标题" prop="title" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn label="创建人" prop="create_name" min-width="150" align="center"
                        show-overflow-tooltip>
                    </ElTableColumn>
                    <ElTableColumn label="创建时间" prop="created_at" min-width="150" align="center"
                        show-overflow-tooltip></ElTableColumn>
                    <ElTableColumn fixed="right" label="操作" width="100" align="center">
                        <template #default="scope">
                            <div class="handle">
                                <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
                            </div>
                        </template>
                    </ElTableColumn>
                </ElTable>
            </div>
            <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
                @change="onTablePage"></IPage>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useRouter } from 'vue-router';
import { OperationTypeEnum, Message } from '@/global/const';
import { useNotificationAuxStore } from '../aux_modules/store';
import _utils from '@/utils/index';
import { apiNoticeList } from '@/api/supervision';

const Router = useRouter();
const NotificationAuxStore = useNotificationAuxStore();
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
        title: '',
    },
    total: 0,
    data: [],
});

/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const { success, data, message } = await apiNoticeList(tableModel.query);
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

/** 新增 */
const onTableAdd = () => {
    NotificationAuxStore.$patch((state) => {
        state.OperationType = OperationTypeEnum.add;
    });
};
/**详情 */
const onTableDetail = (data: Obj) => {
    NotificationAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.detail;
    });
};
const onBack = () => {
    Router.back();
};

watch(() => NotificationAuxStore.refresh, () => {
    onTableRequest();
});
</script>

<style lang="scss" scoped></style>