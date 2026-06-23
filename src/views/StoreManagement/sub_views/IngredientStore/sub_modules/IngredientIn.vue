<template>
    <ElDialog width="1300px" :title="`自采入库${formModel.OperationTypeName}`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formRules" scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol :span="8">
                        <ElFormItem label="食材名称" prop="pro_name">
                            <ElInput v-model="formModel.data.pro_name" maxlength="30" show-word-limit clearable placeholder="请输入食材名称"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="食材类型" prop="pro_type_id">
                            <ElCascader
                                ref="cascaderCategoryRef"
                                v-model="formModel.data.pro_type_ids"
                                :options="categoryModel.data"
                                :props="CascaderCategoryProps"
                                filterable clearable
                                placeholder="请选择食材类型"
                                @change="onCascaderCategoryChange">
                            </ElCascader>
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
                                placeholder="请输入入库单价">
                            </ElInputNumber>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="入库数量" prop="count">
                            <ElInputNumber
                                v-model="formModel.data.count"
                                :min="1"
                                :max="99999999"
                                step-strictly
                                controls-position="right"
                                placeholder="请输入入库数量">
                            </ElInputNumber>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="计量单位(件,袋,包,条,瓶等)" prop="unit">
                            <ElInput v-model="formModel.data.unit" maxlength="10" show-word-limit clearable placeholder="请输入计量单位"></ElInput>
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
                                placeholder="请输入单位重量">
                            </ElInputNumber>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="规格" prop="specification">
                            <ElInput v-model="formModel.data.specification" maxlength="30" show-word-limit clearable placeholder="请输入规格"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="供应商" prop="supplier_name">
                            <ElInput v-model="formModel.data.supplier_name" maxlength="30" show-word-limit clearable placeholder="请输入供应商"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="生产时间" prop="pro_date">
                            <ElDatePicker
                                type="datetime"
                                v-model="formModel.data.pro_date"
                                :value-format="dateTimeModel.valueFormat"
                                :default-time="dateTimeModel.defaultTime"
                                :disabled-date="onDateTimeDisabled"
                                placeholder="请选择生产时间">
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
                                placeholder="请输入保质期">
                            </ElInputNumber>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="品牌" prop="pro_brand">
                            <ElInput v-model="formModel.data.pro_brand" maxlength="30" show-word-limit clearable placeholder="请输入品牌"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="8">
                        <ElFormItem label="生产厂商" prop="manufacturer">
                            <ElInput v-model="formModel.data.manufacturer" maxlength="30" show-word-limit clearable placeholder="请输入生产厂商"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="16"></ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="食材图片" prop="pro_cover">
                            <IUploadImage :limit="5" :data="formModel.data.pro_cover" @success="onUploadCoverImage"></IUploadImage>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="入库图片" prop="in_img">
                            <IUploadImage :limit="5" :data="formModel.data.in_img" @success="onUploadInImage"></IUploadImage>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="质检图片" prop="quality_img">
                            <IUploadImage :limit="5" :data="formModel.data.quality_img" @success="onUploadQualityImage"></IUploadImage>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElForm>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="formModel.visible = false;">取消</ElButton>
                <ElButton type="primary" @click="onFormConfirm">确定</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useIngredientStoreAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message } from '@/global/const';
import { dateTimeEndFilter, timestampFilter } from '@/utils/Dayjs/index';
import _utils from '@/utils';
import { apiInventoryCategoryList } from "@/api/warehouse";

const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();
const cascaderCategoryRef = ref();

const CascaderCategoryProps = {
    children: 'children',
    label: 'name',
    value: 'id',
};

/** 输入数据 函数方式 */
const formInitial = () => ({
    pro_cover: '',
    pro_name: '',
    pro_type_id: '',
    pro_type_name: '',
    pro_type_pid: '',
    pro_type_pname: '',
    pro_type_ids: undefined,
    price: undefined,
    count: undefined,
    pro_brand: '',
    supplier_name: '',
    manufacturer: '',
    specification: '',
    unit: '',
    unit_weight: undefined,
    pro_date: '',
    expired_day: undefined,
    in_img: '',
    quality_img: '',
});
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    vLoading: false,
    OperationTypeName: '',
    data: formInitial(),
});
const formRules = {
    pro_name: [
        { required: true, message: '请输入食材名称', trigger: ['change', 'blur'] }
    ],
    pro_type_id: [
        { required: true, message: '请选择食材类型', trigger: ['change', 'blur'] }
    ],
    price: [
        { required: true, message: '请输入入库单价', trigger: ['change', 'blur'] }
    ],
    count: [
        { required: true, message: '请输入入库数量', trigger: ['change', 'blur'] }
    ],
    supplier_name: [
        { required: true, message: '请输入供应商', trigger: ['change', 'blur'] }
    ],
    unit: [
        { required: true, message: '请输入计量单位', trigger: ['change', 'blur'] }
    ],
    unit_weight: [
        { required: true, message: '请输入单位重量', trigger: ['change', 'blur'] }
    ],
    pro_date: [
        { required: true, message: '请选择生产时间', trigger: ['change', 'blur'] }
    ],
    expired_day: [
        { required: true, message: '请输入保质期', trigger: ['change', 'blur'] }
    ],
};

const categoryModel = reactive<{
    query: Obj;
    data: Obj[];
}>({
    query: {
        pid: '0',
        page: 1,
        size: 99,
    },
    data: [],
});

const onApiInventoryCategoryList = async () => {
    const { success, data, message } = await apiInventoryCategoryList(categoryModel.query);
    if (success) {
        categoryModel.data = _utils.getDefaultArray(data.list);
    } else {
        Message.warning(message);
    }
};
onApiInventoryCategoryList();

const onCascaderCategoryChange = (array: []) => {
    let pro_type_id = '', pro_type_name = '';
    let pro_type_pid = '', pro_type_pname = '';
    if (Array.isArray(array) && array.length > 0) {
        const getCheckedNodes = cascaderCategoryRef.value.getCheckedNodes();
        const checked = getCheckedNodes[0];
        pro_type_id = checked.value;
        pro_type_name = checked.label;
        if (array.length > 1 && checked.parent) {
            pro_type_pid = checked.parent.value;
            pro_type_pname = checked.parent.label;
        }
    }
    formModel.data.pro_type_id = pro_type_id;
    formModel.data.pro_type_name = pro_type_name;
    formModel.data.pro_type_pid = pro_type_pid;
    formModel.data.pro_type_pname = pro_type_pname;
    formRef.value?.validateField('pro_type_id');
};

/** 时间 */
const dateTimeModel = reactive({
    valueFormat: "YYYY-MM-DD HH:mm:ss",
    defaultTime: new Date(2000, 1, 1, 0, 0, 0),
});
const onDateTimeDisabled = (time: Date) => {
    const dateTime = dateTimeEndFilter(new Date());
    const timestamp = timestampFilter(dateTime);
    return time.getTime() > timestamp;
};

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            const params = JSON.parse(JSON.stringify(formModel.data));
            params.price = _utils.YtoF(params.price);
            params.unit_weight = _utils.JtoK(params.unit_weight);
            IngredientStoreAuxStore.$patch((state) => {
                state.ingredientInData = params;
            });
            formModel.data = formInitial();
            formRef.value?.resetFields();
            formModel.visible = false;
        }
    });
};

const onUploadCoverImage = (value: string) => {
    formModel.data.pro_cover = value;
    formRef.value?.validateField('pro_cover');
};

const onUploadInImage = (value: string) => {
    formModel.data.in_img = value;
    formRef.value?.validateField('in_img');
};

const onUploadQualityImage = (value: string) => {
    formModel.data.quality_img = value;
    formRef.value?.validateField('quality_img');
};

/** 取消 */
const onFormClosed = () => {
    IngredientStoreAuxStore.$patch((state) => {
        state.OperationType = OperationTypeEnum.default;
    });
};

/** 监听操作类型 */
watch(() => IngredientStoreAuxStore.OperationType, (type) => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
        if (array.includes(type as OperationTypeEnum)) {
        formModel.visible = true;
        formModel.OperationTypeName = OperationTypeName[type];

        /** 回显数据 */
        if (type === OperationTypeEnum.update) {
            const data = JSON.parse(JSON.stringify(IngredientStoreAuxStore.ingredientInChecked));
            data.price = _utils.FtoY(data.price);
            data.unit_weight = _utils.KtoJ(data.unit_weight);
            formModel.data = data;
        }
    }
});
</script>

<style lang="scss" scoped></style>
