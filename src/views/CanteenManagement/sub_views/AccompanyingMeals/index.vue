<template>
  <div class="accompanying-meals">
    <div>
      <div class="tabs-container">
        <ElTabs v-model="auxStore.type" @tab-change="handleTabClick">
          <ElTabPane label="家长陪餐" :name="ActivityStatus.Pending"></ElTabPane>
          <ElTabPane label="志愿者活动" :name="ActivityStatus.Ongoing"></ElTabPane>
        </ElTabs>
      </div>
      <!-- 搜索表单 -->
      <div class="search-form">
        <ElForm :inline="true" :model="searchForm" class="demo-form-inline">
          <div>
            <ElFormItem form-item label="活动状态">
              <ElSelect v-model="searchForm.status" style="width: 160px" placeholder="请选择">
                <ElOption
                  v-for="item in statusMap"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
            <ElFormItem form-item label="活动日期">
              <ElDatePicker
                v-model="dateRange"
                type="datetimerange"
                format="YYYY-MM-DD HH:mm"
                value-format="YYYY-MM-DD HH:mm"
                unlink-panels
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                @change="handleDateChange"
              ></ElDatePicker>
            </ElFormItem>
          </div>

          <ElFormItem form-item class="search-btn">
            <ElButton type="primary" @click="handleSearch">查询</ElButton>
            <ElButton @click="handleReset">重置</ElButton>
          </ElFormItem>
        </ElForm>
        <ElButton type="primary" @click="showDialog">{{
          `新增${auxStore.type === ActivityStatus.Pending ? "陪餐活动" : "志愿者活动"}`
        }}</ElButton>
      </div>

      <!-- 数据表格 -->
      <div class="table-container">
        <ElTable :data="activityList" style="width: 100%" v-loading="loading" border>
          <ElTableColumn prop="type" align="center" label="陪餐类型">
            <template #default="scope">
              {{ auxStore.type === ActivityStatus.Pending ? "家长陪餐" : "志愿者活动" }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            prop="mealTime"
            v-if="auxStore.type === ActivityStatus.Pending"
            align="center"
            label="陪餐餐次"
          >
            <template #default="scope">
              {{ MealtimeList.find(item => item.value === scope.row.meal_type)?.name }}
            </template>
          </ElTableColumn>
          <ElTableColumn prop="accompanying_time" align="center" label="活动时间"></ElTableColumn>
          <ElTableColumn prop="status" align="center" label="活动状态">
            <template #default="scope">
              <ElTag :class="'tagcolor' + scope.row.status">
                {{ statusMap.find(item => item.value === scope.row.status)?.label }}
              </ElTag>
            </template>
          </ElTableColumn>
          <ElTableColumn prop="action" align="center" width="400" label="操作">
            <template #default="scope">
              <ElButton
                v-if="scope.row.status === ActivityStatus.Pending"
                type="danger"
                size="small"
                @click="handleDelete(scope.row.id)"
                style="margin-right: 5px"
                >删除</ElButton
              >
              <ElButton
                v-if="scope.row.status === ActivityStatus.Pending"
                type="primary"
                size="small"
                @click="showDialog(scope.row)"
                style="margin-right: 5px"
                >编辑</ElButton
              >
              <ElButton
                v-if="scope.row.status === ActivityStatus.Pending"
                type="warning"
                size="small"
                v-permission="'edit_questionnaire'"
                @click="toEditor(scope.row)"
                style="margin-right: 5px"
                >编辑问卷</ElButton
              >
              <ElButton
                v-if="scope.row.status === ActivityStatus.Pending"
                type="success"
                size="small"
                @click="sendSms(scope.row)"
                style="margin-right: 5px"
                >发送短信</ElButton
              >
              <ElButton
                v-if="scope.row.status !== ActivityStatus.Pending"
                type="info"
                size="small"
                @click="handleDetail(scope.row)"
                >详情</ElButton
              >
              <ElButton type="primary" size="small" @click="getQuestionnaire(scope.row)">查看问卷</ElButton>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="searchForm.page"
        v-model:page-size="searchForm.size"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>

    <!-- 新增/编辑弹窗 -->
    <ElDialog
      v-model="dialogVisible"
      :title="(formData.id ? `编辑` : `新增`) + (auxStore.type === ActivityStatus.Pending ? '家长陪餐' : '志愿者活动')"
      width="888px"
      :before-close="handleClose"
      custom-class="accompanying-meals-dialog"
    >
      <ElForm :model="formData" :rules="rules" ref="formRef" label-width="110px" class="activity-form">
        <!-- 第一行：陪餐餐次和陪餐时间 -->
        <div class="form-row">
          <ElFormItem
            :label="auxStore.type === ActivityStatus.Pending ? '陪餐时间' : '活动时间'"
            prop="accompanying_time"
            class="form-col"
          >
            <ElDatePicker
              v-model="formData.accompanying_time"
              type="datetime"
              :placeholder="auxStore.type === ActivityStatus.Pending ? '请选择陪餐时间' : '请选择活动时间'"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            ></ElDatePicker>
          </ElFormItem>
          <ElFormItem label="问卷截止时间" prop="questionnaire_end_time" class="form-col">
            <ElDatePicker
              v-model="formData.questionnaire_end_time"
              type="datetime"
              placeholder="请选择截止时间"
              style="width: 100%"
              format="YYYY-MM-DD HH:mm"
              value-format="YYYY-MM-DD HH:mm"
            ></ElDatePicker>
          </ElFormItem>
        </div>

        <!-- 第二行：配餐人数 -->
        <div class="form-row">
          <ElFormItem
            :label="auxStore.type === ActivityStatus.Pending ? '陪餐人数' : '活动人数'"
            prop="accompanying_total"
            class="form-col"
          >
            <ElInputNumber
              v-model="formData.accompanying_total"
              :min="1"
              :max="50"
              :step="1"
              step-strictly
              type="number"
              placeholder="请输入人数"
              style="width: 100%"
            ></ElInputNumber>
          </ElFormItem>
          <ElFormItem
            label="陪餐餐次"
            v-if="auxStore.type === ActivityStatus.Pending"
            prop="meal_type"
            class="form-col"
          >
            <ElSelect v-model="formData.meal_type" placeholder="请选择陪餐餐次" style="width: 100%">
              <ElOption
                v-for="item in MealtimeList"
                :key="item.value"
                :label="item.name"
                :value="item.value"
              ></ElOption>
            </ElSelect>
          </ElFormItem>

          <!-- 占位列 -->
        </div>

        <!-- 第三行：陪餐须知（宽度100%） -->
        <ElFormItem
          :label="auxStore.type === ActivityStatus.Pending ? '陪餐须知' : '活动须知'"
          prop="remark"
          class="form-col"
        >
          <ElInput
            v-model="formData.remark"
            type="textarea"
            :rows="4"
            placeholder="请输入内容"
            style="width: 100%"
            maxlength="500"
            show-word-limit
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <template #footer>
        <span class="dialog-footer">
          <ElButton @click="handleClose" style="margin-right: 16px">取消</ElButton>
          <ElButton type="primary" @click="handleSubmit" :loading="loading">确定</ElButton>
        </span>
      </template>
    </ElDialog>
    <Questionnaire
      v-if="showQuestionnaire"
      v-model="showQuestionnaire"
      :questionnaire-data="questionnaireData"
      @close="showQuestionnaire = false"
    ></Questionnaire>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { useRouter } from "vue-router";
import {
  apiCanteenActivityList,
  apiCanteenActivityUpdate,
  apiCanteenActivityDelete,
  apiCanteenQuestionnaireList,
  apiCanteenActivityQuestionnaireList,
} from "@/api/recipe";
import { MealtimeList } from "@/global/const";
import { ActivityStatus, statusMap } from "./aux_modules/const";
import { useAccompanyingMealsAuxStore } from "./aux_modules/store";
import Questionnaire from "./sub_modules/Questionnaire.vue";
import _ from "tddev/utils";

const auxStore = useAccompanyingMealsAuxStore();

// 定义接口
interface Activity {
  id: string;
  type: string;
  meal_type: string;
  accompanying_time: string;
  questionnaire_end_time: string;
  status: string;
  remark?: string;
  accompanying_total?: number; // 配餐人数
}
const showQuestionnaire = ref(false);
const questionnaireData = ref<Obj>({});

const Router = useRouter();

/** 详情 */
const toEditor = (row: Activity) => {
  Router.push({ name: "accompanyingMealsEditor", query: { id: row.id, type: auxStore.type } });
};
const dateRange = ref<any>([]);
const handleDateChange = (val: any) => {
  if (val.length > 0) {
    searchForm.start_time = val[0];
    searchForm.end_time = val[1];
  } else {
    searchForm.start_time = "";
    searchForm.end_time = "";
  }
};
// 搜索表单
const searchForm = reactive({
  status: "",
  type: "0",
  page: 1,
  size: 20,
  start_time: "",
  end_time: "",
});
// 切换标签页时，重置分页
const handleTabClick = (tab: string) => {
  auxStore.type = tab;
  searchForm.page = 1;
  loadData();
};
// 数据列表
const activityList = ref<Obj[]>([]);

// 加载状态
const loading = ref(false);

// 分页数据
const total = ref(0);

// 弹窗数据
const dialogVisible = ref(false);
const formRef = ref();
const formData = reactive<Partial<Activity>>({
  id: "",
  meal_type: "",
  accompanying_time: "",
  questionnaire_end_time: "",
  remark: "",
  type: "1",
  accompanying_total: 0, // 配餐人数，默认为0
});

// 获取问卷
const getQuestionnaire = async (row: Activity) => {
  try {
    const { success, data, msg } = await apiCanteenActivityQuestionnaireList({
      id: row.id,
    });
    if (success) {
      questionnaireData.value = data || {};
      questionnaireData.value.title = data.title || "";
      if (_.isNotEmptyArray(data.list)) {
        questionnaireData.value.questions = data.list.map((item: Obj) => {
          // 处理选项
          let answer = item.answer || "";
          if (item.type === "multiple") {
            answer = item.answer.split(",");
          }
          let options: string[] = [];
          if (_.isNotEmptyString(item.option)) {
            options = _.getJSONparse(item.option, []);
          }

          return {
            title: item.title,
            type: item.type,
            options: options,
            answer: answer,
          };
        });
      } else {
        questionnaireData.value.questions = [];
      }

      showQuestionnaire.value = true;
    } else {
      ElMessage.error(msg || "获取问卷失败");
    }
  } catch (error) {
    ElMessage.error("获取问卷失败");
  }
};

// 表单验证规则
const rules = {
  meal_type: [{ required: true, message: "请选择陪餐餐次", trigger: "change" }],
  accompanying_time: [{ required: true, message: "请选择陪餐时间", trigger: "change" }],
  remark: [{ required: true, message: "请输入陪餐须知", trigger: "blur" }],
  questionnaire_end_time: [{ required: true, message: "请选择截止时间", trigger: "change" }],
  accompanying_total: [
    { required: true, message: "请输入配餐人数", trigger: "blur" },
    { type: "number", min: 0, max: 50, message: "配餐人数必须在0-50之间", trigger: "blur,change" },
  ],
};

// 搜索
const handleSearch = () => {
  searchForm.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.status = "";
  dateRange.value = [];
  searchForm.page = 1;
  searchForm.end_time = "";
  searchForm.start_time = "";

  loadData();
};

// 显示弹窗
const showDialog = async (row?: Obj) => {
  if (row && row.id) {
    formData.id = row.id;
    formData.meal_type = row?.meal_type || "";
    formData.accompanying_time = row.accompanying_time;
    formData.questionnaire_end_time = row.questionnaire_end_time;
    formData.type = auxStore.type;
    formData.remark = row.remark;
    formData.accompanying_total = row.accompanying_total;
  } else {
    // 新增模式
    formData.id = "";
    formData.type = auxStore.type;
    formData.meal_type = "";
    formData.accompanying_time = "";
    formData.questionnaire_end_time = "";
    formData.remark = "";
    formData.accompanying_total = 10;
  }
  dialogVisible.value = true;
};

// 关闭弹窗
const handleClose = () => {
  dialogVisible.value = false;

  // 使用nextTick确保DOM更新后再重置表单，避免验证提示残留
  nextTick(() => {
    if (formRef.value) {
      formRef.value.resetFields();
    }

    // 手动清空表单数据，确保干净的初始状态
    formData.id = "";
    formData.meal_type = "";
    formData.accompanying_time = "";
    formData.questionnaire_end_time = "";
    formData.remark = "";
    formData.accompanying_total = 0;
  });
};

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return;

  try {
    await formRef.value.validate();
    loading.value = true;
    const { success, data, msg } = await apiCanteenActivityUpdate(formData);
    if (!success) {
      ElMessage.error(msg || "操作失败1");
      return;
    }
    handleClose();
    // 重新加载数据
    loadData();
  } catch (error) {
    // 表单验证失败不会抛出到这里，只有API错误才会
    if (error !== false) {
      // 排除表单验证取消的情况
      ElMessage.error("操作失败，请稍后重试");
      console.error("操作失败:", error);
    }
  } finally {
    loading.value = false;
  }
};

// 删除
const handleDelete = async (id: string) => {
  try {
    await ElMessageBox.confirm("确定要删除该活动吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    loading.value = true;
    const { success, msg } = await apiCanteenActivityDelete({ id });
    if (success) {
      ElMessage.success("删除成功");
    } else {
      ElMessage.error(msg || "删除失败");
    }

    // 重新加载数据
    loadData();
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
      console.error("删除失败:", error);
    }
  } finally {
    loading.value = false;
  }
};

// sendSms
const sendSms = async (row: Activity) => {
  try {
    await ElMessageBox.confirm("发送短信后活动和问卷将不可修改，确定要发送短信吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    });
    loading.value = true;
    const { success, msg } = await apiCanteenQuestionnaireList({
      id: row.id,
    });
    if (success) {
      ElMessage.success("短信发送成功");
    } else {
      ElMessage.error(msg || "短信发送失败");
    }
  } catch (error) {
    if (error !== "cancel") {
      ElMessage.error("短信发送失败");
      console.error("短信发送失败:", error);
    }
  } finally {
    loading.value = false;
    // 重新加载数据
    loadData();
  }
};

// 查看详情
const handleDetail = async (row: Activity) => {
  Router.push({
    name: "accompanyingMealsDetail",
    query: {
      id: row.id,
      type: auxStore.type,
    },
  });
};

// 分页
const handleSizeChange = (size: number) => {
  searchForm.size = size;
  loadData();
};

const handleCurrentChange = (current: number) => {
  searchForm.page = current;
  loadData();
};

// 加载数据
const loadData = async () => {
  try {
    loading.value = true;
    searchForm.type = auxStore.type;
    const { success, data, msg } = await apiCanteenActivityList(searchForm);
    if (success) {
      activityList.value = data?.list || [];
      total.value = data.total;
    } else {
      ElMessage.error(msg || "获取数据失败");
      activityList.value = [];
      total.value = 1;
    }
  } catch (error) {
    ElMessage.error("获取数据失败2");
    activityList.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadData();
});
</script>

<style scoped lang="scss">
.accompanying-meals {
  padding: 20px;
  background-color: #fff;
  min-height: calc(100vh - 120px);
  display: flex;
  flex-direction: column;
  gap: 12px;
  .tabs-container {
    position: relative;
    min-height: 46px;
    :deep(.el-tabs__header) {
      margin-bottom: 0;
    }
    .tabs-edit {
      position: absolute;
      top: 7px;
      right: var(--gap);
      z-index: 3;
    }
  }

  .search-form {
    padding: 20px;
    margin-bottom: 0;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    flex-direction: column;
    .demo-form-inline {
      display: flex;
      align-items: center;
      width: 100%;
      justify-content: space-between;
      margin-bottom: 12px;
      .el-form-item {
        margin-bottom: 0;
        margin-right: 20px;
      }
      .search-btn {
        margin-right: 0;
      }
    }
  }

  .main-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0; // 防止flex子元素溢出
  }

  .data-table {
    margin-bottom: 0;
    width: 100%;
    overflow-x: auto;
    flex: 1;

    .el-table {
      width: 100% !important;

      .el-table__header {
        th {
          background-color: #fafafa;
          font-weight: 500;
          color: #303133;
        }
      }

      .el-table__cell {
        padding: 12px 0;
      }
    }
  }

  .pagination-container {
    margin-top: auto;
    display: flex;
    justify-content: flex-end;
    padding: 12px 0;
    border-top: 1px solid #ebeef5;
  }
}
/* 简单直接的两列布局样式 */
.form-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
}

.form-col {
  width: 48%;
  margin-bottom: 0 !important;
}
// 弹窗样式
:deep(.accompanying-meals-dialog) {
  border-radius: 4px;
  overflow: hidden;

  .el-dialog__header {
    padding: 16px 24px;
    border-bottom: 1px solid #ebeef5;
    background-color: #fff;

    .el-dialog__title {
      font-size: 16px;
      font-weight: 500;
      color: #303133;
    }
  }

  .el-dialog__body {
    padding: 24px;
    background-color: #fff;
  }

  /* 确保输入控件填满宽度 */
  .form-col .el-select,
  .form-col .el-date-editor,
  .form-col .el-input-number {
    width: 100%;
  }

  /* 陪餐须知宽度100% */
  .activity-form .el-form-item:last-child {
    width: 100%;
  }

  /* 确保内容区域有足够空间 */
  .form-col .el-form-item__content {
    margin-left: 97px !important;
  }

  .el-input__wrapper {
    box-shadow: none;
    border: 1px solid #dcdfe6;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .el-select .el-input__wrapper {
    box-shadow: none;
    border: 1px solid #dcdfe6;
    transition: all 0.3s ease;

    &:hover {
      border-color: #c0c4cc;
    }

    &.is-focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }

  .el-textarea__inner {
    transition: border-color 0.3s ease;

    &:focus {
      border-color: #40a9ff;
      box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
    }
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 24px;
  border-top: 1px solid #ebeef5;
  margin: 0;
}

// 按钮样式
:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.2s ease;

  &.el-button--small {
    padding: 6px 12px;
    font-size: 12px;
  }
}

// 标签样式
:deep(.el-tag) {
  border-radius: 4px;
  padding: 2px 8px;
  font-size: 12px;

  &.el-tag--warning {
    background-color: #fdf6ec;
    border-color: #e6a23c;
    color: #e6a23c;
  }

  &.el-tag--info {
    background-color: #ecf5ff;
    border-color: #909399;
    color: #909399;
  }
}

// 输入框和选择器通用样式
:deep(.el-input),
:deep(.el-select) {
  .el-input__inner {
    transition: all 0.3s ease;
  }
}

// 过渡动画
.el-dialog__wrapper {
  display: flex;
  align-items: center;
  justify-content: center;

  .el-dialog {
    animation: dialog-fade-in 0.3s ease-out;
  }
}
.tagcolor0 {
  background-color: #ecf5ff;
  border-color: #909399;
  color: #909399;
}
// 进行中
.tagcolor1 {
  background-color: #fff;
  border-color: #2582ed;
  color: #2582ed;
}
.tagcolor2 {
  background-color: #fff;
  border-color: #2582ed;
  color: #2582ed;
}
.tagcolor3 {
  background-color: #fff;
  border-color: #909399;
  color: #909399;
}

@keyframes dialog-fade-in {
  0% {
    opacity: 0;
    transform: translate3d(0, -20px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
}

// 加载状态样式
:deep(.el-loading-spinner) {
  .path {
    stroke: #1890ff;
  }
}

// 响应式设计
@media (max-width: 1200px) {
  .accompanying-meals {
    .search-form {
      flex-direction: column;
      align-items: stretch;
      gap: 16px;

      .demo-form-inline {
        flex-wrap: wrap;
        gap: 16px;
      }
    }
  }
}

@media (max-width: 768px) {
  .accompanying-meals {
    padding: 10px;

    .page-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 12px;
    }

    .data-table {
      .el-table {
        .el-table__column--fixed-right {
          position: static !important;
          box-shadow: none;
        }
      }
    }

    .pagination {
      justify-content: center;
    }
  }
}
</style>
