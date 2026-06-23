<template>
  <ElTableColumn
    v-if="isPlatformUser"
    label="组织名称"
    prop="org_name"
    min-width="150"
    align="center"
    show-overflow-tooltip
  >
    <template #default="scope">
      {{ scope.row.org_name || scope.row.unit_name || scope.row.schoolName || scope.row.orgName || "-" }}
    </template>
  </ElTableColumn>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import Storage from "tddev/storage";

const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
const isPlatformUser = computed(() => systemUserinfo?.user_scope === "platform");
</script>

