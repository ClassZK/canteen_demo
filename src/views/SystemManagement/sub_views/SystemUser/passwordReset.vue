<template>
    <div class="layout-fill-container">
        <IFillHeader></IFillHeader>
        <div class="form-title">重置密码</div>
        <ElSteps :active="formModel.type" align-center>
            <ElStep title="账号验证"></ElStep>
            <ElStep title="重置密码"></ElStep>
        </ElSteps>
        <div class="form-container">
            <template v-if="formModel.type === ForgetEnum.phone">
                <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error>
                    <ElFormItem prop="mobile">
                        <ElCol>
                            <ElInput v-model="formModel.data.mobile" maxlength="11" clearable placeholder="请输入联系电话"></ElInput>
                        </ElCol>
                    </ElFormItem>
                    <ElFormItem prop="code" class="captcha">
                        <ElCol>
                            <ElInput
                                v-model="formModel.data.code"
                                maxlength="6"
                                clearable
                                placeholder="请输入图形验证码">
                            </ElInput>
                            <ElButton @click="onGetCaptcha">
                                <ElImage :src="formModel.base64">
                                    <template #placeholder>获取中</template>
                                    <template #error>获取失败</template>
                                </ElImage>
                            </ElButton>
                        </ElCol>
                    </ElFormItem>
                    <ElFormItem prop="smsCode" class="captcha">
                        <ElCol>
                            <ElInput v-model="formModel.data.smsCode" maxlength="6" clearable placeholder="请输入短信验证码"></ElInput>
                            <ElButton type="primary" :loading="smsModel.loading" :disabled="smsModel.disabled" @click="onGetSmsCode">{{ (smsModel.count > 0) ? smsModel.text:'获取验证码' }}</ElButton>
                        </ElCol>
                    </ElFormItem>
                </ElForm>
            </template>
            <template v-else-if="formModel.type === ForgetEnum.password">
                <ElForm ref="formRef2" :model="formModel2.data" :rules="formModel2.rules" scroll-to-error>
                    <ElFormItem prop="newPassword">
                        <ElCol>
                            <ElInput v-model="formModel2.data.newPassword" type="password" show-password maxlength="30" clearable placeholder="请输入新密码"></ElInput>
                        </ElCol>
                    </ElFormItem>
                    <ElFormItem prop="newPasswordCopy">
                        <ElCol>
                            <ElInput v-model="formModel2.data.newPasswordCopy" type="password" show-password maxlength="30" clearable placeholder="请再次输入新密码"></ElInput>
                        </ElCol>
                    </ElFormItem>
                </ElForm>
            </template>
            <div class="form-button">
                <ElButton type="primary" plain class="back" @click="onFormCancel">返回</ElButton>
                <template v-if="formModel.type === ForgetEnum.phone">
                    <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">下一步</ElButton>
                </template>
                <template v-else-if="formModel.type === ForgetEnum.password">
                    <ElButton type="primary" :loading="formModel2.loading" @click="onFormConfirm2">确定</ElButton>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
    import { reactive, ref, onBeforeUnmount } from 'vue'
    import { useRouter } from 'vue-router';
    import Encrypt from 'tddev/encrypt';
    import { Message } from '@/global/const';
    import { validatorPhone, validatorCaptcha, validatorPassword } from '@/utils/Regexp/index';
    import { apiCaptchaImage } from '@/api/admin'

    enum ForgetEnum {
        phone = 1, // 验证码
        password = 2, // 密码
    }

    const Router = useRouter();
    const formRef = ref();
    const formRef2 = ref();

    const validatorPasswordChange = (rule: any, value: string, callback: any) => {
        if (value) {
            if (value === formModel2.data.newPassword) {
                callback();
            } else {
                callback(new Error('两次密码输入不一致'));
            }
        } else {
            callback(new Error('请再次输入新密码'));
        }
    };

    /** 输入数据 函数方式 */
    const formInitial = () => ({
        mobile: '',
        codeUuid: '',
        code: '',
        smsCodeUuid: '',
        smsCode: '',
    });
    const formModel = reactive({
        loading: false,
        base64: '',
        expire: 0,
        type: ForgetEnum.phone,
        data: formInitial() as Obj,
        rules: {
            mobile: [
                { required: true, validator: validatorPhone(), trigger: ['change', 'blur'] }
            ],
            code: [
                { required: true, validator: validatorCaptcha('图形验证码'), trigger: ['change', 'blur'] }
            ],
            smsCode: [
                { required: true, validator: validatorCaptcha('短信验证码'), trigger: ['change', 'blur'] }
            ]
        }
    });
    /** 输入数据 函数方式 */
    const formInitial2 = () => ({
        jwt: '',
        newPassword: '',
        newPasswordCopy: ''
    });
    const formModel2 = reactive({
        loading: false,
        data: formInitial2() as Obj,
        rules: {
            newPassword: [
                { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
            ],
            newPasswordCopy: [
                { required: true, validator: validatorPasswordChange, trigger: ['change', 'blur'] }
            ]
        }
    });
    const smsModel = reactive({
        timer: null as any,
        limit: 60,
        count: 0,
        text: '',
        loading: false,
        disabled: false
    });

    /** 获取图形验证码 */
    const onGetCaptcha = async () => {
        const { success, data } = await apiCaptchaImage();
        if (success) {
            formModel.base64 = `data:image/jpeg;base64,${data.base64cAP}`;
            formModel.expire = Number(`${data.expireAt}000`);
            formModel.data.codeUuid = data.uuid;
        } else {
            Message.warning('图形验证码获取失败');
        }
    }
    onGetCaptcha();

    /** 验证码计时器 */
    const onInitSmsTimer = () => {
        smsModel.disabled = true;
        smsModel.count = smsModel.limit;
        smsModel.text = smsModel.count + 's';
        smsModel.timer = setInterval(() => {
            smsModel.count--;
            smsModel.text = smsModel.count + 's';
            if (smsModel.count === 0) {
                onResetSmsTimer();
            }
        }, 1000);
    };
    /** 重置验证码计时器 */
    const onResetSmsTimer = () => {
        smsModel.disabled = false;
        smsModel.count = 0;
        smsModel.text = '';
        if (smsModel.timer) {
            clearInterval(smsModel.timer);
        }
    };
    /** 获取短信验证码 */
    const onGetSmsCode = async () => {
        const current = new Date().getTime();
        if (current > formModel.expire) {
            Message.warning('图形验证码失效，请重新输入');
            onGetCaptcha();
            return false;
        }
        const mobileValid = await formRef.value?.validateField('mobile');
        const codeValid = await formRef.value?.validateField('code');
        if (mobileValid && codeValid) {
            smsModel.loading = true;
            const query = {
                mobile: formModel.data.mobile,
                timestamp: current,
                uuid: formModel.data.codeUuid,
                code: formModel.data.code
            };
            // const { success, data, message } = await apiSmsSend(query);
            // if (success) {
            //     formModel.data.smsCodeUuid = data.uuid;
            //     onInitSmsTimer();
            //     Message.success('短信验证码已发送');
            // } else {
            //     onGetCaptcha();
            //     Message.warning(message);
            // }
            smsModel.loading = false;
        }
    }

    const onFormConfirm = () => {
        formRef.value?.validate(async (valid: boolean) => {
            if (valid) {
                formModel.loading = true;
                const query = {
                    mobile: formModel.data.mobile,
                    uuid: formModel.data.smsCodeUuid,
                    code: formModel.data.smsCode
                };
                // const { success, data, message } = await apiSmsCheck(query);
                // if (success) {
                //     formModel2.data.jwt = data;
                //     formModel.type = ForgetEnum.password;
                // } else {
                //     Message.warning(message);
                // }
                formModel.loading = false;
            }
        });
    };

    const onFormConfirm2 = () => {
        formRef2.value?.validate(async (valid: boolean) => {
            if (valid) {
                formModel2.loading = true;
                const query = {
                    jwt: formModel2.data.jwt,
                    newPassword: Encrypt.md5(formModel2.data.newPassword),
                    newPasswordCopy: Encrypt.md5(formModel2.data.newPasswordCopy)
                };
                // const { success, message } = await apiUserPasswordResetJwtToken(query);
                // if (success) {
                //     ElMessageBox.alert('密码修改成功', '温馨提示', {
                //         confirmButtonText: '确定',
                //         draggable: true,
                //         showClose: false,
                //         type: 'warning',
                //         customClass: 'message-box-custom',
                //     }).then(() => {
                //         onFormCancel();
                //     }).catch(() => { });
                // } else {
                //     Message.warning(message);
                // }
                formModel2.loading = false;
            }
        });
    };

    const onFormCancel = () => {
        Router.back();
    };

    onBeforeUnmount(() => {
        onResetSmsTimer();
    });
</script>

<style lang="scss" scoped>

</style>