<template>
    <div class="overview-chunk remind">
        <div class="overview-header">
            <p class="title">库存提醒</p>
            <!-- <ElLink type="primary" class="more">查看更多</ElLink> -->
        </div>
        <ul class="remind-price" v-loading="moneyModel.vLoading" element-loading-text="数据加载中">
            <li class="warning">
                <p class="title">即将过期（元）
                    <img class="icon" src="@/assets/image/10101.png">
                </p>
                <p class="price">{{ _utils.FtoY(moneyModel.data.before_money) }}</p>
            </li>
            <li class="danger">
                <p class="title">已过期（元）
                    <img class="icon" src="@/assets/image/10102.png">
                </p>
                <p class="price">{{ _utils.FtoY(moneyModel.data.expired_money) }}</p>
            </li>
        </ul>
        <div class="remind-list" v-loading="tableModel.vLoading" element-loading-text="数据加载中">
            <ul class="list">
                <template v-if="tableModel.total === 0">
                    <li>
                        <div class="null-data">暂无库存不足数据</div>
                    </li>
                </template>
                <li v-for="item of tableModel.data" :key="item.id">
                    <p class="time">{{ item.created_at }}</p>
                    <p class="title">{{ item.org_name }} {{ item.pro_name }}库存数量不足。</p>
                </li>
            </ul>
            <div class="more">
                <IPage :total="tableModel.total" :page="tableModel.query.page" :size="tableModel.query.size"
                    layout="total, prev, pager, next" hide-on-single-page @change="onTablePage"></IPage>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { Message } from '@/global/const';
import _utils from '@/utils/index';
import { apiWarehouseExpiredCountList, apiWarehouseExpiredMoney } from '@/api/warehouse';

const moneyModel = reactive<{
    vLoading: boolean;
    data: Obj;
}>({
    vLoading: false,
    data: {}
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
  },
  total: 0,
  data: [],
});

const getApiWarehouseExpiredMoney = async () => {
    moneyModel.vLoading = true;
    const { success, data, message } = await apiWarehouseExpiredMoney();
    if (success) {
        moneyModel.data = data;
    } else {
        Message.warning(message);
    }
    moneyModel.vLoading = false;
};
getApiWarehouseExpiredMoney();

/** 请求 */
const onTableRequest = async () => {
  tableModel.vLoading = true;
  const { success, data, message } = await apiWarehouseExpiredCountList(tableModel.query);
  if (success) {
    tableModel.data = _utils.getDefaultArray(data.list);
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
</script>

<style lang="scss" scoped>
    .remind {
        overflow: hidden;
        display: flex;
        flex-direction: column;
        flex: auto;
        .overview-header {
            flex: none;
        }
    }
    .remind-price {
        flex: none;
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        column-gap: var(--gap);
        padding: var(--gap);
        box-sizing: border-box;
        li {
            padding: var(--gap);
            box-sizing: border-box;
            border-radius: var(--radius-md);
            &.warning {
                background: rgb(253, 246, 236);
                .price {
                    color: var(--el-color-warning);
                }
            }
            &.danger {
                background: rgb(254, 240, 240);
                .price {
                    color: var(--el-color-danger);
                }
            }
            .title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 18px;
                color: var(--font-color-md);
                .icon {
                    width: 24px;
                }
            }
            .price {
                font-size: 24px;
            }
        }
    }
    .remind-list {
        flex: auto;
        overflow-y: auto;
        padding: 0 var(--gap);
        .list {
            li {
                margin-bottom: var(--gap);
                padding: var(--gap);
                border-left: 2px solid var(--el-color-primary);
                background: var(--bg-color-xs);
                line-height: var(--line-height-sm);
                border-radius: var(--radius-sm);
                word-break: break-all;
                overflow-wrap: break-word;
                &:last-of-type {
                    margin-bottom: 0;
                }
                .time {
                    flex: none;
                    margin-bottom: var(--gap);
                    color: var(--font-color-sm);
                    font-size: var(--font-size-xs);
                }
                .title {
                    flex: auto;
                    padding-right: var(--gap);
                }
            }
        }
        .more {
            padding: var(--gap) 0;
            text-align: center;
        }
    }
</style>