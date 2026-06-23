<template>
    <div class="preview">
        <ElImage fit="cover" :src="previewModel.cover" @click="onPreview">
            <template #placeholder>
                <img class="cover" src="@/assets/image/10021.png" />
            </template>
            <template #error>
                <img class="cover" src="@/assets/image/10021.png" />
            </template>
        </ElImage>
    </div>
    <IImagePreview v-model="previewModel.visible" :index="previewModel.index" :data="previewModel.data"
        @close="previewModel.visible = false;">
    </IImagePreview>
</template>

<script lang="ts" setup>
    import { reactive, watch } from 'vue'
    const props = defineProps({
        image: {
            type: String,
            default: '',
        },
        index: {
            type: Number,
            default: 0,
        }
    });

    const previewModel = reactive<{
        visible: boolean,
        index: number,
        data: string[]
        cover: string,
    }>({
        visible: false,
        index: 0,
        data: [],
        cover: '',
    });

    const onPreview = () => {
        if (previewModel.cover) {
            previewModel.index = 0;
            previewModel.data = previewModel.data;
            previewModel.visible = true;
        }
    };

    watch(() => props.image, (value: string) => {
        if (value) {
            const images = value.split(',');
            previewModel.data = images;
            previewModel.cover = images[0];
        }
    }, {
        immediate: true,
    });
</script>

<style lang="scss" scoped>
    .preview {
        .cover {
            width: 100%;
            height: 100%;
            cursor: default;
        }
    }
</style>