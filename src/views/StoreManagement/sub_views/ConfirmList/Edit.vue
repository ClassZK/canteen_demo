<template>
  <ElDialog
    width="800px"
    :title="`${confirmListStoreAuxStore.data.goods_name || confirmListStoreAuxStore.data.product_name || ''}`"
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
    <div class="form-container">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formRules"
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="24">
            <ElFormItem label="图片" prop="image">
              <IUploadImage :limit="5" :data="formModel.data.image" @success="onUploadImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="入库数量" prop="in_house_count">
              <ElInputNumber
                v-model.trim="formModel.data.in_house_count"
                clearable
                :precision="precision ? 2 : 0"
                :step="precision ? 0.01 : 1"
                :max="9999999"
                :min="0"
                placeholder="请输入入库数量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="出库数量" prop="out_count">
              <ElInputNumber
                v-model.trim="formModel.data.out_count"
                clearable
                placeholder="请输入出库数量"
                :precision="precision ? 2 : 0"
                :step="precision ? 0.01 : 1"
                :max="9999999"
                :min="0"
              ></ElInputNumber>
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
import { ref, reactive, computed } from "vue";
import { apiWarehouseOrderSubmitItem } from "@/api/warehouse";
import { Message } from "@/global/const";
import { useConfirmListStoreAuxStore } from "./aux_modules/store";
import { pickFirstValue } from "../aux_modules/orderDetail";
const confirmListStoreAuxStore = useConfirmListStoreAuxStore();
const emit = defineEmits(["close", "confirm"]);
const formRef = ref();

// 判断精度
const precision = computed(() => confirmListStoreAuxStore.data.measure_type === 1);

/** 输入数据 函数方式 */
const formInitial = () => ({
  id: confirmListStoreAuxStore.data.id,
  image: confirmListStoreAuxStore.data.in_image,
  in_house_count: pickFirstValue(confirmListStoreAuxStore.data, [
    "in_count",
    "received_count",
    "send_number",
    "send_count",
  ]) || 0,
  out_count: pickFirstValue(confirmListStoreAuxStore.data, ["out_count"]) || 0,
});
/** 交互反馈数据 */
const formModel = reactive<{
  visible: boolean;
  loading: boolean;
  OperationTypeName: string;
  data: Obj;
}>({
  visible: true,
  loading: false,
  OperationTypeName: "",
  data: formInitial(),
});

const formRules = {
  image: [{ required: true, message: "请上传图片", trigger: ["change", "blur"] }],
  in_house_count: [{ required: true, message: "请输入入库数量", trigger: ["change", "blur"] }],
  out_count: [{ required: true, message: "请输入出库数量", trigger: ["change", "blur"] }],
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      const params = {
        id: formModel.data.id,
        image: formModel.data.image,
        in_house_count: Number(formModel.data.in_house_count),
        out_count: Number(formModel.data.out_count),
      };
      const { success, message } = await apiWarehouseOrderSubmitItem(params);
      if (success) {
        Message.success("修改成功");
        formRef.value?.resetFields();
        formModel.visible = false; 
        emit("confirm");
        emit("close");
      } else {
        Message.warning(message);
      }
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
  formModel.visible = false;
  emit("close");
};
</script>

<style lang="scss" scoped></style>
