<template>
  <ElDialog
    width="1200px"
    :title="`月采购价格预警${formModel.OperationTypeName}`"
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
                <ElCol :span="8">
                    <ElFormItem label="预警时间">
                    <ElInput v-model="formModel.checked.created_at" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="学校名称">
                    <ElInput v-model="formModel.checked.org_name" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="食材名称">
                    <ElInput v-model="formModel.checked.pro_name" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="食材编号">
                    <ElInput v-model="formModel.checked.pro_no" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="采购月份">
                    <ElInput v-model="formModel.checked.month" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="区域本月均价(元/斤)">
                    <ElInput v-model="formModel.checked._area_price" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="当前月均价(元/斤)">
                    <ElInput v-model="formModel.checked._now_price" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="上月月均价(元/斤)">
                    <ElInput v-model="formModel.checked._last_month_price" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="预警原因">
                    <ElInput v-model="formModel.checked.remark" placeholder=" "></ElInput>
                    </ElFormItem>
                </ElCol>
                <ElCol :span="8">
                    <ElFormItem label="状态">
                    <ElSelect v-model="formModel.checked.status" placeholder=" ">
                        <ElOption v-for="item of HandleTypeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                    </ElSelect>
                    </ElFormItem>
                </ElCol>
                <template v-if="formModel.checked.status === HandleTypeEnum.Handled">
                    <ElCol :span="8">
                        <ElFormItem label="处理时间">
                            <ElInput v-model="formModel.checked.do_time" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="处理人">
                            <ElInput v-model="formModel.checked.do_user_name" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="处理说明" prop="do_remark">
                            <ElInput v-model="formModel.checked.do_remark" type="textarea" :rows="5" resize="none" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                </template>
            </ElRow>
        </ElForm>
    </div>
    <template #footer>
        <div class="dialog-footer">
            <ElButton @click="formModel.visible = false;">取消</ElButton>
        </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useMonthlyPurchasePriceAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message, HandleTypeEnum, HandleTypeList } from "@/global/const";
import { apiForewarningMonthPriceHandle } from "@/api/warehouse";

const MonthlyPurchasePriceAuxStore = useMonthlyPurchasePriceAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
  warn_id: "",
  remark: "",
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
    remark: [{ required: true, message: "请输入处理说明", trigger: ["change", "blur"] }],
  },
});

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      formModel.data.warn_id = formModel.checked.id;
      const { success, message } = await apiForewarningMonthPriceHandle(formModel.data);
      if (success) {
        /** 操作成功刷新页面数据 */
        MonthlyPurchasePriceAuxStore.$patch(state => {
          state.refresh = new Date().getTime();
        });
        formModel.visible = false;
        Message.success(`月采购价格预警${formModel.OperationTypeName}完成`);
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
  MonthlyPurchasePriceAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(() => MonthlyPurchasePriceAuxStore.OperationType, (type) => {
    if (type === OperationTypeEnum.detail) {
        formModel.OperationTypeName = OperationTypeName[type];
        const data = JSON.parse(JSON.stringify(MonthlyPurchasePriceAuxStore.data));
        formModel.checked = data;
        formModel.visible = true;
    }
});
</script>

<style lang="scss" scoped></style>
