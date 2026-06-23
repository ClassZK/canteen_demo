import { defineStore } from 'pinia'

export const useRecipeUserAuxStore = defineStore('RecipeUserAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: {} as Obj,
          refresh: 0,
        }
    }
});