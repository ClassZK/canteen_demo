<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="状态" prop="status">
            <ElSelect v-model="tableModel.query.status" filterable clearable placeholder="状态">
              <ElOption
                v-for="item of CheckStatusList"
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
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="组织名称" prop="unit_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="自查时间"
          prop="inspection_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        >
          <template #default="scope">
            {{ dateFilter(scope.row.inspection_time) }}
          </template>
      </ElTableColumn>
        <ElTableColumn
          label="提交人"
          prop="submitor_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="提交时间"
          prop="submit_time"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="状态" prop="状态" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableCheckStatusFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="140" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="success" link @click="onTableDetail(scope.row)">处理</ElButton>
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
import { useRouter } from "vue-router";
import Storage from 'tddev/storage';
import { useSelfCheckEvaluationAuxStore } from "../aux_modules/store";
import { Message, CheckStatusEnum, CheckStatusList } from "@/global/const";
import { dateFilter } from '@/utils/Dayjs/index';
import _utils from "@/utils/index";
import { apiMonthlyPatrolList } from "@/api/supervision";

const Router = useRouter();
const formRef = ref();
const SelfCheckEvaluationAuxStore = useSelfCheckEvaluationAuxStore();

/** 输入数据 函数方式 */
const tableQueryInitial = () => ({
    page: 1,
    size: 20,
    status: "",
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

const SelfCheckEvaluationQuery = Storage.get('SelfCheckEvaluationQuery') ?? {};
if (SelfCheckEvaluationQuery && Reflect.ownKeys(SelfCheckEvaluationQuery).length > 0) {
  tableModel.query = SelfCheckEvaluationQuery;
  Storage.remove('SelfCheckEvaluationQuery');
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiMonthlyPatrolList(tableModel.query);
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
  Storage.set('SelfCheckEvaluationQuery', tableModel.query);
  Router.push({ name: "selfCheckEvaluationDetail", query: { id: data.id } });
};

const onTableCheckStatusFilter = (data: Obj) => {
    const object = CheckStatusList.find((item: Obj) => item.value === data.status);
    if (object) {
      return object.name;
    }
};

watch(
  () => SelfCheckEvaluationAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
