<template>
  <div class="layout-table" v-loading="pageModel.vLoading" element-loading-text="数据加载中">
    <div class="detail-container">
      <div class="detail-header">
        <div class="title">
          <ElButton icon="back" @click="onBack">返回</ElButton>
        </div>
        <div class="handle">
          <ElButton
            type="primary"
            :disabled="pageModel.selection.length === 0"
            @click="onBatchSignOpen"
          >
            批量签收
          </ElButton>
          <ElButton :loading="pageModel.saveLoading" @click="onSaveDraft">保存当前签收信息</ElButton>
          <ElButton type="primary" :loading="pageModel.submitLoading" @click="onSubmitOrder">整单提交</ElButton>
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
      <ElTable
        ref="tableRef"
        height="100%"
        scrollbar-always-on
        :data="pageModel.data.list"
        @selection-change="onSelectionChange"
      >
        <ElTableColumn type="selection" width="55" align="center" :selectable="isRowSelectable" />
        <ElTableColumn label="商品名称" prop="goods_name" align="center" min-width="160" show-overflow-tooltip />
        <ElTableColumn label="商品分类名称" prop="cat_name" min-width="150" align="center" show-overflow-tooltip />
        <ElTableColumn label="下单数量" prop="goods_number" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="发货数量" prop="send_number" min-width="130" align="center" show-overflow-tooltip />
        <ElTableColumn label="收货数量" prop="in_count" min-width="180" align="center">
          <template #default="scope">
            <ElInputNumber
              v-model="scope.row._in_count"
              :precision="getPrecision(scope.row)"
              :step="getStep(scope.row)"
              :max="9999999"
              :min="0"
              :disabled="isSigned(scope.row)"
            ></ElInputNumber>
          </template>
        </ElTableColumn>
        <ElTableColumn label="出库数量" prop="out_count" min-width="180" align="center">
          <template #default="scope">
            <ElInputNumber
              v-model="scope.row._out_count"
              :precision="getPrecision(scope.row)"
              :step="getStep(scope.row)"
              :max="9999999"
              :min="0"
              :disabled="isSigned(scope.row)"
            ></ElInputNumber>
          </template>
        </ElTableColumn>
        <ElTableColumn label="商品单位" prop="unit" min-width="120" align="center" show-overflow-tooltip />
        <ElTableColumn label="签收状态" prop="sign_status" min-width="120" align="center">
          <template #default="scope">
            <ElTag :type="isSigned(scope.row) ? 'success' : 'warning'">{{ isSigned(scope.row) ? "已签收" : "待签收" }}</ElTag>
          </template>
        </ElTableColumn>
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
        <ElTableColumn label="单独入库图片" prop="in_image" min-width="220" align="center">
          <template #default="scope">
            <IUploadImage
              :limit="5"
              :data="scope.row._image"
              :disabled="isSigned(scope.row)"
              @success="value => onItemImageUpload(scope.row, value)"
            />
          </template>
        </ElTableColumn>
      </ElTable>
    </div>
  </div>
  <ElDialog
    v-model="batchDialog.visible"
    title="批量签收"
    width="520px"
    class="dialog-container"
    append-to-body
    draggable
    :close-on-click-modal="false"
  >
    <div class="batch-upload">
      <div class="upload-label">签收图片：</div>
      <IUploadImage :limit="5" :data="batchDialog.image" @success="value => (batchDialog.image = value)" />
    </div>
    <template #footer>
      <div class="dialog-footer">
        <ElButton @click="batchDialog.visible = false">取消</ElButton>
        <ElButton type="primary" :loading="batchDialog.loading" @click="onBatchSignConfirm">确认</ElButton>
      </div>
    </template>
  </ElDialog>
  <ElImageViewer v-if="showPreview" :url-list="srcList" :initial-index="0" @close="showPreview = false" />
</template>

<script setup lang="ts">
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElImage, ElImageViewer } from "element-plus";
import _ from "tddev/utils";
import { Message } from "@/global/const";
import { apiOrderReceiptDetail, apiOrderReceiptSaveDraft, apiOrderReceiptSubmit } from "@/api/warehouse";
import { normalizeOrderDetail, pickFirstValue } from "../aux_modules/orderDetail";

const Router = useRouter();
const Route = useRoute();
const tableRef = ref();
const showPreview = ref(false);
const srcList = ref<string[]>([]);

const pageModel = reactive<Obj>({
  vLoading: false,
  saveLoading: false,
  submitLoading: false,
  id: Route.query.id as string,
  selection: [],
  data: {
    shop_name: "",
    shipping_address: "",
    goods_total: 0,
    order_sn: "",
    list: [],
  },
});

const batchDialog = reactive({
  visible: false,
  loading: false,
  image: "",
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
    const detail = normalizeOrderDetail(data);
    pageModel.data = {
      ...detail,
      list: withDefaults(detail.list),
    };
    pageModel.selection = [];
  } else {
    Message.warning(message);
  }
  pageModel.vLoading = false;
};

onTableRequest();

const withDefaults = (list: Obj[]) => {
  return (list || []).map(item => ({
    ...item,
    sign_status: item.sign_status || (item.signed_at || item.in_image ? "signed" : "pending"),
    _in_count: getDefaultInCount(item),
    _out_count: getDefaultOutCount(item),
    _image: item.in_image || item.image || "",
  }));
};

const getDefaultInCount = (item: Obj) => Number(pickFirstValue(item, ["in_count", "send_number", "goods_number"]) || 0);
const getDefaultOutCount = (item: Obj) => Number(pickFirstValue(item, ["out_count"]) || 0);
const getPrecision = (item: Obj) => (item.measure_type === 1 ? 2 : 0);
const getStep = (item: Obj) => (item.measure_type === 1 ? 0.01 : 1);
const isSigned = (item: Obj) => item.sign_status === "signed";
const isRowSelectable = (row: Obj) => !isSigned(row);

const onSelectionChange = (selection: Obj[]) => {
  pageModel.selection = selection;
};

const onBatchSignOpen = () => {
  if (pageModel.selection.length === 0) return;
  batchDialog.image = "";
  batchDialog.visible = true;
};

const onBatchSignConfirm = async () => {
  if (!batchDialog.image) {
    Message.warning("请上传签收图片");
    return;
  }
  const list = pageModel.selection.map((item: Obj) => ({
    id: item.id,
    image: batchDialog.image,
    in_image: batchDialog.image,
    in_house_count: Number(item._in_count),
    out_count: Number(item._out_count),
  }));
  if (!validateSubmitList(list)) return;
  batchDialog.loading = true;
  const { success, message } = await apiOrderReceiptSubmit({
    order_id: pageModel.id,
    list,
  });
  batchDialog.loading = false;
  if (success) {
    Message.success("批量签收成功，当前订单显示部分签收");
    batchDialog.visible = false;
    onTableRequest();
  } else {
    Message.warning(message);
  }
};

const onItemImageUpload = (row: Obj, value: string) => {
  row._image = value;
};

const buildSubmitList = () => {
  return (pageModel.data.list || [])
    .filter((item: Obj) => !isSigned(item))
    .map((item: Obj) => ({
      id: item.id,
      image: item._image,
      in_image: item._image,
      in_house_count: Number(item._in_count),
      out_count: Number(item._out_count),
    }));
};

const validateSubmitList = (list: Obj[]) => {
  if (list.length === 0) {
    Message.warning("请选择或填写待签收商品");
    return false;
  }
  for (const item of list) {
    if (!item.image && !item.in_image) {
      Message.warning("请上传签收图片");
      return false;
    }
    if (!Number.isFinite(item.in_house_count) || item.in_house_count <= 0) {
      Message.warning("请输入正确的收货数量");
      return false;
    }
    if (!Number.isFinite(item.out_count) || item.out_count < 0) {
      Message.warning("请输入正确的出库数量");
      return false;
    }
    if (item.out_count > item.in_house_count) {
      Message.warning("出库数量不能大于收货数量");
      return false;
    }
  }
  return true;
};

const onSaveDraft = async () => {
  const list = buildSubmitList();
  if (!validateSubmitList(list)) return;
  pageModel.saveLoading = true;
  const { success, message } = await apiOrderReceiptSaveDraft({
    order_id: pageModel.id,
    list,
  });
  pageModel.saveLoading = false;
  if (success) {
    Message.success("保存成功");
    onTableRequest();
  } else {
    Message.warning(message);
  }
};

const onSubmitOrder = async () => {
  const list = buildSubmitList();
  if (!validateSubmitList(list)) return;
  pageModel.submitLoading = true;
  const submitResult = await apiOrderReceiptSubmit({
    order_id: pageModel.id,
    list,
  });
  pageModel.submitLoading = false;
  if (submitResult.success) {
    Message.success("提交成功");
    Router.back();
  } else {
    Message.warning(submitResult.message);
  }
};

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
    .title,
    .handle {
      display: flex;
      align-items: center;
      gap: var(--gap);
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
.batch-upload {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  .upload-label {
    flex: none;
    padding-top: 12px;
    font-weight: 600;
  }
}
</style>
