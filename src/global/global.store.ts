import { defineStore } from 'pinia';


type GlobalStore = {
    /** 全局加载状态 */
    loading: boolean
    /** 用户数据 */
    user?: Obj
}

type Getters = {
    getUser: (state: GlobalStore) => (Obj | Empty)
    isAdmin: (state: GlobalStore) => boolean
    permission: (state: GlobalStore) => string[]
}

/** 全局仓库 */
const useGlobalStore = defineStore<string, GlobalStore, Getters>('globalStore', {
    state: () => ({
        loading: true,
    }),
    getters: {
        /** 获取当前用户信息 */
        getUser(state) {
            return state.user
        },
        /** 是否是超级管理员 */
        isAdmin(state) {
            // 20 为超级管理员
            return state.user?.admin_type === 20
        },
        permission(state) {
            return (state.user?.rule ?? '').split(',')
        },
    }
})

export default useGlobalStore