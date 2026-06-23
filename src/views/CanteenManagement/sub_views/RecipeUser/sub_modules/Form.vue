<template>
    <ElDialog width="1000px" :title="`配餐对象${formModel.OperationTypeName}`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container">
            <ElForm ref="formRef" :model="formModel.data" :rules="formRules" scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol :span="12">
                        <ElFormItem label="配餐对象" prop="object_name">
                            <ElInput v-model="formModel.data.object_name" maxlength="30" show-word-limit clearable placeholder="请输入配餐对象"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="年龄范围" prop="age_range">
                            <ElInput v-model="formModel.data.age_range" maxlength="50" show-word-limit clearable placeholder="请输入年龄范围"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="用餐餐次" prop="meal_types">
                            <ElSelect v-model="formModel.data._meal_types" multiple filterable clearable placeholder="用餐餐次" @change="onMealtimeChange">
                                <ElOption v-for="item of MealtimeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
                            </ElSelect>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElForm>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="formModel.visible = false;">取消</ElButton>
                <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import { useRecipeUserAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message, MealtimeList } from '@/global/const';
import { apiCateringObjectUpdate } from "@/api/recipe";

const RecipeUserAuxStore = useRecipeUserAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
    object_name: '',
    age_range: '',
    meal_types: '',
    _meal_types: [],
});
/** 交互反馈数据 */
const formModel = reactive<{
    visible: boolean;
    loading: boolean;
    OperationTypeName: string;
    data: Obj;
}>({
    visible: false,
    loading: false,
    OperationTypeName: '',
    data: formInitial(),
});
const formRules = {
    object_name: [
        { required: true, message: '请输入配餐对象', trigger: ['change', 'blur'] }
    ],
    age_range: [
        { required: true, message: '请输入年龄范围', trigger: ['change', 'blur'] }
    ],
    meal_types: [
        { required: true, message: '请选择用餐餐次', trigger: ['change', 'blur'] }
    ],
}

const onMealtimeChange = (data: []) => {
    formModel.data.meal_types = data.join(',');
};

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            const { success, message } = await apiCateringObjectUpdate(formModel.data);
            if (success) {
                /** 操作成功刷新页面数据 */
                Message.success(`${formModel.data.object_name} ${formModel.OperationTypeName}成功`);
                RecipeUserAuxStore.$patch((state) => {
                    state.refresh = new Date().getTime();
                });
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
    RecipeUserAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

/** 监听操作类型 */
watch(() => RecipeUserAuxStore.OperationType, (type) => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type)) {
        formModel.visible = true;
        formModel.OperationTypeName = OperationTypeName[type];

        /** 回显数据 */
        if (type === OperationTypeEnum.update) {
            formModel.data = JSON.parse(JSON.stringify(RecipeUserAuxStore.data));
            formModel.data._meal_types = formModel.data.meal_types ? formModel.data.meal_types.split(',') : [];
        }
    }
});
</script>

<style lang="scss" scoped></style>