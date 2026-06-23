<template>
  <ElFormItem v-if="isPlatformUser" label="组织" prop="org_id">
    <ICascaderDepartment
      v-model="orgId"
      clearable
      noCache
      placeholder="全部组织"
      @change="onOrgChange"
    ></ICascaderDepartment>
  </ElFormItem>
</template>

<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import Storage from "tddev/storage";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
});

const emits = defineEmits(["update:modelValue", "change"]);
const systemUserinfo: Obj = Storage.get("SystemUserinfo") ?? {};
const isPlatformUser = computed(() => systemUserinfo?.user_scope === "platform");
const orgId = ref(String(props.modelValue || ""));

const syncStorage = (value: string) => {
  if (!isPlatformUser.value) return;
  Storage.set("orgID", value);
};

const onOrgChange = (value: string | number) => {
  const nextValue = String(value || "");
  orgId.value = nextValue;
  emits("update:modelValue", nextValue);
  syncStorage(nextValue);
  emits("change", nextValue);
};

watch(
  () => props.modelValue,
  value => {
    const nextValue = String(value || "");
    orgId.value = nextValue;
    syncStorage(nextValue);
  },
  {
    immediate: true,
  },
);
</script>

