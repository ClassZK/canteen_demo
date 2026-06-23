<template>
  <ElDialog
    width="720px"
    title="从业人员信息导入"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    v-model="importModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onClosed"
  >
    <div class="import-container">
      <ElUpload
        class="import-upload"
        :action="uploadModel.action"
        :headers="uploadModel.headers"
        :method="uploadModel.method"
        :accept="uploadModel.accept"
        :multiple="false"
        :show-file-list="false"
        :disabled="uploadModel.loading"
        :before-upload="uploadBefore"
        :on-success="uploadSuccess"
        :on-error="uploadError"
      >
        <template #trigger>
          <ElButton type="primary" :loading="uploadModel.loading">上传Excel</ElButton>
        </template>
      </ElUpload>
      <ElButton @click="onDownloadClick">下载模板</ElButton>
    </div>
  </ElDialog>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, reactive, watch } from "vue";
import { useCanteenStaffAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, ResponseCodeEnum } from "@/global/const";
import { apiCanteenStaffImport } from "@/api/recipe";
import { apiTaskStatus } from "@/api/warehouse";
import { UploadBaseURL } from "@/api/admin";
import _utils from "@/utils";
import Storage from "tddev/storage";
import _ from "tddev/utils";
import type { UploadProps } from "element-plus";

const CanteenStaffAuxStore = useCanteenStaffAuxStore();

const importModel = reactive({
  visible: false,
});

const importTaskPollInterval = 800;
let importTaskTimer: ReturnType<typeof setTimeout> | null = null;

const uploadModel = reactive({
  loading: false,
  action: UploadBaseURL,
  accept: ".xlsx,.xls",
  method: "POST",
  headers: {
    Authorization: Storage.get("token"),
    "X-UDID": Storage.get("browerId"),
    "X-APPID": _.getEnv("appID"),
    "X-TIMESTAMP": _utils.xTimestamp(),
  },
});

const uploadBefore: UploadProps["beforeUpload"] = async (file: File) => {
  uploadModel.loading = true;
  const acceptExt = uploadModel.accept.split(",").map(s => s.trim().replace(".", ""));
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (!acceptExt.includes(fileExt)) {
    Message.warning("请上传Excel文件");
    uploadModel.loading = false;
    return false;
  }
  return true;
};

const uploadSuccess: UploadProps["onSuccess"] = async response => {
  try {
    const { code, data } = response;
    if (code === ResponseCodeEnum.success && data?.url) {
      await onImportClick(data.url);
    } else {
      Message.warning("上传失败");
    }
  } finally {
    uploadModel.loading = false;
  }
};

const uploadError: UploadProps["onError"] = () => {
  uploadModel.loading = false;
  Message.warning("上传失败");
};

const onImportClick = async (url: string) => {
  try {
    const { success, data, message } = await apiCanteenStaffImport({ url });
    if (success) {
      importModel.visible = false;
      pollImportTaskStatus(data.task_id);
    } else {
      Message.warning(message || "导入失败");
    }
  } catch {
    Message.warning("导入失败");
  }
};

const refreshStaffList = () => {
  CanteenStaffAuxStore.$patch(state => {
    state.refresh = new Date().getTime();
  });
};

const clearImportTaskTimer = () => {
  if (importTaskTimer) {
    clearTimeout(importTaskTimer);
    importTaskTimer = null;
  }
};

const pollImportTaskStatus = async (taskId: string) => {
  clearImportTaskTimer();
  if (!taskId) {
    Message.warning("导入失败");
    return;
  }
  try {
    const { success, data, message } = await apiTaskStatus({ id: taskId });
    if (!success) {
      Message.warning(message || "导入失败");
      return;
    }
    if (data.status === "SUCCESS") {
      Message.success("导入成功");
      refreshStaffList();
      return;
    }
    if (data.status === "FAIL") {
      Message.warning(data.message || "导入失败");
      return;
    }
    importTaskTimer = setTimeout(() => pollImportTaskStatus(taskId), importTaskPollInterval);
  } catch {
    Message.warning("导入失败");
  }
};

const onDownloadClick = () => {
  const location = window.location.origin;
  window.open(`${location}/file/practitioners_imp_tmp.xlsx`);
};

const onClosed = () => {
  CanteenStaffAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

watch(
  () => CanteenStaffAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.import) {
      importModel.visible = true;
    }
  },
);

onBeforeUnmount(() => {
  clearImportTaskTimer();
});
</script>

<style lang="scss" scoped>
.import-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: var(--gap);
  min-height: 80px;
}
</style>
