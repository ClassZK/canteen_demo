<template>
    <ElDialog width="1000px" :title="`${formModel.title}${formModel.OperationTypeName}`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formRules" :disabled="formModel.disabled" :hide-required-asterisk="formModel.disabled" scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol v-if="isSystemGroup" :span="12">
                        <ElFormItem label="账号类型" prop="user_type">
                            <ElSelect v-model="formModel.data.user_type" :disabled="formModel.itemDisabled" placeholder="账号类型">
                                <ElOption label="食堂负责人" :value="1"></ElOption>
                                <ElOption label="平台管理员" :value="20"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                    </ElCol>
                    <ElCol v-if="showOrgField" :span="12">
                        <ElFormItem label="学校" prop="org_id">
                            <ICascaderDepartment
                                v-model="formModel.data.org_id"
                                filterable
                                clearable
                                noCache
                                placeholder="请选择学校"
                                @change="onDepartmentChange"
                            ></ICascaderDepartment>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="账号" :prop="formModel.itemDisabled? '':'account'">
                            <ElInput v-model="formModel.data.account" maxlength="20" show-word-limit clearable :disabled="formModel.itemDisabled" placeholder="请输入账号"></ElInput>
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
                    <ElCol v-if="isCanteenGroup" :span="12">
                        <ElFormItem label="角色" prop="role_ids">
                            <ElSelect v-model="formModel.data.role_ids" multiple filterable clearable placeholder="角色">
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
import { useUserAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message } from '@/global/const';
import { validatorE_N, validatorC_E_N, validatorPhone, validatorPassword } from '@/utils/Regexp/index';
import { apiSystemUserAdd, apiSystemUserUpdate, apiSystemUserDetail, apiRoleDict } from '@/api/admin';

const UserAuxStore = useUserAuxStore();
const formRef = ref();
const isCanteenGroup = computed(() => UserAuxStore.roleGroup === 'canteen');
const isSystemGroup = computed(() => UserAuxStore.roleGroup === 'sys');
const showOrgField = computed(() => isCanteenGroup.value || Number(formModel.data.user_type) !== 20);

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
        rules.org_id = [
            { required: true, message: '请选择学校', trigger: ['change', 'blur'] }
        ];
    }
    if (isCanteenGroup.value) {
        rules.role_ids = [
            { required: true, message: '请选择角色', trigger: ['change', 'blur'] }
        ];
    }
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
            { required: true, message: '请选择学校', trigger: ['change', 'blur'] }
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
    if (!isCanteenGroup.value) {
        formModel.data.role_ids = [];
        formModel.data.role_id = '';
        if (Number(formModel.data.user_type) === 20) {
            formModel.data.org_id = '';
        }
    }
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
    if (!isCanteenGroup.value) {
        formModel.data.role_ids = [];
        formModel.data.role_id = '';
        if (Number(formModel.data.user_type) === 20) {
            formModel.data.org_id = '';
        }
    }
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

const onDepartmentChange = (value: string | number) => {
    formModel.data.org_id = value;
    formModel.data.role_ids = [];
    if (isCanteenGroup.value) {
        getApiRoleList(String(value || ''));
    }
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
        UserAuxStore.$patch((state) => {
            state.roleList = commonModel.roleList;
        });
    }
};

watch(() => UserAuxStore.roleList, (array) => {
    commonModel.roleList = array;
}, {
    deep: true
});
/** 监听操作类型 */
watch(() => UserAuxStore.OperationType, async (type) => {
    formModel.disabled = UserAuxStore.OperationType === OperationTypeEnum.detail;
    formModel.itemDisabled = UserAuxStore.OperationType === OperationTypeEnum.update;
    const array = [OperationTypeEnum.add, OperationTypeEnum.update, OperationTypeEnum.detail];
    if (array.includes(type)) {
        formModel.visible = true;
        formModel.title = isCanteenGroup.value ? '人员' : '管理员';
        formModel.OperationTypeName = OperationTypeName[type];
        formModel.data.role_group = UserAuxStore.roleGroup || 'canteen';
        formModel.data.user_type = isSystemGroup.value ? 1 : 1;
        if (type === OperationTypeEnum.add) {
            formModel.data.org_id = UserAuxStore.org_id;
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
        }
    }
});
</script>

<style lang="scss" scoped></style>
