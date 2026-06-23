<template>
  <ElDialog v-model="dialogVisible" title="问卷评价详情" align-center width="70%" destroy-on-close>
    <!-- 问卷标题和副标题 -->
    <div class="questionnaire-dialog">
      <div class="questionnaire-header">
        <h2 class="questionnaire-title">{{ questionnaireData.title }}</h2>
        <p class="questionnaire-subtitle">
          问卷讲解内容：为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与!现在我们就马上开始吧!
        </p>
      </div>

      <!-- 问卷内容 - 只读展示 -->
      <div class="questionnaire-content">
        <div v-for="(question, index) in questionnaireData.questions" :key="index" class="question-item">
          <!-- 问题标题 -->
          <div class="question-header">
            <span class="question-number">{{ index + 1 }}.</span>
            <span class="question-title">{{ question.title }}</span>
            <span class="required-mark">*</span>
          </div>

          <!-- 答案展示 -->
          <div class="answer-content">
            <!-- 单选题答案 -->
            <div v-if="question.type === 'single'" class="single-answer">
              <div
                v-for="(option, index) in question.options || []"
                :key="index"
                class="answer-option"
                :class="{ selected: isOptionSelected(question.answer!, option) }"
              >
                <span class="option-marker">
                  <div class="radio-box" :class="{ selected: isOptionSelected(question.answer!, option) }">
                    <el-icon v-if="isOptionSelected(question.answer!, option)" class="check-icon">
                      <Check />
                    </el-icon>
                  </div>
                </span>
                <span class="option-label">{{ option }}</span>
              </div>
            </div>

            <!-- 多选题答案 -->
            <div v-else-if="question.type === 'multiple'" class="multiple-answer">
              <div
                v-for="(option, index) in question.options || []"
                :key="index"
                class="answer-option"
                :class="{ selected: isOptionSelected(question.answer!, option) }"
              >
                <span class="option-marker">
                  <div class="checkbox" :class="{ selected: isOptionSelected(question.answer!, option) }">
                    <el-icon v-if="isOptionSelected(question.answer!, option)" class="check-icon">
                      <Check />
                    </el-icon>
                  </div>
                </span>
                <span class="option-label">{{ option }}</span>
              </div>
            </div>

            <!-- 文本输入答案 -->
            <div v-else-if="question.type === 'textarea'" class="textarea-answer">
              <el-input
                v-model="question.answer"
                type="textarea"
                :rows="4"
                readonly
                placeholder="暂无回答"
                class="readonly-textarea"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 附件 -->
      <template v-if="questionnaireData?.pic && questionnaireData.pic.length > 0">
        <div class="attachment-header">就餐图片：</div>
        <div class="attachment-item">
          <ElImage
            v-for="(file, index) in questionnaireData.pic || []"
            :key="index"
            :src="file"
            :preview-src-list="[file]"
            alt="附件"
            class="attachment-image"
          /></div
      ></template>
    </div>

    <!-- 弹窗底部按钮 -->
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="dialogVisible = false">关闭</el-button>
      </span>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { Check } from "@element-plus/icons-vue";
import { ElImage } from "element-plus";

// 定义问卷数据结构
interface QuestionOption {
  value: string;
  label: string;
}

interface Question {
  type: "single" | "multiple" | "textarea";
  title: string;
  options?: string[];
  answer?: string | string[];
}

interface Questionnaire {
  title: string;
  questions: Question[];
}

// 组件属性 - 只读展示版本
interface Props {
  modelValue: boolean;
  questionnaireData: Obj;
}

interface Emits {
  (e: "update:modelValue", value: boolean): void;
  (e: "close"): void; // 关闭事件
}

const props = withDefaults(defineProps<Props>(), {});
const emit = defineEmits<Emits>();

// 响应式数据
const dialogVisible = ref(props.modelValue);

// 监听props变化
watch(
  () => props.modelValue,
  newVal => {
    dialogVisible.value = newVal;
  }
);

// 监听弹窗状态变化
watch(dialogVisible, newVal => {
  emit("update:modelValue", newVal);
  if (!newVal) {
    emit("close");
  }
});

// 检查选项是否被选中
const isOptionSelected = (question: string[] | string, option: string): boolean => {
  if (!question) {
    return false;
  }
  if (Array.isArray(question)) {
    return question.includes(option);
  }
  return question === option;
};
</script>

<style scoped lang="scss">
.questionnaire-dialog {
  padding: 24px 48px;
}
.questionnaire-header {
  text-align: center;
  margin-bottom: 30px;
  padding-top: 20px;
  border-top: 1px solid #e5e7eb;
}

.questionnaire-title {
  font-size: 28px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 24px 0;
}

.questionnaire-subtitle {
  font-size: 16px;
  color: #333333;
  margin: 0;
  line-height: 1.5;
}

.questionnaire-content {
  max-height: 400px;
  overflow-y: auto;
  padding-right: 10px;
}

.question-item {
  margin-bottom: 24px;
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.question-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 12px;
}

.question-number {
  font-weight: 600;
  color: #374151;
  margin-right: 8px;
  min-width: 20px;
}

.question-title {
  font-size: 16px;
  color: #1f2937;
  line-height: 1.5;
  flex: 1;
}

.required-mark {
  color: #ef4444;
  margin-left: 4px;
}

.answer-content {
  margin-left: 28px;
}

.answer-option {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
  transition: all 0.2s ease;
}

.answer-option.selected {
  background-color: #f0f9ff;
  padding: 8px 0;
  border-radius: 6px;
  border: 1px solid #bfdbfe;
}

.option-marker {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  margin: 0 8px;
  flex-shrink: 0;
}

// 单选框样式
.radio-box {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 50%;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.radio-box.selected {
  border-color: #3b82f6;
  background-color: #3b82f6;
}

// 多选框样式
.checkbox {
  width: 16px;
  height: 16px;
  border: 2px solid #d1d5db;
  border-radius: 3px;
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox.selected {
  border-color: #3b82f6;
  background-color: #3b82f6;
}

.option-label {
  font-size: 14px;
  color: #374151;
  flex: 1;
}

.answer-option.selected .option-label {
  color: #1e40af;
  font-weight: 500;
  padding-left: 8px;
}

.check-icon {
  color: white;
  font-size: 12px;
}

.readonly-textarea {
  margin-top: 8px;
}

.readonly-textarea :deep(.el-textarea__inner) {
  background-color: #f3f4f6;
  border-color: #e5e7eb;
  color: #374151;
  cursor: default;
}

.readonly-textarea :deep(.el-input__count) {
  color: #6b7280;
}

.dialog-footer {
  display: flex;
  justify-content: center;
}

/* 滚动条样式 */
.questionnaire-content::-webkit-scrollbar {
  width: 6px;
}

.questionnaire-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.questionnaire-content::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.questionnaire-content::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
.attachment-header {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 12px;
  margin-top: 12px;
}
.attachment-item {
  display: flex;
  gap: 12px;
  .attachment-image {
    width: 80px;
    height: 80px;
  }
}
/* 响应式设计 */
@media (max-width: 640px) {
  :deep(.el-dialog) {
    width: 90% !important;
    margin: 5vh auto !important;
  }

  .answer-content {
    margin-left: 0;
  }

  .questionnaire-title {
    font-size: 20px;
  }
}
</style>
