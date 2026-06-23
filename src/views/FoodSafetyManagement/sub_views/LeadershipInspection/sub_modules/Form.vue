<template>
  <ElDialog
    width="1000px"
    :title="`视察记录${formModel.OperationTypeName}`"
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
          <ElCol :span="12">
            <ElFormItem label="视察时间" prop="inspection_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.inspection_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择视察时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
              <ElFormItem label="视察类型" prop="inspection_type">
                  <ElSelect v-model="formModel.data.inspection_type" filterable clearable placeholder="请选择视察类型">
                      <ElOption v-for="item of InspectTypeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                  </ElSelect>
              </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="视察人" prop="inspector">
              <ElInput
                v-model.trim="formModel.data.inspector"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入视察人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="视察人职务" prop="inspector_position">
              <ElInput
                v-model="formModel.data.inspector_position"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入视察人职务"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="陪同人" prop="accompanying">
              <ElInput
                v-model.trim="formModel.data.accompanying"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入陪同人"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="评价" prop="inspection_evaluation">
              <ElInput v-model="formModel.data.inspection_evaluation" type="textarea" :rows="5" resize="none" maxlength="200" show-word-limit placeholder="评价"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="图片" prop="image">
              <IUploadImage :data="formModel.data.image" @success="onUploadImage"></IUploadImage>
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
import { useLeadershipInspectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, InspectTypeList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiLeadershipInspectionUpdate } from "@/api/inspection";

const LeadershipInspectionAuxStore = useLeadershipInspectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  inspection_time: "",
  inspection_type: "",
  inspector: "",
  inspector_position: "",
  accompanying: "",
  inspection_evaluation: "",
  image: "",
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
    inspection_time: [{ required: true, message: "请选择视察时间", trigger: ["change", "blur"] }],
    inspection_type: [{ required: true, message: "请选择视察类型", trigger: ["change", "blur"] }],
    inspector: [{ required: true, message: "请输入视察人", trigger: ["change", "blur"] }],
    inspector_position: [{ required: true, message: "请输入视察人职务", trigger: ["change", "blur"] }],
    accompanying: [{ required: true, message: "请输入陪同人", trigger: ["change", "blur"] }],
  },
});
/** 时间 */
const dateTimeModel = reactive({
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: new Date(2000, 1, 1, 0, 0, 0),
});
const onDateTimeDisabled = (time: Date) => {
    const dateTime = dateTimeFilter(new Date());
    const timestamp = timestampFilter(dateTime);
    return time.getTime() > timestamp;
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const { success, message } = await apiLeadershipInspectionUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        LeadershipInspectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`视察记录${formModel.OperationTypeName}完成`);
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};

const onUploadImage = (value: string) => {
  formModel.data.image = value;
  formRef.value?.validateField("image");
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  LeadershipInspectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => LeadershipInspectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];

      if (type === OperationTypeEnum.update) {
        formModel.data = JSON.parse(JSON.stringify(LeadershipInspectionAuxStore.data));
      }
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
