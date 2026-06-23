<template>
  <div class="detail-container">
    <div class="header">
      <ElButton class="back-btn" @click="close">
        <ElIcon><ArrowLeft /></ElIcon>
        <span>返回</span>
      </ElButton>
      <h2 class="title">活动详情</h2>
      <div class="header-right"></div>
    </div>
    <div class="detail-info">
      <div class="detail-item">
        <span class="label">活动信息</span>
      </div>
      <div class="content-table">
        <div class="table-row">
          <div class="table-cell-header">活动类型</div>
          <div class="table-cell">{{ pageData.type === ActivityStatus.Pending ? "家长陪餐" : "自愿者活动" }}</div>
          <template v-if="pageData.type === ActivityStatus.Pending">
            <div class="table-cell-header">陪餐餐次</div>
            <div class="table-cell">{{ MealtimeList.find(item => item.value === pageData.info?.meal_type)?.name }}</div>
          </template>

          <div class="table-cell-header">活动状态</div>
          <div class="table-cell">{{ statusMap.find(item => item.value === pageData.info?.status)?.label }}</div>
          <div class="table-cell-header">活动时间</div>
          <div class="table-cell">{{ pageData.info?.accompanying_time }}</div>
          <div class="table-cell-header">问卷截止时间</div>
          <div class="table-cell">{{ pageData.info?.questionnaire_end_time }}</div>
        </div>
        <div class="table-row">
          <div class="table-cell-header">陪餐须知</div>
          <div class="table-cell" v-html="pageData.info?.remark || '--'"></div>
        </div>
      </div>
    </div>
    <div class="detail-participants">
      <div class="detail-item-container">
        <div class="detail-item">
          <span class="label">陪餐评价</span>
        </div>
        <div class="table-container">
          <ElTable :data="pageData.info?.answer" style="width: 100%" v-loading="pageData.loading" border>
            <ElTableColumn type="index" width="100" align="center" label="用户">
              <template #default="scope">
                {{ "匿名用户" + (scope.$index + 1) }}
              </template>
            </ElTableColumn>
            <ElTableColumn prop="answer_time" align="center" width="200" label="评价时间">
              <template #default="scope">
                {{ scope.row?.answer_time || "--" }}
              </template>
            </ElTableColumn>
            <ElTableColumn
              prop="score"
              align="center"
              width="200"
              v-for="(value, index) in pageData.info?.title || []"
              :key="index"
              :label="value"
            >
              <template #default="scope">
                <div class="tab-answer">{{ getValue(scope.row?.answer || [], index) }}</div>
              </template>
            </ElTableColumn>
            <ElTableColumn prop="createTime" align="center" width="120" fixed="right" label="操作">
              <template #default="scope">
                <ElButton
                  v-if="scope.row?.status === AnswerStatus.Finished"
                  type="primary"
                  @click="showQuestionnaire(scope.row)"
                  size="mini"
                  >详情</ElButton
                >
                <div v-else>{{ statusMap.find(item => item.value === scope.row?.status)?.label }}</div>
              </template>
            </ElTableColumn>
          </ElTable>
        </div>
      </div>

      <IPage
        :total="tableModel.total"
        :page="tableModel.query.page"
        :size="tableModel.query.size"
        @change="onTablePage"
      ></IPage>
    </div>
  </div>
  <Questionnaire
    v-if="pageData.showQuestionnaire"
    v-model="pageData.showQuestionnaire"
    :questionnaire-data="questionnaireData"
    @close="handleQuestionnaireClose"
  ></Questionnaire>
</template>

<script setup lang="ts">
import { reactive, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ArrowLeft } from "@element-plus/icons-vue";
import Questionnaire from "./Questionnaire.vue";
import { apiCanteenActivityDetail, apiCanteenQuestionnaireDetail } from "@/api/recipe";
import { ActivityStatus } from "../aux_modules/const";
import { MealtimeList } from "@/global/const";
import { ElMessage } from "element-plus";
import _ from "tddev/utils";
const router = useRouter();
const route = useRoute();

// 问卷数据结构
interface Option {
  label: string;
  value: string;
}

interface Question {
  title: string;
  type: "single" | "multiple" | "textarea";
  options?: Option[];
  answer?: string | string[];
}

interface QuestionnaireData {
  title: string;
  questions: Question[];
  pic: string[];
}
const tableModel = reactive<{
  total: number;
  query: Obj;
}>({
  total: 0,
  query: {
    page: 1,
    size: 10,
  },
});
const AnswerStatus = {
  Pending: "0", //待回答
  Confirm: "1", //已确认
  Reject: "2", //拒绝参加
  Finished: "3", //已完成
  Expired: "4", //过期未回答
};
const statusMap = [
  {
    label: "待回答",
    value: AnswerStatus.Pending,
  },
  {
    label: "已确认",
    value: AnswerStatus.Confirm,
  },
  {
    label: "拒绝参加",
    value: AnswerStatus.Reject,
  },
  {
    label: "已完成",
    value: AnswerStatus.Finished,
  },
  {
    label: "过期未回答",
    value: AnswerStatus.Expired,
  },
];

// 页面数据
const pageData = reactive({
  activityList: [],
  type: route.query.type as string,
  info: {} as any,
  loading: false,
  showQuestionnaire: false,
  questionnaireId: "",
});

/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  loadActivityDetail();
};

// 当前显示的问卷数据
const questionnaireData = reactive<QuestionnaireData>({
  title: "",
  questions: [],
  pic: [],
});
const close = () => {
  router.back();
};

// 显示问卷弹窗
const showQuestionnaire = async (row: Obj) => {
  console.log(row);

  const { success, data, msg } = await apiCanteenQuestionnaireDetail({
    id: route.query.id as string,
    user_id: row.user_id,
  });
  if (!success) {
    ElMessage.error(msg || "获取问卷详情失败");
    return;
  }
  questionnaireData.title = data.title;
  if (_.isNotEmptyString(data.pic)) {
    questionnaireData.pic = data.pic.split(",");
  } else {
    questionnaireData.pic = [];
  }

  if (_.isNotEmptyArray(data.list)) {
    questionnaireData.questions = data.list.map((item: Obj) => {
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
    questionnaireData.questions = [];
  }
  pageData.showQuestionnaire = true;
};

// 处理问卷关闭
const handleQuestionnaireClose = () => {
  pageData.showQuestionnaire = false;
};

// 获取活动信息
const loadActivityDetail = async () => {
  try {
    pageData.loading = true;
    const { success, data, msg } = await apiCanteenActivityDetail({
      id: route.query.id as string,
      page: tableModel.query.page,
      size: tableModel.query.size,
    });
    if (success) {
      pageData.info = data;
      if (_.isNotEmptyString(pageData.info.remark)) {
        pageData.info.remark = pageData.info.remark.replace(/\n/g, "<br>").replace(/\s/g, "&nbsp;");
      }

      tableModel.total = data.total;
    } else {
      ElMessage.error(msg || "获取活动信息失败");
    }
  } catch (error) {
    ElMessage.error("获取活动信息失败");
  } finally {
    pageData.loading = false;
  }
};
onMounted(() => {
  loadActivityDetail();
});

// 获取数组中指定索引的值
const getValue = (arr: any[], index: number) => {
  // 确保arr是数组且有足够的元素
  if (!Array.isArray(arr) || index < 0 || index >= arr.length) {
    return "--";
  }
  const value = arr[index] || "--";
  return value;
};
</script>

<style scoped lang="scss">
.detail-container {
  padding: 12px;
  display: flex;
  flex-direction: column;
  height: 100%;
  box-sizing: border-box;
  gap: 12px;
  .header {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .back-btn {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #606266;

      &:hover {
        color: #409eff;
      }
    }

    .title {
      margin: 0;
      font-size: 18px;
      font-weight: 500;
      color: #303133;
    }

    .header-right {
      display: flex;
      gap: 12px;
    }
  }
  .detail-item {
    margin-bottom: 16px;
    font-size: 16px;
    font-weight: 500;
    color: #303133;
    &::before {
      content: "";
      display: inline-block;
      width: 2px;
      height: 12px;
      background-color: #409eff;
      border-radius: 50%;
      margin-right: 5px;
    }
  }
  .tab-answer {
    width: 100%;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .detail-info {
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

    .content-table {
      margin-top: 12px;
      font-size: 14px;
      border-bottom: 1px solid #e4e7ed;
      border-right: 1px solid #e4e7ed;
    }
    .table-row {
      display: flex;
    }
    .table-cell {
      flex: 1;
      padding: 12px 8px;
      border-left: 1px solid #e4e7ed;
      border-top: 1px solid #e4e7ed;
      word-break: break-all;
      line-height: 1.5;
    }
    .table-cell-header {
      background-color: #f4f6f8;
      width: 82x;
      box-sizing: border-box;
      padding: 12px;
      border-left: 1px solid #e4e7ed;
      border-top: 1px solid #e4e7ed;
    }
  }
  .detail-participants {
    padding: 16px;
    background-color: #fff;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    flex: 1;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
    justify-content: space-between;
    .detail-item-container {
      height: calc(100% - 50px);
      overflow-y: auto;
    }
  }
}
</style>
