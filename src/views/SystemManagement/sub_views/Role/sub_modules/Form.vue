<template>
    <ElDialog width="1000px" :title="`角色${formModel.OperationTypeName}`" class="dialog-container"
        modal-class="dialog-overlay-custom" v-model="formModel.visible" draggable destroy-on-close append-to-body
        :close-on-click-modal="false" :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol>
                        <ElFormItem label="角色名称" prop="role_name">
                            <ElInput v-model="formModel.data.role_name" maxlength="30" show-word-limit clearable
                                placeholder="请输入角色名称"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <!-- <ElCol>
                        <ElFormItem label="描述" prop="remark">
                            <ElInput v-model="formModel.data.remark" type="textarea" :rows="5" resize="none"
                                maxlength="200" show-word-limit placeholder="描述"></ElInput>
                        </ElFormItem>
                    </ElCol> -->
                    <ElCol>
                        <ElFormItem label="权限" prop="rule">
                            <div class="auth-container" v-loading="authModel.loading" element-loading-text="数据加载中">
                                <div class="auth-block-list">
                                    <div v-for="item of authModel.data" :key="item.value" class="auth-block">
                                        <ElTree ref="authRefs" :data="[item]" :node-key="authModel.nodeKey"
                                            :props="authModel.props" default-expand-all :expand-on-click-node="false"
                                            show-checkbox check-on-click-node @check="onTreeCheck">
                                        </ElTree>
                                    </div>
                                </div>
                            </div>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElForm>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="formModel.visible = false;">取消</ElButton>
                <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from 'vue';
import { useRoleAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message } from '@/global/const';
import { apiRoleAdd, apiRoleUpdate, apiRoleDetail, apiRoleRule } from '@/api/admin';

const RoleAuxStore = useRoleAuxStore();
const formRef = ref();
const authRefs = ref<any[]>([]);

/** 输入数据 函数方式 */
const formInitial = () => ({
    role_name: '',
    remark: '',
    rule: '',
    org_id: RoleAuxStore.org_id || '',
    role_group: RoleAuxStore.roleGroup || 'canteen'
});
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    vLoading: false,
    loading: false,
    OperationTypeName: '',
    data: formInitial() as Obj,
    checked: {} as Obj,
    rules: {
        role_name: [
            { required: true, message: '请输入角色名称', trigger: ['change', 'blur'] }
        ],
        rule: [
            { required: true, message: '请选择权限', trigger: ['change', 'blur'] }
        ]
    }
});
/** 权限 */
const authModel = reactive({
    loading: false,
    nodeKey: 'value',
    props: {
        label: 'label',
        children: 'children'
    },
    data: [] as any[],
    checkAll: false,
    indeterminate: false,
    authAll: [],
    authChecked: [],
});

/** 详情 */
const onFormDetail = async () => {
    formModel.vLoading = true;
    const { success, data, message } = await apiRoleDetail({
        id: RoleAuxStore.data.role_id,
        role_group: RoleAuxStore.roleGroup,
        org_id: RoleAuxStore.org_id || RoleAuxStore.data.org_id
    });
    if (success) {
        formModel.data = JSON.parse(JSON.stringify(data));
        setTreeCheck();
    } else {
        Message.warning(message);
    }
    formModel.vLoading = false;
}

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            /** 判断操作类型 */
            switch (RoleAuxStore.OperationType) {
                case OperationTypeEnum.add:
                    await onFormAdd();
                    break;
                case OperationTypeEnum.update:
                    await onFormUpdate();
                    break;
                default:
                    formModel.loading = false;
                    formModel.visible = false;
                    break;
            }
        }
    });
};
/** 新增 */
const onFormAdd = async () => {
    const { success, message } = await apiRoleAdd(formModel.data);
    if (success) {
        /** 操作成功刷新页面数据 */
        RoleAuxStore.$patch((state) => {
            state.refresh = new Date().getTime();
        });
        formModel.visible = false;
    }
    onMessage(success, message);
}
/** 编辑 */
const onFormUpdate = async () => {
    const { success, message } = await apiRoleUpdate(formModel.data);
    if (success) {
        /** 操作成功刷新页面数据 */
        RoleAuxStore.$patch((state) => {
            state.refresh = new Date().getTime();
        });
        formModel.visible = false;
    }
    onMessage(success, message);
}
/** 提示 */
const onMessage = (success: boolean, message: string) => {
    const messageText = `角色 ${formModel.data.role_name} ${formModel.OperationTypeName}成功`;
    if (success) {
        Message.success(messageText);
    } else {
        Message.warning(message);
    }
    formModel.loading = false;
}
/** 取消 */
const onFormClosed = () => {
    formModel.data = formInitial();
    formRef.value?.resetFields();
    RoleAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

/** 权限 */
const getApiRoleRule = async () => {
    authModel.loading = true;
    const { success, data, message } = await apiRoleRule({
        role_group: RoleAuxStore.roleGroup
    });
    if (success) {
        /** 根据属性分类 */
        function groupBy(array: any[], category: string) {
            return array.reduce((accumulator, currentValue) => {
                const key = currentValue[category];
                const curGroup = accumulator[key] ?? [];

                return { ...accumulator, [key]: [...curGroup, currentValue] };
            }, {});
        }
        const groupByObject = groupBy(data.list, 'group');
        let tree: any[] = [];
        for (const key in groupByObject) {
            const item = groupByObject[key];
            tree.push({
                label: key,
                value: `category-${key}`,
                children: item
            });
        }
        authModel.data = tree;
        await nextTick();
        setTreeCheck();
    } else {
        Message.warning(message);
    }
    authModel.loading = false;
};
getApiRoleRule();
const onTreeCheck = (data, node) => {
    const checkedKeys = authRefs.value
        .flatMap(item => item?.getCheckedKeys?.() ?? [])
        .filter((item: string) => typeof item === 'string' && !item.startsWith('category-'));
    formModel.data.rule = checkedKeys.join(',');
};
const setTreeCheck = () => {
    const keys = formModel.data.rule ? formModel.data.rule.split(',') : [];
    authRefs.value.forEach(item => item?.setCheckedKeys(keys));
};

/** 监听操作类型 */
watch(() => RoleAuxStore.OperationType, async (type) => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type)) {
        formModel.visible = true;
        formModel.OperationTypeName = OperationTypeName[type];
        formModel.data.role_group = RoleAuxStore.roleGroup || 'canteen';
        formModel.data.org_id = RoleAuxStore.org_id || RoleAuxStore.data.org_id || '';

        if (type === OperationTypeEnum.update) {
            /** 回显数据 */
            await onFormDetail();
        }
    }
});
</script>

<style lang="scss" scoped>
.auth-container {
    width: 100%;
    max-height: 520px;
    overflow-y: auto;
}

.auth-block-list {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
}

.auth-block {
    min-height: 120px;
    padding: 12px;
    border: 1px solid var(--el-border-color-light);
    border-radius: 6px;
    background: var(--el-fill-color-blank);
}

:deep(.auth-block > .el-tree > .el-tree-node > .el-tree-node__content) {
    height: 32px;
    margin-bottom: 6px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    background: var(--el-fill-color-light);
    border-radius: 4px;
}

:deep(.auth-block .el-tree-node__children .el-tree-node__content) {
    height: 30px;
}
</style>
