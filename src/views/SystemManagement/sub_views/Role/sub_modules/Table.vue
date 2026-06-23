<template>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="query-container">
            <div class="query-left">
                <ElForm ref="formRef" :model="tableModel.query">
                    <ElFormItem v-if="isPlatformUser" label="学校" prop="org_id">
                        <ICascaderDepartment
                            v-model="tableModel.query.org_id"
                            filterable
                            clearable
                            noCache
                            placeholder="学校"
                            @change="onDepartmentChange"
                        ></ICascaderDepartment>
                    </ElFormItem>
                    <ElFormItem label="角色名称" prop="keyword">
                        <ElInput v-model="tableModel.query.keyword" maxlength="30" show-word-limit clearable placeholder="角色名称"></ElInput>
                    </ElFormItem>
                    <ElFormItem>
                        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                        <ElButton @click="onTableReset">重置</ElButton>
                    </ElFormItem>
                </ElForm>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableAdd">新增</ElButton>
            </div>
        </div>
        <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                <ElTableColumn label="角色名称" prop="role_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn v-if="isPlatformUser" label="组织名称" prop="org_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <!-- <ElTableColumn label="描述" prop="remark" min-width="200" align="center"
                    show-overflow-tooltip></ElTableColumn> -->
                <ElTableColumn fixed="right" label="操作" width="120" align="center">
                    <template #default="scope">
                        <div class="handle">
                            <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
                            <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
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
import { computed, ref, reactive, watch } from 'vue';
import { useRoute } from 'vue-router';
import Storage from 'tddev/storage';
import { useRoleAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, Message } from '@/global/const';
import _utils from '@/utils/index';
import { apiRoleList, apiRoleDelete } from '@/api/admin';

const RoleAuxStore = useRoleAuxStore();
const route = useRoute();
const formRef = ref();
const roleGroup = String(route.meta.roleGroup || 'canteen');
const systemUserinfo: Obj = Storage.get('SystemUserinfo') ?? {};
const isPlatformUser = computed(() => systemUserinfo?.user_scope === 'platform');
RoleAuxStore.$patch((state) => {
    state.roleGroup = roleGroup;
});

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
        org_id: '',
        role_group: roleGroup
    },
    total: 0,
    data: []
});
/** 请求 */
const onTableRequest = async () => {
    if (isPlatformUser.value && !tableModel.query.org_id) {
        tableModel.data = [];
        tableModel.total = 0;
        return;
    }
    tableModel.vLoading = true;
    const { success, data, message } = await apiRoleList(tableModel.query);
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
    tableModel.query.org_id = '';
    onTableSearch();
};
/** 新增 */
const onTableAdd = () => {
    if (isPlatformUser.value && !tableModel.query.org_id) {
        Message.warning('请先选择学校');
        return;
    }
    RoleAuxStore.$patch((state) => {
        state.org_id = tableModel.query.org_id;
        state.OperationType = OperationTypeEnum.add;
    });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
    RoleAuxStore.$patch((state) => {
        state.data = data;
        state.org_id = tableModel.query.org_id || data.org_id;
        state.OperationType = OperationTypeEnum.update;
    });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
    ElMessageBox.alert(`确定删除角色 ${data.role_name} 吗？`, '温馨提示', {
        confirmButtonText: '确定',
        showCancelButton: true,
        cancelButtonText: '取消',
        draggable: true,
        type: 'warning',
        customClass: 'message-box-custom',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                const { success, message } = await apiRoleDelete({
                    id: data.role_id,
                    role_group: roleGroup,
                    org_id: tableModel.query.org_id || data.org_id
                });
                if (success) {
                    done();
                    onTableRequest();
                    Message.success(`角色 ${data.role_name} 删除成功`);
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

const onDepartmentChange = (value: string | number) => {
    tableModel.query.org_id = value;
    RoleAuxStore.$patch((state) => {
        state.org_id = String(value || '');
    });
    onTableSearch();
};

watch(() => RoleAuxStore.refresh, () => {
    onTableRequest();
});
</script>

<style lang="scss" scoped></style>
