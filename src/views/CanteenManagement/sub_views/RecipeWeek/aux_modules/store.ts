import { defineStore } from 'pinia'

export const useRecipeWeekAuxStore = defineStore('RecipeWeekAuxStore', {
    state: () => {
        return {
          OperationType: '',
          data: <Obj>{},
          refresh: 0,
          weekChecked: <Obj>{},
          weekData: <Obj>{},
        }
    }
});