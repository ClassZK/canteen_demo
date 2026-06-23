<template>
  <div class="upload-container">
    <ul class="upload-list">
      <li v-for="(item, index) of fileModel.data" :key="index">
        <div class="file-item">
          <div class="file-info">
            <ElIcon class="file-icon"><Document /></ElIcon>
            <span class="file-name">{{ getFileName(item) }}</span>
          </div>
          <template v-if="!props.disabled">
            <ElIcon class="close" @click="onFileDelete(index)"><Close /></ElIcon>
          </template>
        </div>
      </li>
      <li class="plus" v-if="uploadModel.visible">
        <ElUpload
          ref="uploadFileRef"
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
      <div class="upload-tip">可上传{{ props.limit }}个文件，且每个文件在{{ props.size }}MB以内。</div>
    </template>
    <template v-if="props.disabled && uploadModel.total === 0">
      <div class="upload-tip">无{{ props.tip }}</div>
    </template>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import type { UploadProps } from "element-plus";
import _ from "tddev/utils";
import Storage from "tddev/storage";
import _utils from "@/utils/index";
import { Message, ResponseCodeEnum } from "@/global/const";
import { UploadBaseURL } from "@/api/admin";
import { Document, Plus, Close } from "@element-plus/icons-vue";
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
    default: 5,
  },
  multiple: {
    type: Boolean,
    default: false,
  },
  tip: {
    type: String,
    default: "文件",
  },
});

const emits = defineEmits(["success"]);

const uploadFileRef = ref(null);
const uploadModel = reactive({
  visible: false,
  loading: false,
  disabled: false,
  action: UploadBaseURL,
  accept: [..._utils.documentType, ..._utils.imageType].join(","),
  method: "POST",
  headers: {
    Authorization: Storage.get("token"),
    "X-UDID": Storage.get("browerId"),
    "X-APPID": _.getEnv("appID"),
    "X-TIMESTAMP": _utils.xTimestamp(),
  },
  total: 0,
});

const fileModel = reactive<{
  data: string[];
}>({
  data: [],
});

const onIs = () => {
  uploadModel.visible = !props.disabled && uploadModel.total < props.limit;
  uploadModel.disabled = uploadModel.loading || uploadModel.total === props.limit;
};

const onFileDelete = (index: number) => {
  fileModel.data.splice(index, 1);
  uploadEmits();
};

const getFileName = (url: string) => {
  // 从URL中提取文件名
  const path = new URL(url).pathname;
  return path.substring(path.lastIndexOf("/") + 1);
};

const uploadBefore: UploadProps["beforeUpload"] = async rawFile => {
  uploadModel.loading = true;
  const suffixIndex = rawFile.name.lastIndexOf(".");
  const suffix = rawFile.name.slice(suffixIndex).toLocaleLowerCase();
  if (!uploadModel.accept.includes(suffix)) {
    Message.warning("仅支持上传文档文件");
    uploadModel.loading = false;
    return false;
  }
  if (rawFile.size / 1024 / 1024 > props.size) {
    Message.warning(`仅支持上传 ${props.size}MB 以内的文件`);
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
    fileModel.data.push(data.url);
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
  const list = fileModel.data;
  uploadModel.total = list.length;
  let value = "";
  if (uploadModel.total > 0) {
    value = list.join(",");
  }
  emits("success", value);
};

const uploadFilter = () => {
  let list: string[] = [];
  if (props.data) {
    list = props.data.split(",");
  }
  fileModel.data = list;
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
$width: 200px;
$height: 60px;

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
      width: 100%;
      height: $height;
      margin: var(--gap-md);
      border: 1px solid var(--bd-color-md);
      border-radius: var(--radius-lg);
      box-sizing: border-box;
      cursor: pointer;

      .file-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        height: inherit;
        padding: 0 var(--gap-md);
        box-sizing: border-box;
      }

      .file-info {
        display: flex;
        align-items: center;
        max-width: calc(100% - 40px);

        .file-icon {
          margin-right: var(--gap-sm);
          color: var(--el-color-primary);
          font-size: var(--font-size-xl);
        }

        .file-name {
          white-space: nowrap;
          height: 16px;
          width: calc(100% - 24px);
          text-overflow: ellipsis;
          color: var(--font-color-md);
          font-size: var(--font-size-sm);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }

      .close {
        padding: var(--gap-sm);
        color: var(--font-color-md);
        font-size: var(--font-size-lg);
        font-weight: bold;
        transition: all 0.3s;

        &:hover {
          color: var(--el-color-primary);
        }
      }
    }
    .plus {
      width: $width;
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
