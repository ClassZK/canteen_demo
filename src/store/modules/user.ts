import { defineStore } from 'pinia';
import { Pinia } from '../index';

export { Pinia };

export const useUserStore = defineStore('UserStore', {
    state: () => {
        return {
          token: '',
          systemUserinfo: {} as Obj,
          permission: [] as string[],
        }
    }
});