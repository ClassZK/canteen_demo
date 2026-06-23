import Storage from 'tddev/storage'
import { useRouter } from 'vue-router'

/** 临时变量存放KEY */
const KEY = 'TEM_ROUTER_PARAMS'

const useNav = () => {
    const router = useRouter()

    const goto = (name: string, params?: Obj) => {
        Storage.setStore('sessionStorage')
        Storage.set(KEY, params)
        Storage.setStore('localStorage')
        router.push({ name })
    }

    const back = () => {
        router.back()
    }

    const replace = (name: string, params?: Obj) => {
        Storage.setStore('sessionStorage')
        Storage.set(KEY, params)
        Storage.setStore('localStorage')
        router.replace({ name })
    }

    const getParams = <T extends any = Obj>(defaultValue?: T): (T | undefined) => {
        Storage.setStore('sessionStorage')
        const value = Storage.get(KEY, defaultValue)
        Storage.setStore('localStorage')
        return value
    }

    return {
        goto,
        back,
        replace,
        getParams,
    }
}
export default useNav
