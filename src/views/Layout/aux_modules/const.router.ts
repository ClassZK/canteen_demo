import { type RouteRecordRaw } from 'vue-router'

/** 自定义mate字段 */
export type TddevRoute = RouteRecordRaw & {
    meta: {
        /** 是否显示在左侧菜单中（默认显示） */
        showMenuTree?: boolean
        /** 是否显示面包屑（默认显示） */
        showBreadcrumb?: boolean
        /** 此路由所显示的界面标题（默认为系统名） */
        title: string
        /** 此路由的权限标识符（不配置默认展示） */
        authKey?: string
        /** 此路由的描述,无实际用途,仅做业务提示 */
        desc?: string
        /** 此路由的svg图标名,请将svg图标放入 @/assets/svg 目录下（存在默认图标） */
        icon?: string
    },
    children?: TddevRoute[]
    /** 框架计算属性 */
    ___isShow___?: boolean
}