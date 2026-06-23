<template>
  <ElDialog
    width="1000px"
    :title="`四害消杀记录${formModel.OperationTypeName}`"
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
    <div v-if="formModel.isDetail" class="ledger-detail">
      <h3>台账内容</h3>
      <table>
        <tbody>
          <tr><th>消杀日期</th><td>{{ formModel.data.disinfection_date }}</td></tr>
          <tr><th>消杀区域</th><td>{{ optionText(formModel.data.disinfection_area, CanteenAreaList) }}</td></tr>
          <tr><th>操作人员</th><td>{{ formModel.data.operator }}</td></tr>
          <tr><th>消杀内容（具体写灭鼠、灭虫等）</th><td>{{ optionText(formModel.data.disinfection_content, FourPestContentList) }}</td></tr>
          <tr><th>操作是否规范</th><td>{{ optionText(formModel.data.operation_standard, CheckResultList) }}</td></tr>
          <tr><th>消杀施工照片</th><td><ITablePreview :image="formModel.data.construction_image"></ITablePreview></td></tr>
          <tr><th>消杀报告照片</th><td><ITablePreview :image="formModel.data.report_image"></ITablePreview></td></tr>
        </tbody>
      </table>
    </div>
    <div v-else class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
      <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error label-width="80px" label-position="top">
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="消杀日期" prop="disinfection_date">
              <ElDatePicker
                type="date"
                v-model="formModel.data.disinfection_date"
                value-format="YYYY-MM-DD"
                :disabled-date="onDateDisabled"
                placeholder="请选择消杀日期"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="消杀区域" prop="disinfection_area">
              <ElSelect v-model="formModel.data.disinfection_area" filterable clearable placeholder="请选择消杀区域">
                <ElOption v-for="item in CanteenAreaList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="操作人员" prop="operator">
              <ElInput v-model.trim="formModel.data.operator" maxlength="30" show-word-limit clearable placeholder="请输入操作人员"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="操作是否规范" prop="operation_standard">
              <ElSelect v-model="formModel.data.operation_standard" filterable clearable placeholder="请选择操作是否规范">
                <ElOption v-for="item in CheckResultList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="消杀内容" prop="_disinfection_content">
              <ElCheckboxGroup v-model="formModel.data._disinfection_content">
                <ElCheckbox v-for="item in FourPestContentList" :key="item.value" :label="item.value">{{ item.name }}</ElCheckbox>
              </ElCheckboxGroup>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="消杀施工照片" prop="construction_image">
              <IUploadImage :data="formModel.data.construction_image" @success="onConstructionImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="消杀报告照片" prop="report_image">
              <IUploadImage :data="formModel.data.report_image" @success="onReportImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">{{ formModel.isDetail ? "关闭" : "取消" }}</ElButton>
        <ElButton v-if="!formModel.isDetail" type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useFourPestDisinfectionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, FourPestContentList, CheckResultList, CanteenAreaList } from "@/global/const";
import { apiFourPestDisinfectionUpdate } from "@/api/inspection";

const FourPestDisinfectionAuxStore = useFourPestDisinfectionAuxStore();
const formRef = ref();

const formInitial = () => ({
  id: "",
  disinfection_date: "",
  disinfection_area: "",
  operator: "",
  disinfection_content: "",
  _disinfection_content: [] as string[],
  operation_standard: "",
  construction_image: "",
  report_image: "",
});
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial() as Obj,
  isDetail: false,
  rules: {
    disinfection_date: [{ required: true, message: "请选择消杀日期", trigger: ["change", "blur"] }],
    disinfection_area: [{ required: true, message: "请选择消杀区域", trigger: ["change", "blur"] }],
    operator: [{ required: true, message: "请输入操作人员", trigger: ["change", "blur"] }],
    _disinfection_content: [{ type: "array", required: true, message: "请选择消杀内容", trigger: ["change", "blur"] }],
    operation_standard: [{ required: true, message: "请选择操作是否规范", trigger: ["change", "blur"] }],
    construction_image: [{ required: true, message: "请上传消杀施工照片", trigger: ["change", "blur"] }],
    report_image: [{ required: true, message: "请上传消杀报告照片", trigger: ["change", "blur"] }],
  },
});

const onDateDisabled = (time: Date) => time.getTime() > Date.now();
const optionText = (value: string, list: Obj[]) => {
  if (!value) {
    return "";
  }
  return String(value)
    .split(",")
    .filter(Boolean)
    .map(item => list.find((option: Obj) => option.value === item)?.name || item)
    .join("、");
};
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (!valid) {
      return;
    }
    Message.close();
    formModel.loading = true;
    const params = { ...formModel.data };
    params.disinfection_content = params._disinfection_content.join(",");
    delete params._disinfection_content;
    const { success, message } = await apiFourPestDisinfectionUpdate(params);
    if (success) {
      FourPestDisinfectionAuxStore.$patch(state => {
        state.refresh = new Date().getTime();
      });
      formModel.visible = false;
      Message.success(`四害消杀记录${formModel.OperationTypeName}成功`);
    } else {
      Message.warning(message);
    }
    formModel.loading = false;
  });
};
const onConstructionImage = (value: string) => {
  formModel.data.construction_image = value;
  formRef.value?.validateField("construction_image");
};
const onReportImage = (value: string) => {
  formModel.data.report_image = value;
  formRef.value?.validateField("report_image");
};
const onFormClosed = () => {
  formModel.data = formInitial();
  formModel.isDetail = false;
  formRef.value?.resetFields();
  FourPestDisinfectionAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};
watch(
  () => FourPestDisinfectionAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update, OperationTypeEnum.detail];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.OperationTypeName = OperationTypeName[type as OperationTypeEnum];
      formModel.isDetail = type === OperationTypeEnum.detail;
      formModel.visible = true;
      if (type !== OperationTypeEnum.add) {
        const data = JSON.parse(JSON.stringify(FourPestDisinfectionAuxStore.data));
        data._disinfection_content = String(data.disinfection_content || "").split(",").filter(Boolean);
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped>
.ledger-detail {
  h3 {
    margin: 0 0 10px;
    font-size: 16px;
    font-weight: 500;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th,
  td {
    min-height: 38px;
    padding: 10px;
    border: 1px solid #dcdfe6;
    line-height: 22px;
    text-align: left;
    vertical-align: top;
  }
  th {
    width: 34%;
    background: #fafafa;
    font-weight: 600;
  }
}
</style>
