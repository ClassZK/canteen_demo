<template>
    <ElDialog width="1000px" title="食材批次打印" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formRules" @submit.prevent scroll-to-error label-width="80px" label-position="top">
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
                        <ElFormItem label="食材编号">
                            <ElInput v-model="formModel.checked.pro_no" disabled></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="标签打印机" prop="printer_id">
                            <ElSelect v-model="formModel.data.printer_id" filterable clearable placeholder="请选择标签打印机">
                                <ElOption v-for="item of commonModel.printerList" :key="item.id" :label="item.name" :value="item.id"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElForm>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="formModel.visible = false;">取消</ElButton>
                <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">打印</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useIngredientStoreAuxStore } from '../aux_modules/store';
import { Message, EquipmentStatusEnum } from '@/global/const';
import _utils from '@/utils/index';
import { apiPrinterDeviceList, apiInventoryLabelPrint } from '@/api/warehouse';

const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();

const commonModel = reactive<{
    printerList: Obj[];
}>({
    printerList: [],
});

/** 输入数据 函数方式 */
const formInitial = () => ({
    printer_id: '',
});
/** 交互反馈数据 */
const formModel = reactive<{
    visible: boolean;
    vLoading: boolean;
    loading: boolean;
    data: Obj;
    checked: Obj;
}>({
    visible: false,
    vLoading: false,
    loading: false,
    data: formInitial(),
    checked: {},
});
const formRules = {
    printer_id: [
        { required: true, message: '请选择标签打印机', trigger: ['change', 'blur'] }
    ],
};

const onApiPrinterDeviceList = async () => {
    formModel.vLoading = true;
    const { success, data, message} = await apiPrinterDeviceList();
    if (success) {
        const list = _utils.getDefaultArray(data.list);
        commonModel.printerList = list.filter((item: Obj) => Number(item.status) === EquipmentStatusEnum.Success);
        if (commonModel.printerList.length > 0) {
            formModel.data.printer_id = commonModel.printerList[0].id;
        }
    } else {
        Message.warning(message);
    }
    formModel.vLoading = false;
};

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            const { success, message } = await apiInventoryLabelPrint({
                goods_batch_id: formModel.checked.id,
                printer_id: formModel.data.printer_id,
            });
            if (success) {
                Message.success('标签打印指令已发送，请查看是否打印成功');
                formModel.visible = false;
            } else {
                Message.warning(message)
            }
            formModel.loading = false;
        }
    });
};

/** 取消 */
const onFormClosed = () => {
    formModel.data = formInitial();
    formRef.value?.resetFields();
    IngredientStoreAuxStore.$patch((state) => {
        state.ingredientPrintData = {};
        state.ingredientPrintVisible = false;
    });
};

/** 监听操作类型 */
watch(() => IngredientStoreAuxStore.ingredientPrintData, (data) => {
    const object = JSON.parse(JSON.stringify(data));
    formModel.checked = object;
}, {
    deep: true
});
watch(() => IngredientStoreAuxStore.ingredientPrintVisible, (boolean) => {
    if (boolean) {
        formModel.visible = true;
        onApiPrinterDeviceList();
    }
});
</script>

<style lang="scss" scoped></style>