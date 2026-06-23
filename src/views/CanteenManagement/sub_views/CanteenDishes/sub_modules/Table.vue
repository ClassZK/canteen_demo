<template>
  <div class="layout-table dishes-library" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container dishes-query">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <IPlatformOrgFilter></IPlatformOrgFilter>
          <ElFormItem label="菜品名称" prop="name">
            <ElInput v-model="tableModel.query.name" maxlength="30" show-word-limit clearable placeholder="菜品名称"></ElInput>
          </ElFormItem>
          <ElFormItem label="菜品分类" prop="category">
            <ElSelect v-model="tableModel.query.category" filterable clearable placeholder="菜品分类">
              <ElOption v-for="item of DishesTypeList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onTableUpdate()">新增</ElButton>
      </div>
    </div>
    <div class="table-container dishes-table">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="菜品名称" prop="name" min-width="320" align="left" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="菜品分类" prop="category" width="220" align="left" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableDishesTypeFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="160" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
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
import { useCanteenDishesAuxStore } from "../aux_modules/store";
import { Message, DishesTypeList } from "@/global/const";
import _utils from "@/utils/index";
import { apiDishesTypeList, apiDishesTypeDelete } from "@/api/recipe";

const Router = useRouter();
const CanteenDishesAuxStore = useCanteenDishesAuxStore();
const formRef = ref();

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  name: "",
  category: "",
});

const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
}>({
  vLoading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [],
});

const CanteenDishesQuery = Storage.get("CanteenDishesQuery") ?? {};
if (CanteenDishesQuery && Reflect.ownKeys(CanteenDishesQuery).length > 0) {
  tableModel.query = CanteenDishesQuery;
  tableModel.query.category = Array.isArray(tableModel.query.category)
    ? tableModel.query.category[0] || ""
    : tableModel.query.category || "";
  Storage.remove("CanteenDishesQuery");
}

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiDishesTypeList(tableModel.query);
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
  tableModel.query = tableQueryInitial();
  formRef.value?.resetFields();
  onTableSearch();
};

const onTableDishesTypeFilter = (data: Obj) => {
  if (!data.category) return "";
  return String(data.category)
    .split(",")
    .map((value: string | number) => DishesTypeList[value]?.name)
    .filter(Boolean)
    .join(",");
};

const onTableUpdate = (data?: Obj) => {
  if (data && Reflect.ownKeys(data).length > 0) {
    Storage.set("CanteenDishesDetail", data);
  }
  Storage.set("CanteenDishesQuery", tableModel.query);
  Router.push({ name: "canteenDishesUpdate" });
};

const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除菜品 ${data.name} 吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiDishesTypeDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`菜品 ${data.name} 删除成功`);
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
  () => CanteenDishesAuxStore.refresh,
  () => {
    onTableRequest();
  },
);
</script>

<style lang="scss" scoped>
.dishes-library {
  padding: 16px 18px 12px;

  .dishes-query {
    align-items: center;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--bd-color-md);
  }

  .query-left {
    min-width: 0;
  }

  :deep(.el-form) {
    gap: 12px 24px;
  }

  :deep(.el-form-item) {
    margin-bottom: 0;
    padding-right: 0;
  }

  :deep(.el-form-item__label) {
    height: 36px;
    padding-right: 10px;
    color: var(--font-color-md);
    font-weight: 500;
    line-height: 36px;
  }

  :deep(.el-input),
  :deep(.el-select) {
    width: 240px;
  }

  .query-right {
    gap: 12px;
    align-items: center;

    :deep(.el-button) {
      min-width: 80px;
      height: 36px;
      margin: 0;
      font-weight: 500;
    }
  }

  .dishes-table {
    padding-top: 12px;
  }

  .handle {
    display: flex;
    justify-content: center;
    gap: 12px;

    :deep(.el-button) {
      margin: 0;
    }
  }
}

@media (max-width: 960px) {
  .dishes-library {
    .dishes-query {
      align-items: flex-start;
      flex-direction: column;
      gap: 12px;
    }

    .query-right {
      align-self: flex-end;
    }
  }
}
</style>
