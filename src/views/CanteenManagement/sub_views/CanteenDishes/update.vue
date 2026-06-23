<template>
  <div class="dishes-container">
    <div class="dishes-header">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <ElButton type="primary" :loading="formModel.loading" @click="onConfirm">确定</ElButton>
    </div>
    <div class="layout-horizontal" v-loading="formModel.vLoading" element-loading-text="数据加载中">
      <div class="form-container">
        <ElForm
          ref="formRef"
          :model="formModel.data"
          :rules="formRules"
          scroll-to-error
          label-width="80px"
          label-position="top"
        >
          <ElRow :gutter="30">
            <ElCol>
              <ElFormItem label="菜品名称" prop="name">
                <ElInput
                  v-model="formModel.data.name"
                  maxlength="30"
                  show-word-limit
                  clearable
                  placeholder="请输入菜品名称"
                ></ElInput>
              </ElFormItem>
            </ElCol>
            <ElCol>
              <ElFormItem label="菜品分类" prop="category">
                <ElSelect v-model="formModel.data.category" filterable clearable placeholder="请选择菜品分类">
                  <ElOption
                    v-for="item of DishesTypeList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
          </ElRow>
        </ElForm>
      </div>
      <div class="layout-horizontal ingredient-container">
        <div class="layout-table table-source" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
          <div class="table-container">
            <div class="table-header">食材档案</div>
            <ElTable
              ref="tableRef"
              height="100%"
              scrollbar-always-on
              row-key="id"
              :data="tableModel.data"
              @selection-change="onTableSourceSelectionChange"
              @row-click="onTableSourceRowClick"
            >
              <ElTableColumn fixed type="selection" reserve-selection align="center" width="55"></ElTableColumn>
              <ElTableColumn label="食材信息" prop="name" min-width="200"> </ElTableColumn>
            </ElTable>
          </div>
          <IPage
            :total="tableModel.total"
            :page="tableModel.query.page"
            :size="tableModel.query.size"
            layout="total, prev, pager, next"
            @change="onTablePage"
          ></IPage>
        </div>
        <div class="layout-table">
          <div class="table-header">
            注：以每人/份的菜品规格为参考值的情况下，设置不同食材的用量。(能量数据由AI生成，仅供参考)
          </div>
          <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.checked">
              <ElTableColumn label="食材信息" prop="name" min-width="200" align="center"> </ElTableColumn>
              <ElTableColumn label="用量(g)" prop="quantity" min-width="150" align="center">
                <template #default="scope">
                  <ElInputNumber
                    v-model="scope.row.quantity"
                    :min="1"
                    :max="99999999"
                    step-strictly
                    controls-position="right"
                    placeholder=" "
                  ></ElInputNumber>
                </template>
              </ElTableColumn>
              <ElTableColumn label="能量(Kcal)" prop="energy" min-width="100" align="center"> </ElTableColumn>
              <ElTableColumn label="蛋白质(g)" prop="protein" min-width="100" align="center"> </ElTableColumn>
              <ElTableColumn label="脂肪(g)" prop="fat" min-width="100" align="center"> </ElTableColumn>
              <ElTableColumn label="碳水化合物(g)" prop="carbohydrate" min-width="100" align="center"> </ElTableColumn>
              <ElTableColumn label="钠(g)" prop="sodium" min-width="100" align="center"> </ElTableColumn>
              <ElTableColumn fixed="right" label="操作" width="100" align="center">
                <template #default="scope">
                  <div class="handle">
                    <ElButton type="danger" link @click="onTableDelete(scope.$index, scope.row)">删除</ElButton>
                  </div>
                </template>
              </ElTableColumn>
            </ElTable>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onBeforeUnmount, nextTick } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { Message, DishesTypeList } from "@/global/const";
import _utils from "@/utils/index";
import { apiIngredientList, apiDishesTypeUpdate, apiDishesTypeDetail } from "@/api/recipe";

const Router = useRouter();
const formRef = ref();
const tableRef = ref();
let syncingTableSelection = false;

/** 交互反馈数据 */
const formModel = reactive<{
  visible: boolean;
  loading: boolean;
  vLoading: boolean;
  OperationTypeName: string;
  data: Obj;
  checked: Obj;
}>({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: {
    name: "",
    category: "",
    suggested_selling_price: undefined,
    image: "",
    seasons: [],
    meal_types: [],
    label1: [],
    label2: [],
    instructions: "",
  },
  checked: {},
});
const formRules = {
  name: [{ required: true, message: "请输入菜品名称", trigger: ["change", "blur"] }],
  category: [{ required: true, message: "请选择菜品分类", trigger: ["change", "blur"] }],
};

/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
  checked: Obj[];
}>({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
  },
  total: 0,
  data: [],
  checked: [],
});

const getCanteenDishesDetail = async () => {
  const CanteenDishesDetail: Obj | undefined = Storage.get("CanteenDishesDetail");
  if (CanteenDishesDetail && Reflect.ownKeys(CanteenDishesDetail).length > 0) {
    formModel.vLoading = true;
    formModel.checked = CanteenDishesDetail;
    const { success, data, message } = await apiDishesTypeDetail({
      id: formModel.checked.id,
    });
    if (success) {
      formModel.data = {
        id: data.id,
        name: data.name,
        category: data.category ? data.category.split(",")[0] : "",
        suggested_selling_price: _utils.FtoY(data.suggested_selling_price),
        image: data.image,
        seasons: data.seasons ? data.seasons.split(",") : [],
        meal_types: data.meal_types ? data.meal_types.split(",") : [],
        label1: data.label1 ? data.label1.split(",") : [],
        label2: data.label2 ? data.label2.split(",") : [],
        instructions: data.instructions,
      };
      if (Array.isArray(data.ingedients)) {
        tableModel.checked = data.ingedients.map((item: Obj) => {
          item.name = item.ingredient_name;
          item.quantity = Number(item.quantity);
          return item;
        });
        onTableSelectionFilter();
      }
    } else {
      Message.warning(message);
    }
    formModel.vLoading = false;
  }
};
getCanteenDishesDetail();

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiIngredientList(tableModel.query);
  if (success) {
    syncingTableSelection = true;
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
    onTableSelectionFilter();
  } else {
    syncingTableSelection = false;
    Message.warning(message);
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

const onTableSelectionFilter = async () => {
  await nextTick();
  syncingTableSelection = true;
  for (const row of tableModel.data) {
    const checked = tableModel.checked.some(item => item.id === row.id);
    tableRef.value?.toggleRowSelection(row, checked);
  }
  await nextTick();
  syncingTableSelection = false;
};

/** 勾选食材 */
const onTableSourceSelectionChange = (selection: Obj[]) => {
  if (syncingTableSelection) return;
  const selectionIds = new Set(selection.map(item => item.id));
  const currentPageIds = new Set(tableModel.data.map(item => item.id));
  tableModel.checked = tableModel.checked.filter(item => {
    return !currentPageIds.has(item.id) || selectionIds.has(item.id);
  });
  for (const row of selection) {
    if (!tableModel.checked.some(item => item.id === row.id)) {
      tableModel.checked.push({
        ...row,
        quantity: row.quantity && Number(row.quantity) > 0 ? Number(row.quantity) : 1,
      });
    }
  }
};

const onTableSourceRowClick = (row: Obj) => {
  tableRef.value?.toggleRowSelection(row);
};

/** 删除食材 */
const onTableDelete = (index: number, data: Obj) => {
  tableModel.checked.splice(index, 1);
  const currentRow = tableModel.data.find(item => item.id === data.id);
  if (currentRow) {
    tableRef.value?.toggleRowSelection(currentRow, false);
  }
};

const onConfirm = () => {
  formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      if (tableModel.checked.length === 0) {
        Message.warning("请至少选择一个食材信息");
        formModel.loading = false;
        return;
      }
      const invalidIngredient = tableModel.checked.find(item => !Number.isFinite(Number(item.quantity)) || Number(item.quantity) <= 0);
      if (invalidIngredient) {
        Message.warning("食材用量必须大于0");
        formModel.loading = false;
        return;
      }

      const params = JSON.parse(JSON.stringify(formModel.data));
      params.list = tableModel.checked.map((item: Obj) => {
        return {
          id: item.id,
          quantity: Number(item.quantity).toString(),
        };
      });
      params.suggested_selling_price = _utils.YtoF(params.suggested_selling_price).toString();
      params.category = Array.isArray(params.category) ? params.category[0] || "" : params.category || "";
      params.seasons = Array.isArray(params.seasons) ? params.seasons.join(",") : params.seasons || "";
      params.meal_types = Array.isArray(params.meal_types) ? params.meal_types.join(",") : params.meal_types || "";
      params.label1 = Array.isArray(params.label1) ? params.label1.join(",") : params.label1 || "";
      params.label2 = Array.isArray(params.label2) ? params.label2.join(",") : params.label2 || "";
      params.instructions = params.instructions || "";
      const { success, message } = await apiDishesTypeUpdate(params);
      if (success) {
        Message.success(`菜品库${formModel.checked.id ? "编辑" : "新增"}成功`);
        onBack();
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};
const onBack = () => {
  Router.back();
};

onBeforeUnmount(() => {
  Storage.remove("CanteenDishesDetail");
});
</script>

<style lang="scss" scoped>
.dishes-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .dishes-header {
    display: flex;
    justify-content: space-between;
    flex: none;
    margin-bottom: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
  }
  .form-container {
    flex: none;
    width: 400px;
    overflow-x: hidden;
    overflow-y: auto;
    margin-right: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
  }
}
.ingredient-container {
  flex: auto;
  .layout-table {
    .ingredient {
      .preview {
        margin-right: var(--gap);
      }
    }
  }
  .table-source {
    flex: none;
    width: 300px;
    margin-right: var(--gap);
    :deep(.el-table__body) {
      cursor: pointer;
    }
  }
  .table-header {
    padding: var(--gap);
    background: var(--el-color-primary);
    color: var(--el-color-white);
    line-height: var(--line-height-sm);
  }
}
</style>
