import { defineStore } from "pinia";

export const useConfirmListStoreAuxStore = defineStore("ConfirmListStoreAuxStore", {
  state: () => {
    return { data: {} as Obj };
  },
});
