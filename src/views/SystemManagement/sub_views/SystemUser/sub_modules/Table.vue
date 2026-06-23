<template>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="query-container">
            <div class="query-left">
                <ElForm ref="formRef" :model="tableModel.query">
                    <ElFormItem v-if="showOrgFilter" label="学校" prop="org_id">
                        <ICascaderDepartment
                            v-model="tableModel.query.org_id"
                            filterable
                            clearable
                            noCache
                            placeholder="学校"
                            @change="onDepartmentChange"
                        ></ICascaderDepartment>
                    </ElFormItem>
                    <ElFormItem v-if="!isCanteenGroup" label="账号类型" prop="user_type">
                        <ElSelect v-model="tableModel.query.user_type" clearable placeholder="账号类型">
                            <ElOption label="平台管理员" :value="20"></ElOption>
                            <ElOption label="食堂负责人" :value="1"></ElOption>
                        </ElSelect>
                    </ElFormItem>
                    <ElFormItem label="姓名" prop="nick">
                        <ElInput v-model="tableModel.query.nick" maxlength="10" show-word-limit clearable
                            placeholder="姓名"></ElInput>
                    </ElFormItem>
                    <ElFormItem label="联系电话" prop="phone">
                        <ElInput v-model="tableModel.query.phone" maxlength="11" show-word-limit clearable
                            placeholder="联系电话"></ElInput>
                    </ElFormItem>
                    <ElFormItem v-if="isCanteenGroup" label="角色" prop="role_id">
                        <ElSelect v-model="tableModel.query.role_id" filterable clearable placeholder="角色">
                            <ElOption v-for="item of commonModel.roleList" :key="item.role_id" :label="item.role_name"
                                :value="item.role_id"></ElOption>
                        </ElSelect>
                    </ElFormItem>
                </ElForm>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                <ElButton class="gray" @click="onTableReset">重置</ElButton>
                <ElButton type="primary" @click="onTableAdd">新增</ElButton>
            </div>
        </div>
        <!-- <div class="query-container">
            <div class="query-left">
                <p class="checked">已选中<span>{{ tableModel.selection.length }}</span>项</p>
                <ElButton :loading="tableModel.eLoading" :disabled="tableModel.selection.length === 0" @click="onTableExport">导出</ElButton>
                <ElButton @click="onTableImport">导入</ElButton>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableAdd">新增</ElButton>
            </div>
        </div> -->
        <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.data" @selection-change="onTableSelectionChange">
                <!-- <ElTableColumn fixed type="selection" align="center" width="55"></ElTableColumn> -->
                <ElTableColumn label="账号" prop="account" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="姓名" prop="nick" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="联系电话" prop="phone" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn :label="isCanteenGroup ? '角色' : '账号类型'" prop="role_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn v-if="showOrgFilter || !isCanteenGroup" label="组织名称" prop="org_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn fixed="right" label="操作" width="190" align="center">
                    <template #default="scope">
                        <div class="handle">
                            <ElButton type="primary" link @click="onTablePasswordReset(scope.row)">密码重置</ElButton>
                            <template v-if="scope.row.account !== 'admin'">
                                <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
                                <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
                            </template>
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
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import Storage from 'tddev/storage';
import { OperationTypeEnum, Message } from '@/global/const';
import { useUserAuxStore } from '../aux_modules/store';
import _utils from '@/utils/index';
import { apiSystemUserList, apiSystemUserDelete, apiRoleDict } from '@/api/admin';

const UserAuxStore = useUserAuxStore();
const route = useRoute();
const formRef = ref();
const roleGroup = String(route.meta.roleGroup || 'canteen');
const isCanteenGroup = computed(() => roleGroup === 'canteen');
const systemUserinfo: Obj = Storage.get('SystemUserinfo') ?? {};
const isPlatformUser = computed(() => systemUserinfo?.user_scope === 'platform');
const showOrgFilter = computed(() => !isCanteenGroup.value || isPlatformUser.value);
UserAuxStore.$patch((state) => {
    state.roleGroup = roleGroup;
});

const commonModel = reactive({
    roleList: [] as any
});
const pageTitle = computed(() => isCanteenGroup.value ? '人员' : '管理员');

/** 交互反馈数据 */
const tableModel = reactive({
    vLoading: false,
    eLoading: false,
    query: {
        page: 1,
        size: 20,
        nick: '',
        phone: '',
        role_id: '',
        org_id: '',
        role_group: roleGroup,
        user_type: ''
    },
    total: 0,
    data: [],
    selection: []
});
/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const query = JSON.parse(JSON.stringify(tableModel.query));
    if (query.user_type === '') {
        delete query.user_type;
    }
    const { success, data, message } = await apiSystemUserList(query);
    if (success) {
        tableModel.data = data.list;
        tableModel.total = data.total;
    } else {
        Message.warning(message);
    }
    tableModel.vLoading = false;
};
onTableRequest();

/** 角色 */
const getApiRoleList = async () => {
    if (!isCanteenGroup.value) {
        commonModel.roleList = [];
        UserAuxStore.$patch((state) => {
            state.roleList = [];
        });
        return;
    }
    const { success, data } = await apiRoleDict({
        page: 1,
        size: 99,
        role_group: roleGroup,
        org_id: tableModel.query.org_id
    });
    if (success) {
        commonModel.roleList = data.list;
        UserAuxStore.$patch((state) => {
            state.roleList = commonModel.roleList;
        });
    }
};
getApiRoleList();

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
    tableModel.query.user_type = '';
    onTableSearch();
};
/** 新增 */
const onTableAdd = () => {
    UserAuxStore.$patch((state) => {
        state.org_id = tableModel.query.org_id;
        state.OperationType = OperationTypeEnum.add;
    });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
    UserAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.update;
    });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
    ElMessageBox.alert(`确定删除${pageTitle.value} ${data.nick} 吗？`, '温馨提示', {
        confirmButtonText: '确定',
        showCancelButton: true,
        cancelButtonText: '取消',
        draggable: true,
        type: 'warning',
        customClass: 'message-box-custom',
        beforeClose: async (action, instance, done) => {
            if (action === 'confirm') {
                instance.confirmButtonLoading = true;
                const { success, message } = await apiSystemUserDelete({
                    id: data.id,
                    role_group: roleGroup,
                    org_id: tableModel.query.org_id
                });
                if (success) {
                    done();
                    onTableRequest();
                    Message.success(`${pageTitle.value} ${data.nick} 删除成功`);
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
const onTablePasswordReset = (data: Obj) => {
    UserAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.reset;
    });
}
const onTableSelectionChange = (array: any) => {
    tableModel.selection = array;
}
const onDepartmentChange = (value: string | number) => {
    tableModel.query.org_id = value;
    getApiRoleList();
};
/** 导出 */
const onTableExport = async () => {
    /** 有选择导出选择 */
    tableModel.eLoading = true;
    // const ids = tableModel.selection.map((item: Obj) => item.id);
    // const { success, data, message } = await apiXxxxxExport({
    //     admin_ids: ids
    // });
    // if (success) {
    //     const { file } = data;
    //     _utils.aTagDownload(file, '管理员管理');
    // } else {
    //     Message.warning(message);
    // }
    tableModel.eLoading = false;
}
/** 导入 */
const onTableImport = () => {
    UserAuxStore.$patch((state) => {
        state.OperationType = OperationTypeEnum.import;
    });
}

watch(() => UserAuxStore.refresh, () => {
    onTableRequest();
});
</script>

<style lang="scss" scoped></style>
