<template>
  <ElDialog
    v-if="formModel.visible"
    width="1000px"
    :title="`从业人员${formModel.OperationTypeName}`"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    v-model="formModel.visible"
    draggable
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    @closed="onFormClosed"
  >
    <div class="form-container" v-loading="formModel.vLoading" element-loading-text="数据加载中">
      <ElForm
        ref="formRef"
        :model="formModel.data"
        :rules="formModel.rules"
        :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="24">
            <div class="form-section-title">基础信息</div>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="姓名" prop="user_name">
              <ElInput v-model="formModel.data.user_name" maxlength="20" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="联系电话" prop="phone">
              <ElInput
                v-model="formModel.data.phone"
                maxlength="11"
                :disabled="CanteenStaffAuxStore.OperationType !== OperationTypeEnum.add"
                placeholder=" "
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="岗位" prop="position">
              <ElInput v-model.trim="formModel.data.position" maxlength="30" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="直属上级" prop="superior_id">
              <ElSelect v-model="formModel.data.superior_id" filterable clearable placeholder="请选择直属上级" @change="onSuperiorChange">
                <ElOption
                  v-for="item of superiorOptions"
                  :key="item.id"
                  :label="`${item.name}（${item.role_name}）`"
                  :value="item.id"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="性别" prop="sex">
              <ElSelect v-model="formModel.data.sex" placeholder=" ">
                <ElOption v-for="item of SexList" :key="item.value" :label="item.name" :value="item.value"></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="年龄" prop="age">
              <ElInput v-model="formModel.data.age" type="number" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="身份证号" prop="id_card">
              <ElInput v-model="formModel.data.id_card" placeholder=" "></ElInput>
            </ElFormItem>
          </ElCol>

          <ElCol :span="12">
            <ElFormItem label="出生日期" prop="birthday">
              <ElDatePicker
                v-model="formModel.data.birthday"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择出生日期"
                :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="健康证有效期" prop="health_cert_expire_date">
              <ElDatePicker
                v-model="formModel.data.health_cert_expire_date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="选择健康证有效期"
                :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="角色" prop="role">
              <ElSelect v-model="formModel.data.role" placeholder=" ">
                <ElOption
                  v-for="item of CanteenStaffAuxStore.RoleList"
                  :key="item.role_id"
                  :label="item.role_name"
                  :value="item.role_id"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="CanteenStaffAuxStore.OperationType !== OperationTypeEnum.add" :span="12">
            <ElFormItem label="状态" prop="status">
              <ElTag :type="getPractitionerStatusType(formModel.data.status)">
                {{ getPractitionerStatusName(formModel.data.status) }}
              </ElTag>
            </ElFormItem>
          </ElCol>
          <ElCol :span="24">
            <div class="form-section-title upload-section-title">图片资料</div>
            <div class="upload-grid">
              <ElFormItem label="照片" prop="user_avatar_uri" class="upload-grid-item">
                <IUploadImage
                  :limit="1"
                  :data="formModel.data.user_avatar_uri"
                  :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
                  @success="handleAvatarSuccess"
                ></IUploadImage>
              </ElFormItem>
              <ElFormItem label="健康证" prop="health_cert" class="upload-grid-item">
                <IUploadImage
                  :limit="1"
                  :data="formModel.data.health_cert"
                  :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
                  @success="handleHealthCertSuccess"
                ></IUploadImage>
              </ElFormItem>
              <ElFormItem label="无犯罪证明" prop="no_criminal_cert" class="upload-grid-item">
                <IUploadImage
                  :limit="1"
                  :data="formModel.data.no_criminal_cert"
                  :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
                  tip="无犯罪证明"
                  @success="handleNoCriminalCertSuccess"
                ></IUploadImage>
              </ElFormItem>
              <ElFormItem label="证书" prop="certificate" class="upload-grid-item">
                <IUploadImage
                  :limit="1"
                  :data="formModel.data.certificate"
                  :disabled="CanteenStaffAuxStore.OperationType === OperationTypeEnum.detail"
                  tip="证书"
                  @success="handleCertificateSuccess"
                ></IUploadImage>
              </ElFormItem>
            </div>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="onFormClosed">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch, onBeforeMount, onMounted } from "vue";
import { useCanteenStaffAuxStore } from "../aux_modules/store";
import { validatorPhone, validatorIDCard, validatorAge } from "@/utils/Regexp/index";
import { OperationTypeEnum, OperationTypeName, Message, SexList } from "@/global/const";
import { apiCanteenStaffUpdate } from "@/api/recipe";
import { apiAttendanceHandoverUsers } from "@/api/attendance";

const CanteenStaffAuxStore = useCanteenStaffAuxStore();
const formRef = ref();
const superiorOptions = ref<Obj[]>([]);

/** 输入数据 函数方式 */
const formInitial = () => ({
  id: "",
  user_name: "",
  phone: "",
  user_avatar_uri: "",
  position: "",
  superior_id: "",
  superior_name: "",
  sex: "",
  age: "",
  id_card: "",
  birthday: "",
  health_cert: "",
  health_cert_expire_date: "",
  no_criminal_cert: "",
  certificate: "",
  role: "",
  status: 0,
});
/** 交互反馈数据 */
const formModel = reactive<Obj>({
  visible: false,
  loading: false,
  vLoading: true,
  OperationTypeName: "",
  data: formInitial(),
  rules: {
    user_name: [{ required: true, message: "请输入姓名", trigger: ["blur", "change"] }],
    user_avatar_uri: [{ required: true, message: "请上传照片", trigger: "change" }],
    position: [{ required: true, message: "请输入岗位", trigger: ["blur", "change"] }],
    superior_id: [{ required: true, message: "请选择直属上级", trigger: "change" }],
    phone: [{ required: true, validator: validatorPhone(), trigger: ["blur", "change"] }],
    sex: [{ required: true, message: "请选择性别", trigger: "change" }],
    age: [{ required: true, validator: validatorAge(), trigger: ["blur", "change"] }],
    id_card: [{ required: false, validator: validatorIDCard(), trigger: ["blur", "change"] }],
    birthday: [{ required: true, message: "请选择出生日期", trigger: "change" }],
    health_cert: [{ required: true, message: "请上传健康证", trigger: ["blur", "change"] }],
    health_cert_expire_date: [{ required: true, message: "请选择健康证有效期", trigger: "change" }],
    role: [{ required: true, message: "请选择角色", trigger: "change" }],
  },
});

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      const params: Obj = { ...formModel.data };
      params.age = Number(params.age);
      params.sex = Number(params.sex);
      const superior = superiorOptions.value.find(item => item.id === params.superior_id);
      params.superior_name = superior?.name || params.superior_name || "";
      const { success, message } = await apiCanteenStaffUpdate(params);
      if (success) {
        // Message.success(`从业人员 ${formModel.data.user_name} ${formModel.OperationTypeName}成功`);
        /** 操作成功刷新页面数据 */
        CanteenStaffAuxStore.$patch(state => {
          state.OperationType = OperationTypeEnum.default;
          state.refresh = new Date().getTime();
          formModel.data = formInitial();
        });
        formModel.visible = false;
      } else {
        Message.warning(message);
      }
      formModel.loading = false;
    }
  });
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  CanteenStaffAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
  formModel.visible = false;
};

const handleAvatarSuccess = (res: string) => {
  formModel.data.user_avatar_uri = res;
  // 重置表单头像验证
  formRef.value?.validateField("user_avatar_uri");
};
const handleHealthCertSuccess = (res: string) => {
  formModel.data.health_cert = res;
  // 重置表单健康证号验证
  formRef.value?.validateField("health_cert");
};
const handleNoCriminalCertSuccess = (res: string) => {
  formModel.data.no_criminal_cert = res;
};
const handleCertificateSuccess = (res: string) => {
  formModel.data.certificate = res;
};

const onSuperiorChange = (id: string) => {
  const superior = superiorOptions.value.find(item => item.id === id);
  formModel.data.superior_name = superior?.name || "";
};

const loadSuperiorOptions = async () => {
  const { success, data, message } = await apiAttendanceHandoverUsers();
  if (success) {
    superiorOptions.value = data?.list || [];
  } else {
    Message.warning(message || "获取直属上级失败");
  }
};

const PractitionerStatusList = [
  { name: "在职", value: "0" },
  { name: "离职", value: "1" },
];

const normalizePractitionerStatus = (status?: string | number | null) => {
  if (status === undefined || status === null || status === "") {
    return "0";
  }
  return String(status);
};

const getPractitionerStatusName = (status?: string | number | null) => {
  const normalizedStatus = normalizePractitionerStatus(status);
  return PractitionerStatusList.find(item => item.value === normalizedStatus)?.name || "-";
};

const getPractitionerStatusType = (status?: string | number | null) => {
  return normalizePractitionerStatus(status) === "1" ? "info" : "success";
};

onMounted(() => {
  formModel.vLoading = false;
  loadSuperiorOptions();
});
/** 监听操作类型 */
watch(
  () => CanteenStaffAuxStore.OperationType,
  type => {
    if (type === OperationTypeEnum.add || type === OperationTypeEnum.update || type === OperationTypeEnum.detail) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type];
      if (type !== OperationTypeEnum.add) {
        const data = JSON.parse(JSON.stringify(CanteenStaffAuxStore.data));
        for (const key in formModel.data) {
          if (!Object.hasOwn(data, key)) continue;
          formModel.data[key] = data[key];
        }
        formModel.data.sex = String(formModel.data.sex);
      }
    }
  },
);
</script>

<style lang="scss" scoped>
.form-section-title {
  display: flex;
  align-items: center;
  margin-bottom: var(--gap);
  color: var(--font-color-xl);
  font-size: 16px;
  font-weight: 600;
  line-height: 24px;
}

.form-section-title::before {
  display: inline-block;
  width: 3px;
  height: 16px;
  margin-right: var(--gap-lg);
  border-radius: var(--radius-sm);
  background: var(--el-color-primary);
  content: "";
}

.upload-section-title {
  margin-top: var(--gap);
  margin-bottom: var(--gap);
  padding-top: var(--gap);
  border-top: 1px solid var(--bd-color-md);
}

.upload-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: var(--gap) 36px;
  padding: var(--gap) 24px 4px;
  border: 1px solid var(--bd-color-md);
  border-radius: var(--radius-lg);
  background: var(--bg-color-xs);
}

.upload-grid-item {
  margin-bottom: var(--gap) !important;

  :deep(.el-form-item__label) {
    justify-content: center;
    width: 100%;
    padding-bottom: var(--gap-lg);
    line-height: 22px;
  }

  :deep(.upload-container) {
    text-align: center;
  }

  :deep(.upload-list) {
    justify-content: center;
  }

  :deep(.upload-list li) {
    margin: 0 0 var(--gap);
  }

  :deep(.upload-tip) {
    color: var(--font-color-sm);
    line-height: 20px;
    text-align: center;
  }
}
</style>
