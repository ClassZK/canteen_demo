<template>
  <ElDialog
    width="1300px"
    title="食材批次详情"
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
        scroll-to-error
        disabled
        hide-required-asterisk
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="8">
            <ElFormItem label="食材名称" prop="pro_name">
              <ElInput v-model="formModel.data.pro_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="食材类型" prop="pro_type_name">
              <ElInput v-model="formModel.data.pro_type_names" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="入库单价(元)" prop="price">
              <ElInputNumber
                v-model="formModel.data.price"
                :min="0"
                :max="99999999"
                :precision="2"
                controls-position="right"
                placeholder=" "
              >
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="入库数量" prop="count">
              <ElInputNumber
                v-model="formModel.data.count"
                :min="1"
                :max="99999999"
                controls-position="right"
                placeholder=" "
              >
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="计量单位(件,袋,包,条,瓶等)" prop="unit">
              <ElInput v-model="formModel.data.unit" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="单位重量(斤)" prop="unit_weight">
              <ElInputNumber
                v-model="formModel.data.unit_weight"
                :min="0"
                :max="99999999"
                :precision="2"
                controls-position="right"
                placeholder=" "
              >
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="规格" prop="specification">
              <ElInput v-model="formModel.data.specification" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="供应商" prop="supplier_name">
              <ElInput v-model="formModel.data.supplier_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="生产时间" prop="pro_date">
              <ElDatePicker
                type="datetime"
                v-model="formModel.data.pro_date"
                :value-format="dateTimeModel.valueFormat"
                :default-time="dateTimeModel.defaultTime"
                placeholder=" "
              >
              </ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="保质期(天)" prop="expired_day">
              <ElInputNumber
                v-model="formModel.data.expired_day"
                :min="1"
                :max="99999999"
                step-strictly
                controls-position="right"
                placeholder=" "
              >
              </ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="到期时间" prop="end_day">
              <ElInput v-model="formModel.data.end_day" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="品牌" prop="pro_brand">
              <ElInput v-model="formModel.data.pro_brand" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="8">
            <ElFormItem label="生产厂商" prop="manufacturer">
              <ElInput v-model="formModel.data.manufacturer" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="16"></ElCol>
          <ElCol :span="12">
            <ElFormItem label="食材图片" prop="pro_cover">
              <IUploadImage :limit="5" :data="formModel.data.pro_cover" disabled></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="入库图片" prop="in_img">
              <IUploadImage :limit="5" :data="formModel.data.in_img" disabled></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="质检图片" prop="quality_img">
              <IUploadImage :limit="5" :data="formModel.data.quality_img" disabled></IUploadImage>
            </ElFormItem>
          </ElCol>
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
import { useIngredientStoreAuxStore } from "../aux_modules/store";
import _utils from "@/utils";

const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  pro_cover: "",
  pro_name: "",
  pro_type_pid: "",
  pro_type_pname: "",
  pro_type_id: "",
  pro_type_name: "",
  pro_type_names: "",
  price: undefined,
  count: undefined,
  pro_brand: "",
  supplier_name: "",
  manufacturer: "",
  specification: "",
  unit: "",
  unit_weight: "",
  pro_date: "",
  expired_day: undefined,
  end_day: "",
  in_img: "",
  quality_img: "",
});
/** 交互反馈数据 */
const formModel = reactive<Obj>({
  visible: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial(),
});

/** 时间 */
const dateTimeModel = reactive({
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: new Date(2000, 1, 1, 0, 0, 0),
});

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientDetailData = {};
    state.ingredientDetailVisible = false;
  });
};

/** 监听操作类型 */
watch(
  () => IngredientStoreAuxStore.ingredientDetailData,
  data => {
    const object = JSON.parse(JSON.stringify(data));
    object.pro_type_names = `${object.pro_type_pname} / ${object.pro_type_name}`;
    formModel.data = object;
    formModel.data.count = _utils.KtoJ(object.count, object.measure_type);
  },
  {
    deep: true,
  }
);
watch(
  () => IngredientStoreAuxStore.ingredientDetailVisible,
  boolean => {
    if (boolean) {
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
