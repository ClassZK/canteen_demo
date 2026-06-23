<template>
    <ElSelect v-model="formModel.active" filterable remote :remote-method="onRemoteMethod" :loading="formModel.loading" :clearable="props.clearable" :placeholder="props.placeholder" @change="onChange">
        <ElOption v-for="item of formModel.data" :key="item.pro_name" :label="item.pro_name" :value="item.pro_name"></ElOption>
        <template #loading>
            <div v-loading="formModel.loading"></div>
        </template>
    </ElSelect>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue';
import _utils from '@/utils/index';
import { apiWarehouseInventoryList } from '@/api/warehouse';

const emits = defineEmits(['change']);

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    clearable: {
        type: Boolean,
        default: false,
    },
    placeholder: {
        type: String,
        default: '食材名称'
    },
});

const formModel = reactive<{
    loading: boolean;
    query: Obj;
    active: string;
    data: Obj[];
}>({
    loading: false,
    query: {
        page: 1,
        size: 20,
        keyword: '',
    },
    active: '',
    data: [],
});

/** 请求 */
const onTableRequest = async () => {
    formModel.loading = true;
    const { success, data, message } = await apiWarehouseInventoryList(formModel.query);
    if (success) {
        formModel.data = _utils.getDefaultArray(data.list);
    }
    formModel.loading = false;
};

const onRemoteMethod = (value: string) => {
    if (value) {
        formModel.query.keyword = value;
        onTableRequest();
    }
};

const onChange = () => {
    emits('change', formModel.active);
};

watch(() => props.modelValue, (value) => {
    if (!value) {
        formModel.active = '';
        onChange();
    }
});
</script>

<style lang="scss" scoped>

</style>
