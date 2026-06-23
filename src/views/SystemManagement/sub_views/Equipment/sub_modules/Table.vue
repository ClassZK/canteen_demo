<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          <ElFormItem v-if="isPlatformUser" label="学校" prop="org_id">
            <ICascaderDepartment
              v-model="tableModel.query.org_id"
              filterable
              @change="onDepartmentChange"
            ></ICascaderDepartment>
          </ElFormItem>
          <ElFormItem label="设备编号" prop="device_code">
            <ElInput
              v-model.trim="tableModel.query.device_code"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="设备编号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="设备类型" prop="device_type">
            <ElSelect v-model="tableModel.query.device_type" filterable clearable placeholder="设备类型">
              <ElOption
                v-for="item of commonModel.equipmentList"
                :key="item.type_name"
                :label="item.type_name"
                :value="item.type_name"
              ></ElOption>
            </ElSelect>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        <ElTableColumn
          label="学校"
          prop="org_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="设备编号"
          prop="device_code"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="设备名称"
          prop="device_name"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="设备类型" prop="device_type" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="设备厂商"
          prop="device_factory"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="设备状态" prop="device_status" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableDeviceStatusFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="120" align="center">
          <template #default="scope">
            <div class="handle">
              <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
              <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
            </div>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
    <IPage
      :total="tableModel.total"
      :page="tableModel.query.page"
      :size="tableModel.query.size"
      @change="onTablePage"
    ></IPage>
  </div>
</template>

<script lang="ts" setup>
import { computed, ref, reactive, watch } from "vue";
import Storage from "tddev/storage";
import { OperationTypeEnum, Message, EquipmentStatusList } from "@/global/const";
import { useEquipmentAuxStore } from "../aux_modules/store";
import _utils from "@/utils/index";
import { apiDeviceTypes, apiDeviceList, apiDeviceDelete } from "@/api/admin";
import { ElMessageBox } from "element-plus";
const EquipmentAuxStore = useEquipmentAuxStore();
const formRef = ref();
const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
const isPlatformUser = computed(() => systemUserinfo?.user_scope === "platform");
const commonModel = reactive<{
  equipmentList: Obj[];
}>({
  equipmentList: [],
});
/** 交互反馈数据 */
const tableModel = reactive<{
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
}>({
  vLoading: false,
  query: {
    page: 1,
    size: 20,
    org_id: "",
    device_code: "",
    device_type: "",
  },
  total: 0,
  data: [],
});

/** 设备类型 */
const onApiDeviceTypes = async () => {
  const { success, data, message } = await apiDeviceTypes();
  if (success) {
    commonModel.equipmentList = data.device_types;
    EquipmentAuxStore.$patch(state => {
      state.equipmentList = commonModel.equipmentList;
    });
  } else {
    Message.warning(message);
  }
};
onApiDeviceTypes();

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiDeviceList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.device_list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
/** 查询 */
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = () => {
  tableModel.query.page = 1;
  tableModel.query.device_code = "";
  tableModel.query.device_type = "";
  onTableSearch();
};

const onTableDeviceStatusFilter = (data: Obj) => {
  let text = "";
  const object = EquipmentStatusList.find((item: Obj) => item.value === data.device_status);
  if (object) {
    text = object.name;
  }
  return text;
};

/** 新增 */
const onTableAdd = () => {
  EquipmentAuxStore.$patch(state => {
    state.org_id = tableModel.query.org_id;
    state.OperationType = OperationTypeEnum.add;
  });
};
/** 编辑 */
const onTableUpdate = (data: Obj) => {
  EquipmentAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
/** 删除 */
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert(`确定删除设备 ${data.device_name} 吗？`, "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiDeviceDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`设备 ${data.device_name} 删除成功`);
        } else {
          Message.warning(message);
        }
        // instance.confirmButtonLoading = false;
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

const onDepartmentChange = (value: string | number) => {
  tableModel.query.org_id = value;
};

watch(
  () => EquipmentAuxStore.refresh,
  () => {
    onTableRequest();
  },
);
</script>

<style lang="scss" scoped></style>
