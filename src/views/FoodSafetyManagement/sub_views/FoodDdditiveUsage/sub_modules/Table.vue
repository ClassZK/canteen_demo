<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="时间范围">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.data"
              :value-format="dateTimeModel.valueFormat"
              :default-time="dateTimeModel.defaultTime"
              unlink-panels
              range-separator="-"
              @change="dateTimeModelChange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            >
            </ElDatePicker>
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
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="菜品名称"
          prop="dish_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">{{ scope.row.dish_name || scope.row.producet_name }}</template>
        </ElTableColumn>
        <ElTableColumn
          label="食材总量(kg)"
          prop="total_quantity"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="添加剂名称"
          prop="additive_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">{{ scope.row.additive_name || scope.row.additiveName }}</template>
        </ElTableColumn>
        <ElTableColumn
          label="添加剂使用量(g)"
          prop="useage"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="记录人"
          prop="recorder"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">{{ scope.row.recorder || scope.row.operator || scope.row.user_name }}</template>
        </ElTableColumn>
        <ElTableColumn
          label="使用时间"
          prop="use_date"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>

        <ElTableColumn label="图片" prop="image" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="120" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
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
import { useFoodDdditiveUsageAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message } from "@/global/const";
import _utils from "@/utils/index";
import { apiFoodAdditivesUseList, apiFoodAdditivesUseDelete } from "@/api/inspection";
import { ElMessageBox } from "element-plus";
const FoodDdditiveUsageAuxStore = useFoodDdditiveUsageAuxStore();
const formRef = ref();

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
    start_time: "",
    end_time: "",
  },
  total: 0,
  data: [],
});

/** 时间范围 */
const dateTimeModel = reactive({
  data: [] as string[],
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});
const dateTimeModelChange = (array: string[]) => {
  let start_time = "",
    end_time = "";
  if (Array.isArray(array)) {
    start_time = array[0];
    end_time = array[1];
  }
  tableModel.query.start_time = start_time;
  tableModel.query.end_time = end_time;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiFoodAdditivesUseList(tableModel.query);
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

/** 新增 */
const onTableAdd = () => {
  FoodDdditiveUsageAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.add;
  });
};

/** 重置 */
const onTableReset = () => {
  dateTimeModel.data = [];
  formRef.value?.resetFields();
  tableModel.query.start_time = "";
  tableModel.query.end_time = "";
  onTableRequest();
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  FoodDdditiveUsageAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除该条食品添加剂使用记录吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiFoodAdditivesUseDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`食品添加剂使用记录删除成功`);
        } else {
          Message.warning(message);
        }
        // instance.confirmButtonLoading = false;
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};
watch(
  () => FoodDdditiveUsageAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
