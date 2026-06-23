<template>
  <div class="chat-chunk">
    <div class="chat-title">学校食谱评分统计</div>
    <ElRow>
      <ElCol :span="14">
        <div class="chart-2"></div>
      </ElCol>
      <ElCol :span="10">
        <ul class="type-list">
          <li v-for="item of chatModel.data">
            <p>{{ item.name }}</p>
            <p>{{ item.value }}家</p>
          </li>
        </ul>
      </ElCol>
    </ElRow>
  </div>
</template>

<script lang="ts" setup>
import { reactive, onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import { ScoreList } from '@/global/const';

const props = defineProps({
  data: {
    type: Array<Obj>,
    default: [],
  }
});

let Chart: any = null;
let seriesData: Array<Obj> = [];

const chatModel = reactive<{
  data: Obj[];
}>({
  data: []
});

/** 初始化图表配置 */
const initChart = () => {
  const chartDOM = document.querySelector('.chart-2') as HTMLElement;
  Chart = echarts.init(chartDOM);
  const option = {
    color: ['#EF4444', '#FFB95A', '#84CC16', '#22C55E', '#3B82F6'],
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: ['30%', '70%'],
        data: []
      }
    ]
  };
  Chart.setOption(option);
};

const windowResize = () => {
  Chart.resize();
};

/** 刷新图表数据 */
const getChartData = (array: Obj[]) => {
  seriesData = [];
  if (array.length > 0) {
    for (const item of array) {
      seriesData.push({
        name: ScoreList[item.score].name,
        value: item.count,
      });
    };
  } else {
    seriesData = [
      { value: 0, name: '完美' },
      { value: 0, name: '优秀' },
      { value: 0, name: '良好' },
      { value: 0, name: '一般' },
      { value: 0, name: '较差' },
    ];
  }
  chatModel.data = seriesData;
  Chart.setOption({
    series: [{
      data: seriesData
    }]
  });
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', windowResize, false);
});
onBeforeUnmount(() => {
  if (Chart) {
    Chart.dispose();
    Chart = null;
  }
  window.removeEventListener('resize', windowResize, false);
});

watch(() => props.data, (data) => {
  getChartData(data);
}, {
  deep: true,
});
</script>

<style lang="scss" scoped>
  .chart-2 {
    height: 300px;
  }
  .type-list {
    display: flex;
    flex-direction: column;
    justify-content: space-evenly;
    height: 100%;
    li {
      display: flex;
      align-items: center;
      padding: var(--gap);
      background: var(--bg-color-sm);
      border-radius: var(--radius-md);
      p {
        flex: none;
        width: calc(100% / 2);
        text-align: center;
      }
    }
  }
</style>