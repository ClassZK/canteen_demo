import { defineStore } from 'pinia'

export const useHomeAuxStore = defineStore('HomeAuxStore', {
    state: () => {
        return {
            refresh: 0,
        }
    }
});