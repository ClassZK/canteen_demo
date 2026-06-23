<template>
  <div class="dpexev-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
    <div class="exev-header">
      <ElButton icon="back" @click="onBack">返回</ElButton>
      <p class="title">周排查详情</p>
    </div>
    <div class="form-container">
      <div class="exev-title">基本信息</div>
      <ElForm :model="formModel.checked" disabled label-width="80px" label-position="top">
        <ElRow :gutter="30">
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="学校名称" prop="unit_name">
              <ElInput v-model="formModel.checked.unit_name" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="自查时间" prop="inspection_time">
              <ElInput v-model="formModel.checked.inspection_time" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <template v-if="formModel.checked.submitor_name">
            <ElCol :sm="12" :lg="8" :xl="6">
              <ElFormItem label="提交人" prop="submitor_name">
                <ElInput v-model.trim="formModel.checked.submitor_name" placeholder=" "></ElInput>
              </ElFormItem>
            </ElCol>
            <ElCol :sm="12" :lg="8" :xl="6">
              <ElFormItem label="提交时间" prop="submit_time">
                <ElInput v-model="formModel.checked.submit_time" placeholder=" "></ElInput>
              </ElFormItem>
            </ElCol>
          </template>
          <ElCol :sm="12" :lg="8" :xl="6">
            <ElFormItem label="状态" prop="status">
              <ElSelect v-model="formModel.checked.status" filterable clearable placeholder="状态">
                <ElOption
                  v-for="item of CheckStatusList"
                  :key="item.value"
                  :label="item.name"
                  :value="item.value"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <div class="table-container">
      <div class="exev-title">自查详情</div>
      <ElTable border scrollbar-always-on :data="tableModel.data">
        <ElTableColumn type="index" width="50" align="center"></ElTableColumn>
        <ElTableColumn label="自查项目" prop="item" width="200" align="center"></ElTableColumn>
        <ElTableColumn label="自查内容" prop="content" min-width="200"></ElTableColumn>
        <ElTableColumn label="自查结果" prop="status" width="150" align="center">
          <template #default="scope">
            <ElRadioGroup v-model="scope.row.status" :disabled="formModel.disabled">
              <ElRadioButton v-for="item of CheckResultList" :label="item.name" :value="item.value" />
            </ElRadioGroup>
          </template>
        </ElTableColumn>
        <ElTableColumn label="自查不符合项说明" prop="not_ok_desc" min-width="200">
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
      <div class="form-conclusion">
        <ElForm
          ref="formRef"
          :model="formModel.data"
          :rules="formModel.rules"
          :disabled="formModel.disabled"
          :hide-required-asterisk="formModel.disabled"
          label-width="80px"
          label-position="top"
        >
          <ElFormItem label="自查结论" prop="conclusion">
            <ElInput
              v-model="formModel.data.conclusion"
              type="textarea"
              :rows="5"
              resize="none"
              maxlength="200"
              show-word-limit
              placeholder="请输入自查结论"
            ></ElInput>
          </ElFormItem>
        </ElForm>
        <template v-if="!formModel.showCheck">
          <div class="exev-button">
            <ElButton @click="onBack">返回</ElButton>
            <template v-if="formModel.checked.id && !formModel.disabled">
              <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">提交</ElButton>
            </template>
          </div>
        </template>
      </div>
    </div>
    <template v-if="formModel.showCheck">
      <div class="form-container">
        <div class="exev-title">审查结果</div>
        <ElForm :rules="formModel.rules" disabled label-width="80px" label-position="top">
          <ElRow :gutter="30">
            <ElCol :sm="12" :lg="8" :xl="6">
              <ElFormItem label="评价" prop="censor">
                <ElSelect v-model="formModel.checked.censor" filterable clearable placeholder="请选择评价">
                  <ElOption
                    v-for="item of EvaluationTypeList"
                    :key="item.value"
                    :label="item.name"
                    :value="item.value"
                  ></ElOption>
                </ElSelect>
              </ElFormItem>
            </ElCol>
            <ElCol>
              <ElFormItem label="审查说明" prop="review_notes">
                <ElInput
                  v-model="formModel.checked.review_notes"
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
        <div class="exev-button">
          <ElButton @click="onBack">返回</ElButton>
        </div>
      </div>
    </template>
  </div>
  <ICheckItemDetail></ICheckItemDetail>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter, useRoute } from "vue-router";
import ICheckItemDetail from "./sub_modules/CheckItemDetail.vue";
import { useSelfCheckEvaluationAuxStore } from "./aux_modules/store";
import {
  Message,
  CheckStatusEnum,
  CheckResultEnum,
  CheckStatusList,
  CheckResultList,
  EvaluationTypeList,
} from "@/global/const";
import { dateFilter } from "@/utils/Dayjs/index";
import _utils from "@/utils";
import { apiMonthlyPatrolDetail, apiMonthlyPatrolSubmit } from "@/api/supervision";

const Route = useRoute();
const Router = useRouter();
const formRef = ref();
const SelfCheckEvaluationAuxStore = useSelfCheckEvaluationAuxStore();

/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  disabled: false,
  showCheck: false,
  data: {} as Obj,
  checked: {} as Obj,
  rules: {
    conclusion: [{ required: true, message: "请输入自查结论", trigger: ["change", "blur"] }],
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
  const { success, data, message } = await apiMonthlyPatrolDetail({ id: Route.query.id });
  if (success) {
    data.inspection_time = dateFilter(data.inspection_time);
    formModel.checked = data;
    /** 自查结论 */
    formModel.disabled = false;
    formModel.data.conclusion = formModel.checked.conclusion || formModel.data.conclusion;
    formModel.showCheck = false;
    tableModel.data = _utils.getDefaultArray(formModel.checked.list);
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
        const { success, data, message } = await apiMonthlyPatrolSubmit({
          id: formModel.checked.id,
          conclusion: formModel.data.conclusion,
          list,
        });
        if (success) {
          Message.success("周排查提交成功");
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
  SelfCheckEvaluationAuxStore.$patch(state => {
    state.checkItemDetailData = data;
    state.checkItemDetailVisible = true;
  });
};

const onBack = () => {
  Router.back();
};
</script>

<style lang="scss" scoped></style>
