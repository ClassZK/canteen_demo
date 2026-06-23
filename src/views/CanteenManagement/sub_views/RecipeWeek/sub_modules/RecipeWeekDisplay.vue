<template>
  <div class="recipe-week-vtable">
    <div class="list list-category">
      <div class="vthead">
        <div class="cell">用餐餐次</div>
      </div>
      <div class="vtbody">
        <div class="cell" v-for="item of mealtimes" :key="item.name">{{ item.name }}</div>
      </div>
    </div>
    <div class="list" v-for="item in days" :key="item.date">
      <div class="vthead">
        <div class="cell">{{ item.date }} {{ item.week }}</div>
      </div>
      <div class="vtbody">
        <div class="cell" v-for="el of item.mealtimes" :key="item.date + el.value">
          <ElTag v-for="e of el.data" :key="item.date + el.value + e.id + e.name" type="warning">
            {{ e.name }}<span v-if="showPrice(e)">（{{ formatPrice(e.price) }}元）</span>
          </ElTag>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { computed } from "vue";

const props = defineProps<{
  data: Obj | Obj[];
  mealtimes: Obj[];
}>();

const days = computed<Obj[]>(() => {
  if (Array.isArray(props.data)) return props.data;
  return Object.values(props.data || {});
});

const showPrice = (data: Obj) => data.price !== undefined && data.price !== "" && data.price !== null;
const formatPrice = (value: string | number) => {
  const number = Number(value || 0);
  if (!Number.isFinite(number)) return "0.00";
  return number.toFixed(2);
};
</script>
