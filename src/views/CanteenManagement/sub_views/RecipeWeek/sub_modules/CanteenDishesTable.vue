<template>
  <ElDialog
    v-model="tableModel.visible"
    width="1200px"
    :title="tableModel.title"
    class="dialog-container dialog-table"
    modal-class="dialog-overlay-custom"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @opened="onDetailOpened"
    @closed="onDetailClosed"
  >
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
      <div class="query-container">
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
        </div>
      </div>
      <div class="table-container">
        <ElTable
          ref="tableRef"
          height="100%"
          scrollbar-always-on
          row-key="id"
          :data="tableModel.data"
          @selection-change="onTableSelectionChange"
          @row-click="onTableRowClick"
        >
          <IPlatformOrgColumn></IPlatformOrgColumn>
          <ElTableColumn fixed type="selection" reserve-selection align="center" width="55"></ElTableColumn>
          <ElTableColumn label="菜品名称" prop="name" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
          <ElTableColumn label="菜品分类" prop="category" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ onTableDishesTypeFilter(scope.row) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="价格" prop="price" min-width="160" align="center">
            <template #default="scope">
              <ElInputNumber
                v-model="scope.row._recipe_price"
                :min="0"
                :precision="2"
                :step="1"
                controls-position="right"
                @click.stop
              ></ElInputNumber>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
      <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size" @change="onTablePage"></IPage>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="tableModel.visible = false">取消</ElButton>
        <ElButton type="primary" @click="onConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, nextTick } from "vue";
import { useRecipeWeekAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, DishesTypeList, MealtimeList } from "@/global/const";
import _utils from "@/utils/index";
import { apiDishesTypeList } from "@/api/recipe";

const RecipeWeekAuxStore = useRecipeWeekAuxStore();
const formRef = ref();
const tableRef = ref();

const tableDishesProps: Obj = {
  index: 0,
  data: [],
};

const tableModel = reactive<{
  visible: boolean;
  vLoading: boolean;
  title: string;
  query: Obj;
  total: number;
  data: Obj[];
  selection: Obj[];
}>({
  visible: false,
  vLoading: false,
  title: "",
  query: {
    page: 1,
    size: 20,
    name: "",
    category: "",
  },
  total: 0,
  data: [],
  selection: [],
});

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiDishesTypeList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list).map((item: Obj) => ({
      ...item,
      _recipe_price: getDefaultRecipePrice(item),
    }));
    tableModel.total = data.total;
    onTableSelectionFilter();
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};

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
  tableModel.query.name = "";
  tableModel.query.category = "";
  formRef.value?.resetFields();
  onTableSearch();
};

const onTableSelectionChange = (array: Obj[]) => {
  tableModel.selection = array;
};

const onTableRowClick = (row: Obj, column: Obj) => {
  if (column?.property === "price") return;
  tableRef.value?.toggleRowSelection(row);
};

const onTableDishesTypeFilter = (data: Obj) => {
  if (!data.category) return "";
  return String(data.category)
    .split(",")
    .map((value: string | number) => DishesTypeList[value]?.name)
    .filter(Boolean)
    .join(",");
};

const getDefaultRecipePrice = (item: Obj) => {
  const old = tableDishesProps.data.find((el: Obj) => el.id === item.id);
  return old?.price ?? _utils.FtoY(item.suggested_selling_price || item.price || 0);
};

const onTableSelectionFilter = async () => {
  await nextTick();
  for (const row of tableModel.data) {
    const checked = tableDishesProps.data.some((item: Obj) => item.id === row.id);
    tableRef.value?.toggleRowSelection(row, checked);
  }
};

const onDetailOpened = () => {
  const { date, week, mealtime } = RecipeWeekAuxStore.weekChecked;
  if (date && mealtime !== undefined && mealtime !== "") {
    const mealName = MealtimeList[mealtime]?.name || MealtimeList.find?.((item: Obj) => item.value === mealtime)?.name || "";
    tableModel.title = `${date} ${week} ${mealName}`;
    const weekData = JSON.parse(JSON.stringify(RecipeWeekAuxStore.weekData));
    const object = weekData[date]?.mealtimes?.find((item: Obj) => item.value === mealtime);
    tableDishesProps.index = 0;
    tableDishesProps.data = _utils.getDefaultArray(object?.data);
    onTableSearch();
  }
  tableModel.vLoading = false;
};

const onDetailClosed = () => {
  formRef.value?.resetFields();
  tableModel.title = "";
  tableModel.query.page = 1;
  tableModel.query.name = "";
  tableModel.query.category = "";
  tableModel.data = [];
  tableModel.selection = [];
  RecipeWeekAuxStore.$patch(state => {
    state.weekChecked = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

const onConfirm = () => {
  if (tableModel.selection.length === 0) {
    Message.warning("请选择菜品");
    return;
  }

  const { date, mealtime } = RecipeWeekAuxStore.weekChecked;
  const weekData = JSON.parse(JSON.stringify(RecipeWeekAuxStore.weekData));
  const dataDate = weekData[date];
  const object = dataDate.mealtimes.find((item: Obj) => item.value === mealtime);
  const oldData = _utils.getDefaultArray(object.data);
  object.data = tableModel.selection.map((item: Obj) => {
    const old = oldData.find((el: Obj) => el.id === item.id);
    return {
      ...item,
      name: item.name || item.dish_name,
      price: item._recipe_price ?? old?.price ?? _utils.FtoY(item.suggested_selling_price || item.price || 0),
    };
  });
  RecipeWeekAuxStore.$patch(state => {
    state.weekData = weekData;
  });
  tableModel.visible = false;
};

watch(
  () => RecipeWeekAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.handle) {
      tableModel.visible = true;
      tableModel.vLoading = true;
    }
  }
);
</script>
