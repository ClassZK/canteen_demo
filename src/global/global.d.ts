/// <reference types="vite/client" />

declare module "*.mjs";

declare module '*.vue' {
    import type { DefineComponent } from 'vue'

    const vueComponent: DefineComponent<{}, {}, any>

    export default vueComponent
}

type Empty = null | undefined
type Obj = Record<string, any>

interface HttpResult extends Obj {
    success: boolean,
    msg: string,
    data: any
}


declare interface Window {
    /** 环境变量 */
    _env: Obj
    /** 系统主版本 */
    majorVersion: string
    /** 系统打包号 */
    buildVersion: string
    /** 项目名 */
    project: string
}

/**
 *  自定义事件 Record< 事件key,事件参数类型 >
 *  请为每一种自定义事件定义字段以及参数类型
 *  并且添加注释,方便后续维护,如果情况允许的情况下,请不要大量使用any
 *  */
interface ObservedEventConfig {
    'DEFAULT_EVENT': Obj // 默认事件
    'TEST_EVENT': string // 测试事件
}