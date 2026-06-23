<template>
  <div class="upload-container">
    <ul class="upload-list">
      <li v-for="(item, index) of imageModel.data">
        <ElImage fit="cover" :src="item" @click="onPreviewClick(index)"></ElImage>
        <template v-if="!props.disabled">
          <ElIcon class="close" @click="onImageDelete(index)"><Close /></ElIcon>
        </template>
      </li>
      <li class="plus" v-if="uploadModel.visible">
        <ElUpload
          ref="uploadImageRef"
          :action="uploadModel.action"
          :headers="uploadModel.headers"
          :method="uploadModel.method"
          :accept="uploadModel.accept"
          :multiple="props.multiple"
          :show-file-list="false"
          :disabled="uploadModel.disabled"
          :before-upload="uploadBefore"
          :http-request="mockUpload"
          :on-success="uploadSuccess"
          :on-error="uploadError"
        >
          <template #trigger>
            <ElButton :loading="uploadModel.loading" :disabled="uploadModel.disabled">
              <template v-if="!uploadModel.loading">
                <ElIcon><Plus /></ElIcon>
              </template>
            </ElButton>
          </template>
        </ElUpload>
      </li>
    </ul>
    <template v-if="!props.disabled">
      <div class="upload-tip">可上传{{ props.limit }}张图片，且每张图片在{{ props.size }}MB以内。</div>
    </template>
    <template v-if="props.disabled && uploadModel.total === 0">
      <div class="upload-tip">无{{ props.tip }}</div>
    </template>
  </div>
  <IImagePreview
    v-model="imageModel.visible"
    :index="imageModel.index"
    :data="imageModel.data"
    @close="imageModel.visible = false"
  >
  </IImagePreview>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import type { UploadProps } from "element-plus";
import _ from "tddev/utils";
import Storage from "tddev/storage";
import _utils from "@/utils/index";
import { Message, ResponseCodeEnum } from "@/global/const";
import { UploadBaseURL } from "@/api/admin";
import { localUploadResponse } from "@/mock/localApi";

const props = defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  data: {
    type: String,
    default: "",
  },
  size: {
    type: Number,
    default: 10,
  },
  limit: {
    type: Number,
    default: 9,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: "图片",
  },
});

const emits = defineEmits(["success"]);

const uploadImageRef = ref(null);
const uploadModel = reactive({
  visible: false,
  loading: false,
  disabled: false,
  action: UploadBaseURL,
  accept: _utils.imageType.join(","),
  method: "POST",
  headers: {
    Authorization: Storage.get("token"),
    "X-UDID": Storage.get("browerId"),
    "X-APPID": _.getEnv("appID"),
    "X-TIMESTAMP": _utils.xTimestamp(),
  },
  total: 0,
});

const imageModel = reactive<{
  visible: boolean;
  index: number;
  data: string[];
}>({
  visible: false,
  index: 0,
  data: [],
});

const onIs = () => {
  uploadModel.visible = !props.disabled && uploadModel.total < props.limit;
  uploadModel.disabled = uploadModel.loading || uploadModel.total === props.limit;
};

const onImageDelete = (index: number) => {
  imageModel.data.splice(index, 1);
  uploadEmits();
};

const onPreviewClick = (index: number) => {
  imageModel.index = index;
  imageModel.visible = true;
};

const uploadBefore: UploadProps["beforeUpload"] = async rawFile => {
  uploadModel.loading = true;
  const suffixIndex = rawFile.name.lastIndexOf(".");
  const suffix = rawFile.name.slice(suffixIndex).toLocaleLowerCase();
  if (!uploadModel.accept.includes(suffix)) {
    Message.warning("仅支持上传图片");
    uploadModel.loading = false;
    return false;
  }
  if (rawFile.size / 1024 / 1024 > props.size) {
    Message.warning(`仅支持上传 ${props.size}MB 以内的图片`);
    uploadModel.loading = false;
    return false;
  }
  return true;
};

const mockUpload: UploadProps["httpRequest"] = async options => {
  uploadSuccess(localUploadResponse(options.file.name), options.file as any, [] as any);
  return localUploadResponse(options.file.name) as any;
};

const uploadSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  const { code, data } = response;
  if (code === ResponseCodeEnum.success) {
    imageModel.data.push(data.url);
    uploadEmits();
  } else {
    Message.warning("上传失败");
  }
  uploadModel.loading = false;
};

const uploadError: UploadProps["onError"] = () => {
  uploadModel.loading = false;
  Message.warning("上传失败");
};

const uploadEmits = () => {
  const list = imageModel.data;
  uploadModel.total = list.length;
  let value = "";
  if (uploadModel.total > 0) {
    value = list.join(",");
  }
  emits("success", value);
};

const uploadFilter = () => {
  console.log("uploadFilter", props.data);

  let list: string[] = [];
  if (props.data) {
    list = props.data.split(",");
  }
  imageModel.data = list;
  uploadModel.total = list.length;
};

watch(
  () => props.data,
  () => {
    uploadFilter();
    onIs();
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
$width: 80px;
$height: 80px;

.upload-container {
  position: relative;
  width: 100%;
  line-height: var(--line-height);

  .upload-list {
    display: flex;
    flex-wrap: wrap;

    li {
      overflow: hidden;
      position: relative;
      width: $width;
      height: $height;
      margin: var(--gap-md);
      border: 1px solid var(--bd-color-md);
      border-radius: var(--radius-lg);
      box-sizing: border-box;
      cursor: pointer;

      .el-image {
        width: inherit;
        height: inherit;
      }

      .close {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1;
        padding: var(--gap-md);
        background: var(--bg-color-xs);
        color: var(--font-color-md);
        font-size: var(--font-size-lg);
        font-weight: bold;
        border-radius: 0 var(--radius-md) 0 var(--radius-md);
        transition: all 0.3s;
        box-shadow: 0 0 2px var(--bg-color-xl);

        &:hover {
          color: var(--el-color-white);
          background: var(--el-color-primary);
        }
      }
    }
    .plus {
      border-style: dashed;
      .el-button {
        width: $width;
        height: $height;
        padding: 0;
        border: none;
        font-size: 28px;
        border-radius: var(--radius-lg);
      }
    }
  }

  .upload-tip {
    color: var(--font-color-sm);
    line-height: var(--line-height-md);
  }
}
</style>
