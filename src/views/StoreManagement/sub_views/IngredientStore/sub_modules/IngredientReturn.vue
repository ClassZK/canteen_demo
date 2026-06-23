<template>
  <ElDialog
    width="1000px"
    title="食材批次退货"
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
        @submit.prevent
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="食材批次">
              <ElInput v-model="formModel.checked.in_batch_no" disabled></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="食材名称">
              <ElInput v-model="formModel.checked.pro_name" disabled></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="`库存数量(${formModel.checked.unit})`">
              <ElInputNumber
                v-model="formModel.checked.storeCount"
                :min="0"
                :max="999999999"
                controls-position="right"
                disabled
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem :label="`退货数量(${formModel.checked.unit})`" prop="count">
              <ElInputNumber
                v-model="formModel.data.count"
                :min="0"
                :max="formModel.checked.storeCount"
                controls-position="right"
                placeholder="请输入退货数量"
              ></ElInputNumber>
            </ElFormItem>
          </ElCol>
          <!-- <ElCol>
                        <ElFormItem label="备注" prop="remark">
                            <ElInput v-model="formModel.data.remark" type="textarea" :rows="5" resize="none" maxlength="200" show-word-limit placeholder="备注"></ElInput>
                        </ElFormItem>
                    </ElCol> -->
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
import { useIngredientStoreAuxStore } from "../aux_modules/store";
import { Message } from "@/global/const";
import { apiInventoryOuthouse } from "@/api/warehouse";
import _utils from "@/utils";
const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  count: undefined,
  remark: "",
});
/** 交互反馈数据 */
const formModel = reactive<{
  visible: boolean;
  loading: boolean;
  data: Obj;
  checked: Obj;
}>({
  visible: false,
  loading: false,
  data: formInitial(),
  checked: {},
});
const formRules = {
  count: [{ required: true, message: "请输入退货数量", trigger: ["change", "blur"] }],
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const { success, message } = await apiInventoryOuthouse({
        list: [
          {
            batch_id: formModel.checked.id,
            count: _utils.JtoK(formModel.data.count, formModel.checked.measure_type),
          },
        ],
        action_id: 104,
      });
      if (success) {
        /** 操作成功刷新页面数据 */
        IngredientStoreAuxStore.$patch(state => {
          state.detailRefresh = new Date().getTime();
        });
        Message.success("退货出库成功");
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
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientReturnData = {};
    state.ingredientReturnVisible = false;
  });
};

/** 监听操作类型 */
watch(
  () => IngredientStoreAuxStore.ingredientReturnData,
  data => {
    const object = JSON.parse(JSON.stringify(data));
    formModel.checked = object;
    formModel.checked.storeCount = _utils.KtoJ(formModel.checked.storeCount, formModel.checked.measure_type);
  },
  {
    deep: true,
  }
);
watch(
  () => IngredientStoreAuxStore.ingredientReturnVisible,
  boolean => {
    if (boolean) {
      formModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>
