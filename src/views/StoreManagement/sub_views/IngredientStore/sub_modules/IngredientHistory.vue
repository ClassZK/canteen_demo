<template>
  <ElDialog
    width="1300px"
    :title="`【${detailModel.data.pro_name}】批次历史`"
    class="dialog-container dialog-table"
    modal-class="dialog-overlay-custom"
    v-model="detailModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @open="onDetailOpen"
    @closed="onDetailClosed"
  >
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
      <div class="query-container">
        <div class="query-left"></div>
        <div class="query-right">
          <ElButton type="primary" @click="onTableSearch">查询</ElButton>
          <!-- <ElButton class="gray" @click="onTableReset">重置</ElButton> -->
        </div>
      </div>
      <div class="table-container">
        <ElTable height="100%" scrollbar-always-on :data="tableModel.data"><ElTableColumn label="食材名称" prop="pro_name" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="食材编号" prop="pro_no" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="规格"
            prop="specification"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="操作人"
            prop="user_name"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="操作人系电话" prop="user_phone" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="操作类型" prop="typeName" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn label="操作数量" prop="count" min-width="150" align="center" show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="备注"
            prop="remark"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="操作时间"
            prop="created_at"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
        </ElTable>
      </div>
      <IPage
        :total="tableModel.total"
        :page="tableModel.query.page"
        :size="tableModel.query.size"
        @change="onTablePage"
      ></IPage>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="detailModel.visible = false">取消</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useIngredientStoreAuxStore } from "../aux_modules/store";
import { Message } from "@/global/const";
import { InOutTypeObject } from "@/views/StoreManagement/aux_modules/const";
import _utils from "@/utils/index";
import { apiInventoryBatchHistoryList } from "@/api/warehouse";

const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const formRef = ref();

/** 交互反馈数据 */
const detailModel = reactive<{
  visible: boolean;
  data: Obj;
}>({
  visible: false,
  data: {},
});

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
    batch_id: "",
  },
  total: 0,
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiInventoryBatchHistoryList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      if (item.action_id) {
        const type = item.action_id.toString();
        const typeData = InOutTypeObject[type];
        item.typeName = typeData.name;
      }
      item.count = _utils.KtoJ(item.count, item.measure_type);
      return item;
    });
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};

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
  onTableRequest();
};
const onTableInOutTypeFilter = (data: Obj) => {
  if (data.action_id) {
    const type = data.action_id.toString();
    const typeData = InOutTypeObject[type];
    return typeData.name;
  }
};

const onDetailOpen = () => {
  onTableRequest();
};
/** 取消 */
const onDetailClosed = () => {
  formRef.value?.resetFields();
  tableModel.data = [];
  IngredientStoreAuxStore.$patch(state => {
    state.ingredientHistoryVisible = false;
    state.ingredientHistoryData = {};
  });
};

/** 监听操作类型 */
watch(
  () => IngredientStoreAuxStore.ingredientHistoryData,
  data => {
    const object = JSON.parse(JSON.stringify(data));
    tableModel.query.batch_id = object.id;
    detailModel.data = object;
  },
  {
    deep: true,
  }
);
watch(
  () => IngredientStoreAuxStore.ingredientHistoryVisible,
  boolean => {
    if (boolean) {
      detailModel.visible = true;
    }
  }
);
</script>

<style lang="scss" scoped></style>

