<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="姓名" prop="name">
            <ElInput
              v-model="tableModel.query.name"
              maxlength="10"
              show-word-limit
              clearable
              placeholder="姓名"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="联系电话" prop="phone">
            <ElInput
              v-model="tableModel.query.phone"
              maxlength="10"
              show-word-limit
              clearable
              placeholder="电话"
            ></ElInput>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="import-container">
      <ElUpload
        class="import-upload"
        :action="uploadModel.action"
        :headers="uploadModel.headers"
        :method="uploadModel.method"
        :accept="uploadModel.accept"
        :multiple="1"
        :show-file-list="false"
        :disabled="uploadModel.disabled"
        :before-upload="uploadBefore"
        :on-success="uploadSuccess"
        :on-error="uploadError"
      >
        <template #trigger>
          <ElButton>导入</ElButton>
        </template>
      </ElUpload>

      <ElButton type="primary" @click="onDownloadClick">下载模板</ElButton>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="姓名" prop="name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn
          label="联系电话"
          prop="phone"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="导入时间"
          prop="created_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="操作" min-width="150" align="center">
          <template #default="scope">
            <div class="operation-buttons">
              <ElButton type="danger" size="mini" @click="onDeleteClick(scope.row)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage
      :total="tableModel.total"
      :page="tableModel.query.page"
      :size="tableModel.query.size"
      @change="onTablePage"
    ></IPage>
  </div>
  <IProgress v-if="progressData.DialogVisible" :id="progressData.id" @close="onImportComplete"></IProgress>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { Message, ResponseCodeEnum } from "@/global/const";
import {
  apiCanteenStudentParentDelete,
  apiCanteenStudentParentImport,
  apiCanteenStudentParentList,
} from "@/api/recipe";
import { ElMessageBox } from "element-plus";
import { UploadBaseURL } from "@/api/admin";
import Storage from "tddev/storage";
const formRef = ref();
import _utils from "@/utils";
import _ from "tddev/utils";
import type { UploadProps } from "element-plus";
/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
}>({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
    name: "",
    phone: "",
  },
  total: 0,
  data: [],
});
const uploadModel = reactive({
  visible: false,
  loading: false,
  disabled: false,
  action: UploadBaseURL,
  accept: ".xlsx, .xls",
  method: "POST",
  headers: {
    Authorization: Storage.get("token"),
    "X-UDID": Storage.get("browerId"),
    "X-APPID": _.getEnv("appID"),
    "X-TIMESTAMP": _utils.xTimestamp(),
  },
  total: 0,
});
/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, msg } = await apiCanteenStudentParentList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(msg);
  }
  tableModel.vLoading = false;
};
onTableRequest();

/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
/** 查询 */
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = () => {
  formRef.value?.resetFields();
  onTableSearch();
};

/** 删除 */
const onDeleteClick = (row: Obj) => {
  ElMessageBox.confirm(`确定删除${row.name}吗？`, "删除", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(async () => {
    const { success, msg } = await apiCanteenStudentParentDelete({
      id: row.id,
    });
    if (success) {
      Message.success("删除成功");
      onTableSearch();
    } else {
      Message.warning(msg);
    }
  });
};
/** 导入完成 */
const onImportComplete = () => {
  progressData.DialogVisible = false;
  progressData.id = "";
  onTableSearch();
};
/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
/** 导入表格 */
const onImportClick = async (url: string) => {
  const { success, data, message } = await apiCanteenStudentParentImport({
    url,
  });
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
  } else {
    Message.warning(message);
  }
};
const uploadBefore: UploadProps["beforeUpload"] = async (file: File) => {
  uploadModel.loading = true;
  // 判断文件类型是否为表格
  const acceptExt = uploadModel.accept.split(",").map(s => s.trim().replace(".", ""));
  const fileExt = file.name.split(".").pop()?.toLowerCase() || "";
  if (!acceptExt.includes(fileExt)) {
    Message.warning("请上传Excel文件");
    uploadModel.loading = false;
    return false;
  }

  return true;
};
const uploadSuccess: UploadProps["onSuccess"] = (response, uploadFile) => {
  const { code, data } = response;
  if (code === ResponseCodeEnum.success) {
    onImportClick(data.url);
  } else {
    Message.warning("上传失败");
  }
  uploadModel.loading = false;
};
const uploadError: UploadProps["onError"] = () => {
  uploadModel.loading = false;
  Message.warning("上传失败");
};
/** 下载模板 */
const onDownloadClick = async () => {
  const location = window.location.origin;
  window.open(`${location}/file/parents_imp_tmp.xlsx`);
};

</script>

<style lang="scss" scoped>
.import-container {
  text-align: right;
  margin: 12px 0;
  .import-upload {
    display: inline-block;
    margin-right: 12px;
  }
}
</style>
