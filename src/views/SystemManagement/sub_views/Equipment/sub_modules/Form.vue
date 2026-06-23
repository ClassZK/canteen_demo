<template>
  <ElDialog
    width="1000px"
    :title="`设备${formModel.OperationTypeName}`"
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
        scroll-to-error
        label-width="80px"
        label-position="top"
      >
        <ElRow :gutter="30">
          <ElCol :span="12">
            <ElFormItem label="学校" prop="org_id">
              <ICascaderDepartment
                v-model="formModel.data.org_id"
                filterable
                noCache
                @change="onDepartmentChange"
                placeholder="请选择学校"
              ></ICascaderDepartment>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="设备编号" prop="device_code">
              <ElInput
                v-model="formModel.data.device_code"
                maxlength="100"
                show-word-limit
                clearable
                placeholder="请输入设备编号"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="设备名称" prop="device_name">
              <ElInput
                v-model="formModel.data.device_name"
                maxlength="30"
                show-word-limit
                clearable
                placeholder="请输入设备名称"
              ></ElInput>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="设备类型" prop="device_type">
              <ElSelect
                v-model="formModel.data.device_type"
                filterable
                clearable
                placeholder="请选择设备类型"
                @change="onDeviceTypeChange"
              >
                <ElOption
                  v-for="item of commonModel.equipmentList"
                  :key="item.type_name"
                  :label="item.type_name"
                  :value="item.type_name"
                ></ElOption>
              </ElSelect>
            </ElFormItem>
          </ElCol>
          <ElCol :span="12">
            <ElFormItem label="设备状态" prop="device_status">
              <ElSelect v-model="formModel.data.device_status" filterable clearable placeholder="请选择设备状态">
                <ElOption
                  v-for="item of EquipmentStatusList"
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
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="formModel.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="formModel.loading" @click="onFormConfirm">确定</ElButton>
      </div>
    </template>
  </ElDialog>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from "vue";
import { useEquipmentAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, OperationTypeName, Message, EquipmentStatusList } from "@/global/const";
import { apiDeviceAdd, apiDeviceUpdate } from "@/api/admin";
import _utils from "@/utils";

const EquipmentAuxStore = useEquipmentAuxStore();
const formRef = ref();

const commonModel = reactive<{
  equipmentList: Obj[];
}>({
  equipmentList: [],
});

/** 输入数据 函数方式 */
const formInitial = () => ({
  device_code: "",
  device_name: "",
  device_type: "",
  device_type_code: "",
  device_factory: "",
  device_status: "",
  org_id: "",
});
/** 交互反馈数据 */
const formModel = reactive({
  visible: false,
  loading: false,
  vLoading: false,
  OperationTypeName: "",
  data: formInitial() as Obj,
  rules: {
    device_code: [{ required: true, message: "请输入设备编号", trigger: ["change", "blur"] }],
    device_name: [{ required: true, message: "请输入设备名称", trigger: ["change", "blur"] }],
    device_type: [{ required: true, message: "请选择设备类型", trigger: ["change", "blur"] }],
    device_status: [{ required: true, message: "请选择设备状态", trigger: ["change", "blur"] }],
    org_id: [{ required: true, message: "请选择学校", trigger: ["change", "blur"] }],
  },
});

const onDeviceTypeChange = (value: string) => {
  let device_type_code = "",
    device_factory = "";
  if (value) {
    const object = commonModel.equipmentList.find((item: Obj) => item.type_name === value);
    if (object) {
      device_type_code = object.type_code;
      device_factory = object.device_factory;
    }
  }
  formModel.data.device_type_code = device_type_code;
  formModel.data.device_factory = device_factory;
};

/** 确定 */
const onFormConfirm = async () => {
  await formRef.value?.validate(async (valid: boolean) => {
    if (valid) {
      Message.close();
      formModel.loading = true;
      /** 判断操作类型 */
      switch (EquipmentAuxStore.OperationType) {
        case OperationTypeEnum.add:
          await onFormAdd();
          break;
        case OperationTypeEnum.update:
          await onFormUpdate();
          break;
        default:
          formModel.loading = false;
          formModel.visible = false;
          break;
      }
    }
  });
};

/** 新增 */
const onFormAdd = async () => {
  const { success, message } = await apiDeviceAdd(formModel.data);
  if (success) {
    /** 操作成功刷新页面数据 */
    EquipmentAuxStore.$patch(state => {
      state.refresh = new Date().getTime();
    });
    formModel.visible = false;
  }
  onMessage(success, message);
};
/** 编辑 */
const onFormUpdate = async () => {
  const { success, message } = await apiDeviceUpdate(formModel.data);
  if (success) {
    /** 操作成功刷新页面数据 */
    EquipmentAuxStore.$patch(state => {
      state.refresh = new Date().getTime();
    });
    formModel.visible = false;
  }
  onMessage(success, message);
};
/** 提示 */
const onMessage = (success: boolean, message: string) => {
  const messageText = `设备 ${formModel.data.device_name} ${formModel.OperationTypeName}成功`;
  if (success) {
    Message.success(messageText);
  } else {
    Message.warning(message);
  }
  formModel.loading = false;
};

const onDepartmentChange = (value: string | number) => {
  formModel.data.org_id = value;
};

/** 取消 */
const onFormClosed = () => {
  formModel.data = formInitial();
  formRef.value?.resetFields();
  EquipmentAuxStore.$patch(state => {
    state.data = {};
    state.OperationType = OperationTypeEnum.default;
  });
};

watch(
  () => EquipmentAuxStore.equipmentList,
  array => {
    commonModel.equipmentList = array;
  },
  {
    deep: true,
  }
);

/** 监听操作类型 */
watch(
  () => EquipmentAuxStore.OperationType,
  type => {
    const array = [OperationTypeEnum.add, OperationTypeEnum.update];
    if (array.includes(type as OperationTypeEnum)) {
      formModel.visible = true;
      formModel.OperationTypeName = OperationTypeName[type];
      if (type === OperationTypeEnum.add) {
        formModel.data.org_id = EquipmentAuxStore.org_id;
      }

      if (type === OperationTypeEnum.update) {
        /** 回显数据 */
        const data = JSON.parse(JSON.stringify(EquipmentAuxStore.data));
        formModel.data = data;
      }
    }
  }
);
</script>

<style lang="scss" scoped></style>
