<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食材名称" prop="keyword">
            <ElInput
              v-model="tableModel.query.keyword"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食材名称"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="食材编号" prop="pro_no">
            <ElInput
              v-model.trim="tableModel.query.pro_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食材编号"
            ></ElInput>
          </ElFormItem>
          <!-- <ElFormItem label="供应商" prop="supplier_id">
                        <ElInput v-model="tableModel.query.supplier_id" maxlength="30" show-word-limit clearable
                            placeholder="供应商"></ElInput>
                    </ElFormItem> -->
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="query-container">
      <div class="query-left">
        <!-- <p class="checked">已选中<span>{{ tableModel.selection.length }}</span>项</p>
                <ElButton :loading="tableModel.eLoading" :disabled="tableModel.selection.length === 0" @click="onTableExport">导出</ElButton> -->
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableCheck"> 批量盘点</ElButton>
        <ElButton type="primary" @click="onTableIn">批量入库</ElButton>
        <ElButton type="warning" @click="onTableOut">批量出库</ElButton>
        <ElButton type="warning" @click="onTableScanOut">扫码出库</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data" @selection-change="onTableSelectionChange">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><!-- <ElTableColumn fixed type="selection" align="center" width="55"></ElTableColumn> -->
        <ElTableColumn label="食材名称" prop="pro_name" min-width="260" show-overflow-tooltip>
          <template #default="scope">
            <div class="preview-name">
              <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
              <p class="name ellipsis">{{ scope.row.pro_name }}</p>
            </div>
          </template>
        </ElTableColumn>
        <ElTableColumn label="食材编号" prop="pro_no" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="食材类型"
          prop="pro_type_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="规格"
          prop="specification"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="库存数量" prop="_count" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="供应商"
          prop="supplier_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="保质期(天)"
          prop="expired_day"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableDetail(scope.row)">批次</ElButton>
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
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useRouter } from "vue-router";
import Storage from "tddev/storage";
import { useIngredientStoreAuxStore } from "../aux_modules/store";
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiWarehouseInventoryList } from "@/api/warehouse";

const Router = useRouter();
const formRef = ref();
const IngredientStoreAuxStore = useIngredientStoreAuxStore();

/** 输入数据 函数方式 */
const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  keyword: "",
  pro_no: "",
  type_id: "",
  supplier_id: "",
});
/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  eLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
  selection: Obj[];
}>({
  vLoading: false,
  eLoading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [],
  selection: [],
});

const IngredientQuery = Storage.get("IngredientQuery") ?? {};
if (IngredientQuery && Reflect.ownKeys(IngredientQuery).length > 0) {
  tableModel.query = IngredientQuery;
  Storage.remove("IngredientQuery");
}

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiWarehouseInventoryList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      item._count = item.count > 0 ? _utils.KtoJ(item.count, item.measure_type) + item.unit : "-";
      return item;
    });
    tableModel.total = data.total;
  } else {
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
/** 查询 */
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = () => {
  tableModel.query = tableQueryInitial();
  formRef.value?.resetFields();
  onTableSearch();
};
/** 入库 */
const onTableIn = () => {
  Storage.set("IngredientQuery", tableModel.query);
  Router.push({ name: "ingredientIn" });
};
/** 出库 */
const onTableOut = () => {
  Storage.set("IngredientQuery", tableModel.query);
  Router.push({ name: "ingredientOut" });
};
/** 扫码出库 */
const onTableScanOut = () => {
  Storage.set("IngredientQuery", tableModel.query);
  Router.push({ name: "ingredientScanOut" });
};
/** 盘点 */
const onTableCheck = () => {
  Storage.set("IngredientQuery", tableModel.query);
  Router.push({ name: "ingredientCheck" });
};
/** 详情 */
const onTableDetail = (data: Obj) => {
  Storage.set("IngredientQuery", tableModel.query);
  Storage.set("IngredientDetail", data);
  Router.push({ name: "ingredientDetail" });
};
const onTableSelectionChange = (array: any) => {
  tableModel.selection = array;
};
/** 导出 */
const onTableExport = async () => {
  /** 有选择导出选择 */
  tableModel.eLoading = true;
  // const ids = tableModel.selection.map((item: Obj) => item.id);
  // const { success, data, message } = await apiXxxxxExport({
  //     admin_ids: ids
  // });
  // if (success) {
  //     const { file } = data;
  //     _utils.aTagDownload(file, '库存管理');
  // } else {
  //     Message.warning(message);
  // }
  tableModel.eLoading = false;
};

watch(
  () => IngredientStoreAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
