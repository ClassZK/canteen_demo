import { onBeforeMount } from 'vue';
import useGlobalStore from '@/global/global.store';

/** 系统认证业务hook */
export default function useSystemAuth() {
    const globalStore = useGlobalStore();

    onBeforeMount(() => {
        setTimeout(() => {
            globalStore.loading = false
        }, 1000)
    })
}