<template>
  <ElDialog
    width="1000px"
    :title="`清洁记录${formModel.OperationTypeName}`"
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
            <ElFormItem label="操作人" prop="operator">
              <ElInput v-model.trim="formModel.data.operator" maxlength="10" show-word-limit clearable placeholder="请输入操作人"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="清洁时间" prop="clean_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.clean_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择清洁时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
              <ElFormItem label="清洁区域" prop="region">
                  <ElSelect v-model="formModel.data.region" filterable clearable placeholder="请选择清洁区域">
                      <ElOption v-for="item of CanteenAreaList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                  </ElSelect>
              </ElFormItem>
          </ElCol>
          <ElCol :span="12"></ElCol>
          <ElCol :span="6">
            <ElFormItem label="食品规范存放" prop="stored">
              <ElRadioGroup v-model="formModel.data.stored">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="5">
            <ElFormItem label="地面、桌面、墙面擦拭" prop="wipe">
              <ElRadioGroup v-model="formModel.data.wipe">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="7">
            <ElFormItem label="工具用具、设备清洗、归位保洁" prop="tool">
              <ElRadioGroup v-model="formModel.data.tool">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="垃圾密封转运" prop="garbage">
              <ElRadioGroup v-model="formModel.data.garbage">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
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
import { useCleaningRecordAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, WhetherEnum, WhetherList, CanteenAreaList } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiCleaningRecordUpdate } from "@/api/inspection";

const CleaningRecordAuxStore = useCleaningRecordAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  operator: '',
  clean_time: '',
  region: '',
  stored: WhetherEnum.yes,
  wipe: WhetherEnum.yes,
  tool: WhetherEnum.yes,
  garbage: WhetherEnum.yes,
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
    operator: [{ required: true, message: "请输入操作人", trigger: ["change", "blur"] }],
    clean_time: [{ required: true, message: "请选择清洁时间", trigger: ["change", "blur"] }],

    region: [{ required: true, message: "请输入清洁区域", trigger: ["change", "blur"] }],

    stored: [{ required: true, message: "请选择食品规范存放", trigger: ["change", "blur"] }],
    wipe: [{ required: true, message: "请选择地面、桌面、墙面擦拭", trigger: ["change", "blur"] }],
    tool: [{ required: true, message: "请选择工具用具、设备清洗、归位保洁", trigger: ["change", "blur"] }],
    garbage: [{ required: true, message: "请选择垃圾密封转运", trigger: ["change", "blur"] }],
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
      const { success, message } = await apiCleaningRecordUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        CleaningRecordAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`清洁记录${formModel.OperationTypeName}完成`);
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
  CleaningRecordAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => CleaningRecordAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      //   formModel.checked = JSON.parse(JSON.stringify(CleaningRecordAuxStore.data));
      /** 回显数据 */
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(CleaningRecordAuxStore.data));
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
