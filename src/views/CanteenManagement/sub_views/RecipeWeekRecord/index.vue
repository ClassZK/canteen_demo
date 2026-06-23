<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="食谱名称" prop="recipe_name">
            <ElInput v-model="tableModel.query.recipe_name" maxlength="30" show-word-limit clearable placeholder="食谱名称"></ElInput>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="配餐对象" prop="object_name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="食谱名称" prop="recipe_name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="食谱周期" min-width="200" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.date_start }} 至 {{ scope.row.date_end }}</template>
        </ElTableColumn>
        <ElTableColumn label="状态" prop="status_name" min-width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ElTag :type="scope.row.status === 'done' ? 'success' : 'warning'">{{ scope.row.status_name || statusText(scope.row.status) }}</ElTag>
          </template>
        </ElTableColumn>
        <ElTableColumn label="创建人" prop="creator" min-width="140" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="创建时间" prop="create_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { Message } from "@/global/const";
import { apiRecipeList } from "@/api/recipe";

const router = useRouter();
const formRef = ref();

const tableModel = reactive({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
    recipe_name: "",
  },
  total: 0,
  data: [] as Obj[],
});

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiRecipeList(tableModel.query);
  if (success) {
    tableModel.data = data.list || [];
    tableModel.total = data.total || 0;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
const onTableReset = () => {
  formRef.value?.resetFields();
  onTableSearch();
};
const onTableDetail = (data: Obj) => {
  router.push({ name: "recipeWeekRecordDetail", query: { id: data.id } });
};
const statusText = (status: string) => {
  if (status === "done" || status === "已完成") return "已完成";
  return "进行中";
};
</script>
