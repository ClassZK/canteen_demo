<template>
    <div class="login-module">
        <div class="login-title">{{ systemModel.systemTitle }}</div>
        <div class="login-form">
            <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error>
                <ElFormItem prop="account">
                    <ElCol>
                        <ElInput v-model="formModel.data.account" maxlength="20" clearable placeholder="请输入账号">
                        </ElInput>
                    </ElCol>
                </ElFormItem>
                <ElFormItem prop="password">
                    <ElCol>
                        <ElInput v-model="formModel.data.password" type="password" show-password maxlength="30"
                            clearable placeholder="请输入密码">
                        </ElInput>
                    </ElCol>
                </ElFormItem>
                <ElFormItem prop="captcha" class="captcha">
                    <ElCol>
                        <ElInput v-model="formModel.data.captcha" maxlength="6" clearable placeholder="请输入图形验证码">
                        </ElInput>
                        <ElButton @click="onGetCaptcha">
                            <ElImage :src="formModel.base64">
                                <template #placeholder>获取中</template>
                                <template #error>获取失败</template>
                            </ElImage>
                        </ElButton>
                    </ElCol>
                </ElFormItem>
                <!-- <ElFormItem class="forget">
                    <ElLink @click="onPasswordReset">忘记密码？</ElLink>
                </ElFormItem> -->
                <ElFormItem class="submit">
                    <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">登录</ElButton>
                </ElFormItem>
                <ElFormItem class="agreement">
                    <div class="accept">
                        <ElCheckbox v-model="formModel.accept"></ElCheckbox>
                        <span class="tip" @click="onAcceptChange">我已阅读并同意</span>
                        <a href="javascript: void(0);" @click="onAgreementPrivacy('userPrivacyAgreement')">《用户协议》</a>和
                        <a href="javascript: void(0);" @click="onAgreementPrivacy('userPrivacyPolicy')">《隐私政策》</a>
                    </div>
                </ElFormItem>
            </ElForm>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router';
import Encrypt from 'tddev/encrypt';
import Storage from 'tddev/storage';
import { Message } from '@/global/const';
import { validatorPassword, validatorCaptcha } from '@/utils/Regexp/index';
import _utils from '@/utils/index';
import { apiCaptchaImage, apiSystemUserLogin } from '@/api/admin'

const Router = useRouter();
const formRef = ref();

const systemModel = reactive({
    menuCollapse: false,
    systemTitle: '',
    systemLogo: '',
});

const formModel = reactive({
    loading: false,
    accept: false,
    base64: '',
    data: {
        account: 'admin',
        password: 'Admin123',
        captcha: '1234',
        captcha_id: ''
    },
    rules: {
        account: [
            { required: true, message: '请输入账号', trigger: ['change', 'blur'] }
        ],
        password: [
            { required: true, validator: validatorPassword(), trigger: ['change', 'blur'] }
        ],
        captcha: [
            { required: true, validator: validatorCaptcha(), trigger: ['change', 'blur'] }
        ]
    }
});

const getSystemInfo = () => {
    systemModel.systemTitle = _utils.getSystemTitle();
    systemModel.systemLogo = _utils.getSystemLogo();
};
getSystemInfo();

/** 图形验证码 */
const onGetCaptcha = async () => {
    const { success, data } = await apiCaptchaImage();
    if (success) {
        formModel.base64 = data.image;
        formModel.data.captcha_id = data.captcha_id;
    } else {
        Message.warning('图形验证码获取失败');
    }
}
onGetCaptcha();
const onResetCaptcha = (message: string) => {
    Message.warning(message);
    formModel.data.captcha = '';
    onGetCaptcha();
};

/** 登录 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            if (formModel.accept) {
                await onFormLogin();
            } else {
                await onAgreeMessageBox();
            }
        }
    });
};
const onFormLogin = async () => {
    formModel.loading = true;
    /** 登录 */
    let query = JSON.parse(JSON.stringify(formModel.data));
    query.password = Encrypt.md5(query.password);
    const { success, data, message } = await apiSystemUserLogin(query);
    if (success) {
        Storage.set('token', data.token);
        delete data.token;
        Storage.set('SystemUserinfo', data);
        const route = Router.resolve({
            name: 'home'
        });
        window.location.href = route.href;

    } else {
        onResetCaptcha(message);
    }
    formModel.loading = false;
};

const onAcceptChange = () => {
    formModel.accept = !formModel.accept;
};

/** 判断是否勾选协议和隐私 */
const onAgreeMessageBox = async () => {
    ElMessageBox.alert(`我已阅读并同意<a href="#" target="_blank">《用户协议》</a>和<a href="#">《隐私政策》</a>，是否确定？`, '温馨提示', {
        confirmButtonText: '确定',
        showCancelButton: true,
        cancelButtonText: '取消',
        draggable: true,
        type: 'warning',
        dangerouslyUseHTMLString: true,
        customClass: 'message-box-custom'
    }).then(async () => {
        formModel.accept = true;
        await onFormLogin();
    }).catch(() => { });
};

const onPasswordReset = () => {
    Router.push({ name: 'passwordReset' });
};
const onAgreementPrivacy = (name: string) => {
    const route = Router.resolve({ name });
    window.open(route.href);
}

const windowKeyboard = async (event: any) => {
    if (event.key === 'Enter' && !formModel.loading) {
        event.preventDefault();
        await onFormConfirm();
    }
};

onMounted(() => {
    window.addEventListener('keydown', windowKeyboard, false);
});
onBeforeUnmount(() => {
    window.removeEventListener('keydown', windowKeyboard, false);
});
</script>

<style lang="scss" scoped>
$chunk-height: 64px;

.login-module {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex: none;
    width: 720px;
    padding: 5%;
    box-sizing: border-box;
}

.login-title {
    width: 100%;
    margin-bottom: 100px;
    color: #263E5A;
    font-size: 44px;
    font-weight: bold;
}

.login-qr {
    position: absolute;
    top: var(--gap-xl);
    right: var(--gap-xl);
    width: 40px;
    height: 40px;
    cursor: pointer;

    img {
        width: 100%;
        height: 100%;
    }
}

.login-form {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;

    .el-form {
        width: inherit;
    }

    .el-form-item {
        margin-bottom: 32px;
        border-radius: var(--radius-md);

        &:last-of-type {
            margin-bottom: 0;
        }

        :deep(.el-input__wrapper) {
            padding: 0 24px;
            background: #F6F7FC;
            box-shadow: none;
        }
    }

    .el-input {
        height: $chunk-height;
        font-size: var(--font-size-xl);
    }

    .el-button {
        height: $chunk-height;
        font-size: var(--font-size-xl);
    }

    .captcha {
        margin-bottom: 20px;

        .el-col {
            display: flex;
        }

        .el-input {
            flex: auto;
        }

        .el-button {
            overflow: hidden;
            flex: none;
            width: 150px;
            padding: 0;
            margin-left: 20px;
            border: none;
            background: #F6F7FC;
            font-size: var(--font-size-md);
            border-radius: var(--radius-md);
            box-shadow: none;
        }

        .el-image {
            height: $chunk-height;
            line-height: $chunk-height;
        }
    }

    .forget {
        margin-bottom: 0;

        :deep(.el-form-item__content) {
            justify-content: flex-end;
        }
    }

    .submit {
        margin-top: 30px;

        .el-button {
            width: 100%;
            letter-spacing: var(--gap-md);
            border-radius: var(--radius-xl);
        }
    }

    .agreement {
        .accept {
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            color: var(--font-color-sm);
            font-size: var(--font-size-md);
            line-height: var(--line-height-sm);

            .el-checkbox {
                height: auto;
                margin: 0 8px 0 2px;
                transform: scale(1.3);
            }

            .tip {
                flex: none;
                cursor: pointer;
            }

            a {
                flex: none;
                color: var(--el-color-primary);
                font-size: inherit;
                line-height: inherit;
            }
        }
    }
}

@media (max-width: 1366px) {
    .login-module {
        width: 600px;
    }
}
@media (max-width: 768px) {
    .login-module {
        width: 500px;
    }
}
</style>
