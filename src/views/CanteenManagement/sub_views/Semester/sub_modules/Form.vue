<template>
  <ElDialog
    v-if="formModel.visible"
    width="680px"
    :title="`${formModel.OperationTypeName}学期`"
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
        :disabled="SemesterAuxStore.OperationType === OperationTypeEnum.detail"
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="30">
            <ElFormItem label="学期名称" prop="name">
              <ElInput v-model="formModel.data.name" maxlength="20" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="30">
            <ElFormItem label="学期开始时间" prop="start_time">
              <ElDatePicker
                type="daterange"
                v-model="dateTimeModel.data"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                unlink-panels
                range-separator="-"
                @change="dateTimeModelChange"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="30"> </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="onFormClosed">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onMounted } from "vue";
import { useSemesterAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message } from "@/global/const";
import { apiCanteenSemesterUpdate } from "@/api/recipe";

const SemesterAuxStore = useSemesterAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  id: "",
  name: "",
  start_time: "",
  end_time: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: true,
  OperationTypeName: "",
  data: formInitial(),
  rules: {
    name: [{ required: true, message: "请输入学期名称", trigger: ["blur", "change"] }],
    start_time: [{ required: true, message: "请选择学期开始时间", trigger: ["blur", "change"] }],
  },
});
/** 时间范围 */
const dateTimeModel = reactive<{
  data: string[];
  valueFormat: string;
  defaultTime: Date[];
}>({
  data: [],
  valueFormat: "YYYY-MM-DD",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});
const dateTimeModelChange = (array: string[]) => {
  let start_time = "",
    end_time = "";
  if (Array.isArray(array)) {
    start_time = array[0];
    end_time = array[1];
  }
  formModel.data.start_time = start_time;
  formModel.data.end_time = end_time;
};
/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const params: Obj = { ...formModel.data };
      const { success, message } = await apiCanteenSemesterUpdate(params);
      if (success) {
        /** 操作成功刷新页面数据 */
        SemesterAuxStore.$patch(state => {
          state.OperationType = OperationTypeEnum.default;
          state.refresh = new Date().getTime();
          formModel.data = formInitial();
          dateTimeModel.data = [];
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
  SemesterAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
  formModel.visible = false;
};

onMounted(() => {
  formModel.vLoading = false;
});
/** 监听操作类型 */
watch(
  () => SemesterAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.add || type === OperationTypeEnum.update || type === OperationTypeEnum.detail) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type];
      if (type !== OperationTypeEnum.add) {
        const data = JSON.parse(JSON.stringify(SemesterAuxStore.data));
        formModel.data = data;
        dateTimeModel.data = [data.start_time, data.end_time];
      } else {
        dateTimeModel.data = [];
      }
    }
  },
);
</script>

<style lang="scss" scoped></style>
