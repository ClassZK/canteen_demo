<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="记录类型" prop="status">
            <ElSelect v-model="tableModel.query.status" placeholder="请选择记录类型" @change="onTableSearch">
              <ElOption label="留样记录" :value="DestroyStatus.retained"></ElOption>
              <ElOption label="销样记录" :value="DestroyStatus.destroyed"></ElOption>
            </ElSelect>
          </ElFormItem>
          <ElFormItem label="时间范围">
            <ElDatePicker
              type="daterange"
              v-model="dateTimeModel.data"
              :value-format="dateTimeModel.valueFormat"
              :default-time="dateTimeModel.defaultTime"
              unlink-panels
              range-separator="-"
              @change="dateTimeModelChange"
              start-placeholder="开始时间"
              end-placeholder="结束时间"
            ></ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
        <ElButton type="primary" @click="onTableAdd">新增</ElButton>
        <ElButton
          v-if="tableModel.query.status === DestroyStatus.retained"
          type="warning"
          :disabled="!tableModel.data.some(item => item.can_destroy)"
          @click="onTableDestroyAll"
        >
          一键销样
        </ElButton>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
        
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="留样人" prop="sample_pepeole" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="留样时间" prop="sample_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="留样餐次" prop="sample_meal_types" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableMealtimeFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="留样重量(g)" prop="sample_weight" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="图片" prop="image" width="100" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ITablePreview :image="scope.row.image"></ITablePreview>
          </template>
        </ElTableColumn>
        <ElTableColumn label="状态" prop="status" min-width="120" align="center" show-overflow-tooltip>
          <template #default="scope">
            {{ onTableStatusFilter(scope.row) }}
          </template>
        </ElTableColumn>
        <ElTableColumn label="销样人" prop="handlers" min-width="150" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn label="销样时间" prop="handle_time" min-width="160" align="center" show-overflow-tooltip></ElTableColumn>
        <ElTableColumn fixed="right" label="操作" width="190" align="center">
          <template #default="scope">
            <div class="handle">
              <template v-if="scope.row.status !== DestroyStatus.destroyed">
                <ElButton type="danger" link @click="onTableDelete(scope.row)">删除</ElButton>
                <ElButton type="primary" link @click="onTableUpdate(scope.row)">编辑</ElButton>
                <ElButton v-if="scope.row.can_destroy" type="warning" link @click="onTableDestroy(scope.row)">
                  销样
                </ElButton>
              </template>
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
import { ref, reactive, watch } from "vue";
import { useSampleRetentionAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, MealtimeList } from "@/global/const";
import _utils from "@/utils/index";
import { apiFoodRetentionDestroy, apiFoodRetentionList, apiFoodRetentionDelete } from "@/api/inspection";
import { ElMessageBox } from "element-plus";

const SampleRetentionAuxStore = useSampleRetentionAuxStore();
const formRef = ref();
const DestroyStatus = {
  retained: "0",
  destroyed: "1",
};

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
    startTime: "",
    endTime: "",
    status: DestroyStatus.retained,
  },
  total: 0,
  data: [],
});

const dateTimeModel = reactive<{
  data: string[];
  valueFormat: string;
  defaultTime: Date[];
}>({
  data: [],
  valueFormat: "YYYY-MM-DD HH:mm:ss",
  defaultTime: [new Date(2000, 1, 1, 0, 0, 0), new Date(2000, 1, 1, 23, 59, 59)],
});

const dateTimeModelChange = (array: string[]) => {
  let startTime = "",
    endTime = "";
  if (Array.isArray(array)) {
    startTime = array[0];
    endTime = array[1];
  }
  tableModel.query.startTime = startTime;
  tableModel.query.endTime = endTime;
};

const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiFoodRetentionList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
const onTableReset = () => {
  dateTimeModel.data = [];
  tableModel.query.startTime = "";
  tableModel.query.endTime = "";
  tableModel.query.status = DestroyStatus.retained;
  formRef.value?.resetFields();
  onTableSearch();
};

const onTableMealtimeFilter = (data: Obj) => {
  if (!data.sample_meal_types) {
    return "";
  }

  const list = data.sample_meal_types.split(",");
  return list
    .map((value: string | number) => {
      const object = MealtimeList[value as number];
      return object?.name;
    })
    .join(",");
};
const onTableStatusFilter = (data: Obj) => {
  return data.status === DestroyStatus.destroyed ? "已销样" : "未销样";
};

const onTableAdd = () => {
  SampleRetentionAuxStore.$patch(state => {
    state.OperationType = OperationTypeEnum.add;
  });
};
const onTableUpdate = (data: Obj) => {
  SampleRetentionAuxStore.$patch(state => {
    state.data = data;
    state.OperationType = OperationTypeEnum.update;
  });
};
const onTableDelete = (data: Obj) => {
  ElMessageBox.alert("确定删除此条食品留样吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiFoodRetentionDelete({
          id: data.id,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success("食品留样删除成功");
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};
const onTableDestroy = (data: Obj) => {
  ElMessageBox.alert("确定销样此条食品留样吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, message } = await apiFoodRetentionDestroy({
          ids: [data.id],
        });
        if (success) {
          done();
          onTableRequest();
          Message.success("食品留样销样成功");
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};
const onTableDestroyAll = () => {
  ElMessageBox.alert("确定一键销样所有已满48小时的食品留样吗？", "温馨提示", {
    confirmButtonText: "确定",
    showCancelButton: true,
    cancelButtonText: "取消",
    draggable: true,
    type: "warning",
    customClass: "message-box-custom",
    beforeClose: async (action, instance, done) => {
      if (action === "confirm") {
        instance.confirmButtonLoading = true;
        const { success, data, message } = await apiFoodRetentionDestroy({
          all_due: true,
        });
        if (success) {
          done();
          onTableRequest();
          Message.success(`食品留样销样成功，共${data?.count || 0}条`);
        } else {
          Message.warning(message);
        }
      } else {
        done();
      }
    },
  })
    .then(() => {})
    .catch(() => {});
};

watch(
  () => SampleRetentionAuxStore.refresh,
  () => {
    onTableRequest();
  }
);

</script>

<style lang="scss" scoped></style>
