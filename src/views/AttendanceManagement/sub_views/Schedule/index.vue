<template>
  <div class="layout-table schedule-page" v-loading="loading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm :inline="true" :model="query">
          <IPlatformOrgFilter v-model="query.org_id" @change="onSearch"></IPlatformOrgFilter>
          <ElFormItem label="月份">
            <ElDatePicker v-model="query.month" type="month" value-format="YYYY-MM" placeholder="请选择月份" @change="onSearch" />
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onSearch">搜索</ElButton>
        <ElButton :type="editMode ? 'warning' : 'primary'" @click="toggleEditMode">{{ editMode ? "退出编辑" : "编辑" }}</ElButton>
      </div>
    </div>

    <div class="calendar-wrap">
      <ElCalendar v-model="calendarDate">
        <template #date-cell="{ data }">
          <button class="day-cell" :class="{ muted: !isCurrentMonth(data.day) }" @click.stop="openDay(data.day)">
            <span class="date-row">
              <span class="date-text">{{ dayNumber(data.day) }}</span>
              <span v-if="editMode && isCurrentMonth(data.day)" class="add-icon" @click.stop="openEdit(data.day)">+</span>
            </span>
            <template v-if="dayMap[data.day]">
              <span class="count work">工作 {{ dayMap[data.day].work_count }} 人</span>
              <span class="count rest">休息 {{ dayMap[data.day].rest_count }} 人</span>
            </template>
            <span v-else class="empty">未排班</span>
          </button>
        </template>
      </ElCalendar>
    </div>

    <ElDialog v-model="detail.visible" :title="`${detail.date} 排班安排`" width="860px" destroy-on-close>
      <ElTabs v-model="detail.activeTab">
        <ElTabPane label="工作人员" name="work">
          <ElTable :data="detail.workers" max-height="420" table-layout="fixed">
            <ElTableColumn label="人员名称" prop="name" min-width="130" />
            <ElTableColumn label="状态" prop="status" width="100">
              <template #default="{ row }">
                <ElTag :type="row.status === '到岗' ? 'success' : 'danger'">{{ row.status }}</ElTag>
              </template>
            </ElTableColumn>
            <ElTableColumn label="上班打卡时间" prop="check_in_time" min-width="160" />
            <ElTableColumn label="下班打卡时间" prop="check_out_time" min-width="160" />
            <ElTableColumn label="打卡地点" prop="location" min-width="180" show-overflow-tooltip />
          </ElTable>
        </ElTabPane>
        <ElTabPane label="休息人员" name="rest">
          <ElTable :data="detail.resters" max-height="420" table-layout="fixed">
            <ElTableColumn label="人员名称" prop="name" min-width="160" />
            <ElTableColumn label="状态" prop="status" width="120">
              <template #default="{ row }">
                <ElTag :type="row.status === '请假' ? 'warning' : 'info'">{{ row.status }}</ElTag>
              </template>
            </ElTableColumn>
          </ElTable>
        </ElTabPane>
      </ElTabs>
      <template #footer>
        <ElButton @click="detail.visible = false">关闭</ElButton>
      </template>
    </ElDialog>

    <ElDialog v-model="edit.visible" title="编辑排班" width="720px" destroy-on-close>
      <ElForm label-position="top">
        <ElFormItem label="排班日期">
          <ElDatePicker v-model="edit.date" type="date" value-format="YYYY-MM-DD" placeholder="请选择日期" @change="loadEditDay" />
        </ElFormItem>
        <ElFormItem label="工作人员">
          <ElSelect v-model="edit.workerIds" multiple filterable placeholder="请选择工作人员">
            <ElOption v-for="item in edit.staff" :key="item.id" :label="`${item.name}（${item.role_name}）`" :value="item.id" />
          </ElSelect>
        </ElFormItem>
      </ElForm>
      <div class="edit-tip">未添加为工作人员的人员，将默认为休息人员。</div>
      <template #footer>
        <ElButton @click="edit.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="edit.saving" @click="saveSchedule">保存</ElButton>
      </template>
    </ElDialog>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { apiAttendanceScheduleDay, apiAttendanceScheduleMonth, apiAttendanceScheduleSave } from "@/api/attendance";

const today = new Date();
const pad = (value: number) => String(value).padStart(2, "0");
const currentMonth = `${today.getFullYear()}-${pad(today.getMonth() + 1)}`;
const loading = ref(false);
const editMode = ref(false);
const calendarDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const rows = ref<Obj[]>([]);
const query = reactive({
  org_id: "",
  month: currentMonth,
});

const dayMap = computed(() =>
  rows.value.reduce((map: Obj, item: Obj) => {
    map[item.date] = item;
    return map;
  }, {})
);

const detail = reactive({
  visible: false,
  date: "",
  activeTab: "work",
  workers: [] as Obj[],
  resters: [] as Obj[],
});

const edit = reactive({
  visible: false,
  date: "",
  workerIds: [] as string[],
  staff: [] as Obj[],
  saving: false,
});

const dayNumber = (day: string) => Number(day.slice(-2));
const isCurrentMonth = (day: string) => day.startsWith(query.month);

const loadMonth = async () => {
  loading.value = true;
  try {
    const { success, data, message } = await apiAttendanceScheduleMonth(query);
    if (!success) {
      ElMessage.warning(message || "获取排班失败");
      return;
    }
    rows.value = data?.list || [];
  } finally {
    loading.value = false;
  }
};

const loadDay = async (date: string) => {
  const { success, data, message } = await apiAttendanceScheduleDay({ org_id: query.org_id, date });
  if (!success) {
    ElMessage.warning(message || "获取当天排班失败");
    return null;
  }
  return data;
};

const openDay = async (date: string) => {
  if (editMode.value) return;
  if (!isCurrentMonth(date)) return;
  const data = await loadDay(date);
  if (!data) return;
  detail.date = date;
  detail.workers = data.workers || [];
  detail.resters = data.resters || [];
  detail.activeTab = "work";
  detail.visible = true;
};

const openEdit = async (date = "") => {
  edit.date = date || `${query.month}-01`;
  edit.visible = true;
  await loadEditDay();
};

const toggleEditMode = () => {
  editMode.value = !editMode.value;
};

const loadEditDay = async () => {
  if (!edit.date) return;
  const data = await loadDay(edit.date);
  if (!data) return;
  edit.staff = data.staff || [];
  edit.workerIds = (data.workers || []).map((item: Obj) => item.id);
};

const saveSchedule = async () => {
  if (!edit.date) {
    ElMessage.warning("请选择排班日期");
    return;
  }
  edit.saving = true;
  try {
    const { success, message } = await apiAttendanceScheduleSave({
      org_id: query.org_id,
      date: edit.date,
      worker_ids: edit.workerIds,
    });
    if (!success) {
      ElMessage.warning(message || "保存排班失败");
      return;
    }
    ElMessage.success("排班已保存");
    edit.visible = false;
    await loadMonth();
  } finally {
    edit.saving = false;
  }
};

const onSearch = () => {
  calendarDate.value = new Date(`${query.month}-01 00:00:00`);
  loadMonth();
};

watch(calendarDate, value => {
  const month = `${value.getFullYear()}-${pad(value.getMonth() + 1)}`;
  if (month !== query.month) {
    query.month = month;
    loadMonth();
  }
});

loadMonth();
</script>

<style lang="scss" scoped>
.schedule-page {
  gap: 0;
}

.calendar-wrap {
  overflow: auto;
  flex: auto;
  min-height: 0;
  padding: 0 12px 12px;
  background: #fff;
}

:deep(.el-calendar) {
  --el-calendar-cell-width: 104px;
}

:deep(.el-calendar-day) {
  padding: 0;
}

.day-cell {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  height: 100%;
  min-height: 104px;
  padding: 10px;
  border: 0;
  background: transparent;
  text-align: left;
  cursor: pointer;
}

.day-cell:hover {
  background: #f5f9ff;
}

.day-cell.muted {
  color: #a8abb2;
  cursor: default;
}

.date-text {
  font-weight: 700;
}

.date-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.add-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  color: #fff;
  background: var(--el-color-primary);
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
}

.add-icon:hover {
  background: var(--el-color-primary-light-3);
}

.count {
  display: inline-flex;
  width: fit-content;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.count.work {
  color: #166534;
  background: #dcfce7;
}

.count.rest {
  color: #475569;
  background: #f1f5f9;
}

.empty {
  color: #9ca3af;
  font-size: 12px;
}

.edit-tip {
  color: #64748b;
  font-size: 13px;
}
</style>
