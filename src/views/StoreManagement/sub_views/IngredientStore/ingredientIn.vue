<template>
  <div class="ingredient-container">
    <div class="ingredient-header">
      <div class="title">
        <ElButton icon="back" @click="onBack">返回</ElButton>
      </div>
      <div class="handle">
          <ElButton @click="onTableAdd">新增自采入库信息</ElButton>
          <ElButton type="primary" :loading="tableModel.loading" @click="onFormConfirm">确定入库</ElButton>
      </div>
    </div>
    <div class="layout-table">
      <div class="table-container">
        <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
          <ElTableColumn
            label="食材名称"
            prop="pro_name"
            min-width="260"
            show-overflow-tooltip>
            <template #default="scope">
                <div class="preview-name">
                    <ITablePreview :image="scope.row.pro_cover"></ITablePreview>
                    <p class="name ellipsis">{{ scope.row.pro_name }}</p>
                </div>
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="食材类型"
            prop="pro_type_name"
            min-width="150"
            align="center"
            show-overflow-tooltip>
            <template #default="scope">
                {{ scope.row.pro_type_pname }} / {{ scope.row.pro_type_name }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="规格"
            prop="specification"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="品牌"
            prop="pro_brand"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="供应商"
            prop="supplier_name"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="生产厂商"
            prop="manufacturer"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="生产时间"
            prop="pro_date"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="保质期(天)"
            prop="expired_day"
            min-width="150"
            align="center"
            show-overflow-tooltip>
          </ElTableColumn>
          <ElTableColumn
            label="入库单价(元)"
            prop="price"
            min-width="150"
            align="center"
            show-overflow-tooltip>
            <template #default="scope">
                {{ _utils.FtoY(scope.row.price) }}
            </template>
          </ElTableColumn>
          <ElTableColumn
            label="入库数量"
            prop="count"
            min-width="150"
            align="center"
            show-overflow-tooltip>
            <template #default="scope">
                  {{ scope.row.count }}{{ scope.row.unit }}
              </template>
          </ElTableColumn>
          <ElTableColumn
            label="单位重量(斤)"
            prop="unit_weight"
            min-width="150"
            align="center"
            show-overflow-tooltip>
            <template #default="scope">
                  {{ _utils.KtoJ(scope.row.unit_weight) }}
              </template>
          </ElTableColumn>
          <ElTableColumn label="入库图片" prop="in_img" width="100" align="center"
              show-overflow-tooltip>
              <template #default="scope">
                  <ITablePreview :image="scope.row.in_img"></ITablePreview>
              </template>
          </ElTableColumn>
          <ElTableColumn label="质检图片" prop="quality_img" width="100" align="center"
              show-overflow-tooltip>
              <template #default="scope">
                  <ITablePreview :image="scope.row.quality_img"></ITablePreview>
              </template>
          </ElTableColumn>
          <ElTableColumn
            fixed="right"
            label="操作"
            width="120"
            align="center">
            <template #default="scope">
              <div class="handle">
                <ElButton type="danger" link @click="onTableDelete(scope.$index)">删除</ElButton>
                <ElButton type="primary" link @click="onTableUpdate(scope.$index, scope.row)">编辑</ElButton>
              </div>
            </template>
          </ElTableColumn>
        </ElTable>
      </div>
    </div>
  </div>
  <IIngredientIn></IIngredientIn>
</template>

<script lang="ts" setup>
import { reactive, watch } from "vue";
import { useRouter } from 'vue-router';
import { useIngredientStoreAuxStore } from './aux_modules/store';
import IIngredientIn from './sub_modules/IngredientIn.vue'
import { OperationTypeEnum, Message } from '@/global/const';
import _utils from '@/utils/index';
import { apiInventoryInhouse } from "@/api/warehouse";

const IngredientStoreAuxStore = useIngredientStoreAuxStore();
const Router = useRouter();

/** 交互反馈数据 */
const tableModel = reactive<{
  loading: boolean;
  total: number;
  data: Obj[];
  index: number,
}>({
  loading: false,
  index: -1,
  total: 0,
  data: [],
});

/** 新增 */
const onTableAdd = () => {
    IngredientStoreAuxStore.$patch((state) => {
        state.ingredientInChecked = {};
        state.OperationType = OperationTypeEnum.add;
    });
};
/** 编辑 */
const onTableUpdate = (index: number, data: Obj) => {
    tableModel.index = index;
    IngredientStoreAuxStore.$patch((state) => {
        state.ingredientInChecked = data;
        state.OperationType = OperationTypeEnum.update;
    });
};
/** 删除 */
const onTableDelete = (index: number) => {
  tableModel.data.splice(index, 1);
};
const onFormConfirm = async () => {
  if (tableModel.data.length > 0) {
    Message.close();
    tableModel.loading = true;
    const { success, message } = await apiInventoryInhouse({
      pro_list: tableModel.data
    });
    if (success) {
        Message.success('采购入库完成');
        onBack();
    } else {
        Message.warning(message);
    }
    tableModel.loading = false;
  } else {
      Message.warning('请先添加自采入库信息');
  }
}

const onBack = () => {
  Router.back();
}

watch(() => IngredientStoreAuxStore.ingredientInData, (object: Obj) => {
  const data = JSON.parse(JSON.stringify(object));
  if (tableModel.index >= 0) {
    tableModel.data.splice(tableModel.index, 1, data);
    tableModel.index = -1;
  } else {
    tableModel.data.push(data);
  }
}, {
  deep: true
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
    justify-content: space-between;
    flex: none;
    margin-bottom: var(--gap);
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
  }
}
</style>
