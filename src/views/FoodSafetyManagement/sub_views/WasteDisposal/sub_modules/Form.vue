<template>
  <ElDialog
    width="1000px"
    :title="`废弃物处置报表${formModel.OperationTypeName}`"
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
          <ElCol :span="12">
            <ElFormItem label="处理时间" prop="disposal_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.disposal_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择处理时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="废弃物量(斤)" prop="waste_volume">
              <ElInput
                v-model="formModel.data.waste_volume"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入废弃物量"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="废弃物种类" prop="waste_type">
                <ElSelect v-model="formModel.data.waste_type" filterable clearable placeholder="请输入废弃物种类">
                    <ElOption v-for="item of GarbageTypeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="收运公司" prop="recipient">
              <ElInput
                v-model.trim="formModel.data.recipient"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入收运公司"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="收运商资质是否合格" prop="recipient_qualifications">
              <ElRadioGroup v-model="formModel.data.recipient_qualifications">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="图片" prop="image">
              <IUploadImage :disabled="true" :data="formModel.data.image"></IUploadImage>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">关闭</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useWasteDisposalAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, WhetherEnum, WhetherList, GarbageTypeList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';

const WasteDisposalAuxStore = useWasteDisposalAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  disposal_time: '',
  waste_volume: '',
  waste_type: '',
  recipient: '',
  recipient_qualifications: WhetherEnum.yes,
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
    disposal_time: [{ required: true, message: "请选择处理时间", trigger: ["change", "blur"] }],
    waste_volume: [{ required: true, message: "请输入废弃物量", trigger: ["change", "blur"] }],
    waste_type: [{ required: true, message: "请输入废弃物种类", trigger: ["change", "blur"] }],
    recipient: [{ required: true, message: "请输入收运公司", trigger: ["change", "blur"] }],
    recipient_qualifications: [{ required: true, message: "请选择收运商资质是否合格", trigger: ["change", "blur"] }],
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

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  WasteDisposalAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => WasteDisposalAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.detail];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      formModel.data = JSON.parse(JSON.stringify(WasteDisposalAuxStore.data));
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
