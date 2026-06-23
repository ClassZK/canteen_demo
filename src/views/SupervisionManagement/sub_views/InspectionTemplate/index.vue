<template>
  <div class="inspection-template layout-table" v-loading="templateModel.loading" element-loading-text="数据加载中">
    <div class="template-header">
      <ElTabs v-model="templateModel.activeType" @tab-change="onTypeChange">
        <ElTabPane name="1" label="日管控模板"></ElTabPane>
        <ElTabPane name="0" label="周排查模板"></ElTabPane>
      </ElTabs>
      <ElButton type="primary" :loading="templateModel.saving" @click="onSave">保存模板</ElButton>
    </div>

    <div class="form-container">
      <div class="exev-title">基本信息</div>
      <ElForm class="template-form" :model="templateModel.data" label-width="80px" label-position="top">
        <ElRow :gutter="30">
          <ElCol :xs="24" :sm="12" :lg="8" :xl="6">
            <ElFormItem label="模板类型">
              <ElInput :model-value="currentLabels.title" disabled></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :xs="24" :sm="12" :lg="8" :xl="6">
            <ElFormItem label="模板名称" required>
              <ElInput v-model.trim="templateModel.data.name" maxlength="50" show-word-limit clearable placeholder="请输入模板名称"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <ElFormItem label="模板说明">
              <ElInput
                v-model="templateModel.data.remark"
                type="textarea"
                :rows="4"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder="请输入模板说明"
              ></ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>

    <div class="table-container">
      <div class="table-toolbar">
        <div class="exev-title">{{ currentLabels.detailTitle }}</div>
        <ElButton type="primary" @click="onAddRow">新增{{ currentLabels.detailTitle }}</ElButton>
      </div>
      <ElTable border scrollbar-always-on :data="templateModel.data.list">
        <ElTableColumn label="排序" width="80" align="center">
          <template #default="scope">{{ scope.$index + 1 }}</template>
        </ElTableColumn>
        <ElTableColumn :label="currentLabels.itemLabel" prop="item" width="220" align="center">
          <template #default="scope">
            <ElSelect v-model="scope.row.item" filterable placeholder="请选择">
              <ElOption v-for="item of templateModel.categories" :key="item.value" :label="item.name" :value="item.value"></ElOption>
            </ElSelect>
          </template>
        </ElTableColumn>
        <ElTableColumn :label="currentLabels.contentLabel" prop="content" min-width="320">
          <template #default="scope">
            <ElInput
              v-model="scope.row.content"
              type="textarea"
              :autosize="{ minRows: 1, maxRows: 3 }"
              resize="none"
              maxlength="200"
              show-word-limit
              :placeholder="`请输入${currentLabels.contentLabel}`"
            ></ElInput>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="180" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link :disabled="scope.$index === 0" @click="onMoveRow(scope.$index, -1)">上移</ElButton>
              <ElButton
                type="primary"
                link
                :disabled="scope.$index === templateModel.data.list.length - 1"
                @click="onMoveRow(scope.$index, 1)"
              >
                下移
              </ElButton>
              <ElButton type="danger" link @click="onDeleteRow(scope.$index)">删除</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed, onMounted, reactive } from "vue";
import { apiInspectionTemplateCategories, apiInspectionTemplateDetail, apiInspectionTemplateSave } from "@/api/supervision";
import { Message } from "@/global/const";
import _utils from "@/utils";

const templateModel = reactive({
  activeType: "1",
  loading: false,
  saving: false,
  categories: [] as Obj[],
  data: {
    type: "1",
    name: "",
    remark: "",
    list: [] as Obj[],
  },
});

const currentLabels = computed(() => {
  const isDaily = templateModel.activeType === "1";
  return {
    title: isDaily ? "日管控模板" : "周排查模板",
    detailTitle: isDaily ? "巡检详情" : "自查详情",
    itemLabel: isDaily ? "巡检项目" : "自查项目",
    contentLabel: isDaily ? "巡检内容" : "自查内容",
  };
});

const normalizeRows = () => {
  templateModel.data.list = templateModel.data.list.map((item, index) => ({
    ...item,
    sort: index + 1,
  }));
};

const onGetCategories = async () => {
  const { success, data, message } = await apiInspectionTemplateCategories({ type: templateModel.activeType });
  if (success) {
    templateModel.categories = _utils.getDefaultArray(data.list);
  } else {
    Message.warning(message);
  }
};

const onGetTemplate = async () => {
  templateModel.loading = true;
  const { success, data, message } = await apiInspectionTemplateDetail({ type: templateModel.activeType });
  if (success) {
    templateModel.data = {
      type: data.type || templateModel.activeType,
      name: data.name || "",
      remark: data.remark || "",
      list: _utils.getDefaultArray(data.list).map((item: Obj, index: number) => ({
        ...item,
        sort: item.sort || index + 1,
      })),
    };
  } else {
    Message.warning(message);
  }
  templateModel.loading = false;
};

const onTypeChange = async () => {
  await onGetCategories();
  await onGetTemplate();
};

const onAddRow = () => {
  const firstCategory = templateModel.categories[0]?.value || "";
  templateModel.data.list.push({
    item: firstCategory,
    sort: templateModel.data.list.length + 1,
    content: "",
  });
};

const onDeleteRow = (index: number) => {
  templateModel.data.list.splice(index, 1);
  normalizeRows();
};

const onMoveRow = (index: number, offset: number) => {
  const target = index + offset;
  if (target < 0 || target >= templateModel.data.list.length) return;
  const current = templateModel.data.list[index];
  templateModel.data.list[index] = templateModel.data.list[target];
  templateModel.data.list[target] = current;
  normalizeRows();
};

const validateBeforeSave = () => {
  if (!templateModel.data.name?.trim()) {
    Message.warning("请输入模板名称");
    return false;
  }
  if (!templateModel.data.list.length) {
    Message.warning(`请至少新增一条${currentLabels.value.detailTitle}`);
    return false;
  }
  for (let i = 0; i < templateModel.data.list.length; i++) {
    const item = templateModel.data.list[i];
    if (!item.item) {
      Message.warning(`请选择第${i + 1}条${currentLabels.value.itemLabel}`);
      return false;
    }
    if (!item.content?.trim()) {
      Message.warning(`请输入第${i + 1}条${currentLabels.value.contentLabel}`);
      return false;
    }
  }
  return true;
};

const onSave = async () => {
  if (!validateBeforeSave()) return;
  templateModel.saving = true;
  normalizeRows();
  const { success, message } = await apiInspectionTemplateSave({
    type: templateModel.activeType,
    name: templateModel.data.name.trim(),
    remark: templateModel.data.remark?.trim() || "",
    list: templateModel.data.list.map(item => ({
      item: item.item,
      sort: item.sort,
      content: item.content.trim(),
    })),
  });
  if (success) {
    Message.success("保存成功");
    await onGetTemplate();
  } else {
    Message.warning(message);
  }
  templateModel.saving = false;
};

onMounted(async () => {
  await onTypeChange();
});
</script>

<style lang="scss" scoped>
.inspection-template {
  overflow-y: auto;
  padding: var(--gap-8);
  box-sizing: border-box;
  gap: var(--gap-6);

  .template-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    column-gap: var(--gap-8);
    flex-shrink: 0;

    :deep(.el-tabs) {
      flex: 1;
    }

    :deep(.el-tabs__header) {
      margin: 0;
    }

    .el-button {
      flex-shrink: 0;
    }
  }

  .form-container,
  .table-container {
    padding: 18px 20px 20px;
    background: var(--color-white);
    border-radius: 8px;
    box-sizing: border-box;
  }

  .form-container {
    flex-shrink: 0;
  }

  .template-form {
    margin-top: 14px;

    :deep(.el-form-item) {
      margin-bottom: 18px;
    }

    :deep(.el-form-item__label) {
      line-height: 22px;
      padding-bottom: 8px;
    }
  }

  .table-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-shrink: 0;
    margin-bottom: 12px;
  }

  .exev-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
  }

  .handle {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;
    white-space: nowrap;
  }

  :deep(.el-select) {
    width: 100%;
  }

  :deep(.el-table .el-table__cell) {
    padding: 6px 0;
  }

  :deep(.el-textarea__inner) {
    min-height: 36px !important;
  }
}
</style>
