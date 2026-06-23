<template>
    <ElDialog width="1000px" :title="`${formModel.title}${formModel.OperationTypeName}`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formRules" :disabled="formModel.disabled" :hide-required-asterisk="formModel.disabled" scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol v-if="showOrgField" :span="12">
                        <ElFormItem label="组织" prop="org_ids">
                            <ElSelect v-model="formModel.data.org_ids" multiple filterable clearable placeholder="请选择组织" @change="onOrgIdsChange">
                                <ElOption v-for="item of orgOptions" :key="item.org_id" :label="item.org_name" :value="item.org_id"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                    </ElCol>
                    <ElCol v-if="showOrgSummary" :span="12">
                        <ElFormItem label="绑定组织">
                            <ElInput v-model="currentOrgName" disabled placeholder="当前组织"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="账号" prop="account">
                            <ElInput v-model="formModel.data.account" maxlength="20" show-word-limit clearable placeholder="请输入账号"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <template v-if="!formModel.disabled && !formModel.itemDisabled">
                            <ElFormItem label="密码" prop="password">
                                <ElInput v-model="formModel.data.password" type="password" show-password maxlength="30" show-word-limit clearable placeholder="请输入密码"></ElInput>
                            </ElFormItem>
                        </template>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="姓名" prop="nick">
                            <ElInput v-model="formModel.data.nick" maxlength="20" show-word-limit clearable placeholder="请输入姓名"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="联系电话" prop="phone">
                            <ElInput v-model="formModel.data.phone" maxlength="11" show-word-limit clearable placeholder="请输入联系电话"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="角色" prop="role_ids">
                            <ElSelect v-model="formModel.data.role_ids" multiple filterable :disabled="!allowMultipleRoles" :clearable="allowMultipleRoles" placeholder="角色">
                                <ElOption v-for="item of commonModel.roleList" :key="item.role_id" :label="item.role_name"
                                    :value="item.role_id"></ElOption>
                            </ElSelect>
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
import { ref, reactive, watch } from 'vue';
import { computed } from 'vue';
import Encrypt from 'tddev/encrypt';
import Storage from 'tddev/storage';
import { useUserAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message } from '@/global/const';
import { validatorE_N, validatorC_E_N, validatorPhone, validatorPassword } from '@/utils/Regexp/index';
import { apiSystemUserAdd, apiSystemUserUpdate, apiSystemUserDetail, apiRoleDict } from '@/api/admin';

const UserAuxStore = useUserAuxStore();
const formRef = ref();
const systemUserinfo: Obj = Storage.get('SystemUserinfo') ?? {};
const activeRoleCode = computed(() => {
    const roleId = Storage.get('roleID') || systemUserinfo?.role_id;
    const role = Array.isArray(systemUserinfo?.roles) ? systemUserinfo.roles.find((item: Obj) => item.role_id === roleId) : null;
    return role?.role_code || role?.code || systemUserinfo?.role_code;
});
const isPlatformAdmin = computed(() => activeRoleCode.value === 'platform_admin');
const isCanteenManager = computed(() => activeRoleCode.value === 'canteen_manager');
const allowMultipleRoles = computed(() => isCanteenManager.value);
const showOrgField = computed(() => isPlatformAdmin.value);
const showOrgSummary = computed(() => !isPlatformAdmin.value);
const currentOrgName = computed(() => {
    const orgs: Obj[] = Storage.get('Orgs') ?? [];
    const orgID = Storage.get('orgID') || systemUserinfo?.org_id;
    return orgs.find(item => item.org_id === orgID)?.org_name || systemUserinfo?.org_name || '';
});
const orgOptions = computed<Obj[]>(() => {
    const orgs: Obj[] = Storage.get('Orgs') ?? [];
    if (isPlatformAdmin.value) {
        return orgs.filter(item => item.org_id && item.org_type === 'project');
    }
    return orgs.filter(item => item.org_id && item.org_type !== 'company');
});

const formRules = computed(() => {
    const rules: Obj = {
        account: [
            { required: true, validator: validatorE_N(), trigger: ['change', 'blur'] }
        ],
        password: [
            { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
        ],
        nick: [
            { required: true, validator: validatorC_E_N(), trigger: ['change', 'blur'] }
        ],
        phone: [
            { required: true, validator: validatorPhone(), trigger: ['change', 'blur'] }
        ]
    };
    if (showOrgField.value) {
        rules.org_ids = [
            { required: true, message: '请选择组织', trigger: ['change', 'blur'] }
        ];
    }
    rules.role_ids = [
        { required: true, message: '请选择角色', trigger: ['change', 'blur'] }
    ];
    return rules;
});

const commonModel = reactive({
    roleList: [] as Obj[],
});

/** 输入数据 函数方式 */
const formInitial = () => ({
    account: '',
    password: '',
    nick: '',
    phone: '',
    role_id: '',
    role_ids: [] as string[],
    org_ids: [] as string[],
    department_ids: [],
    org_id: '',
    role_group: UserAuxStore.roleGroup || 'canteen',
    user_type: 1,
});
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    loading: false,
    vLoading: false,
    disabled: false,
    itemDisabled: false,
    title: '人员',
    OperationTypeName: '',
    data: formInitial() as Obj,
    legacyRules: {
        account: [
            { required: true, validator: validatorE_N(), trigger: ['change', 'blur'] }
        ],
        password: [
            { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
        ],
        nick: [
            { required: true, validator: validatorC_E_N(), trigger: ['change', 'blur'] }
        ],
        phone: [
            { required: true, validator: validatorPhone(), trigger: ['change', 'blur'] }
        ],
        role_ids: [
            { required: true, message: '请选择角色', trigger: ['change', 'blur'] }
        ],
        org_id: [
            { required: true, message: '请选择组织', trigger: ['change', 'blur'] }
        ]
    }
});

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            /** 判断操作类型 */
            switch(UserAuxStore.OperationType) {
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
    normalizeSubmitData();
    const object = {...formModel.data, ...{
        password: Encrypt.md5(formModel.data.password),
        role_group: UserAuxStore.roleGroup
    }};
    const { success, message } = await apiSystemUserAdd(object);
    if (success) {
        /** 操作成功刷新页面数据 */
        UserAuxStore.$patch((state) => {
            state.refresh = new Date().getTime();
        });
        formModel.visible = false;
    }
    onMessage(success, message);
}
/** 编辑 */
const onFormUpdate = async () => {
    normalizeSubmitData();
    const { success, message } = await apiSystemUserUpdate({
        ...formModel.data,
        role_group: UserAuxStore.roleGroup
    });
    if (success) {
        /** 操作成功刷新页面数据 */
        UserAuxStore.$patch((state) => {
            state.refresh = new Date().getTime();
        });
        formModel.visible = false;
    }
    onMessage(success, message);
}
/** 提示 */
const onMessage = (success: boolean, message: string) => {
    const messageText = `${formModel.title} ${formModel.data.nick} ${formModel.OperationTypeName}成功`;
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
    UserAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

const onOrgIdsChange = (value: string[]) => {
    formModel.data.org_ids = Array.isArray(value) ? value : [];
    formModel.data.org_id = formModel.data.org_ids[0] || '';
};

const getApiRoleList = async (orgId: string) => {
    const { success, data } = await apiRoleDict({
        page: 1,
        size: 99,
        role_group: UserAuxStore.roleGroup,
        org_id: orgId
    });
    if (success) {
        commonModel.roleList = data.list;
        if (formModel.data.role_ids.length === 0 && data.list.length > 0) {
            formModel.data.role_ids = allowMultipleRoles.value ? [] : [data.list[0].role_id];
        }
        UserAuxStore.$patch((state) => {
            state.roleList = commonModel.roleList;
        });
    }
};

const normalizeSubmitData = () => {
    if (!Array.isArray(formModel.data.role_ids)) {
        formModel.data.role_ids = formModel.data.role_ids ? [formModel.data.role_ids] : [];
    }
    if (!allowMultipleRoles.value && formModel.data.role_ids.length > 1) {
        formModel.data.role_ids = formModel.data.role_ids.slice(0, 1);
    }
    const orgIds = isPlatformAdmin.value
        ? formModel.data.org_ids
        : [Storage.get('orgID') || systemUserinfo?.org_id || ''].filter(Boolean);
    formModel.data.org_ids = orgIds;
    formModel.data.org_id = orgIds[0] || '';
    formModel.data.role_id = formModel.data.role_ids[0] || '';
};

watch(() => UserAuxStore.roleList, (array) => {
    commonModel.roleList = array;
}, {
    deep: true
});
/** 监听操作类型 */
watch(() => UserAuxStore.OperationType, async (type) => {
    formModel.disabled = UserAuxStore.OperationType === OperationTypeEnum.detail;
    formModel.itemDisabled = false;
    const array = [OperationTypeEnum.add, OperationTypeEnum.update, OperationTypeEnum.detail];
    if (array.includes(type)) {
        formModel.visible = true;
        formModel.title = '人员';
        formModel.OperationTypeName = OperationTypeName[type];
        formModel.data.role_group = UserAuxStore.roleGroup || 'canteen';
        if (type === OperationTypeEnum.add) {
            formModel.data.org_ids = isPlatformAdmin.value
                ? (UserAuxStore.org_id ? [UserAuxStore.org_id] : [])
                : [Storage.get('orgID') || systemUserinfo?.org_id || ''].filter(Boolean);
            formModel.data.org_id = formModel.data.org_ids[0] || '';
            await getApiRoleList(String(formModel.data.org_id || ''));
        }

        if (type === OperationTypeEnum.update) {
            /** 回显数据 */
            const object = JSON.parse(JSON.stringify(UserAuxStore.data));
            object.department_ids = [];
            const { success, data } = await apiSystemUserDetail({
                id: object.id,
                role_group: UserAuxStore.roleGroup
            });
            formModel.data = success ? { ...object, ...data } : object;
            formModel.data.user_type = formModel.data.user_type || 1;
            formModel.data.role_ids = Array.isArray(formModel.data.role_ids)
                ? formModel.data.role_ids
                : String(formModel.data.role_id || '').split(',').filter(Boolean);
            formModel.data.org_ids = Array.isArray(formModel.data.org_ids)
                ? formModel.data.org_ids
                : String(formModel.data.org_id || '').split(',').filter(Boolean);
            await getApiRoleList(String(formModel.data.org_id || ''));
        }
    }
});
</script>

<style lang="scss" scoped></style>
