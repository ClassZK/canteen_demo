<template>
  <div class="layout-fill-container">
    <IFillHeader></IFillHeader>
    <div class="form-container">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formRules"
        disabled
        hide-required-asterisk
        scroll-to-error
        label-width="80px"
      >
        <ElFormItem label="账号" prop="account">
          <ElInput v-model="formModel.data.account" placeholder=" "></ElInput>
        </ElFormItem>
        <ElFormItem label="姓名" prop="nick">
          <ElInput v-model="formModel.data.nick" placeholder=" "></ElInput>
        </ElFormItem>
        <ElFormItem label="联系电话" prop="phone">
          <ElInput v-model="formModel.data.phone" placeholder=" "></ElInput>
        </ElFormItem>
        <ElFormItem label="学校" prop="org_name">
          <ElInput v-model="formModel.data.org_name" placeholder=" "></ElInput>
        </ElFormItem>
        <ElFormItem label="角色" prop="role_name">
          <ElInput v-model="formModel.data.role_name" placeholder=" "></ElInput>
        </ElFormItem>
      </ElForm>
    </div>
    <div class="layout-fill-button">
      <ElButton @click="onFormBack">返回</ElButton>
      <!-- <template v-if="formModel.disabled">
                <ElButton type="primary" @click="onFormUpdate">编辑</ElButton>
            </template>
            <template v-else>
                <ElButton type="primary" plain :disabled="formModel.loading" @click="onFormCancel">取消</ElButton>
                <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
            </template> -->
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { Message } from "@/global/const";
import { validatorPhone } from "@/utils/Regexp/index";
import { apiMyInformationUpdate } from "@/api/admin";

const Router = useRouter();
const formRef = ref();

/** 交互反馈数据 */
const formModel = reactive<{
  loading: boolean;
  disabled: boolean;
  data: Obj;
}>({
  loading: false,
  disabled: true,
  data: {
    nick: "",
    phone: "",
  },
});
const formRules = {
  nick: [{ required: true, message: "请输入姓名", trigger: ["change", "blur"] }],
  phone: [{ required: true, validator: validatorPhone(), trigger: ["change", "blur"] }],
};

const onGetSystemUserinfo = async () => {
  formModel.data = Storage.get("SystemUserinfo") ?? {};
  console.log("formModel.data", formModel.data);
  const OrgId = Storage.get("orgID");
  formModel.data.org_name = formModel.data.orgs.find((item: Obj) => item.org_id === OrgId)?.org_name || "";
};
onGetSystemUserinfo();

/** 编辑 */
const onFormUpdate = () => {
  formModel.disabled = false;
};
/** 取消 */
const onFormCancel = () => {
  onGetSystemUserinfo();
  formRef.value?.clearValidate();
  formModel.disabled = true;
};
/** 提交数据 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const { success, data, message } = await apiMyInformationUpdate({
        nick: formModel.data.nick,
        phone: formModel.data.phone,
      });
      if (success) {
        Storage.set("SystemUserinfo", formModel.data);
        formModel.disabled = true;
        Message.success("信息修改成功");
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

<style lang="scss" scoped></style>
