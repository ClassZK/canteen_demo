<template>
  <ElDialog
    width="1000px"
    :title="`晨检记录${formModel.OperationTypeName}`"
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
        :rules="formRules"
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="晨检时间" prop="inspection_time">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.inspection_time"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                :disabled-date="onDateTimeDisabled"
                placeholder="请选择晨检时间"
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="姓名" prop="name">
              <ElInput
                v-model="formModel.data.name"
                maxlength="10"
                show-word-limit
                clearable
                placeholder="请输入姓名"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否发热" prop="fever">
              <ElRadioGroup v-model="formModel.data.fever">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否咽喉痛或咳嗽" prop="sore_throat">
              <ElRadioGroup v-model="formModel.data.sore_throat">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否呕吐腹泻" prop="vomiting">
              <ElRadioGroup v-model="formModel.data.vomiting">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否皮肤感染" prop="skin_infections">
              <ElRadioGroup v-model="formModel.data.skin_infections">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="着装是否正常" prop="dress">
              <ElRadioGroup v-model="formModel.data.dress">
                <ElRadioButton v-for="item of WhetherList" :label="item.name" :value="item.value" />
              </ElRadioGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="6">
            <ElFormItem label="是否能上岗" prop="handling_opinions">
              <ElRadioGroup v-model="formModel.data.handling_opinions">
                <ElRadioButton v-for="item of WhetherList2" :label="item.name" :value="item.value" />
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
import { useMorningHealthCheckAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, WhetherEnum, WhetherList, WhetherList2 } from "@/global/const";
import { dateTimeFilter, timestampFilter } from '@/utils/Dayjs/index';
import { apiMorningInspectionUpdate } from "@/api/inspection";

const MorningHealthCheckAuxStore = useMorningHealthCheckAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  inspection_time: "",
  name: "",
  fever: WhetherEnum.no,
  sore_throat: WhetherEnum.no,
  vomiting: WhetherEnum.no,
  skin_infections: WhetherEnum.no,
  dress: WhetherEnum.yes,
  handling_opinions: WhetherEnum.yes,
  image: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial(),
});
const formRules = {
  inspection_time: [{ required: true, message: "请选择晨检时间", trigger: ["change", "blur"] }],
  name: [{ required: true, message: "请输入姓名", trigger: ["change", "blur"] }],
  fever: [{ required: true, message: "请选择", trigger: ["change", "blur"] }],
  sore_throat: [{ required: true, message: "请选择是否咽喉痛或咳嗽", trigger: ["change", "blur"] }],
  vomiting: [{ required: true, message: "请选择是否呕吐或腹泻", trigger: ["change", "blur"] }],
  skin_infections: [{ required: true, message: "请选择是否皮肤感染", trigger: ["change", "blur"] }],
  dress: [{ required: true, message: "请选择着装是否正常", trigger: ["change", "blur"] }],
  handling_opinions: [{ required: true, message: "请选择是否能上岗", trigger: ["change", "blur"] }],
};

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
      const { success, message } = await apiMorningInspectionUpdate(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        MorningHealthCheckAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`晨检记录 ${formModel.OperationTypeName}成功`);
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
  MorningHealthCheckAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => MorningHealthCheckAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];

      /** 回显数据 */
      if (type === OperationTypeEnum.update) {
        const data = JSON.parse(JSON.stringify(MorningHealthCheckAuxStore.data));
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
