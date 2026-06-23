<template>
    <ElDialog width="1000px" :title="`公告${formModel.OperationTypeName}`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" disabled scroll-to-error label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol>
                        <ElFormItem label="公告标题" prop="title">
                            <ElInput v-model="formModel.data.title" maxlength="30" show-word-limit clearable placeholder="请输入公告标题"></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="公告内容" prop="content">
                            <ElInput v-model="formModel.data.content" type="textarea" :rows="5" resize="none" maxlength="200" show-word-limit placeholder="公告内容"></ElInput>
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
import { useNotificationAuxStore } from '../aux_modules/store';
import { OperationTypeEnum, OperationTypeName, Message } from '@/global/const';
import _utils from '@/utils';
import { apiNoticeUpdate, apiNoticeDetail } from '@/api/supervision';

const NotificationAuxStore = useNotificationAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
    title: '',
    content: '',
});
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    loading: false,
    vLoading: false,
    OperationTypeName: '',
    data: formInitial() as Obj,
    checked: {} as Obj,
    rules: {
        title: [
            { required: true, message: '请输入公告标题', trigger: ['change', 'blur'] }
        ],
        content: [
            { required: true, message: '请输入公告内容', trigger: ['change', 'blur'] }
        ],
    }
});

/** 确定 */
const onFormConfirm = async () => {
    await formRef.value?.validate(async (valid: boolean) => {
        if (valid) {
            Message.close();
            formModel.loading = true;
            const { success, message } = await apiNoticeUpdate(formModel.data);
            if (success) {
                Message.success(`公告 ${formModel.data.title} ${formModel.OperationTypeName}成功`);
                formModel.visible = false;
                /** 操作成功刷新页面数据 */
                NotificationAuxStore.$patch((state) => {
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
    formModel.checked = {};
    formModel.data = formInitial();
    formRef.value?.resetFields();
    NotificationAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

const onApiNoticeDetail = async () => {
    formModel.vLoading = true;
    const { success, data, message } = await apiNoticeDetail({
        id: formModel.checked.id
    });
    if (success) {
        formModel.data = data;
    } else {
        Message.warning(message);
    }
    formModel.vLoading = false;
};

/** 监听操作类型 */
watch(() => NotificationAuxStore.OperationType, (type) => {
    if (type === OperationTypeEnum.detail) {
        formModel.visible = true;
        formModel.OperationTypeName = OperationTypeName[type];

        /** 回显数据 */
        const data = JSON.parse(JSON.stringify(NotificationAuxStore.data));
        formModel.checked = data;
        onApiNoticeDetail();
    }
});
</script>

<style lang="scss" scoped></style>