<template>
  <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
    <div class="detail-container">
      <div class="detail-header">
        <div class="title">
          <ElButton icon="back" @click="onBack">返回</ElButton>
        </div>
        <div class="handle">
          <ElButton type="primary" :loading="tableModel.loading" @click="showLog = true">确定收货</ElButton>
        </div>
      </div>
      <div class="detail-content">
        <div class="detail-item">
          <div class="detail-item-label">供应商名称：</div>
          <div class="detail-item-value">{{ tableModel.data.shop_name }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">收货地址：</div>
          <div class="detail-item-value">{{ tableModel.data.shipping_address }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">待收货商品数量：</div>
          <div class="detail-item-value">{{ tableModel.data.goods_total }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">订单号：</div>
          <div class="detail-item-value">{{ tableModel.data.order_sn }}</div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="tableModel.data.list">
        <ElTableColumn label="商品名称" prop="goods_name" align="center" min-width="150" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn label="商品分类名称" prop="cat_name" min-width="150" align="center" show-overflow-tooltip>
        </ElTableColumn>
        <ElTableColumn
          label="下单数量"
          prop="goods_number"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="发货数量"
          prop="send_number"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="收货数量"
          prop="in_count"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn
          label="出库数量"
          prop="out_count"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="商品图片" prop="goods_image" min-width="150" align="center">
          <template #default="scope">
            <ElImage
              :src="scope.row.goods_image"
              fit="contain"
              style="width: 50px; height: 50px"
              @click="onPreview([scope.row.goods_image])"
            />
          </template>
        </ElTableColumn>
        <ElTableColumn label="入库图片" prop="in_image" min-width="150" align="center">
          <template #default="scope">
            <ElImage
              v-if="scope.row.in_image"
              :src="getImg(scope.row.in_image)[0]"
              fit="contain"
              style="width: 50px; height: 50px"
              @click="onPreview(getImg(scope.row.in_image))"
            />
            <div v-else>无</div>
          </template>
        </ElTableColumn>
        <ElTableColumn
          label="商品单位"
          prop="unit"
          min-width="150"
          align="center"
          show-overflow-tooltip
        ></ElTableColumn>
        <ElTableColumn label="操作" prop="status" min-width="150" align="center" show-overflow-tooltip>
          <template #default="scope">
            <ElButton link type="primary" @click="onTableDetail(scope.row)">修改</ElButton>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
  <Form
    ref="formRef"
    @close="showLog = false"
    @confirm="onBack"
    v-if="showLog"
    :id="tableModel.id"
    :OperationTypeName="tableModel.data.shop_name"
  />
  <EditForm v-if="showEditForm" ref="editFormRef" @confirm="onTableRequest" @close="showEditForm = false" />
  <ElImageViewer v-if="showPreview" :url-list="srcList" :initial-index="0" @close="showPreview = false" />
</template>

<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
import { reactive, ref } from "vue";
import { ElImage, ElImageViewer } from "element-plus";
import { apiConfirmListDetail } from "@/api/warehouse";
import { Message } from "@/global/const";
import Form from "./Form.vue";
import EditForm from "./Edit.vue";
import _ from "tddev/utils";
import { useConfirmListStoreAuxStore } from "./aux_modules/store";
import { normalizeOrderDetail } from "../aux_modules/orderDetail";
const confirmListStoreAuxStore = useConfirmListStoreAuxStore();
const showPreview = ref(false);
const srcList = ref<string[]>([]);

const showEditForm = ref(false);
const showLog = ref(false);
const tableModel = reactive<Obj>({
  vLoading: false,
  id: "",
  data: {
    shop_name: "",
    shipping_address: "",
    goods_total: 0,
    order_sn: "",
    list: [],
  },
});
const Router = useRouter();
const Route = useRoute();
tableModel.id = Route.query.id as string;
const onBack = () => {
  Router.back();
};
/** 表格详情 */
const onTableDetail = (val: Obj) => {
  confirmListStoreAuxStore.data = val;
  showEditForm.value = true;
};
/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiConfirmListDetail({
    order_id: tableModel.id,
  });
  if (success) {
    tableModel.data = normalizeOrderDetail(data);
  } else {
    Message.warning(message);
  }
  tableModel.vLoading = false;
};
onTableRequest();

const getImg = (val: string) => {
  if (_.isNotEmptyString(val)) {
    return val.split(",");
  }
  return [""];
};

// 预览图片
const onPreview = (val: string[]) => {
  srcList.value = val;
  showPreview.value = true;
};
</script>

<style scoped lang="scss">
.detail-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  .detail-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex: none;

    background: var(--el-color-white);
    border-radius: var(--radius-lg);
    .title {
      display: flex;
      align-items: center;
      & > * {
        margin-right: var(--gap);
      }
    }
  }
  .detail-content {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 36px;
    padding: var(--gap);
    background: var(--el-color-white);
    border-radius: var(--radius-lg);
    margin-bottom: 12px;
    .detail-item {
      display: flex;
      align-items: center;
      .detail-item-label {
        font-weight: 600;
        margin-right: 8px;
        font-size: 16px;
        line-height: 24px;
      }
      .detail-item-value {
        font-weight: 500;
        font-size: 16px;
        line-height: 24px;
      }
    }
  }
}
</style>
