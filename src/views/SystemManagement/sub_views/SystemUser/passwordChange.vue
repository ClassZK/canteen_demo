<template>
    <div class="layout-fill-container">
        <IFillHeader></IFillHeader>
        <div class="form-container">
            <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error label-width="100px">
                <ElFormItem label="原密码" prop="old_password">
                    <ElInput v-model="formModel.data.old_password" type="password" show-password
                        maxlength="30" show-word-limit clearable placeholder="请输入原密码"></ElInput>
                </ElFormItem>
                <ElFormItem label="新密码" prop="password">
                    <ElInput v-model="formModel.data.password" type="password" show-password maxlength="30"
                        show-word-limit clearable placeholder="请输入新密码"></ElInput>
                </ElFormItem>
                <ElFormItem label="确认新密码" prop="passwordChange">
                    <ElInput v-model="formModel.data.passwordChange" type="password" show-password
                        maxlength="30" show-word-limit clearable placeholder="请再次输入新密码"></ElInput>
                </ElFormItem>
            </ElForm>
        </div>
        <div class="layout-fill-button">
            <ElButton @click="onFormBack">返回</ElButton>
            <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { ref, reactive } from 'vue'
    import { useRouter } from 'vue-router';
    import Encrypt from 'tddev/encrypt';
    import { Message } from '@/global/const';
    import { validatorPassword } from '@/utils/Regexp/index';
    import { apiMyPasswordChange } from '@/api/admin'

    const Router = useRouter();
    const formRef = ref();

    /** 输入数据 函数方式 */
    const formInitial = () => ({
        old_password: '',
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
        loading: false,
        data: formInitial() as Obj,
        rules: {
            old_password: [
                { required: true, message: '请输入旧密码', trigger: ['change', 'blur'] }
            ],
            password: [
                { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
            ],
            passwordChange: [
                { required: true, validator: validatorPasswordChange, trigger: ['change', 'blur'] }
            ]
        }
    });

    const onFormConfirm = async () => {
        await formRef.value?.validate(async (valid: boolean) => {
            if (valid) {
                Message.close();
                formModel.loading = true;
                const query = {
                    old_password: Encrypt.md5(formModel.data.old_password),
                    password: Encrypt.md5(formModel.data.password)
                };
                const { success, message } = await apiMyPasswordChange(query);
                if (success) {
                    ElMessageBox.alert('密码修改成功', '温馨提示', {
                        confirmButtonText: '确定',
                        draggable: true,
                        showClose: false,
                        type: 'warning',
                        customClass: 'message-box-custom',
                    }).then(() => {
                        onFormBack();
                    }).catch(() => { });
                } else {
                    Message.warning(message);
                }
                formModel.loading = false;
            }
        });
    };

    const onFormBack = () => {
        Router.back();
    };
</script>

<style lang="scss" scoped>

</style>