<template>
  <div class="ingredient-container">
    <div class="ingredient-header">
      <div class="title">
        <ElButton icon="back" @click="onBack">返回</ElButton>
      </div>
      <div class="handle">
        <label>出库类型</label>
        <ElSelect v-model="commonModel.outType" filterable clearable placeholder="请选择出库类型">
          <ElOption
            v-for="item of commonModel.outTypeList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          ></ElOption>
        </ElSelect>
        <ElButton type="primary" :loading="tableModel.loading" @click="onTableConfirm">确定出库</ElButton>
      </div>
    </div>
    <div class="query-container">
      <div class="query-left">
        <ElForm ref="formRef" :model="tableModel.query" @submit.prevent>
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食材扫码" prop="id" class="w350">
            <ElInput
              ref="inputScanRef"
              v-model.trim="tableModel.query.id"
              autofocus
              maxlength="50"
              show-word-limit
              clearable
              placeholder="食材扫码"
              @input="onInputScan"
            ></ElInput>
          </ElFormItem>
          <ElFormItem class="tips">
            <p>注：请先点击食材扫码框，显示光标后，再使用扫码枪！</p>
          </ElFormItem>
        </ElForm>
      </div>
    </div>
    <div class="layout-table">
      <div class="table-header">计划出库食材</div>
      <div class="table-container">
        <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
          
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="食材名称" prop="pro_name" min-width="260" show-overflow-tooltip>
            <template #default="scope">
              <div class="preview-name">
                <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
                <p class="name ellipsis">{{ scope.row.pro_name }}</p>
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="规格"
            prop="specification"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="库存数量" prop="_count" width="150" align="center" show-overflow-tooltip>
            <template #default="scope"> {{ scope.row._count }}{{ scope.row.unit }} </template>
          </ElTableColumn>
          <ElTableColumn label="出库数量" prop="storeCount" min-width="150" align="center">
            <template #default="scope">
              <div class="center">
                <ElInputNumber
                  v-model="scope.row.storeCount"
                  :min="1"
                  :max="scope.row._count"
                  :step="scope.row?.measure_type === 1 ? 0.01 : 1"
                  step-strictly
                  controls-position="right"
                  placeholder=" "
                ></ElInputNumber
                >{{ scope.row.unit }}
              </div>
            </template>
          </ElTableColumn>
          <ElTableColumn label="单价(元)" prop="price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ _utils.FtoY(scope.row.price) }}
            </template>
          </ElTableColumn>D:\Project\sfs-canteen-client\canteen-system\src\views\StoreManagement\sub_views\IngredientStore\ingredientScanOut.vue
          <ElTableColumn label="结算价" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ _utils.FtoY(scope.row.guide_price) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="入库批次"
            prop="in_batch_no"
            min-width="220"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="入库时间"
            prop="in_time"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="食材类型"
            prop="pro_type_name"
            min-width="150"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="供应商"
            prop="supplier_name"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="生产日期"
            prop="pro_date"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn
            label="保质期(天)"
            prop="expired_day"
            min-width="160"
            align="center"
            show-overflow-tooltip
          ></ElTableColumn>
          <ElTableColumn label="到期时间" prop="end_day" min-width="160" align="center" show-overflow-tooltip>
            <template #default="scope">
              {{ sToDateTimeFilter(scope.row.end_day) }}
            </template>
          </ElTableColumn>
          <ElTableColumn fixed="right" label="操作" width="100" align="center">
            <template #default="scope">
              <div class="handle">
                <ElButton type="danger" link @click="onTableDelete(scope.$index)">删除</ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { OutTypeList } from "@/views/StoreManagement/aux_modules/const";
import { Message } from "@/global/const";
import { dateTimeFilter, timestampFilter, sToDateTimeFilter } from "@/utils/Dayjs";
import _utils from "@/utils/index";
import { apiInventoryBatchInfo, apiInventoryOuthouse } from "@/api/warehouse";

const Router = useRouter();
const formRef = ref();
const inputScanRef = ref();

let timer: NodeJS.Timeout | null = null;
const commonModel = reactive({
  outType: OutTypeList[0].value,
  outTypeList: OutTypeList,
});

/** 交互反馈数据 */
const tableModel = reactive<{
  loading: boolean;
  vLoading: boolean;
  query: Obj;
  data: Obj[];
}>({
  loading: false,
  vLoading: false,
  query: {
    id: "",
  },
  data: [],
});

/** 请求 */
const onTableRequest = async () => {
  if (tableModel.vLoading) return;
  tableModel.vLoading = true;
  inputScanRef.value.blur();
  const { success, data, message } = await apiInventoryBatchInfo(tableModel.query);
  if (success) {
    if (data && Reflect.ownKeys(data).length > 0) {
      data.pro_no = data.pro_no === "-1" ? "线下购买" : data.pro_no;
      data._count = _utils.KtoJ(data.count - data.out_count, data?.measure_type);

      if (data._count > 0) {
        const object = tableModel.data.find((item: Obj) => item.id === tableModel.query.id);
        if (object) {
          if (data._count > object.storeCount) {
            if (data._count - object.storeCount >= 1) {
              object.storeCount += 1;
            } else {
              object.storeCount = data._count;
            }
          } else {
            Message.warning(`【${data.pro_name}】食材剩余库存数量不足，无法继续出库！`);
          }
        } else {
          if (data._count > 1) {
            data.storeCount = 1;
          } else {
            data.storeCount = data._count;
          }
          tableModel.data.push(data);
        }
      } else {
        Message.warning(`【${data.pro_name}】食材库存数量不足，无法出库！`);
      }
    } else {
      Message.warning("未查询到食材信息");
    }
  } else {
    Message.warning(message);
  }
  tableModel.query.id = "";
  tableModel.vLoading = false;
  inputScanRef.value.focus();
};

const onInputScan = () => {
  if (timer) clearTimeout(timer);
  timer = setTimeout(() => {
    onTableSearch();
  }, 500);
};

/** 查询 */
const onTableSearch = () => {
  onTableRequest();
};
/** 清除 */
const onTableClear = () => {
  formRef.value?.resetFields();
};

const onTableEndTimeFilter = (data: Obj) => {
  const start = timestampFilter(data.pro_date);
  const limit = data.expired_day * 24 * 60 * 60 * 1000;
  const end = dateTimeFilter(start + limit);
  return end;
};

/** 删除 */
const onTableDelete = (index: number) => {
  tableModel.data.splice(index, 1);
};
const onTableConfirm = async () => {
  if (!commonModel.outType) {
    Message.warning("请选择出库类型");
    return;
  }
  if (tableModel.data.length === 0) {
    Message.warning("请扫描出库食材码");
    return;
  }
  tableModel.loading = true;
  const list = tableModel.data.map((item: Obj) => {
    return {
      batch_id: item.id,
      count: _utils.JtoK(item.storeCount, item?.measure_type),
    };
  });
  const { success, message } = await apiInventoryOuthouse({
    list,
    action_id: commonModel.outType,
  });
  if (success) {
    Message.success(`出库完成`);
    onBack();
  } else {
    Message.warning(message);
  }
  tableModel.loading = false;
};
const onBack = () => {
  Router.back();
};

onMounted(() => {
  setTimeout(() => {
    inputScanRef.value.focus();
  }, 500);
});

</script>

<style lang="scss" scoped>
.ingredient-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .ingredient-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: none;
    margin-bottom: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
    .title {
      display: flex;
      align-items: center;
      & > * {
        margin-right: var(--gap);
      }
    }
    .handle {
      display: flex;
      align-items: center;
      label {
        position: relative;
        &::before {
          content: "*";
          color: var(--el-color-danger);
        }
      }
      .el-select {
        width: 200px;
      }
      & > * {
        margin-left: var(--gap);
      }
    }
  }
  .query-container {
    padding: var(--gap) var(--gap) 0;
  }
  .layout-table {
    padding-top: 0;
    .table-container {
      border-left: 1px solid var(--bd-color-md);
      border-right: 1px solid var(--bd-color-md);
    }
    .ingredient {
      padding: 0 var(--gap-md);
      .preview {
        margin-right: var(--gap-md);
      }
      .info {
        line-height: var((--line-height-lg));
      }
    }
  }
  .table-source {
    flex: none;
    width: 380px;
    :deep(.el-table__body) {
      cursor: pointer;
    }
  }
  .table-header {
    padding: var(--gap);
    background: var(--el-color-primary);
    color: var(--el-color-white);
  }
}
</style>
