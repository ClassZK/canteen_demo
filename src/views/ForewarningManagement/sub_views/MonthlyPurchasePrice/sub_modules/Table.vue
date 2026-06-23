<template>
    <div class="layout-table" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
        <div class="query-container">
            <div class="query-left">
                <ElForm ref="formRef" :model="tableModel.query">
                    
          <IPlatformOrgFilter></IPlatformOrgFilter><ElFormItem label="食材名称" prop="pro_name">
                        <ISelectInventory v-model="tableModel.query.pro_name" clearable @change="onIngredientChange"></ISelectInventory>
                    </ElFormItem>
                    <ElFormItem label="供应商名称" prop="supplier_name">
                        <ElInput v-model="tableModel.query.supplier_name" maxlength="30" show-word-limit clearable
                            placeholder="供应商名称"></ElInput>
                    </ElFormItem>
                    <ElFormItem label="时间" prop="month">
                        <ElDatePicker type="month" v-model="tableModel.query.month"
                            :value-format="dateTimeModel.valueFormat" :default-time="dateTimeModel.defaultTime"
                            :disabled-date="onDateTimeDisabled" placeholder="时间">
                        </ElDatePicker>
                    </ElFormItem>
                </ElForm>
            </div>
            <div class="query-right">
                <ElButton type="primary" @click="onTableSearch">查询</ElButton>
                <ElButton class="gray" @click="onTableReset">重置</ElButton>
            </div>
        </div>
        <div class="table-container">
            <ElTable height="100%" scrollbar-always-on :data="tableModel.data">
                
        <IPlatformOrgColumn></IPlatformOrgColumn><ElTableColumn label="预警时间" prop="created_at" min-width="160" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="预警原因" prop="remark" min-width="300" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="组织名称" prop="org_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="食材名称" prop="pro_name" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="食材编号" prop="pro_no" min-width="150" align="center"
                    show-overflow-tooltip>
                </ElTableColumn>
                <ElTableColumn label="采购月份" prop="month" min-width="150" align="center"
                    show-overflow-tooltip></ElTableColumn>
                <ElTableColumn label="区域本月均价(元/斤)" prop="_area_price" min-width="160" align="center"
                    show-overflow-tooltip>
                </ElTableColumn>
                <ElTableColumn label="当前月均价(元/斤)" prop="_now_price" min-width="160" align="center"
                    show-overflow-tooltip>
                </ElTableColumn>
                <ElTableColumn label="上月月均价(元/斤)" prop="_last_month_price" min-width="160" align="center"
                    show-overflow-tooltip>
                </ElTableColumn>
                <ElTableColumn label="状态" prop="_status" min-width="150" align="center"
                    show-overflow-tooltip>
                </ElTableColumn>
                <ElTableColumn fixed="right" label="操作" width="180" align="center">
                    <template #default="scope">
                        <div class="handle">
                            <template v-if="scope.row.status === HandleTypeEnum.Pending">
                                <ElButton type="success" link @click="onTableHandle(scope.row)">处理</ElButton>
                            </template>
                            <ElButton type="primary" link @click="onTableProcurement(scope.row)">采购明细</ElButton>
                            <ElButton type="primary" link @click="onTableDetail(scope.row)">详情</ElButton>
                        </div>
                    </template>
                </ElTableColumn>
            </ElTable>
        </div>
        <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
            @change="onTablePage"></IPage>
    </div>
</template>

<script lang="ts" setup>
import { ref, reactive, watch } from 'vue';
import dayjs from 'dayjs';
import { useMonthlyPurchasePriceAuxStore } from "../aux_modules/store";
import { OperationTypeEnum, Message, HandleTypeEnum, HandleTypeList } from '@/global/const';
import { dateTimeEndFilter, timestampFilter } from '@/utils/Dayjs/index';
import _utils from '@/utils/index';
import { apiForewarningMonthPriceList } from '@/api/warehouse';

const MonthlyPurchasePriceAuxStore = useMonthlyPurchasePriceAuxStore();
const formRef = ref();

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
        pro_name: '',
        supplier_name: '',
        month: '',
    },
    total: 0,
    data: [],
});

tableModel.query.month = dayjs(new Date()).format('YYYYMM');
/** 时间 */
const dateTimeModel = reactive({
    valueFormat: 'YYYYMM',
    defaultTime: new Date(2000, 1, 1, 23, 59, 59)
});
const onDateTimeDisabled = (time: Date) => {
    const dateTime = dateTimeEndFilter(new Date());
    const timestamp = timestampFilter(dateTime);
    return time.getTime() > timestamp;
};

/** 请求 */
const onTableRequest = async () => {
    tableModel.vLoading = true;
    const query = JSON.parse(JSON.stringify(tableModel.query));
    query.month = Number(query.month);

    const { success, data, message } = await apiForewarningMonthPriceList(query);
    if (success) {
        const list = _utils.getDefaultArray(data.list);
        tableModel.data = list.map((item: Obj) => {
            item.pro_no = (item.pro_no === '-1')? '线下购买':item.pro_no;
            item._area_price = _utils.FtoY(item.area_price) / 2;
            item._now_price = _utils.FtoY(item.now_price) / 2;
            item._last_month_price = _utils.FtoY(item.last_month_price) / 2;
            const object = HandleTypeList.find((el: Obj) => el.value === item.status);
            if (object) {
                item._status = object.name;
            }
            return item;
        });
        tableModel.total = data.total;
    } else {
        Message.warning(message);
    }
    tableModel.vLoading = false;
};
onTableRequest();
/** 分页 */
const onTablePage = (object: { page: number, size: number; }) => {
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
    formRef.value?.resetFields();
    onTableSearch();
};

const onTableDetail = (data: Obj) => {
    MonthlyPurchasePriceAuxStore.$patch((state) => {
        state.data = data;
        state.OperationType = OperationTypeEnum.detail;
    });
};
const onTableProcurement = (data: Obj) => {
    MonthlyPurchasePriceAuxStore.$patch((state) => {
        state.data = data;
        state.isProcurementDetail = true;
    });
};
const onTableHandle = (data: Obj) => {
    MonthlyPurchasePriceAuxStore.$patch(state => {
        state.data = data;
        state.OperationType = OperationTypeEnum.handle;
    });
}
const onIngredientChange = (value: string) => {
    tableModel.query.pro_name = value;
};

watch(() => MonthlyPurchasePriceAuxStore.refresh, () => {
    onTableRequest();
});

</script>

<style lang="scss" scoped>

</style>