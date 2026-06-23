<template>
  <div class="chat-chunk">
    <div class="chat-title">学校菜品类型统计</div>
    <div class="chart-4"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import { DishesTypeList } from '@/global/const';

const props = defineProps({
  data: {
    type: Array<Obj>,
    default: [],
  }
});

let Chart: any = null;
let xAxisData: Array<string> = [];
let seriesData: Array<number> = [];

/** 初始化图表配置 */
const initChart = () => {
  const chartDOM = document.querySelector('.chart-4') as HTMLElement;
  Chart = echarts.init(chartDOM);
  const option = {
    color: ['#EF4444', '#FFB95A', '#84CC16', '#22C55E', '#3B82F6'],
    legend: {
      top: '0',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 30,
      right: 20,
      bottom: 10,
      left: 10,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: [],
      axisLabel: {
        color: '#333333'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#eeeeee'
        }
      }
    },
    yAxis: {
      nameGap: 20,
      minInterval: 1,
      nameTextStyle: {
        color: '#333333',
        fontSize: 12,
        align: 'center'
      },
      axisLabel: {
        color: '#333333'
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: '#eeeeee'
        }
      },
      splitLine: {
        show: true,
        lineStyle: {
          color: '#eeeeee',
          type: 'dashed'
        }
      }
    },
    series: [
      {
        type: 'bar',
        emphasis: {
          focus: 'series'
        },
        barMaxWidth: '30px',
        itemStyle: {
          borderRadius: [5, 5, 0, 0]
        },
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
  xAxisData = [];
  seriesData = [];
  if (array.length > 0) {
    for (const item of array) {
      xAxisData.push(DishesTypeList[item.type].name);
      seriesData.push(item.count);
    };
  } else {
    for (const item of DishesTypeList) {
      xAxisData.push(item.name);
      seriesData.push(0);
    }
  }
  Chart.setOption({
    xAxis: {
      data: xAxisData
    },
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
  .chart-4 {
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
      margin-bottom: 20px;
      padding: var(--gap);
      background: var(--bg-color-sm);
      border-radius: var(--radius-md);
      p {
        flex: none;
        width: calc(100% / 3);
      }
      .p2 {
        text-align: center;
      }
      .p3 {
        text-align: right;
      }
    }
  }
</style>