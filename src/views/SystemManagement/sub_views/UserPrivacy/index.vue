<template>
    <IFillHeader></IFillHeader>
    <div class="agreement-privacy" v-loading="formModel.vLoading" element-loading-text="数据加载中">
        <ElInput class="content" v-model="formModel.content" type="textarea" resize="none" readonly placeholder=" "></ElInput>
    </div>
</template>

<script lang="ts" setup>
    import { reactive, onMounted } from 'vue'
    import { Message } from '@/global/const';
    import { apiConfigInfo } from '@/api/admin';

    /** 交互反馈数据 */
    const formModel = reactive({
        vLoading: false,
        key: 'UserPrivacy',
        content: ''
    });

    /** 请求 */
    const onFormRequest = async () => {
        formModel.vLoading = true;
        const { success, data, message } = await apiConfigInfo({
            key: formModel.key,
        });
        if (success) {
            formModel.content = data.value;
        } else {
            Message.warning(message);
        }
        formModel.vLoading = false;
    };
    onFormRequest();

    onMounted(() => {
        document.title = '隐私政策';
    });
</script>

<style lang="scss" scoped>

</style>