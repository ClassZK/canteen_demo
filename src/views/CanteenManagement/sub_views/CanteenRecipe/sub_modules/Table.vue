<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="食谱名称" prop="recipe_name">
            <ElInput
              v-model="tableModel.query.recipe_name"
              maxlength="10"
              show-word-limit
              clearable
              placeholder="食谱名称"
            ></ElInput>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="配餐对象" prop="object_name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="食谱名称" prop="recipe_name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="食谱时间" prop="recipe_time" min-width="200" align="center" show-overflow-tooltip>
          <template #default="scope">{{ scope.row.date_start }} 至 {{ scope.row.date_end }}</template>
        </ElTableColumn>
        <ElTableColumn label="年龄范围" prop="age_range" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="创建人" prop="creator" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="创建时间" prop="create_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="180" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { useCanteenRecipeAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiCateringObjectListAll, apiRecipeList, apiRecipeDelete } from "@/api/recipe";

const CanteenRecipeAuxStore = useCanteenRecipeAuxStore();
const Router = useRouter();
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
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
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

const resolveCateringObject = async (data: Obj = {}) => {
  const id = data.catering_objects_id || data.object_id || data.uid || "";
  if (id) return { id, name: data.object_name, meal_types: data.meal_types };

  const { success, data: result } = await apiCateringObjectListAll();
  const list = success ? _utils.getDefaultArray(result.list) : [];
  const matched = list.find((item: Obj) => item.object_name === data.object_name) || list[0] || {};
  return {
    id: matched.id || "",
    name: matched.object_name || data.object_name || "",
    meal_types: data.meal_types || matched.meal_types || "",
  };
};

const onTableAdd = () => {
  Storage.remove("RecipeWeekData");
  Router.push({ name: "recipeWeek" });
};
const onTableUpdate = async (data: Obj) => {
  const object = await resolveCateringObject(data);
  Storage.set("RecipeWeekData", {
    id: data.id,
    uid: object.id,
    uname: object.name,
    meal_types: object.meal_types,
  });
  Router.push({ name: "recipeWeekUpdate" });
};
const onTableDetail = (data: Obj) => {
  CanteenRecipeAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.detail;
  });
};
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除食谱 ${data.recipe_name} 吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiRecipeDelete({ id: data.id });
        if (success) {
          done();
          onTableRequest();
          Message.success(`食谱 ${data.recipe_name} 删除成功`);
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

watch(
  () => CanteenRecipeAuxStore.refresh,
  () => {
    onTableRequest();
  },
);
</script>

<style lang="scss" scoped></style>
