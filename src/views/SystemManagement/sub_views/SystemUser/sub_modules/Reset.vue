<template>
    <ElDialog width="800px" title="密码重置" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container">
            <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error label-width="120px">
                <ElRow>
                    <ElCol>
                        <ElFormItem label="账号">
                            <ElInput v-model="formModel.checked.account" disabled placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="姓名">
                            <ElInput v-model="formModel.checked.nick" disabled placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="新密码" prop="password">
                            <ElInput v-model="formModel.data.password" type="password" show-password maxlength="30"
                                show-word-limit clearable placeholder="请输入新密码"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="确认新密码" prop="passwordChange">
                            <ElInput v-model="formModel.data.passwordChange" type="password" show-password
                                maxlength="30" show-word-limit clearable placeholder="请再次输入新密码"></ElInput>
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
import Encrypt from 'tddev/encrypt';
import { useUserAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, Message } from '@/global/const';
import { validatorPassword } from '@/utils/Regexp/index';
import { apiSystemUserPasswordChange } from '@/api/admin';

const UserAuxStore = useUserAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
    account: '',
    password: '',
    passwordChange: ''
});
const validatorPasswordChange = (rule: any, value: string, callback: any) => {
    if (value) {
        if (value === formModel.data.password) {
            callback();
        } else {
            callback(new Error('两次密码输入不一致'));
        }
    } else {
        callback(new Error('请再次输入新密码'));
    }
};
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    loading: false,
    data: formInitial() as Obj,
    checked: {} as Obj,
    rules: {
        password: [
            { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
        ],
        passwordChange: [
            { required: true, validator: validatorPasswordChange, trigger: ['change', 'blur'] }
        ]
    }
});
/** 确定 */
const onFormConfirm = () => {
    formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            const query = {
                id: formModel.checked.id,
                password: Encrypt.md5(formModel.data.password),
                role_group: UserAuxStore.roleGroup,
                org_id: UserAuxStore.org_id
            };
            const { success, message } = await apiSystemUserPasswordChange(query);
            if (success) {
                Message.success(`管理员 ${formModel.checked.nick} 密码重置成功`);
                formModel.visible = false;
            } else {
                Message.warning(message);
            }
            formModel.loading = false;
        }
    });
};
/** 取消 */
const onFormClosed = () => {
    formRef.value?.resetFields();
    UserAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

/** 监听操作类型 */
watch(() => UserAuxStore.OperationType, (type) => {
    if (type === OperationTypeEnum.reset) {
        formModel.visible = true;
        formModel.checked = JSON.parse(JSON.stringify(UserAuxStore.data));
    }
});
</script>

<style lang="scss" scoped></style>
