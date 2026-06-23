<template>
  <ElDialog
    v-model="show"
    :title="OrganizationAuxStore.logType > 0 ? '编辑组织' : '新增组织'"
    width="1000px"
    class="dialog-container"
    modal-class="dialog-overlay-custom"
    destroy-on-close
    append-to-body
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    draggable
    @closed="close"
  >
    <div class="form-container">
      <ElForm ref="formRef" :model="formModel.data" :rules="formModel.rules" scroll-to-error label-width="88px">
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="组织名称" prop="name">
              <ElInput
                v-model="formModel.data.name"
                maxlength="15"
                minlength="2"
                clearable
                placeholder="请输入"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12" v-if="!OrganizationAuxStore.logType">
            <ElFormItem label="组织编码" prop="code">
              <ElInput
                v-model="formModel.data.code"
                maxlength="20"
                minlength="2"
                clearable
                placeholder="请输入"
              ></ElInput> </ElFormItem
          ></ElCol>
          <ElCol :span="12" v-if="!OrganizationAuxStore.logType">
            <ElFormItem label="行政区划" prop="city_id">
              <ElCascader
                v-model="formModel.data.city_id"
                :options="OrganizationAuxStore.districtTree"
                filterable
                :props="{
                  value: 'id',
                  label: 'name',
                  children: 'child',
                  checkStrictly: true,
                }"
                @change="handleChange"
              />
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="组织地址" prop="address">
              <ElInput
                v-model="formModel.data.address"
                maxlength="20"
                minlength="2"
                clearable
                placeholder="请输入"
              ></ElInput> </ElFormItem
          ></ElCol> 
          <ElCol :span="12">
            <ElFormItem label="负责人" prop="contact_name">
              <ElInput v-model="formModel.data.contact_name" maxlength="20" clearable placeholder="请输入负责人"></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="联系电话" prop="contact_phone">
              <ElInput v-model="formModel.data.contact_phone" maxlength="11" clearable placeholder="请输入联系电话"></ElInput>
            </ElFormItem>
          </ElCol>
        </ElRow>

        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="组织图标" prop="icon_url">
              <IUploadImage :limit="1" :data="formModel.data.icon_url" @success="onUploadImage"></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol v-if="!OrganizationAuxStore.logType" :span="12">
            <ElFormItem label="组织类型" prop="unit_attr">
              <ElSelect v-model="formModel.data.unit_attr" placeholder="请选择" filterable>
                <ElOption v-for="item in ORG_UNIT_ATTR" :key="item.value" :label="item.label" :value="item.value" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
        </ElRow>
        <ElRow :gutter="30" v-if="formModel.data.unit_attr === '8'">
          <ElCol :span="12">
            <ElFormItem label="是否自营食堂" prop="independent">
              <ElSelect v-model="formModel.data.independent" placeholder="请选择" filterable>
                <ElOption v-for="item in WhetherList" :key="item.value" :label="item.name" :value="item.value" />
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="经营许可证编号" prop="business_license_no">
              <ElInput
                v-model="formModel.data.business_license_no"
                maxlength="100"
                clearable
                placeholder="请输入经营许可证编号"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="经营许可证图片" prop="business_license_image">
              <IUploadImage
                :limit="1"
                :data="formModel.data.business_license_image"
                @success="onUploadBusinessLicenseImage"
              ></IUploadImage>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="许可证有效期" prop="business_license_expire_date">
              <ElDatePicker
                v-model="formModel.data.business_license_expire_date"
                type="date"
                value-format="YYYY-MM-DD"
                placeholder="请选择有效期"
              ></ElDatePicker>
            </ElFormItem>
          </ElCol>
        </ElRow>
      </ElForm>
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="close">取 消</ElButton>
        <ElButton type="primary" @click="submitForm(formRef)">确 定</ElButton>
      </div></template
    >
  </ElDialog>
</template>
<script lang="ts" setup>
import _ from "tddev/utils";
import { ref, reactive, onMounted } from "vue";
import { type FormInstance, ElMessage } from "element-plus";
import { useOrganizationAuxStore } from "../aux_modules/store";
import { ORG_UNIT_ATTR } from "../aux_modules/const";
import { apiAdminDistrictUpdate } from "@/api/management";
import { WhetherList } from "@/global/const";
const OrganizationAuxStore = useOrganizationAuxStore();

const props = defineProps<{ Id?: number; Pid: number }>();
const formRef = ref<FormInstance>();
const formModel = reactive<Obj>({
  loading: false,
  data: {
    name: "",
    code: "",
    city_id: ["330000", "330100"],
    address: "",
    icon_url: "",
    unit_attr: "",
    parent_id: "",
    independent: "",
    business_license_no: "",
    business_license_image: "",
    business_license_expire_date: "",
    contact_name: "",
    contact_phone: "",
    id: "",
  },
  rules: {
    name: [
      { required: true, message: "请输入组织名称", trigger: ["change", "blur"] },
      { min: 2, max: 15, message: "组织名称长度为2-15位", trigger: ["change", "blur"] },
    ],
    code: [
      { required: true, message: "请输入组织编码", trigger: ["change", "blur"] },
      { min: 2, max: 20, message: "组织编码长度为2-20位", trigger: ["change", "blur"] },
    ],
    city_id: [
      { required: true, message: "请选择行政区划", trigger: ["change", "blur"] },
      {
        type: "array",
        message: "请选择行政区划",
        trigger: ["change", "blur"],
      },
    ],
    address: [
      { required: true, message: "请输入组织地址", trigger: ["change", "blur"] },
      { min: 2, max: 20, message: "组织地址长度为2-50位", trigger: ["change", "blur"] },
    ],
    icon_url: [
      { required: true, message: "请上传组织图标", trigger: ["change", "blur"] },
      // {
      //   type: "array",
      //   message: "请上传组织图标",
      //   trigger: ["change", "blur"],
      // },
    ],
    unit_attr: [{ required: true, message: "请选择组织类型", trigger: ["change", "blur"] }],
    contact_name: [{ required: true, message: "请输入负责人", trigger: ["change", "blur"] }],
    contact_phone: [{ required: true, message: "请输入联系电话", trigger: ["change", "blur"] }],
    business_license_no: [
      { required: OrganizationAuxStore.logType === 0, message: "请输入经营许可证编号", trigger: ["change", "blur"] },
    ],
    business_license_image: [
      { required: OrganizationAuxStore.logType === 0, message: "请上传经营许可证图片", trigger: ["change", "blur"] },
    ],
    business_license_expire_date: [
      { required: OrganizationAuxStore.logType === 0, message: "请选择经营许可证有效期", trigger: ["change", "blur"] },
    ],
  },
  roleList: [],
  sectionList: [],
});
const emits = defineEmits(["submit", "close"]);

const show = ref(true);
// 新增提交
const submitForm = async (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      const params = _.deepClone(formModel.data);
      params.city_id = formModel.data.city_id[formModel.data.city_id.length - 1];
      params.org_name = params.name;
      params.unit_attr_name = ORG_UNIT_ATTR.find(item => item.value === params.unit_attr)?.label || "";
      params.independent = Number(formModel.data.independent);
      if (params.unit_attr !== "8") {
        params.business_license_no = "";
        params.business_license_image = "";
        params.business_license_expire_date = "";
      }
      console.log("params", params);

      const { success, message } = await apiAdminDistrictUpdate(params);
      if (success) {
        show.value = false;
        emits("submit");
        ElMessage.success(`组织${OrganizationAuxStore.logType > 0 ? "编辑" : "新增"}成功`);
        OrganizationAuxStore.getOrg = !OrganizationAuxStore.getOrg;
      } else {
        ElMessage.error(message || `组织${OrganizationAuxStore.logType > 0 ? "编辑" : "新增"}失败`);
      }
    }
  });
};

// 关闭
const close = async () => {
  show.value = false;
  emits("close");
};

/** 上传组织图标 */
const onUploadImage = (imgs: Obj) => {
  formModel.data.icon_url = imgs;
  formRef.value?.validateField("icon_url");
};

const onUploadBusinessLicenseImage = (imgs: Obj) => {
  formModel.data.business_license_image = imgs;
  formRef.value?.validateField("business_license_image");
};
/** 组织行政区划选择改变 */
const handleChange = (val: Obj) => {
  // formModel.data.city_id = val.id;
  console.log("val", val);
};

onMounted(() => {
  if (OrganizationAuxStore.logType === 0) {
    formModel.data.parent_id = OrganizationAuxStore.pid;
    const parent = OrganizationAuxStore.checked || {};
    const nextUnitAttr = parent.unit_attr === "2" ? "4" : parent.unit_attr === "4" ? "8" : "2";
    formModel.data.unit_attr = nextUnitAttr;
    formModel.data.contact_name = "组织负责人";
    formModel.data.contact_phone = "13800000000";
  } else {
    formModel.data = OrganizationAuxStore.current;
    formModel.data.city_id = [formModel.data.city_id];
    formModel.data.independent = String(formModel.data.independent);
  }
});
</script>
<style lang="scss" scoped></style>
