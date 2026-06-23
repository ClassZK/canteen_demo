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
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol>
            <ElFormItem label="预警主题">
              <ElInput v-model="formModel.checked.subject" disabled placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="督办人">
              <ElInput v-model="formModel.checked.supervisor_name" disabled placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="督办时间">
              <ElInput v-model="formModel.checked.supervise_time" disabled placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="预警说明" prop="alarm_desc">
              <ElInput
                v-model="formModel.checked.alarm_desc"
                type="textarea"
                :rows="5"
                resize="none"
                disabled
                placeholder=" "
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="预警文件" prop="alarm_files">
              <IUploadImage :data="formModel.checked.alarm_files" disabled></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="处理说明" prop="process_desc">
              <ElInput
                v-model="formModel.data.process_desc"
                type="textarea"
                :rows="5"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder="处理说明"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="处理文件" prop="process_files">
              <IUploadFile :data="formModel.data.process_files" @success="onUploadProcessFiles"></IUploadFile>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useWarningManagementAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { apiForewarningMonthPriceSupervisionHandle } from "@/api/warehouse";
import _ from "tddev/utils";
const WarningManagementAuxStore = useWarningManagementAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  process_desc: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial() as Obj,
  checked: {} as Obj,
  rules: {
    process_desc: [{ required: true, message: "请输入处理说明", trigger: ["change", "blur"] }],
  },
});

/** 处理文件上传成功 */
const onUploadProcessFiles = (value: string) => {
  formModel.data.process_files = value;
};

const onApiSupervisionDetail = async () => {
  formModel.checked = WarningManagementAuxStore.data;
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      formModel.data.id = formModel.checked.id;
      const { success, message } = await apiForewarningMonthPriceSupervisionHandle(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        WarningManagementAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
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
    if (type === OperationTypeEnum.handle) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      const data = JSON.parse(JSON.stringify(WarningManagementAuxStore.data));
      formModel.checked = data;
      onApiSupervisionDetail();
    }
  }
);
</script>

<style lang="scss" scoped></style>
