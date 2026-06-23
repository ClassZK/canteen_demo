<template>
    <ElDialog width="800px" :title="`${importModel.name}导入`" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="importModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onClosed">
        <IImport :type="importModel.type" :name="importModel.name" @success="onSuccess"></IImport>
    </ElDialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import { useUserAuxStore } from '../aux_modules/store';
import { OperationTypeEnum } from '@/global/const';

const UserAuxStore = useUserAuxStore();

/** 交互反馈数据 */
const importModel = reactive({
    visible: false,
    loading: false,
    type: 'canteenStaff',
    name: '管理员管理'
});

const onSuccess = () => {
    UserAuxStore.$patch((state) => {
        state.refresh = new Date().getTime();
    });
    importModel.visible = false;
}

/** 取消 */
const onClosed = () => {
    UserAuxStore.$patch((state) => {
        state.data = {};
        state.OperationType = OperationTypeEnum.default;
    });
};

/** 监听操作类型 */
watch(() => UserAuxStore.OperationType, (type) => {
    if (type === OperationTypeEnum.import) {
        importModel.visible = true;
    }
});
</script>

<style lang="scss" scoped></style>