import { defineStore } from 'pinia'

export const useNotificationAuxStore = defineStore('NotificationAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
          roleList: [] as Obj[]
        }
    }
});