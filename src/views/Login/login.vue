<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <h1 class="system-title">食堂管理系统</h1>
        <p class="system-subtitle">推动校园餐专项整治走深走实，以数字化赋能压缩权力寻租空间</p>

        <ul class="features-list">
          <li>廉洁采购监督 - 识别关联交易与异常采购</li>
          <li>阳光管理监督 - 监控食材损耗与食品安全</li>
          <li>虚报冒领监督 - 检测虚假人员与骗取补贴</li>
          <li>多源数据整合 - 教育、市场、人社、财政系统数据联动</li>
          <li>智能预警分析 - 自动挖掘潜在违规违纪问题</li>
        </ul>
        <div class="security-notice">
          <strong>安全提示：</strong>本系统涉及敏感数据，请妥善保管账号密码，严禁非授权访问。
        </div>
      </div>

      <div class="login-right">
        <div class="login-tabs">
          <button class="tab-btn" :class="{ active: loginType === 'password' }" @click="loginType = 'password'">
            密码登录
          </button>
          <button class="tab-btn" :class="{ active: loginType === 'sms' }" @click="loginType = 'sms'">
            验证码登录
          </button>
        </div>
        <ElForm ref="loginFormRef" class="login-form" :model="loginForm" :rules="loginForm.rules" scroll-to-error>
          <h2 class="form-title">{{ loginType === "password" ? "用户登录" : "验证码登录" }}</h2>
          <div v-if="loginType === 'password'">
            <ElFormItem prop="username" label="用户名" label-position="top" size="large">
              <ElCol>
                <ElInput v-model="loginForm.username" maxlength="11" clearable placeholder="请输入账号"> </ElInput>
              </ElCol>
            </ElFormItem>
            <ElFormItem prop="password" label="密码" label-position="top">
              <ElCol>
                <ElInput
                  v-model="loginForm.password"
                  type="password"
                  show-password
                  maxlength="30"
                  clearable
                  placeholder="请输入密码"
                >
                </ElInput>
              </ElCol>
            </ElFormItem>
          </div>
          <div v-if="loginType === 'sms'">
            <ElFormItem prop="phone" label="手机号码" label-position="top">
              <ElCol>
                <ElInput v-model="loginForm.phone" maxlength="11" clearable placeholder="请输入手机号码"> </ElInput>
              </ElCol>
            </ElFormItem>
            <ElFormItem prop="smsCode" label="验证码" label-position="top">
              <ElRow :gutter="12">
                <ElCol :span="16">
                  <ElInput
                    :style="{ width: '230px' }"
                    v-model="loginForm.smsCode"
                    maxlength="6"
                    clearable
                    placeholder="请输入验证码"
                  >
                  </ElInput>
                </ElCol>
                <ElCol :span="4">
                  <ElButton
                    type="primary"
                    class="send-sms-btn"
                    :disabled="smsCountdown > 0 || !isPhoneValid"
                    @click="sendSmsCode"
                    >获取验证码</ElButton
                  >
                </ElCol>
              </ElRow>
            </ElFormItem>
          </div>
          <button type="button" @click="handleLogin(loginFormRef)" class="login-btn" :disabled="loading">
            {{ loading ? "登录中..." : "登录系统" }}
          </button>
          <div class="security-notice"><strong>使用须知：</strong>本系统仅供授权人员使用，所有操作将被记录审计。</div>
        </ElForm>
      </div>
    </div>
    <div @click="handleFooterClick" class="footer">备案号：<span>蜀ICP备2025164632号</span></div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue";
import { apigetMseCaptcha, apiSystemUserLoginBySms, apiSystemUserLoginByPassword } from "@/api/admin";
import Encrypt from "tddev/encrypt";
import { ElMessage } from "element-plus";
import Storage from "tddev/storage";
import { useRouter } from "vue-router";
import { validatorPassword, validatorPhone, validatorSmsCode } from "@/utils/Regexp/index";
const Router = useRouter();
import type { FormInstance, FormRules } from "element-plus";
const loginFormRef = ref<FormInstance>();
// 登录类型
type LoginType = "password" | "sms";

// 登录类型
const loginType = ref<LoginType>("password");

// 密码登录表单数据
interface LoginForm {
  username: string;
  password: string;
  phone: string;
  smsCode: string;
  rules: FormRules;
}

const loginForm = reactive<LoginForm>({
  username: "admin",
  password: "Admin123",
  phone: "13800000000",
  smsCode: "123456",
  rules: {
    username: [{ required: true, message: "请输入用户名", trigger: ["blur", "change"] }],
    password: [{ required: true, validator: validatorPassword(), trigger: ["blur", "change"] }],
    phone: [{ required: true, validator: validatorPhone(), trigger: ["blur", "change"] }],
    smsCode: [{ required: true, validator: validatorSmsCode(), trigger: ["blur", "change"] }],
  },
});

// 加载状态
const loading = ref(false);

// 短信验证码倒计时
const smsCountdown = ref(0);

// 验证手机号格式
const isPhoneValid = computed(() => {
  const phoneRegex = /^1[3-9]\d{9}$/;
  return phoneRegex.test(loginForm.phone);
});

// 处理页脚点击事件
const handleFooterClick = () => {
  window.open("https://beian.miit.gov.cn/", "_blank");
};

// 发送短信验证码
const sendSmsCode = async () => {
  if (!isPhoneValid.value) {
    ElMessage.error("请输入正确的手机号码");
    return;
  }
  const { success, message } = await apigetMseCaptcha({
    account: loginForm.phone,
  });
  if (success) {
    smsCountdown.value = 60;
    const countdownInterval = setInterval(() => {
      smsCountdown.value--;
      if (smsCountdown.value <= 0) {
        clearInterval(countdownInterval);
        smsCountdown.value = 0;
      }
    }, 1000);
  } else {
    ElMessage.error(message);
  }
};

// 登录处理
const handleLogin = async (formRef: FormInstance | undefined) => {
  if (!formRef) {
    return;
  }
  await formRef.validate(async (valid, fields) => {
    if (valid) {
      if (loginType.value === "password") {
        await handlePasswordLogin();
      } else {
        await handleSmsLogin();
      }
    }
  });
};

// 密码登录
const handlePasswordLogin = async () => {
  loading.value = true;
  const { success, data, message } = await apiSystemUserLoginByPassword({
    account: loginForm.username,
    password: Encrypt.md5(loginForm.password),
  });
  loading.value = false;
  if (success) {
    saveLoginInfo(data);
  } else {
    ElMessage.error(message);
  }
};

// 短信登录
const handleSmsLogin = async () => {
  loading.value = true;
  const { success, data, message } = await apiSystemUserLoginBySms({
    account: loginForm.phone,
    sms_code: loginForm.smsCode,
  });
  loading.value = false;
  if (success) {
    ElMessage.success("登录成功");
    saveLoginInfo(data);
    delete data.token;
  } else {
    ElMessage.error(message);
  }
};

const saveLoginInfo = (data: Obj) => {
  Storage.set("token", data.token);
  Storage.set("SystemUserinfo", data);
  Storage.set("Orgs", data?.orgs);
  const orgID = data?.user_scope === "platform" ? "" : data?.orgs[0]?.org_id || data?.org_id || "";
  Storage.set("orgID", orgID);
  const route = Router.resolve({
    name: "home",
  });
  window.location.href = route.href;
};
// 忘记密码处理
const handleForgotPassword = () => {
  alert("请联系系统管理员重置密码");
};

// // 页面加载时检查是否有记住的密码
// const checkRememberedLogin = () => {
//   const rememberMe = localStorage.getItem("rememberMe");
//   if (rememberMe === "true") {
//     loginForm.remember = true;
//     const savedUsername = localStorage.getItem("username");
//     if (savedUsername) {
//       loginForm.username = savedUsername;
//     }
//   }
// };

// // 初始化检查
// checkRememberedLogin();
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: "Microsoft YaHei", "Segoe UI", sans-serif;
}
.footer {
  text-align: center;
  font-size: 14px;
  color: #fff;
  margin-top: 20px;
  cursor: pointer;
}
.login-page {
  background-image: url("@/assets/image/10001.jpg");
  background-size: 100% 100%;
  background-position: center;
  background-repeat: no-repeat;
  height: 100vh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  color: #333;
}

.login-container {
  display: flex;
  width: 900px;
  height: 550px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

.login-left {
  flex: 1;
  background: linear-gradient(135deg, #1a3a8f 0%, #0d4cb3 100%);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.system-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 15px;
}

.system-subtitle {
  font-size: 16px;
  opacity: 0.9;
  margin-bottom: 30px;
}

.features-list {
  list-style: none;
  margin-top: 30px;
}

.features-list li {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
}

.features-list li::before {
  content: "✓";
  display: inline-block;
  width: 22px;
  height: 22px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  text-align: center;
  line-height: 22px;
  margin-right: 10px;
}

.login-right {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: none;
  border: none;
  font-size: 16px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
  border-bottom: 2px solid transparent;
}

.tab-btn.active {
  color: #1a3a8f;
  border-bottom-color: #1a3a8f;
  font-weight: bold;
}

.tab-btn:hover {
  color: #1a3a8f;
}

.login-form {
  width: 100%;
  .el-input {
    height: 48px;
    font-size: 16px;
  }
  ::v-deep(.el-form-item) {
    margin-bottom: 20px;
    .el-form-item__label {
      font-size: 16px;
      &::before {
        content: "";
        display: none;
      }
    }
  }
}

.form-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 30px;
  color: #1a3a8f;
  text-align: center;
}

.input-group {
  margin-bottom: 20px;
}

.input-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.input-group input {
  width: 100%;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 16px;
  transition: border 0.3s;
}

.input-group input:focus {
  border-color: #1a3a8f;
  outline: none;
  box-shadow: 0 0 0 2px rgba(26, 58, 143, 0.2);
}

.sms-code-group {
  display: flex;
  gap: 10px;
}

.sms-code-group input {
  flex: 1;
}

.send-sms-btn {
  padding: 12px 15px;
  height: 46px;
  background: #1a3a8f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: background 0.3s;
  white-space: nowrap;
  min-width: 120px;
}

.send-sms-btn:hover:not(:disabled) {
  background: #0d4cb3;
}

.send-sms-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.remember-forgot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 25px;
  font-size: 14px;
}

.remember-me {
  display: flex;
  align-items: center;
}

.remember-me input {
  margin-right: 5px;
}

.forgot-password {
  color: #1a3a8f;
  text-decoration: none;
  cursor: pointer;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-btn {
  width: 100%;
  height: 45px;
  padding: 12px;
  text-align: center;
  background: #1a3a8f;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.3s;
}

.login-btn:hover:not(:disabled) {
  background: #0d4cb3;
}

.login-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.security-notice {
  margin-top: 20px;
  padding: 10px;
  background: #f5f9ff;
  border-left: 4px solid #1a3a8f;
  font-size: 13px;
  color: #666;
}

.login-left .security-notice {
  background: rgba(255, 255, 255, 0.1);
  border-left: 4px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.9);
  margin-top: auto;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
    width: 95%;
    height: auto;
  }

  .login-left,
  .login-right {
    padding: 30px 25px;
  }

  .sms-code-group {
    flex-direction: column;
  }

  .send-sms-btn {
    min-width: auto;
  }
}
</style>
