<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="purchasingAuxStore.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="学期" v-if="purchasingAuxStore.active === 'semester'" prop="semester">
            <ElSelect
              v-model="purchasingAuxStore.times"
              filterable
              remote
              reserve-keyword
              @change="getSemesterChange"
              :remote-method="onSemesterChange"
              :loading="loading"
              placeholder="请选择学期"
            >
              <ElOption v-for="item in semesterOptions" :key="item.id" :label="item.name" :value="item.id"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="时间" v-if="purchasingAuxStore.active === 'day'" prop="day">
            <ElDatePicker
              type="daterange"
              v-model="purchasingAuxStore.times"
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
          <ElFormItem label="时间" v-if="purchasingAuxStore.active === 'week'" prop="week">
            <ElDatePicker
              type="week"
              v-model="purchasingAuxStore.times"
              format="YYYY年第w周"
              :value-format="dateTimeModel.valueFormat"
              :disabled-date="onDateTimeDisabled"
              @change="dateTimeModelChange"
              placeholder="时间"
              :popper-class="'custom-week-picker'"
            >
            </ElDatePicker>
          </ElFormItem>
          <ElFormItem label="时间" v-if="purchasingAuxStore.active === 'month'" prop="month">
            <ElDatePicker
              type="month"
              v-model="purchasingAuxStore.times"
              :value-format="dateTimeModel.valueFormat"
              :default-time="new Date(2000, 1, 1, 23, 59, 59)"
              @change="dateTimeModelChange"
              :disabled-date="onDateTimeDisabled"
              placeholder="时间"
            >
            </ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <div>
          <ElButton type="primary" @click="onTableSearch">查询</ElButton>
          <ElButton @click="onExport">导出</ElButton>
        </div>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn
          label="组织名称" prop="org_name"
          min-width="105"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="时间" prop="pro_no" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ dateFilter(scope.row.start_time) }} - {{ dateFilter(scope.row.end_time) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="采购支出参考价总金额(元)" prop="price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope"> {{ _utils.FtoY(scope.row.price) }} </template>
        </ElTableColumn>
        <ElTableColumn label="采购支出结算价总金额(元)" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope"> {{ _utils.FtoY(scope.row.guide_price) }} </template>
        </ElTableColumn>
        <ElTableColumn label="操作" prop="price" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ElButton type="primary" size="mini" @click="onDetailClick(scope.row)">详情</ElButton>
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
    <IProgress v-if="progressData.DialogVisible" :fileName="'采购支出数据'" :id="progressData.id"></IProgress>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import dayjs from "dayjs";
import { Message } from "@/global/const";
import { dateTimeEndFilter, timestampFilter } from "@/utils/Dayjs/index";
import _utils from "@/utils/index";
import { apiPurchaseCostStatisticsList, apiPurchaseCostStatisticsExport } from "@/api/warehouse";
import { apiCanteenSemesterList } from "@/api/recipe";
import { usePurchasingAuxStore } from "../aux_modules/store";
import { useRouter } from "vue-router";
import { dateFilter } from "@/utils/Dayjs/index";
import _ from "tddev/utils";
const router = useRouter();

const purchasingAuxStore = usePurchasingAuxStore();
const loading = ref(false);
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
/** 时间 */
const dateTimeModel = reactive<{
  valueFormat: string;
  defaultTime: Date[];
  data: string | string[];
}>({
  valueFormat: "YYYY-MM-DD",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
  data: [],
});
const dateTimeModelChange = (value: string | string[]) => {
  let startTime = "",
    endTime = "";

  // 根据当前激活的时间类型处理
  switch (purchasingAuxStore.active) {
    case "day":
      // 日选择范围，直接使用返回的数组
      if (Array.isArray(value)) {
        startTime = value[0];
        endTime = value[1];
      }
      break;
    case "week":
      // 周选择，计算周一和周日
      if (typeof value === "string") {
        const weekStart = dayjs(value);
        startTime = weekStart.format(dateTimeModel.valueFormat);
        endTime = weekStart.add(6, "day").format(dateTimeModel.valueFormat);
      }
      break;
    case "month":
      // 月选择，计算月初和月末
      if (typeof value === "string") {
        const monthStart = dayjs(value);
        startTime = monthStart.startOf("month").format(dateTimeModel.valueFormat);
        endTime = monthStart.endOf("month").format(dateTimeModel.valueFormat);
      }
      break;
  }

  purchasingAuxStore.query.start_time = startTime + " 00:00:00";
  purchasingAuxStore.query.end_time = endTime + " 23:59:59";
};
const initTIme = () => {
  const currentDate = dayjs(new Date());
  switch (purchasingAuxStore.active) {
    case "day":
      // 日选择范围，设置为当前日期
      if (purchasingAuxStore.timeType !== "day") {
        purchasingAuxStore.timeType = "day";
        const dayValue = currentDate.format(dateTimeModel.valueFormat);
        purchasingAuxStore.times = [dayValue, dayValue];
      }
      break;
    case "week":
      // 周选择，设置为当前周的周一
      if (purchasingAuxStore.timeType !== "week") {
        purchasingAuxStore.timeType = "week";
        // 计算当前周的周一（dayjs的startOf("week")默认从周日开始，所以需要加1天）
        const weekStart = currentDate.startOf("week").add(0, "day");
        purchasingAuxStore.times = weekStart.format(dateTimeModel.valueFormat);
      }
      break;
    case "month":
      // 月选择，设置为当前月份
      if (purchasingAuxStore.timeType !== "month") {
        purchasingAuxStore.timeType = "month";
        const monthValue = currentDate.format(dateTimeModel.valueFormat);
        purchasingAuxStore.times = monthValue;
      }
      break;
  }
  // 初始化时计算start_time和end_time
  dateTimeModelChange(purchasingAuxStore.times);
};

/** 学期选择 */
const getSemesterChange = (value: string | string[]) => {
  const semester = semesterOptions.value.find(item => item.id === value);
  if (semester) {
    purchasingAuxStore.query.start_time = semester.start_time + " 00:00:00";
    purchasingAuxStore.query.end_time = semester.end_time + " 23:59:59";
    onTableRequest();
  }
};

const onDateTimeDisabled = (time: Date) => {
  const dateTime = dateTimeEndFilter(new Date());
  const timestamp = timestampFilter(dateTime);
  return time.getTime() > timestamp;
};

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiPurchaseCostStatisticsList(purchasingAuxStore.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list;
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};

/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  purchasingAuxStore.query.page = object.page;
  purchasingAuxStore.query.size = object.size;
  onTableRequest();
};
/** 查询 */
const onTableSearch = () => {
  purchasingAuxStore.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = async () => {
  await initTIme();
  onTableSearch();
};

const semesterOptions = ref<Obj[]>([]);
/** 查询学期 */
const onSemesterChange = async (query: string) => {
  const params = {
    page: 1,
    size: 20,
    keyword: query,
  };
  loading.value = true;
  const { success, data, message } = await apiCanteenSemesterList(params);
  if (success) {
    semesterOptions.value = _utils.getDefaultArray(data.list);
    if (semesterOptions.value.length > 0) {
      if (purchasingAuxStore.timeType === "semester") {
        getSemesterChange(purchasingAuxStore.times);
      } else {
        purchasingAuxStore.timeType = "semester";
        purchasingAuxStore.times = semesterOptions.value[0].id;
        getSemesterChange(semesterOptions.value[0].id);
      }
    }
  } else {
    Message.warning(message);
  }
  loading.value = false;
};
if (purchasingAuxStore.active === "semester") {
  onSemesterChange("");
}

/** 查询任务状态 */
const progressData = reactive<Obj>({
  DialogVisible: false,
  id: "",
});
const onExport = async () => {
  const params = {
    start_time: purchasingAuxStore.query.start_time,
    end_time: purchasingAuxStore.query.end_time,
  };
  const { success, data, message } = await apiPurchaseCostStatisticsExport(params);
  if (success) {
    progressData.DialogVisible = true;
    progressData.id = data.task_id;
  } else {
    Message.warning(message);
  }
};
// 详情
const onDetailClick = (row: Obj) => {
  // 打开详情弹窗
  router.push({
    path: "/procurementDetail",
  });
};

watch(
  () => purchasingAuxStore.active,
  newVal => {
    if (newVal !== "semester") {
      onTableReset();
    }
  },
  {
    immediate: true,
    deep: true,
  },
);

</script>

<style lang="scss" scoped>
.query-right {
  flex-direction: column;
}
</style>
