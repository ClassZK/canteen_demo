<template>
  <ElDialog
    width="1000px"
    :title="`安全自查${formModel.OperationTypeName}`"
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
            <ElFormItem label="检查人" prop="operator">
              <ElInput v-model.trim="formModel.data.operator" maxlength="10" show-word-limit clearable placeholder="请输入检查人"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="检查时间" prop="inspection_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.inspection_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择检查时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
              <ElFormItem label="检查区域" prop="region">
                  <ElSelect v-model="formModel.data.region" filterable clearable placeholder="请选择检查区域">
                      <ElOption v-for="item of CanteenAreaList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                  </ElSelect>
              </ElFormItem>
          </ElCol>
          <ElCol :span="12"></ElCol>
          <ElCol :span="6">
            <ElFormItem label="水、电" prop="water">
              <ElRadioGroup v-model="formModel.data.water">
                <ElRadioButton v-for="item of WhetherList3" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="燃气" prop="gas">
              <ElRadioGroup v-model="formModel.data.gas">
                <ElRadioButton v-for="item of WhetherList3" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="门、窗" prop="doors">
              <ElRadioGroup v-model="formModel.data.doors">
                <ElRadioButton v-for="item of WhetherList3" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="厨房设备" prop="kitchen">
              <ElRadioGroup v-model="formModel.data.kitchen">
                <ElRadioButton v-for="item of WhetherList3" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="消防设备" prop="fire_fighting">
              <ElRadioGroup v-model="formModel.data.fire_fighting">
                <ElRadioButton v-for="item of WhetherList3" :label="item.name" :value="item.value" />
              </ElRadioGroup>
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
import { useSafetySelfInspectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, WhetherEnum, WhetherList3, CanteenAreaList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiSafeInspectionUpdate } from "@/api/inspection";

const SafetySelfInspectionAuxStore = useSafetySelfInspectionAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  operator: '',
  inspection_time: '',
  region: '',
  water: WhetherEnum.yes,
  gas: WhetherEnum.yes,
  doors: WhetherEnum.yes,
  kitchen: WhetherEnum.yes,
  fire_fighting: WhetherEnum.yes,
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
    operator: [{ required: true, message: "请输入检查人", trigger: ["change", "blur"] }],
    inspection_time: [{ required: true, message: "请输入检查时间", trigger: ["change", "blur"] }],
    region: [{ required: true, message: "请输入检查区域", trigger: ["change", "blur"] }],
    water: [{ required: true, message: "请选择水、电", trigger: ["change", "blur"] }],
    gas: [{ required: true, message: "请选择燃气", trigger: ["change", "blur"] }],
    doors: [{ required: true, message: "请选择门、窗", trigger: ["change", "blur"] }],
    kitchen: [{ required: true, message: "请选择厨房设备", trigger: ["change", "blur"] }],
    fire_fighting: [{ required: true, message: "请选择消防设备", trigger: ["change", "blur"] }],
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
      const { success, message } = await apiSafeInspectionUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        SafetySelfInspectionAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`安全自检记录 ${formModel.OperationTypeName}成功`);
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
  SafetySelfInspectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => SafetySelfInspectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      formModel.visible = true;
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(SafetySelfInspectionAuxStore.data));
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
