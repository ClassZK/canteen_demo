import { defineStore } from 'pinia';
import { Pinia } from '../index';

export { Pinia };

export const useMenuStore = defineStore('MenuStore', {
    state: () => {
        return {
            menu: false,
            collapse: false,
            breadcrumb: false,
            layoutNoGap: false,
            refresh: 0,
            orgRefresh: 0,
        };
    }
});
