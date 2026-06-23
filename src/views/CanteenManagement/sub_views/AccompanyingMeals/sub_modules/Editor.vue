<template>
  <div v-loading="loading" class="questionnaire-detail">
    <!-- 页面头部 -->
    <div class="header">
      <ElButton class="back-btn" @click="handleBack">
        <ElIcon><ArrowLeft /></ElIcon>
        <span>返回</span>
      </ElButton>
      <h2 class="title">编辑问卷</h2>
      <div class="header-right">
        <ElButton type="primary" plain @click.stop="addQuestion"> 添加题目 </ElButton>
        <ElButton type="default" @click="handleCancel">取消</ElButton>
        <ElButton type="primary" @click="handleSave">保存</ElButton>
      </div>
    </div>

    <!-- 主内容区域 -->
    <div class="main-content">
      <!-- 左侧编辑面板 -->
      <div class="left-panel">
        <div class="panel-section">
          <h3 class="section-title">问卷标题</h3>
          <div class="tabs">
            <ElForm :model="questionnaireInfo">
              <ElFormItem>
                <ElInput
                  v-model="questionnaireInfo.title"
                  type="textarea"
                  maxlength="50"
                  show-word-limit
                  :rows="4"
                  placeholder="请输入问卷标题"
                />
              </ElFormItem>
            </ElForm>
          </div>
        </div>

        <!-- 问题属性设置 -->
        <div class="panel-section" v-if="selectedQuestion">
          <h3 class="section-title">题目设置</h3>
          <ElForm :model="selectedQuestion">
            <ElFormItem label="题目">
              <ElInput
                v-model="selectedQuestion.title"
                type="textarea"
                maxlength="100"
                show-word-limit
                :rows="4"
                placeholder="请输入题目"
              />
            </ElFormItem>
            <ElFormItem label="类型">
              <ElSelect v-model="selectedQuestion.type" placeholder="请选择">
                <ElOption label="单选题" value="single" />
                <ElOption label="多选题" value="multiple" />
                <ElOption label="多行文本" value="textarea" />
              </ElSelect>
            </ElFormItem>
            <ElFormItem label="可输入" v-if="selectedQuestion.type === 'textarea'">
              <ElInputNumber v-model="selectedQuestion.max_length" :min="1" :max="5000" placeholder="200字" />
            </ElFormItem>
            <ElFormItem label="提示文案" v-if="selectedQuestion.type === 'textarea'">
              <ElInput
                v-model="selectedQuestion.placeholder"
                type="textarea"
                maxlength="100"
                show-word-limit
                :rows="4"
                placeholder="请输入提示文案"
              />
            </ElFormItem>
          </ElForm>
        </div>

        <!-- 所有问题 -->
      </div>

      <!-- 右侧预览区域 -->
      <div class="right-panel">
        <!-- 问卷预览区域 -->
        <div class="questionnaire-preview">
          <!-- 问卷标题 -->
          <div class="questionnaire-header">
            <h1 class="questionnaire-title" contenteditable="true" @blur="updateTitle" ref="titleRef">
              {{ questionnaireInfo.title || "问卷标题" }}
            </h1>
            <p class="questionnaire-description">
              {{ description }}
            </p>
          </div>

          <!-- 预览问题列表 -->
          <div class="questions-container">
            <div
              v-for="(question, index) in questions"
              :key="index"
              :class="['question-item', { selected: selectedQuestionIndex === index }]"
              @click="selectQuestion(index)"
            >
              <div class="question-number">{{ (index + 1).toString().padStart(2, "0") }}</div>
              <div class="question-content">
                <div class="question-title">{{ question.title || "请输入题目" }}</div>

                <!-- 单选题预览 -->
                <div v-if="question.type === 'single'" class="question-options">
                  <div v-for="(option, optIndex) in question.option" :key="optIndex" class="option-item">
                    <ElRadio :label="optIndex + 1">{{ option }}</ElRadio>
                    <div v-if="selectedQuestionIndex === index" class="option-actions">
                      <ElButton
                        type="text"
                        size="small"
                        class="edit-option-btn"
                        @click.stop="editOption(question, optIndex)"
                      >
                        <ElIcon><Edit /></ElIcon>
                      </ElButton>
                      <ElButton
                        type="text"
                        size="small"
                        class="delete-option-btn"
                        @click.stop="deleteOption(question, optIndex)"
                      >
                        <ElIcon><Delete /></ElIcon>
                      </ElButton>
                    </div>
                  </div>
                </div>

                <!-- 多选题预览 -->
                <div v-else-if="question.type === 'multiple'" class="question-options">
                  <div v-for="(option, optIndex) in question.option" :key="optIndex" class="option-item">
                    <ElCheckbox :label="optIndex + 1">{{ option }}</ElCheckbox>
                    <div v-if="selectedQuestionIndex === index" class="option-actions">
                      <ElButton
                        type="text"
                        size="small"
                        class="edit-option-btn"
                        @click.stop="editOption(question, optIndex)"
                      >
                        <ElIcon><Edit /></ElIcon>
                      </ElButton>
                      <ElButton
                        type="text"
                        size="small"
                        class="delete-option-btn"
                        @click.stop="deleteOption(question, optIndex)"
                      >
                        <ElIcon><Delete /></ElIcon>
                      </ElButton>
                    </div>
                  </div>
                </div>

                <!-- 文本题预览 -->
                <div v-else-if="question.type === 'textarea'" class="question-textarea">
                  <ElInput
                    type="textarea"
                    :rows="4"
                    :maxlength="(question as any).max_length || 200"
                    :placeholder="(question as any).placeholder || '请输入内容'"
                    readonly
                  />
                </div>
              </div>
              <!-- 问题操作按钮 - 只在选中题目下方显示 -->
              <div v-if="selectedQuestionIndex === index" class="question-actions">
                <ElButton v-if="question.type !== 'textarea'" size="small" @click.stop="addOptionToSelectedQuestion">
                  <ElIcon><Plus /></ElIcon>添加选项
                </ElButton>
                <ElButton size="small" @click.stop="addQuestion">
                  <ElIcon><Plus /></ElIcon>添加题目
                </ElButton>
                <ElButton size="small" @click.stop="deleteSelectedQuestion">
                  <ElIcon><Delete /></ElIcon>删除
                </ElButton>
                <ElButton size="small" @click.stop="moveQuestionUp">
                  <ElIcon><ArrowUp /></ElIcon>上移
                </ElButton>
                <ElButton size="small" @click.stop="moveQuestionDown">
                  <ElIcon><ArrowDown /></ElIcon>下移
                </ElButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 选项编辑对话框 -->
  <ElDialog v-model="optionDialogVisible" :title="optionDialogTitle" width="400px" align-center destroy-on-close>
    <ElForm :model="optionForm" :rules="optionRules" ref="optionFormRef">
      <ElFormItem label="选项内容" prop="optionValue">
        <ElInput
          v-model="optionForm.optionValue"
          placeholder="请输入选项内容"
          maxlength="50"
          show-word-limit
          clearable
        />
      </ElFormItem>
    </ElForm>
    <template #footer>
      <ElButton @click="handleOptionDialogCancel">取消</ElButton>
      <ElButton type="primary" @click="handleOptionDialogConfirm">确定</ElButton>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft, Plus, Delete, ArrowUp, ArrowDown, Edit } from "@element-plus/icons-vue";
import { useRouter, useRoute } from "vue-router";
import { apiCanteenQuestionnaireUpdate, apiCanteenActivityQuestionnaireList } from "@/api/recipe";
import _utils from "@/utils/index";
import _ from "tddev/utils";
const Router = useRouter();
const Route = useRoute();
const loading = ref(false);
// 问卷信息
const questionnaireInfo = reactive({
  activity_id: Route.query.id as string,
  title: "问卷标题",
});
const description =
  "为了给您提供更好的服务，希望您能抽出几分钟时间，将您的感受和建议告诉我们，我们非常重视每位用户的宝贵意见，期待您的参与！现在我们就马上开始吧！";
// 所有问题数据
const questions = ref([
  {
    title: "",
    type: "single",
    option: [],
    answer: "",
    max_length: 200,
    placeholder: "请输入内容",
  },
]);

// 当前选中的问题索引
const selectedQuestionIndex = ref<number | null>(null);

// 计算属性：当前选中的问题对象
const selectedQuestion = computed(() => {
  return selectedQuestionIndex.value !== null ? questions.value[selectedQuestionIndex.value] : null;
});

// 编辑选项相关状态
const editingQuestion = ref<any>(null);
const editingOptionIndex = ref(-1);

// 选项编辑对话框相关变量
const optionDialogVisible = ref(false);
const optionDialogTitle = ref("");
const optionForm = reactive({
  optionValue: "",
});
const optionFormRef = ref<any>(null);
const optionRules = reactive({
  optionValue: [
    { required: true, message: "选项内容不能为空", trigger: "blur" },
    { max: 50, message: "选项内容不能超过50个字符", trigger: "blur" },
  ],
});
const dialogMode = ref<"add" | "edit">("add");

// 活动标签页
const activeTab = ref("0");

// 标题引用
const titleRef = ref<HTMLElement>();

// 更新标题
const updateTitle = (event: Event) => {
  if (event.target instanceof HTMLElement) {
    questionnaireInfo.title = event.target.innerText || "";
  }
};

// 选择问题
const selectQuestion = (index: number) => {
  selectedQuestionIndex.value = index;
};

// 添加选项到选中的问题
const addOptionToSelectedQuestion = () => {
  if (!selectedQuestion.value || selectedQuestion.value.type === "textarea") {
    ElMessage.warning("请先选择一个单选题或多选题");
    return;
  }

  // 设置为添加模式
  dialogMode.value = "add";
  optionDialogTitle.value = "添加选项";
  // 清空表单
  optionForm.optionValue = "";
  // 重置表单验证
  if (optionFormRef.value) {
    optionFormRef.value.resetFields();
  }
  // 显示对话框
  optionDialogVisible.value = true;
};

// 编辑选项
const editOption = (question: any, optionIndex: number) => {
  if (!question || !question.option || optionIndex < 0 || optionIndex >= question.option.length) {
    return;
  }

  editingQuestion.value = question;
  editingOptionIndex.value = optionIndex;

  // 设置为编辑模式
  dialogMode.value = "edit";
  optionDialogTitle.value = "编辑选项内容";
  // 设置表单初始值
  optionForm.optionValue = question.option[optionIndex];
  // 重置表单验证
  if (optionFormRef.value) {
    optionFormRef.value.resetFields();
  }
  // 显示对话框
  optionDialogVisible.value = true;
};

// 重置编辑状态
const resetEditState = () => {
  editingQuestion.value = null;
  editingOptionIndex.value = -1;
};

// 处理选项对话框确认
const handleOptionDialogConfirm = () => {
  if (!optionFormRef.value) return;

  optionFormRef.value.validate((valid: boolean) => {
    if (valid) {
      const trimmedValue = optionForm.optionValue.trim();

      if (dialogMode.value === "add" && selectedQuestion.value) {
        // 添加新选项
        // @ts-ignore
        selectedQuestion.value!.option.push(trimmedValue);
      } else if (
        dialogMode.value === "edit" &&
        editingQuestion.value &&
        editingQuestion.value.option &&
        editingOptionIndex.value !== -1
      ) {
        // 编辑现有选项
        editingQuestion.value.option[editingOptionIndex.value] = trimmedValue || "选项";
        resetEditState();
      }

      // 关闭对话框
      optionDialogVisible.value = false;
    }
  });
};

// 处理选项对话框取消
const handleOptionDialogCancel = () => {
  // 关闭对话框
  optionDialogVisible.value = false;

  // 如果是编辑模式，重置编辑状态
  if (dialogMode.value === "edit") {
    resetEditState();
  }
};

// 删除选项
const deleteOption = (question: any, optionIndex: number) => {
  ElMessageBox.confirm("确定要删除这个选项吗？", "删除选项", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 删除选项
      question.option.splice(optionIndex, 1);

      ElMessage.success("选项删除成功");
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 滚动到指定索引的题目
const scrollToQuestion = (index: number) => {
  nextTick(() => {
    const questionElements = document.querySelectorAll(".question-item");
    if (questionElements && questionElements[index]) {
      const targetElement = questionElements[index] as HTMLElement;
      const container = document.querySelector(".questionnaire-preview");

      if (container && targetElement) {
        const containerRect = (container as HTMLElement).getBoundingClientRect();
        const elementRect = targetElement.getBoundingClientRect();
        const scrollTop = (container as HTMLElement).scrollTop + elementRect.top - containerRect.top - 100;
        (container as HTMLElement).scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
        selectedQuestionIndex.value = index;
      }
    }
  });
};

// 添加题目
const addQuestion = () => {
  const newQuestion = {
    title: "",
    type: "single",
    option: [],
    max_length: 200,
    placeholder: "请输入内容",
  };

  // @ts-ignore
  questions.value.push(newQuestion);

  // 选中新添加的题目并滚动到该位置
  nextTick(() => {
    const newIndex = questions.value.length - 1;
    scrollToQuestion(newIndex);
  });
};

// 删除选中的题目
const deleteSelectedQuestion = () => {
  if (selectedQuestionIndex.value === null) return;

  ElMessageBox.confirm("确定要删除这道题目吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  })
    .then(() => {
      // 获取当前选中题目的索引
      const index = selectedQuestionIndex.value;
      if (index !== -1 && index !== null) {
        // 删除题目
        questions.value.splice(index, 1);

        // 调整选中状态
        if (questions.value.length > 0) {
          // 选中下一题或上一题
          if (index >= questions.value.length) {
            selectedQuestionIndex.value = index - 1;
          } else {
            selectedQuestionIndex.value = index;
          }
        } else {
          selectedQuestionIndex.value = null;
        }
      }
    })
    .catch(() => {
      // 用户取消删除
    });
};

// 上移题目
const moveQuestionUp = () => {
  if (selectedQuestionIndex.value === null) return;

  const index = selectedQuestionIndex.value;
  if (index > 0) {
    // 交换位置
    const temp = questions.value[index - 1];
    questions.value[index - 1] = questions.value[index];
    questions.value[index] = temp;

    // 保持选中状态
    selectedQuestionIndex.value = index - 1;
  } else {
    ElMessage.warning("已经是第一题了");
  }
};

// 下移题目
const moveQuestionDown = () => {
  if (selectedQuestionIndex.value === null) return;

  const index = selectedQuestionIndex.value;
  if (index < questions.value.length - 1) {
    // 交换位置
    const temp = questions.value[index + 1];
    questions.value[index + 1] = questions.value[index];
    questions.value[index] = temp;

    // 保持选中状态
    selectedQuestionIndex.value = index + 1;
  } else {
    ElMessage.warning("已经是最后一题了");
  }
};

// 返回
const handleBack = () => {
  // 检查是否有未保存的更改
  if (hasUnsavedChanges()) {
    ElMessageBox.confirm("有未保存的更改，确定要离开吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      // 这里可以添加返回逻辑
      handleBackToQuestionnaireList();
    });
  } else {
    // 这里可以添加返回逻辑
    handleBackToQuestionnaireList();
  }
};

// 返回问卷列表
const handleBackToQuestionnaireList = () => {
  // 这里可以添加返回问卷列表的逻辑
  Router.push({ name: "accompanyingMeals" });
};

// 取消
const handleCancel = () => {
  handleBack();
};

// 保存
const handleSave = async () => {
  if (!_.isNotEmptyString(questionnaireInfo.title)) {
    ElMessage.warning("请输入问卷标题");
    return;
  }
  if (!_.isNotEmptyArray(questions.value)) {
    ElMessage.warning("请添加题目");
    return;
  }
  // 检查题目类型
  for (let index = 0; index < questions.value.length; index++) {
    const q = questions.value[index];
    if (q.title === "请输入题目") {
      ElMessage.warning(`第${index + 1}题：请输入题目`);
      scrollToQuestion(index);
      return;
    }
    if (q.type !== "textarea" && !_.isNotEmptyArray(q.option)) {
      ElMessage.warning(`第${index + 1}题：请添加选择题的选项`);
      scrollToQuestion(index);
      return;
    }
  }

  try {
    // 构建保存数据
    const saveData = {
      ...questionnaireInfo,
      list: questions.value.map(q => ({
        ...q,
        option: JSON.stringify(q.option),
      })),
    };
    const { success, msg } = await apiCanteenQuestionnaireUpdate(saveData);
    if (success) {
      ElMessage.success("保存成功");
      handleBackToQuestionnaireList();
    } else {
      ElMessage.error(msg || "保存失败");
    }
  } catch (error) {
    ElMessage.error("保存失败");
    console.error("保存失败:", error);
  }
};

// 检查是否有未保存的更改
const hasUnsavedChanges = (): boolean => {
  // 这里可以实现更复杂的检查逻辑
  return true; // 简单示例，总是返回有更改
};

// 监听选中问题的类型变化
const watchSelectedQuestionType = () => {
  if (selectedQuestion.value && selectedQuestion.value.type === "textarea") {
    // 文本题不需要选项
    // @ts-ignore
    delete selectedQuestion.value.option;
    // 添加文本题特有属性
    if (!selectedQuestion.value.max_length) {
      selectedQuestion.value.max_length = 200;
    }
  } else if (selectedQuestion.value && !selectedQuestion.value.option) {
    selectedQuestion.value.max_length = 0;
    selectedQuestion.value.placeholder = " ";
    // 选择题需要选项，初始化空的选项数组
    selectedQuestion.value.option = [];
  }
};

// 监听选中问题变化
const unwatch = ref(() => {});
// 获取活动问卷
const getActivityQuestionnaire = async () => {
  try {
    loading.value = true;
    const { success, data, msg } = await apiCanteenActivityQuestionnaireList({
      id: questionnaireInfo.activity_id,
    });
    if (success) {
      questionnaireInfo.title = data.title;
      if (_.isNotEmptyArray(data.list)) {
        questions.value = data.list.map((q: Obj) => ({
          ...q,
          option: _.getJSONparse(q.option, []),
        }));
      }
    } else {
      ElMessage.error(msg || "获取活动问卷失败");
    }
    loading.value = false;
  } catch (error) {
    ElMessage.error("获取活动问卷失败");
    console.error("获取活动问卷失败:", error);
  }
};

// 初始化
onMounted(async () => {
  await getActivityQuestionnaire();
  // 选中第一个问题（如果有）
  if (questions.value.length > 0) {
    selectedQuestionIndex.value = 0;
  }

  // 监听选中问题的变化
  unwatch.value = () => {
    if (selectedQuestion.value) {
      watchSelectedQuestionType();
    }
  };

  // 监听类型变化
  const typeWatcher = () => {
    if (selectedQuestion.value) {
      watchSelectedQuestionType();
    }
  };

  // 这里应该使用Vue的watch函数，但为了简化示例，我们使用定时器
  const typeCheckInterval = setInterval(() => {
    if (selectedQuestion.value) {
      watchSelectedQuestionType();
    }
  }, 100);

  // 清理函数
});
</script>

<style scoped lang="scss">
.questionnaire-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;

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

  .main-content {
    flex: 1;
    display: flex;
    padding: 20px;
    gap: 20px;
    overflow: hidden;

    .left-panel {
      width: 300px;
      display: flex;
      flex-direction: column;
      gap: 20px;
      background-color: #fff;
      .panel-section {
        border-radius: 4px;
        padding: 16px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

        .section-title {
          margin: 0 0 16px 0;
          font-size: 16px;
          font-weight: 500;
          color: #303133;
        }

        .el-form {
          .el-form-item {
            margin-bottom: 16px;

            &:last-child {
              margin-bottom: 0;
            }
          }
        }
      }
    }

    .right-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .questionnaire-preview {
        flex: 1;
        background-color: #fff;
        border-radius: 4px;
        padding: 40px;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        overflow-y: auto;

        .questionnaire-header {
          text-align: center;
          margin-bottom: 40px;

          .questionnaire-title {
            margin: 0 0 20px 0;
            font-size: 24px;
            font-weight: 500;
            color: #303133;
            outline: none;
            min-height: 32px;
            word-break: break-all;

            &:empty:before {
              content: "问卷标题";
              color: #c0c4cc;
            }
          }

          .questionnaire-description {
            margin: 0;
            font-size: 14px;
            color: #606266;
            line-height: 1.6;
          }
        }

        .questions-container {
          display: flex;
          flex-direction: column;
          gap: 72px;
          margin-bottom: 40px;

          .question-item {
            display: flex;
            gap: 16px;
            padding: 12px 20px;
            border: 2px solid transparent;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            position: relative;
            &:hover {
              background-color: #fff;
              border: 2px solid #1890ff;
            }

            .option-item {
              display: flex;
              align-items: center;
              gap: 8px;
              margin-bottom: 8px;

              &:last-child {
                margin-bottom: 0;
              }

              .option-actions {
                display: flex;
                gap: 4px;
                margin-left: 8px;
              }

              .edit-option-btn {
                color: #606266;

                &:hover {
                  color: #409eff;
                }
              }

              .delete-option-btn {
                color: #f56c6c;

                &:hover {
                  color: #ff4d4f;
                }
              }
            }

            &.selected {
              background-color: #fff;
              border: 2px solid #1890ff;
            }

            /* 题目操作按钮样式 */
            .question-actions {
              width: 100%;
              display: flex;
              gap: 12px;
              margin-top: 16px;
              padding-top: 16px;
              padding: 16px 40px 16px;
              // border-top: 1px solid #ebeef5;
              position: absolute;
              bottom: -58px;
              left: 0;
              box-sizing: border-box;
              background-color: #fff;
              box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
              .el-button {
                font-size: 12px;
              }
            }

            .question-number {
              width: 42px;
              height: 42px;
              display: flex;
              align-items: center;
              justify-content: center;
              background-color: #f5f7fa;
              color: #606266;
              border-radius: 50%;
              font-size: 18px;
              font-weight: 700;
              flex-shrink: 0;
            }

            .question-content {
              flex: 1;

              .question-title {
                font-size: 16px;
                font-weight: 500;
                color: #303133;
                margin-bottom: 16px;
                min-height: 22px;
              }

              .question-options {
                display: flex;
                flex-direction: column;
                gap: 12px;

                .option-item {
                  display: flex;
                  align-items: center;

                  .el-radio,
                  .el-checkbox {
                    margin-right: 8px;
                  }
                }
              }

              .question-textarea {
                .el-textarea {
                  width: 100%;
                }
              }
            }
          }
        }
      }
    }
  }
}

// 自定义滚动条样式
:deep(.questionnaire-preview::-webkit-scrollbar) {
  width: 6px;
}

:deep(.questionnaire-preview::-webkit-scrollbar-track) {
  background: #f1f1f1;
  border-radius: 3px;
}

:deep(.questionnaire-preview::-webkit-scrollbar-thumb) {
  background: #c0c4cc;
  border-radius: 3px;
}

:deep(.questionnaire-preview::-webkit-scrollbar-thumb:hover) {
  background: #909399;
}
</style>
