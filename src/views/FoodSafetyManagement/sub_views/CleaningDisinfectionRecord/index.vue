<template>
  <div class="cleaning-disinfection-record">
    <ElTabs v-if="tabModel.data.length > 0" v-model="tabModel.active" @tab-change="onTabChange">
      <ElTabPane v-if="permissionModel.cleaning" label="清洁记录" name="cleaning">
        <ICleaningRecord v-if="tabModel.active === 'cleaning'"></ICleaningRecord>
      </ElTabPane>
      <ElTabPane v-if="permissionModel.environmental" label="环境消毒记录" name="environmental">
        <IEnvironmentalDisinfection v-if="tabModel.active === 'environmental'"></IEnvironmentalDisinfection>
      </ElTabPane>
    </ElTabs>
    <ElEmpty v-else description="暂无权限"></ElEmpty>
  </div>
</template>

<script lang="ts" setup>
import { computed, reactive, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import _utils from "@/utils/index";
import ICleaningRecord from "../CleaningRecord/index.vue";
import IEnvironmentalDisinfection from "../EnvironmentalDisinfection/index.vue";

const Route = useRoute();
const Router = useRouter();

const permissionModel = reactive({
  cleaning: _utils.permissionAnyFilter("cleaning_record"),
  environmental: _utils.permissionAnyFilter("environment_sanitization_record"),
});

const tabModel = reactive({
  active: "",
  data: computed(() => {
    const array: string[] = [];
    if (permissionModel.cleaning) {
      array.push("cleaning");
    }
    if (permissionModel.environmental) {
      array.push("environmental");
    }
    return array;
  }),
});

const getDefaultTab = () => {
  const queryTab = Route.query.tab?.toString();
  if (queryTab === "environmental" && permissionModel.environmental) {
    return "environmental";
  }
  if (queryTab === "cleaning" && permissionModel.cleaning) {
    return "cleaning";
  }
  return tabModel.data[0] ?? "";
};

const onTabChange = (name: string | number) => {
  Router.replace({
    name: "cleaningRecord",
    query: {
      ...Route.query,
      tab: name.toString(),
    },
  });
};

watch(
  () => Route.query.tab,
  () => {
    tabModel.active = getDefaultTab();
  },
  {
    immediate: true,
  }
);
</script>

<style lang="scss" scoped>
.cleaning-disinfection-record {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(.el-tabs) {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  :deep(.el-tabs__content) {
    flex: auto;
    min-height: 0;
  }

  :deep(.el-tab-pane) {
    height: 100%;
  }
}
</style>
