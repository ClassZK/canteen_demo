<template>
  <ElDialog
    width="1000px"
    :title="`月调度${formModel.OperationTypeName}`"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    v-model="formModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onFormClosed"
  >
    <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formModel.rules"
        disabled
        hide-required-asterisk
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol>
            <ElFormItem label="督办主题" prop="subject">
              <ElInput v-model="formModel.data.subject" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="督办人" prop="supervisor_name">
              <ElInput v-model.trim="formModel.data.supervisor_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="督办时间" prop="supervise_time">
              <ElInput v-model.trim="formModel.data.supervise_time" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="督办说明" prop="task_desc">
              <ElInput
                v-model="formModel.data.task_desc"
                type="textarea"
                :rows="5"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder=" "
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="督办任务" prop="task">
              <IUploadImage :data="formModel.data.task" disabled @success="onUploadImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
          <template v-if="formModel.data.processor_name">
            <ElCol :span="12">
              <ElFormItem label="处理人" prop="processor_name">
                <ElInput v-model.trim="formModel.data.processor_name" placeholder=" "></ElInput>
              </ElFormItem>
            </ElCol>
            <ElCol :span="12">
              <ElFormItem label="处理时间" prop="processor_time">
                <ElInput v-model.trim="formModel.data.processor_time" placeholder=" "></ElInput>
              </ElFormItem>
            </ElCol>
            <ElCol>
              <ElFormItem label="处理说明" prop="process_desc">
                <ElInput
                  v-model="formModel.data.process_desc"
                  type="textarea"
                  :rows="5"
                  resize="none"
                  placeholder=" "
                ></ElInput>
              </ElFormItem>
            </ElCol>
          </template>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">取消</ElButton>
        <!-- <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton> -->
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useSupervisionInspectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { apiSupervisionAdd, apiSupervisionDetail } from "@/api/supervision";

const SupervisionInspectionAuxStore = useSupervisionInspectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  unit_code: "",
  subject: "",
  supervisor: "",
  supervise_time: "",
  task_desc: "",
  task: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  disabled: false,
  OperationTypeName: "",
  data: formInitial() as Obj,
  checked: formInitial() as Obj,
  rules: {
    unit_code: [{ required: true, message: "请选择学校", trigger: ["change", "blur"] }],
    subject: [{ required: true, message: "请输入督办主题", trigger: ["change", "blur"] }],
    supervisor: [{ required: true, message: "请输入督办人", trigger: ["change", "blur"] }],
    supervise_time: [{ required: true, message: "请选择督办时间", trigger: ["change", "blur"] }],
  },
});

const onApiSupervisionDetail = async () => {
  formModel.vLoading = true;
  const { success, data, message } = await apiSupervisionDetail({
    id: formModel.checked.id,
  });
  if (success) {
    formModel.data = data;
  } else {
    Message.warning(message);
  }
  formModel.vLoading = false;
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const formData = JSON.parse(JSON.stringify(formModel.data));
      if (formData.sample_type) {
        formData.sample_type = formData.sample_type.toString();
      }
      const { success, message } = await apiSupervisionAdd(formData);
      if (success) {
        /** 操作成功刷新页面数据 */
        SupervisionInspectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`月调度 ${formModel.OperationTypeName}成功`);
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};

const onUploadImage = (value: string) => {
  formModel.data.task = value;
  formRef.value?.validateField("task");
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  SupervisionInspectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => SupervisionInspectionAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.detail) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      /** 回显数据 */
      const data = JSON.parse(JSON.stringify(SupervisionInspectionAuxStore.data));
      formModel.checked = data;
      onApiSupervisionDetail();
    }
  }
);
</script>

<style lang="scss" scoped></style>
