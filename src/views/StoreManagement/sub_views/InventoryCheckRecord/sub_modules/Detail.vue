<template>
  <ElDialog
    width="1300px"
    :title="`【${detailModel.data.user_name}】盘点记录详情`"
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
          <ElButton type="primary" :style="{ '--el-button-bg-color': '#FFF' }" @click="onTableExport" plain
            >导出</ElButton
          >
          <!-- <ElButton type="primary" @click="onTableSearch">查询</ElButton> -->
          <!-- <ElButton class="gray" @click="onTableReset">重置</ElButton> -->
        </div>
      </div>
      <div class="table-container">
        <ElTable height="100%" scrollbar-always-on :data="tableModel.data"><ElTableColumn label="食材名称" prop="pro_name" min-width="260" show-overflow-tooltip>
            <template #default="scope">
              <div class="preview-name">
                <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
                <p class="name ellipsis">{{ scope.row.pro_name }}</p>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="食材编号"
            prop="pro_no"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
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
          <ElTableColumn
            label="盘点人"
            prop="out_user_name"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="联系电话"
            prop="out_user_phone"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="盘点前数量" prop="old_count" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ _utils.KtoJ(scope.row.old_count, scope.row?.measure_type) }}
            </template>
          </ElTableColumn>
          <ElTableColumn label="盘点后数量" prop="count" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ _utils.KtoJ(scope.row.count, scope.row?.measure_type) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="盘点时间"
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
  <IProgress
    v-if="progressData.DialogVisible"
    :id="progressData.id"
    :fileName="'盘点记录数据'"
    @close="progressData.DialogVisible = false"
  ></IProgress>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useInventoryCheckRecordAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiInventoryCheckList, apiInventoryCheckRecordExport } from "@/api/warehouse";

const InventoryCheckRecordAuxStore = useInventoryCheckRecordAuxStore();
const formRef = ref();

/** 交互反馈数据 */
const detailModel = reactive<{
  visible: boolean;
  data: Obj;
}>({
  visible: false,
  data: {},
});

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  check_record_id: "",
  pro_no: "",
  batch_no: "",
});
/** 交互反馈数据 */
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

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiInventoryCheckList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
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

const onDetailOpen = () => {
  onTableRequest();
};
/** 取消 */
const onDetailClosed = () => {
  tableModel.query = tableQueryInitial();
  formRef.value?.resetFields();
  tableModel.data = [];
  InventoryCheckRecordAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

/** 监听操作类型 */
watch(
  () => InventoryCheckRecordAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.detail) {
      detailModel.data = JSON.parse(JSON.stringify(InventoryCheckRecordAuxStore.data));
      tableModel.query.check_record_id = detailModel.data.id;
      detailModel.visible = true;
    }
  }
);
/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
/** 导出 */
const onTableExport = async () => {
  const params = {
    check_record_id: tableModel.query.check_record_id,
  };
  const { success, data, message } = await apiInventoryCheckRecordExport(params);
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
  } else {
    Message.warning(message);
  }
};
</script>

<style lang="scss" scoped></style>

