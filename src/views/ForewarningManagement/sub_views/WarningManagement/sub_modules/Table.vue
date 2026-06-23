<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="预警主题" prop="keyword">
            <ElInput
              v-model="tableModel.query.keyword"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="预警主题"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="状态" prop="status">
            <ElSelect v-model="tableModel.query.status" filterable clearable placeholder="状态">
              <ElOption
                v-for="item of HandleStatusList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <!-- <ElButton type="primary" @click="onTableAdd">新增</ElButton> -->
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="预警主题"
          prop="subject"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="预警人"
          prop="supervisor_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="预警时间"
          prop="supervise_time"
          min-width="160"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="状态" prop="status" width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableStatusFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="120" align="center">
          <template #default="scope">
            <div class="handle">
              <template v-if="scope.row.status === HandleStatusEnum.Pending">
                <ElButton type="success" link @click="onTableHandle(scope.row)">处理</ElButton>
              </template>
              <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
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
import { useWarningManagementAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, HandleStatusEnum, HandleStatusList } from "@/global/const";
import _utils from "@/utils/index";
import { apiForewarningMonthPriceSupervisionList } from "@/api/warehouse";

const WarningManagementAuxStore = useWarningManagementAuxStore();
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
    keyword: "",
    status: "",
  },
  total: 0,
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiForewarningMonthPriceSupervisionList(tableModel.query);
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
  formRef.value?.resetFields();
  onTableSearch();
};
const onTableAdd = () => {
  WarningManagementAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};
/** 详情 */
const onTableDetail = (data: Obj) => {
  WarningManagementAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.detail;
  });
};
/** 处理 */
const onTableHandle = (data: Obj) => {
  WarningManagementAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.handle;
  });
};

const onTableStatusFilter = (data: Obj) => {
  let text = "";
  const object = HandleStatusList.find((item: Obj) => item.value === data.status);
  if (object) {
    return object.name;
  }
  return text;
};

watch(
  () => WarningManagementAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
