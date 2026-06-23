<template>
    <div class="overview-chunk notification" v-loading="notifyModel.vLoading" element-loading-text="数据加载中">
        <div class="overview-header">
            <p class="title">系统公告</p>
            <ElLink type="primary" class="more" @click="onPath">查看更多</ElLink>
        </div>
        <ul class="notification-list">
            <template v-if="notifyModel.total === 0">
                <li class="null">暂无系统公告</li>
            </template>
            <li v-for="item of notifyModel.data" :key="item.id" @click="onNoticeDetail(item)">
                <p class="title ellipsis">{{ item.title }} </p>
                <p class="time">{{ item.created_at }}</p>
            </li>
        </ul>
    </div>

    <ElDialog width="1000px" title="公告详情" class="dialog-container" modal-class="dialog-overlay-custom"
        v-model="notifyModel.visible" draggable destroy-on-close append-to-body :close-on-click-modal="false"
        :close-on-press-escape="false" @closed="onFormClosed">
        <div class="form-container" v-loading="notifyModel.vLoading2" element-loading-text="数据加载中">
            <ElForm ref="formRef" :model="notifyModel.checked" disabled label-width="80px" label-position="top">
                <ElRow :gutter="30">
                    <ElCol>
                        <ElFormItem label="公告标题" prop="title">
                            <ElInput v-model="notifyModel.checked.title"  placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                    <ElCol>
                        <ElFormItem label="公告内容" prop="content">
                            <ElInput v-model="notifyModel.checked.content" type="textarea" :rows="5" resize="none" placeholder=" "></ElInput>
                        </ElFormItem>
                    </ElCol>
                </ElRow>
            </ElForm>
        </div>
        <template #footer>
            <div class="dialog-footer">
                <ElButton @click="notifyModel.visible = false;">取消</ElButton>
            </div>
        </template>
    </ElDialog>
</template>

<script lang="ts" setup>
import { reactive, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Message } from '@/global/const';
import _utils from '@/utils/index';
import { apiNoticeList, apiNoticeDetail } from '@/api/supervision';

const Router = useRouter();

/** 交互反馈数据 */
const notifyModel = reactive<{
    visible: boolean;
    vLoading: boolean;
    vLoading2: boolean;
    query: Obj;
    total: number;
    data: Obj[];
    checked: Obj;
}>({
    visible: false,
    vLoading: false,
    vLoading2: false,
    query: {
        page: 1,
        size: 5,
    },
    total: 0,
    data: [],
    checked: {},
});

/** 请求 */
const onTableRequest = async () => {
    notifyModel.vLoading = true;
    const { success, data, message } = await apiNoticeList(notifyModel.query);
    if (success) {
        notifyModel.data = _utils.getDefaultArray(data.list);
        notifyModel.total = data.total;
    } else {
        Message.warning(message);
    }
    notifyModel.vLoading = false;
};
onTableRequest();

const onPath = () => {
    Router.push({ name: 'notification' });
};

/** 取消 */
const onFormClosed = () => {
    notifyModel.checked = {};
};

const onNoticeDetail = async (_data: Obj) => {
    notifyModel.visible = true;
    notifyModel.vLoading2 = true;
    const { success, data, message } = await apiNoticeDetail({
        id: _data.id
    });
    if (success) {
        notifyModel.checked = data;
    } else {
        Message.warning(message);
    }
    notifyModel.vLoading2 = false;
};
</script>

<style lang="scss" scoped>
    .notification {
        flex: none;
    }
    .notification-list {
        min-height: 280px;
        padding: var(--gap);
        box-sizing: border-box;
        li {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: var(--gap);
            padding: var(--gap);
            background: var(--bg-color-xs);
            line-height: var(--line-height-sm);
            border-radius: var(--radius-sm);
            cursor: pointer;
            &.null {
                justify-content: center;
                text-align: center;
            }
            &:last-of-type {
                margin-bottom: 0;
            }
            .title {
                flex: auto;
                padding-right: var(--gap);
                color: var(--font-color-md);
            }
            .time {
                flex: none;
                color: var(--font-color-sm);
                font-size: var(--font-size-xs);
            }
        }
    }
</style>