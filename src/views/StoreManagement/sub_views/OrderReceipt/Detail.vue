<template>
  <div class="layout-table" v-loading="pageModel.vLoading" element-loading-text="数据加载中">
    <div class="detail-container">
      <div class="detail-header">
        <div class="title">
          <ElButton icon="back" @click="onBack">返回</ElButton>
        </div>
      </div>
      <div class="detail-content">
        <div class="detail-item">
          <div class="detail-item-label">供应商名称：</div>
          <div class="detail-item-value">{{ pageModel.data.shop_name }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">收货地址：</div>
          <div class="detail-item-value">{{ pageModel.data.shipping_address }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">商品数量：</div>
          <div class="detail-item-value">{{ pageModel.data.goods_total }}</div>
        </div>
        <div class="detail-item">
          <div class="detail-item-label">订单号：</div>
          <div class="detail-item-value">{{ pageModel.data.order_sn }}</div>
        </div>
      </div>
    </div>
    <div class="table-container">
      <ElTable height="100%" scrollbar-always-on :data="pageModel.data.list">
        <ElTableColumn label="商品名称" prop="goods_name" align="center" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="商品分类名称" prop="cat_name" min-width="150" align="center" show-overflow-tooltip />
        <ElTableColumn label="下单数量" prop="goods_number" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="发货数量" prop="send_number" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="收货数量" prop="in_count" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="出库数量" prop="out_count" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="商品单位" prop="unit" min-width="120" align="center" show-overflow-tooltip />
        <ElTableColumn label="商品图片" prop="goods_image" min-width="120" align="center">
          <template #default="scope">
            <ElImage
              v-if="scope.row.goods_image"
              :src="getImg(scope.row.goods_image)[0]"
              fit="contain"
              style="width: 50px; height: 50px"
              @click="onPreview(getImg(scope.row.goods_image))"
            />
            <span v-else>无</span>
          </template>
        </ElTableColumn>
        <ElTableColumn label="入库图片" prop="in_image" min-width="120" align="center">
          <template #default="scope">
            <ElImage
              v-if="scope.row.in_image"
              :src="getImg(scope.row.in_image)[0]"
              fit="contain"
              style="width: 50px; height: 50px"
              @click="onPreview(getImg(scope.row.in_image))"
            />
            <span v-else>无</span>
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
  <ElImageViewer v-if="showPreview" :url-list="srcList" :initial-index="0" @close="showPreview = false" />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElImage, ElImageViewer } from "element-plus";
import _ from "tddev/utils";
import { Message } from "@/global/const";
import { apiOrderReceiptDetail } from "@/api/warehouse";

const Router = useRouter();
const Route = useRoute();
const showPreview = ref(false);
const srcList = ref<string[]>([]);

const pageModel = reactive<Obj>({
  vLoading: false,
  id: Route.query.id as string,
  data: {
    shop_name: "",
    shipping_address: "",
    goods_total: 0,
    order_sn: "",
    list: [],
  },
});

const onBack = () => {
  Router.back();
};

const onTableRequest = async () => {
  pageModel.vLoading = true;
  const { success, data, message } = await apiOrderReceiptDetail({
    order_id: pageModel.id,
  });
  if (success) {
    pageModel.data = data;
  } else {
    Message.warning(message);
  }
  pageModel.vLoading = false;
};

onTableRequest();

const getImg = (val: string) => {
  if (_.isNotEmptyString(val)) {
    return val.split(",").filter(item => item);
  }
  return [];
};

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
