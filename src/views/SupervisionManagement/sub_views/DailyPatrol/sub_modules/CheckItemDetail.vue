<template>
    <ElDialog width="1000px" title="巡检项目详情" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="formModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="formModel.data" scroll-to-error disabled hide-required-asterisk label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol :span="12">
                        <ElFormItem label="巡检项目" prop="item">
                            <ElInput v-model="formModel.data.item" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol :span="12">
                        <ElFormItem label="巡检结果" prop="status">
                            <ElRadioGroup v-model="formModel.data.status" disabled>
                                <ElRadioButton v-for="item of CheckResultList" :label="item.name" :value="item.value" />
                            </ElRadioGroup>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="巡检内容" prop="content">
                            <ElInput v-model="formModel.data.content" type="textarea" :rows="5" resize="none" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="巡检不符合项说明" prop="not_ok_desc">
                            <ElInput v-model="formModel.data.not_ok_desc" type="textarea" :rows="5" resize="none" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="整改情况（包括整改时间、措施、完成情况等）" prop="rectification_situation">
                            <ElInput v-model="formModel.data.rectification_situation" type="textarea" :rows="5" resize="none" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
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
import { CheckResultList } from "@/global/const";
import { useDailyPatrolAuxStore } from '../aux_modules/store';
import _utils from '@/utils';

const DailyPatrolAuxStore = useDailyPatrolAuxStore();
const formRef = ref();

/** 输入数据 函数方式 */
const formInitial = () => ({
    item: '',
    status: '',
    content: '',
    not_ok_desc: '',
    rectification_situation: '',
});
/** 交互反馈数据 */
const formModel = reactive({
    visible: false,
    vLoading: false,
    OperationTypeName: '',
    data: formInitial(),
});

/** 取消 */
const onFormClosed = () => {
    formModel.data = formInitial();
    formRef.value?.resetFields();
    DailyPatrolAuxStore.$patch((state) => {
        state.checkItemDetailData = {};
        state.checkItemDetailVisible = false;
    });
};

/** 监听操作类型 */
watch(() => DailyPatrolAuxStore.checkItemDetailData, (data) => {
    const object = JSON.parse(JSON.stringify(data));
    formModel.data = object;
}, {
    deep: true
});
watch(() => DailyPatrolAuxStore.checkItemDetailVisible, (boolean) => {
    if (boolean) {
        formModel.visible = true;
    }
});
</script>

<style lang="scss" scoped></style>