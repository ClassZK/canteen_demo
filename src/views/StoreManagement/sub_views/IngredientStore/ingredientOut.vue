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
        <ElForm ref="formRef" :model="tableModel.query">
          
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食材编号" prop="pro_no">
            <ElInput
              v-model.trim="tableModel.query.pro_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="食材编号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="批次号" prop="batch_no">
            <ElInput
              v-model.trim="tableModel.query.batch_no"
              maxlength="30"
              show-word-limit
              clearable
              placeholder="批次号"
            ></ElInput>
          </ElFormItem>
          <ElFormItem label="入库日期" prop="date">
            <ElDatePicker
              v-model="tableModel.query.date"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="选择入库日期"
            ></ElDatePicker>
          </ElFormItem>
        </ElForm>
      </div>
      <div class="query-right">
        <ElButton type="primary" @click="onTableSearch">查询</ElButton>
        <ElButton class="gray" @click="onTableReset">重置</ElButton>
      </div>
    </div>
    <div class="layout-horizontal">
      <div class="layout-table table-source" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="table-header">食材批次</div>
        <div class="table-container">
          <ElTable height="100%" scrollbar-always-on :data="tableModel.data" @row-click="onTableSourceRowClick">
            
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="食材信息" prop="食材信息" min-width="260" show-overflow-tooltip>
              <template #default="scope">
                <div class="ingredient">
                  <div class="preview-name">
                    <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
                    <p class="name ellipsis">{{ scope.row.pro_name }}</p>
                  </div>
                  <div class="info">
                    <p>{{ scope.row.in_batch_no }}</p>
                    <p>{{ scope.row.specification }}</p>
                    <p>{{ scope.row.supplier_name }}</p>
                  </div>
                </div>
              </template>
            </ElTableColumn>
            <ElTableColumn label="库存数量" prop="_count" width="100" align="center" show-overflow-tooltip>
              <template #default="scope"> {{ scope.row._count }}{{ scope.row.unit }} </template>
            </ElTableColumn>
          </ElTable>
        </div>
        <IPage
          :total="tableModel.total"
          :page="tableModel.query.page"
          :size="tableModel.query.size"
          layout="total, prev, pager, next"
          @change="onTablePage"
        ></IPage>
      </div>
      <div class="layout-table">
        <div class="table-header">计划出库食材</div>
        <div class="table-container">
          <ElTable height="100%" scrollbar-always-on :data="tableModel.checked">
            <ElTableColumn label="食材信息" prop="食材信息" min-width="230">
              <template #default="scope">
                <div class="ingredient">
                  <div class="preview-name">
                    <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
                    <p class="name ellipsis">{{ scope.row.pro_name }}</p>
                  </div>
                  <div class="info">
                    <p>{{ scope.row.in_batch_no }}</p>
                    <p>{{ scope.row.supplier_name }}</p>
                  </div>
                </div>
              </template>
            </ElTableColumn>
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
            <ElTableColumn
              label="规格"
              prop="specification"
              min-width="150"
              align="center"
              show-overflow-tooltip
            ></ElTableColumn>
            <ElTableColumn label="单价(元)" prop="price" min-width="150" align="center" show-overflow-tooltip>
            </ElTableColumn>
            <ElTableColumn label="结算价" prop="guide_price" min-width="150" align="center" show-overflow-tooltip>
              <template #default="scope">
                <p class="price ellipsis">{{ _utils.FtoY(scope.row.guide_price) }}元</p>
              </template>
            </ElTableColumn>
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
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { OutTypeList } from "@/views/StoreManagement/aux_modules/const";
import { Message } from "@/global/const";
import { dateTimeFilter, timestampFilter, sToDateTimeFilter } from "@/utils/Dayjs";
import _utils from "@/utils/index";
import { apiInventoryBatchList, apiInventoryOuthouse } from "@/api/warehouse";

const Router = useRouter();
const formRef = ref();

const commonModel = reactive({
  outType: OutTypeList[0].value,
  outTypeList: OutTypeList,
});

const tableQueryInitial = () => ({
  page: 1,
  size: 20,
  inventory_id: "",
  pro_no: "",
  batch_no: "",
  date: "",
});
/** 交互反馈数据 */
const tableModel = reactive<{
  loading: boolean;
  vLoading: boolean;
  query: Obj;
  total: number;
  data: Obj[];
  checked: Obj[];
}>({
  loading: false,
  vLoading: false,
  query: tableQueryInitial(),
  total: 0,
  data: [],
  checked: [],
});

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiInventoryBatchList(tableModel.query);
  if (success) {
    const list = _utils.getDefaultArray(data.list);
    tableModel.data = list.map((item: Obj) => {
      item.pro_no = item.pro_no === "-1" ? "线下购买" : item.pro_no;
      item._count = _utils.KtoJ(item.count - item.out_count, item?.measure_type);
      item.price = _utils.FtoY(item.price);
      item.end_day = sToDateTimeFilter(item.end_day);
      return item;
    });
    tableModel.total = data.total;
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();
/** 查询 */
const onTableSearch = () => {
  tableModel.query.page = 1;
  onTableRequest();
};
/** 重置 */
const onTableReset = () => {
  formRef.value?.resetFields();
  tableModel.query = tableQueryInitial();
  onTableRequest();
};
/** 分页 */
const onTablePage = (object: { page: number; size: number }) => {
  tableModel.query.page = object.page;
  tableModel.query.size = object.size;
  onTableRequest();
};

const onTableEndTimeFilter = (data: Obj) => {
  const start = timestampFilter(data.pro_date);
  const limit = data.expired_day * 24 * 60 * 60 * 1000;
  const end = dateTimeFilter(start + limit);
  return end;
};

const onTableSourceRowClick = (row: Obj) => {
  if (row._count > 0) {
    const object = tableModel.checked.find((item: Obj) => item.id === row.id);
    if (!object) {
      if (row._count > 1) {
        row.storeCount = 1;
      } else {
        row.storeCount = row._count;
      }
      tableModel.checked.push(row);
    }
  } else {
    Message.warning(`【${row.pro_name}】食材库存数量不足！`);
  }
};
/** 删除 */
const onTableDelete = (index: number) => {
  tableModel.checked.splice(index, 1);
};
const onTableConfirm = async () => {
  if (!commonModel.outType) {
    Message.warning("请选择出库类型");
    return;
  }
  if (tableModel.checked.length === 0) {
    Message.warning("请选择出库食材");
    return;
  }
  tableModel.loading = true;
  const list = tableModel.checked.map((item: Obj) => {
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
    width: 400px;
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
