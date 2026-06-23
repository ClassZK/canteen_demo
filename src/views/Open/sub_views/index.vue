<template>
    <div class="open-container" v-loading="openModel.vLoading" element-loading-text="授权登录中"></div>
</template>

<script lang="ts" setup>
import { reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import Storage from 'tddev/storage';
import { apiSystemAuthLogin } from '@/api/admin';

const Route = useRoute();
const Router = useRouter();
const { query } = Route;

const openModel = reactive({
    vLoading: false,
});

const onLogin = () => {
    Router.replace({ name: 'login' });
};

const onSystemAuthLogin = async () => {
    openModel.vLoading = true;
    const { success, data, message } = await apiSystemAuthLogin(query);
    if (success) {
        Storage.set('token', data.token);
        delete data.token;
        Storage.set('SystemUserinfo', data);
        const route = Router.resolve({
            name: 'home'
        });
        window.location.href = route.href;
    } else {
        ElMessageBox.alert(`${message}`, '温馨提示', {
            confirmButtonText: '手动登录',
            draggable: true,
            type: 'warning',
            customClass: 'message-box-custom',
        }).then(() => {
            onLogin();
        });
    }
    openModel.vLoading = false;
};

const onInit = () => {
    localStorage.clear();
    sessionStorage.clear();
    if (query.token && query.org_code) {
        onSystemAuthLogin();
    } else {
        onLogin();
    }
};
onInit();
</script>

<style lang="scss" scoped>
    .open-container {
        width: 100%;
        height: 100%;
    }
</style>

