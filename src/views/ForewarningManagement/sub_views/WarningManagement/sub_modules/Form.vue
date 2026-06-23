<template>
  <ElDialog
    width="1000px"
    :title="`预警处理${formModel.OperationTypeName}`"
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
            <ElFormItem label="预警主题" prop="subject">
              <ElInput v-model="formModel.data.subject" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="预警人" prop="supervisor_name">
              <ElInput v-model.trim="formModel.data.supervisor_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="督办时间" prop="supervise_time">
              <ElInput v-model.trim="formModel.data.supervise_time" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="预警说明" prop="alarm_desc">
              <ElInput
                v-model="formModel.data.alarm_desc"
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
            <ElFormItem label="预警文件" prop="alarm_files">
              <IUploadImage :data="formModel.data.alarm_files" disabled></IUploadImage>
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
            <ElCol>
              <ElFormItem label="处理文件" prop="process_files">
                <div
                  :style="{ marginBottom: '5px' }"
                  v-for="(item, index) in onUploadProcessFiles(formModel.data.process_files)"
                  :key="index"
                >
                  <ElLink :href="item" target="_blank">{{ item }}</ElLink>
                </div>
              </ElFormItem>
            </ElCol>
          </template>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">取消</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useWarningManagementAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import _ from "tddev/utils";

const WarningManagementAuxStore = useWarningManagementAuxStore();
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
  formModel.data = WarningManagementAuxStore.data;
};

//处理文件
const onUploadProcessFiles = (value: string) => {
  if (_.isNotEmptyString(value)) {
    return value.split(",");
  } else {
    return [];
  }
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  WarningManagementAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => WarningManagementAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.detail) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      /** 回显数据 */
      const data = JSON.parse(JSON.stringify(WarningManagementAuxStore.data));
      formModel.checked = data;
      onApiSupervisionDetail();
    }
  },
);
</script>

<style lang="scss" scoped></style>
