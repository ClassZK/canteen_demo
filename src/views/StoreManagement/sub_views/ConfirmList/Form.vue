<template>
  <ElDialog
    width="800px"
    :title="`${props.OperationTypeName}`"
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
          <ElCol :span="12">
            <ElFormItem label="备注" prop="remark">
              <ElInput
                v-model.trim="formModel.data.remark"
                maxlength="100"
                show-word-limit
                clearable
                type="textarea"
                placeholder="请输入备注"
              ></ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol>
            <ElFormItem label="图片" prop="attachment">
              <IUploadImage :limit="5" :data="formModel.data.attachment" @success="onUploadImage"></IUploadImage>
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
import { ref, reactive } from "vue";
import { apiConfirmListHandle } from "@/api/warehouse";
import { Message } from "@/global/const";
const props = defineProps<{
  OperationTypeName: string;
  id: string;
}>();

const emit = defineEmits(["confirm", "close"]);
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  attachment: "",
  remark: "",
  order_id: props.id,
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
  remark: [{ required: true, message: "请输入备注", trigger: ["change", "blur"] }],
  attachment: [{ required: true, message: "请上传图片", trigger: ["change", "blur"] }],
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      //
      const { success, message } = await apiConfirmListHandle(formModel.data);
      if (success) {
        Message.success("确认收货成功");
        formModel.data = formInitial();
        formRef.value?.resetFields();
        formModel.visible = false;
        emit("confirm");
      } else {
        Message.warning(message);
      }
    }
  });
};
const onUploadImage = (value: string) => {
  formModel.data.attachment = value;
  formRef.value?.validateField("attachment");
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
