<template>
  <ElImageViewer
      v-if="previewModel.visible"
      :initial-index="previewModel.index"
      :url-list="previewModel.data"
      hide-on-click-modal
      teleported
      @close="onPreviewClose">
      <template #viewer-error="{ activeIndex, src }">
        <img class="cover" src="@/assets/image/10021.png" />
      </template>
  </ElImageViewer>
</template>

<script lang="ts" setup>
  import { reactive, watch } from 'vue'

  const emits = defineEmits(['close']);
  const props = defineProps({
      modelValue: {
          type: Boolean,
          default: false
      },
      index: {
          type: Number,
          default: 0
      },
      data: {
          type: [Array, String]
      }
  });

  const previewModel = reactive({
      visible: false,
      index: 0,
      data: []
  });
  const onPreviewFilter = () => {
      previewModel.index = props.index;
      let list: any = [];
      // 判断数组还是字符串
      if (Array.isArray(props.data)) {
        list = props.data;
      } else {
        list = [props.data];
      }
      previewModel.data = list;
  };
  const onPreviewClose = () => {
      emits('close');
  };

  watch(() => props.modelValue, () => {
      previewModel.visible = props.modelValue;
      if (previewModel.visible) {
          onPreviewFilter();
          document.documentElement.classList.add('lock-scroll');
      } else {
          document.documentElement.classList.remove('lock-scroll');
      }
  });
</script>

<style lang="scss">
html {
    &.lock-scroll {
        overflow: hidden;
        width: 100vw;
        height: 100vh;
    }
}
</style>
