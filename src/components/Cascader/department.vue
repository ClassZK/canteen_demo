<template>
  <div class="cascader-container" v-loading="formModel.vLoading">
    <ElCascader v-model="formModel.checked" :options="formModel.data" :props="onCascaderProps" @change="onCascaderChange" filterable :clearable="props.clearable" :placeholder="props.placeholder"></ElCascader>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, watch, onBeforeUnmount } from 'vue';
  import Storage from 'tddev/storage';
  import _utils from '@/utils/index';
  import { apiAdminDistrictTreePage, apiAdminDistrictTreeLevel } from '@/api/management';

  const emits = defineEmits(['change']);
  const props = defineProps({
      modelValue: {
          type: [String, Number],
          default: ''
      },
      clearable: {
          type: Boolean,
          default: false,
      },
      placeholder: {
          type: String,
          default: '学校'
      },
      loadFirst: {
          type: Boolean,
          default: false,
      },
      noCache: {
          type: Boolean,
          default: false,
      },
  });

  let departmentCheckedList: Obj[] = [],
      departmentChecked: string[] = [];
  const formModel = reactive<{
      vLoading: boolean;
      data: Obj[];
      checked: string[];
  }>({
      vLoading: false,
      data: [],
      checked: [],
  });

  const onCascaderProps: Obj = {
      value: 'value',
      label: 'name',
      lazy: true,
      checkStrictly: true,
      lazyLoad: async (node, resolve) => {
        if (formModel.data.length > 0) {
          const DepartmentCheckedList: Obj[] = Storage.get('DepartmentCheckedList') ?? [];
          if (Array.isArray(DepartmentCheckedList) && DepartmentCheckedList.length >= 1) {
            departmentCheckedList = DepartmentCheckedList;

            const DepartmentChecked: string[] = departmentChecked;
            if (Array.isArray(DepartmentChecked) && DepartmentChecked.length >= 1 && node.value === DepartmentChecked[0]) {
              resolve(DepartmentCheckedList);
            } else {
              const list = await onApiRestaurantListAll(node.value);
              resolve(list);
            }
          } else {
            const list = await onApiRestaurantListAll(node.value);
            resolve(list);
          }
        } else {
          resolve([]);
        }
      }
  };

  const onLoad = () => {
    if (props.noCache) {
      if (props.loadFirst) {
        onFirstChecked();
      }
      return;
    }

    const DepartmentChecked: string[] = Storage.get('DepartmentChecked') ?? [];
    if (Array.isArray(DepartmentChecked) && DepartmentChecked.length >= 2) {
      formModel.checked = DepartmentChecked;
      departmentChecked = JSON.parse(JSON.stringify(DepartmentChecked));
      onChange();
    } else {
      if (props.loadFirst) {
          onFirstChecked();
      }
    }
  };

  const onFirstChecked = async () => {
      const list = await onApiRestaurantListAll(formModel.data[0].value);
      formModel.checked = [formModel.data[0].value, list[0].value];
      onChange();
  };

  /** 学校 */
  const onApiRestaurantListAll = async (areaName: string) => {
      formModel.vLoading = true;
      departmentCheckedList = [];
      const { success, data } = await apiAdminDistrictTreeLevel({
        parent_id: areaName
      });
      if (success) {
          const list = _utils.getDefaultArray(data.list);
          departmentCheckedList = list.map((item: Obj) => {
            item.value = item.id;
            item.leaf = item.unit_attr === "8";
            return item;
          });
      }
      formModel.vLoading = false;
      return departmentCheckedList;
  };

  const onCascaderChange = (value: []) => {
    let checked: string[] = [];
    if (Array.isArray(value) && value.length >= 1) {
      checked = value;
    }
    formModel.checked = checked;
    onChange();
  };

  const onChange = () => {
    const checked: string[] = formModel.checked;
    let id: string = '';
    let checkedData: Obj = {};
    if (checked.length >= 1) {
      id = checked[checked.length - 1];
      checkedData = departmentCheckedList.find(item => item.value === id) ?? {};

      if (!props.noCache) {
        if (departmentChecked.length >= 1 && checked[0] !== departmentChecked[0]) {
          Storage.set('DepartmentCheckedList', departmentCheckedList);
        }
        Storage.set('DepartmentID', id);
        Storage.set('DepartmentChecked', checked);
        departmentChecked = JSON.parse(JSON.stringify(checked));
      }
    }
    emits('change', id, checkedData);
  }

  onBeforeUnmount(() => {
    departmentCheckedList = [];
    departmentChecked = [];
  });

  const loadRootOrganizations = async () => {
      formModel.vLoading = true;
      const { success, data } = await apiAdminDistrictTreePage();
      const array = success ? _utils.getDefaultArray(data.list) : [];
      if (array.length > 0) {
        formModel.vLoading = true;
        const list = JSON.parse(JSON.stringify(array));
        formModel.data = list.map((item: Obj) => {
          item.value = item.id;
          item.leaf = item.unit_attr === "8";
          return item;
        });
        onLoad();
      }
      formModel.vLoading = false;
  };

  loadRootOrganizations();

  watch(() => props.modelValue, (value) => {
    if (!value) {
      if (props.loadFirst) {
        onFirstChecked();
      } else {
        formModel.checked = [];
      }
      return;
    }
    if (!formModel.checked.includes(String(value))) {
      formModel.checked = [String(value)];
    }
  }, {
    immediate: true,
  });
</script>

<style lang="scss" scoped>
  .cascader-container {
    width: 100%;
  }
  :deep() {
      .el-loading-spinner {
          height: 100%;
          .circular {
              width: 30px;
          }
      }
  }
</style>
