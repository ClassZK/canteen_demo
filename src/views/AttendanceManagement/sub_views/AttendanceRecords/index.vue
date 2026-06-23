<template>
  <div class="layout-table attendance-record-page" v-loading="loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm :inline="true" :model="query">
          <IPlatformOrgFilter v-model="query.org_id" @change="onSearch"></IPlatformOrgFilter>
          <ElFormItem label="人员姓名">
            <ElInput v-model.trim="query.name" clearable placeholder="请输入人员姓名" @keyup.enter="onSearch" />
          </ElFormItem>
          <ElFormItem label="考勤时间">
            <ElDatePicker
              v-model="query.dateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="-"
            />
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onSearch">搜索</ElButton>
      </div>
    </div>

    <div class="summary-grid">
      <button
        v-for="item in summaryItems"
        :key="item.key"
        class="summary-item"
        :class="{ active: selectedCards.includes(item.key), disabled: !item.statuses.length }"
        type="button"
        @click="toggleSummary(item)"
      >
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </button>
    </div>

    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="rows" table-layout="fixed">
        <IPlatformOrgColumn></IPlatformOrgColumn>
        <ElTableColumn label="组织" prop="org_name" min-width="170" show-overflow-tooltip />
        <ElTableColumn label="考勤人员" prop="name" min-width="130" show-overflow-tooltip />
        <ElTableColumn label="上班打卡时间" prop="check_in_time" min-width="170" />
        <ElTableColumn label="下班打卡时间" prop="check_out_time" min-width="170" />
        <ElTableColumn label="打卡地点" prop="location" min-width="180" show-overflow-tooltip />
        <ElTableColumn label="状态" prop="status" width="110" align="center">
          <template #default="{ row }">
            <ElTag :type="statusTag(row.status)">{{ row.status }}</ElTag>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>

    <IPage :total="total" :page="query.page" :size="query.size" @change="onPage"></IPage>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { TagProps } from "element-plus";
import { ElMessage } from "element-plus";
import { apiAttendanceRecordList } from "@/api/attendance";

const loading = ref(false);
const rows = ref<Obj[]>([]);
const total = ref(0);
const summary = ref<Obj>({});
const selectedCards = ref<string[]>([]);
const query = reactive({
  page: 1,
  size: 20,
  org_id: "",
  name: "",
  dateRange: [] as string[],
});

const summaryItems = computed(() => [
  { key: "expected", label: "应到人数", value: summary.value.expected_count || 0, statuses: ["到岗", "缺勤"] },
  { key: "actual", label: "实到人数", value: summary.value.actual_count || 0, statuses: ["到岗"] },
  { key: "leave", label: "请假人数", value: summary.value.leave_count || 0, statuses: ["请假"] },
  { key: "absent", label: "缺勤人数", value: summary.value.absent_count || 0, statuses: ["缺勤"] },
  { key: "rest", label: "休息人数", value: summary.value.rest_count || 0, statuses: ["休息"] },
  { key: "rate", label: "出勤率", value: `${summary.value.attendance_rate || 0}%`, statuses: [] },
]);

const selectedStatuses = computed(() =>
  Array.from(
    new Set(
      summaryItems.value
        .filter(item => selectedCards.value.includes(item.key))
        .flatMap(item => item.statuses)
    )
  )
);

const statusTag = (status: string): TagProps["type"] => {
  const map: Record<string, TagProps["type"]> = {
    到岗: "success",
    缺勤: "danger",
    请假: "warning",
    休息: "info",
  };
  return map[status] || "info";
};

const loadData = async () => {
  loading.value = true;
  try {
    const { success, data, message } = await apiAttendanceRecordList({
      page: query.page,
      size: query.size,
      org_id: query.org_id,
      name: query.name,
      start_time: query.dateRange?.[0] || "",
      end_time: query.dateRange?.[1] || "",
      statuses: selectedStatuses.value,
    });
    if (!success) {
      ElMessage.warning(message || "获取考勤记录失败");
      return;
    }
    rows.value = data?.list || [];
    total.value = Number(data?.total || 0);
    summary.value = data?.summary || {};
  } finally {
    loading.value = false;
  }
};

const toggleSummary = (item: Obj) => {
  if (!item.statuses?.length) return;
  const index = selectedCards.value.indexOf(item.key);
  if (index >= 0) {
    selectedCards.value.splice(index, 1);
  } else {
    selectedCards.value.push(item.key);
  }
  query.page = 1;
  loadData();
};

const onSearch = () => {
  query.page = 1;
  loadData();
};

const onPage = (page: { page: number; size: number }) => {
  query.page = page.page;
  query.size = page.size;
  loadData();
};

loadData();
</script>

<style lang="scss" scoped>
.attendance-record-page {
  gap: 0;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
  flex: none;
  padding: 0 0 12px;
}

.summary-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 54px;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s, box-shadow 0.2s;
}

.summary-item:hover {
  border-color: var(--el-color-primary-light-5);
  background: #f8fbff;
}

.summary-item.active {
  border-color: var(--el-color-primary);
  background: #ecf5ff;
  box-shadow: inset 0 0 0 1px var(--el-color-primary);
}

.summary-item.disabled {
  cursor: default;
}

.summary-item.disabled:hover {
  border-color: #e5e7eb;
  background: #fff;
  box-shadow: none;
}

.summary-item span {
  color: #64748b;
}

.summary-item strong {
  color: #111827;
  font-size: 20px;
}

@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
</style>
