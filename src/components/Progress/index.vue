<template>
  <ElDialog v-model="progressData.DialogVisible" title="下载进度" width="500" @close="close" align-center>
    <el-progress
      :percentage="progressData.progress"
      :text-inside="true"
      :status="progressData.state === 'FAIL' ? 'exception' : 'success'"
      :stroke-width="15"
    />
    <div v-if="progressData.state === 'FAIL'">
      <p class="error">{{ progressData.msg || "下载失败，请重试" }}</p>
    </div>
  </ElDialog>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { useTimeout } from "vue-hooks-plus";
import { apiTaskStatus } from "@/api/warehouse";
import { Message } from "@/global/const";
import { dateFilter } from "@/utils/Dayjs";
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  fileName: {
    type: String,
    default: "导出数据",
  },
});
const emits = defineEmits(["close"]);
/** 查询任务状态 */
const progressData = reactive<Obj>({
  progress: 0,
  DialogVisible: true,
  msg: "",
  state: "success",
});
const onTaskStatus = async () => {
  const { success, data, message } = await apiTaskStatus({
    id: props.id,
  });
  if (success) {
    if (success) {
      progressData.progress = Number(data.process).toFixed(2) ?? 10;
      progressData.msg = data.message;
      progressData.state = data.status;

      if (data.status !== "FAIL" && data.status !== "SUCCESS") {
        useTimeout(() => {
          onTaskStatus();
        }, 800);
      } else {
        if (data.status === "SUCCESS" && data.process === 100) {
          progressData.progress = 100;
          progressData.msg = "";
          progressData.state = "success";
          const blob = new Blob(["纯前端导出演示数据"], { type: "text/plain;charset=utf-8" });
          const blobUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = blobUrl;
          a.download = props.fileName + dateFilter(new Date()) + Math.random().toString(36).substring(2);
          a.click();
          useTimeout(() => URL.revokeObjectURL(blobUrl), 100);
          progressData.DialogVisible = false;
          useTimeout(() => {
            emits("close");
          }, 8000);
        } else {
          progressData.state = "FAIL";
          Message.error(data.message || "下载失败");
        }
      }
    } else {
      progressData.state = "FAIL";
      progressData.msg = data.message || "导出失败";
      // Message.error(data.msg || "导出失败");
    }
  } else {
    Message.warning(message);
    progressData.state = "FAIL";
  }
};
onTaskStatus();
const close = () => {
  progressData.DialogVisible = false;
  emits("close");
};
</script>

<style scoped></style>
