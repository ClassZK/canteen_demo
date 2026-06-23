<template>
  <div class="dpexev-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
    <div class="exev-header">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <p class="title">日管控详情</p>
    </div>
    <div class="form-container">
      <div class="exev-title">基本信息</div>
      <ElForm :model="formModel.checked" disabled label-width="80px" label-position="top">
        <ElRow :gutter="30">
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="巡检主题" prop="theme">
              <ElInput v-model="formModel.checked.theme" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="学校" prop="unit_name">
              <ElInput v-model="formModel.checked.unit_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <template v-if="formModel.checked.inspector_name">
            <ElCol :sm="12" :lg="8" :xl="6">
              <ElFormItem label="巡检人" prop="inspector_name">
                <ElInput v-model.trim="formModel.checked.inspector_name" placeholder=" "></ElInput>
              </ElFormItem>
            </ElCol>
          </template>
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="巡检时间" prop="inspection_time">
              <ElInput v-model="formModel.checked.inspection_time" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="状态" prop="status">
              <ElSelect v-model="formModel.checked.status" filterable clearable placeholder="状态">
                <ElOption
                  v-for="item of HandleStatusList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol>
            <ElFormItem label="巡检任务" prop="task_desc">
              <ElInput
                v-model="formModel.checked.task_desc"
                type="textarea"
                :rows="5"
                resize="none"
                maxlength="200"
                show-word-limit
                placeholder=" "
              ></ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <div class="table-container">
      <div class="exev-title">巡检详情</div>
      <ElTable border scrollbar-always-on :data="tableModel.data">
        <ElTableColumn type="index" width="50" align="center"></ElTableColumn>
        <ElTableColumn label="巡检项目" prop="item" width="200" align="center"></ElTableColumn>
        <ElTableColumn label="巡检内容" prop="content" min-width="200"></ElTableColumn>
        <ElTableColumn label="巡检结果" prop="status" width="150" align="center">
          <template #default="scope">
            <ElRadioGroup v-model="scope.row.status" :disabled="formModel.disabled">
              <ElRadioButton v-for="item of CheckResultList" :label="item.name" :value="item.value" />
            </ElRadioGroup>
          </template>
        </ElTableColumn>
        <ElTableColumn label="巡检不符合项说明" prop="not_ok_desc" min-width="200">
          <template #default="scope">
            <ElInput
              v-model="scope.row.not_ok_desc"
              :disabled="scope.row.status !== CheckResultEnum.No || formModel.disabled"
              maxlength="200"
              placeholder=" "
            ></ElInput>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="整改情况（包括整改时间、措施、完成情况等）"
          prop="rectification_situation"
          min-width="200"
        >
          <template #default="scope">
            <ElInput
              v-model="scope.row.rectification_situation"
              :disabled="scope.row.status !== CheckResultEnum.No || formModel.disabled"
              maxlength="200"
              placeholder=" "
            ></ElInput>
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="100" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="primary" link @click="onTableCheckItemDetail(scope.row)">详情</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <div class="form-container">
      <div class="exev-title">巡检结果</div>
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formModel.rules"
        :disabled="formModel.disabled"
        :hide-required-asterisk="formModel.disabled"
        label-width="80px"
        label-position="top"
      >
        <ElFormItem label="巡检情况说明" prop="process_desc">
          <ElInput
            v-model="formModel.data.process_desc"
            type="textarea"
            :rows="5"
            resize="none"
            maxlength="200"
            show-word-limit
            placeholder="请输入巡检情况说明"
          ></ElInput>
        </ElFormItem>
      </ElForm>
      <div class="exev-button">
        <ElButton @click="onBack">返回</ElButton>
        <template v-if="formModel.checked.id && !formModel.disabled">
          <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">提交</ElButton>
        </template>
      </div>
    </div>
  </div>
  <ICheckItemDetail></ICheckItemDetail>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import ICheckItemDetail from "./sub_modules/CheckItemDetail.vue";
import { Message, HandleStatusEnum, HandleStatusList, CheckResultEnum, CheckResultList } from "@/global/const";
import { useDailyPatrolAuxStore } from "./aux_modules/store";
import _utils from "@/utils";
import { apiDailyPatrolDetail, apiDailyPatrolSubmit } from "@/api/supervision";

const Route = useRoute();
const Router = useRouter();
const formRef = ref();
const DailyPatrolAuxStore = useDailyPatrolAuxStore();

/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  disabled: false,
  data: {} as Obj,
  checked: {} as Obj,
  rules: {
    process_desc: [{ required: true, message: "请输入巡检情况说明", trigger: ["change", "blur"] }],
  },
});

/** 交互反馈数据 */
const tableModel = reactive<{
  data: Obj[];
}>({
  data: [],
});

/** 请求 */
const onGetDetail = async () => {
  formModel.vLoading = true;
  const { success, data, message } = await apiDailyPatrolDetail({ id: Route.query.id });
  if (success) {
    formModel.checked = data;
    /** 巡检结果 */
    formModel.disabled = false;
    formModel.data.process_desc = formModel.checked.process_desc || formModel.data.process_desc;
    tableModel.data = _utils.getDefaultArray(formModel.checked.items);
  } else {
    Message.warning(message);
  }
  formModel.vLoading = false;
};
onGetDetail();

const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();

      let list = [],
        isPass = true;
      for (let i = 0, len = tableModel.data.length; i < len; i++) {
        const _data = tableModel.data[i];
        const isStatus = [CheckResultEnum.Yes, CheckResultEnum.No].includes(_data.status);
        if (isStatus) {
          if (_data.status === CheckResultEnum.No) {
            if (!_data.not_ok_desc) {
              Message.warning(`请输入第${i + 1}项不符合项说明`);
              isPass = false;
              break;
            }
            if (!_data.rectification_situation) {
              Message.warning(`请输入第${i + 1}项整改情况`);
              isPass = false;
              break;
            }
          } else {
            _data.not_ok_desc = "";
            _data.rectification_situation = "";
          }
        } else {
          Message.warning(`请选择第${i + 1}项自查结果`);
          isPass = false;
          break;
        }
        list.push({
          id: _data.id,
          status: _data.status,
          not_ok_desc: _data.not_ok_desc,
          rectification_situation: _data.rectification_situation,
        });
      }

      if (isPass) {
        formModel.loading = true;
        const { success, data, message } = await apiDailyPatrolSubmit({
          id: formModel.checked.id,
          process_desc: formModel.data.process_desc,
          items: tableModel.data,
        });
        if (success) {
          Message.success("日管控提交成功");
          onBack();
        } else {
          Message.warning(message);
        }
        formModel.loading = false;
      }
    }
  });
};
const onTableCheckItemDetail = (data: Obj) => {
  DailyPatrolAuxStore.$patch(state => {
    state.checkItemDetailData = data;
    state.checkItemDetailVisible = true;
  });
};

const onBack = () => {
  Router.back();
};
</script>

<style lang="scss" scoped></style>
