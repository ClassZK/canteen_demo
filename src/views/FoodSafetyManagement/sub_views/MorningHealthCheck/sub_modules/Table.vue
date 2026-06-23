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
          label="晨检时间"
          prop="inspection_time"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="姓名" prop="name" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="是否发热" prop="fever" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.fever) }}</template>
        </ElTableColumn>
        <ElTableColumn label="是否咽喉痛或咳嗽" prop="sore_throat" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.sore_throat) }}</template>
        </ElTableColumn>
        <ElTableColumn label="是否呕吐腹泻" prop="vomiting" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.vomiting) }}</template>
        </ElTableColumn>
        <ElTableColumn label="是否皮肤感染" prop="skin_infections" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.skin_infections) }}</template>
        </ElTableColumn>
        <ElTableColumn label="着装是否正常" prop="dress" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter(scope.row.dress) }}</template>
        </ElTableColumn>
        <ElTableColumn label="是否能上岗" prop="handling_opinions" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">{{ onTableWhetherFilter2(scope.row.handling_opinions) }}</template>
        </ElTableColumn>
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
import { useMorningHealthCheckAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, WhetherList, WhetherList2 } from "@/global/const";
import _utils from "@/utils/index";
import { apiMorningInspectionList, apiMorningInspectionDelete } from "@/api/inspection";
import { ElMessageBox } from "element-plus";
const MorningHealthCheckAuxStore = useMorningHealthCheckAuxStore();
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
    startTime: "",
    endTime: "",
  },
  total: 0,
  data: [],
});

/** 时间范围 */
const dateTimeModel = reactive<{
  data: string[];
  valueFormat: string;
  defaultTime: Date[];
}>({
  data: [],
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});

const dateTimeModelChange = (array: string[]) => {
  let startTime = "",
    endTime = "";
  if (Array.isArray(array)) {
    startTime = array[0];
    endTime = array[1];
  }
  tableModel.query.startTime = startTime;
  tableModel.query.endTime = endTime;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiMorningInspectionList(tableModel.query);
  if (success) {
    tableModel.data = data.list;
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
  dateTimeModel.data = [];
  tableModel.query.startTime = '';
  tableModel.query.endTime = '';
  formRef.value?.resetFields();
  onTableSearch();
};
const onTableWhetherFilter = (value: string | undefined) => {
  let text = "";
  const object = WhetherList.find((item: Obj) => item.value === value);
  if (object) {
    return object.name;
  }
  return text;
};
const onTableWhetherFilter2 = (value: string | undefined) => {
  let text = "";
  const object = WhetherList2.find((item: Obj) => item.value === value);
  if (object) {
    return object.name;
  }
  return text;
};
/** 新增 */
const onTableAdd = () => {
  MorningHealthCheckAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  MorningHealthCheckAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除此条晨检记录吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiMorningInspectionDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`晨检记录删除成功`);
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
  () => MorningHealthCheckAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
