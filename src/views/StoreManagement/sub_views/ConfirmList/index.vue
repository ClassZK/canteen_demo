<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="供应商名称" prop="keyword">
            <ElInput
              v-model="tableModel.query.keyword"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="供应商名称"
            ></ElInput>
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
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="供应商名称" prop="shop_name" align="center" min-width="150" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="收货地址" prop="shipping_address" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="下单时间"
          prop="order_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="待提交商品数量"
          prop="goods_total"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>

        <ElTableColumn label="状态" prop="status" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <div v-if="scope.row.status === 0" class="status status-pending">待确认</div>
            <div v-else class="status status-confirm">已确认</div>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableDetail(scope.row)">去确认</ElButton>
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
import { Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiConfirmList } from "@/api/warehouse";

const Router = useRouter();
const formRef = ref();

/** 输入数据 函数方式 */
const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  keyword: "",
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
  const { success, data, message } = await apiConfirmList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);

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

/** 详情 */
const onTableDetail = (data: Obj) => {
  Router.push({ path: "/confirmListDetail", query: { id: data.order_id } });
};

</script>

<style lang="scss" scoped></style>
