<template>
    <div class="error-page">
        <ElRow type="flex" justify="center" class="content">
            <ElCol :xs="20" :sm="16" :md="14" :lg="12" :xl="10">
                <img src="@/assets/image/10404.jpg" />
                <h3>页面不存在<br>404</h3>
            </ElCol>
        </ElRow>
        <ElRow type="flex" justify="center" class="btns">
            <ElCol :xs="20" :sm="16" :md="14" :lg="12" :xl="10">
                <ElButton @click="backHome">返回首页</ElButton>
                <ElButton @click="backPrev">返回上一页({{ second }}s)</ElButton>
            </ElCol>
        </ElRow>
    </div>
</template>

<script lang="ts" setup>
import { ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

defineProps({
    code: {
        type: Number,
        default: 0
    },
    title: {
        type: String,
        default: ''
    },
    src: {
        type: String,
        default: ''
    }
});
const Router = useRouter();
const second = ref(5);

const backHome = () => {
    Router.push('/');
};
const backPrev = () => {
    Router.back();
};
const timer = setInterval(() => {
    if (second.value === 0) backPrev();
    else second.value--;
}, 1000);

onBeforeUnmount(() => {
    clearInterval(timer);
});
</script>

<style lang="scss" scoped>
.error-page {
    padding: 30px;
    box-sizing: border-box;

    .content {
        .el-col {
            position: relative;
            text-align: center;
        }

        img {
            width: 100%;
            max-width: 580px;
        }

        h3 {
            position: absolute;
            top: 0;
            right: 0;
            font-weight: bold;
            text-align: right;
            color: var(--font-color-xl);
            font-size: 40px;
            line-height: var(--line-height-sm);
        }
    }

    .btns {
        padding-top: 30px;

        .el-col {
            text-align: right;
        }

        .el-button {
            margin-left: 15px;
        }
    }
}
</style>

