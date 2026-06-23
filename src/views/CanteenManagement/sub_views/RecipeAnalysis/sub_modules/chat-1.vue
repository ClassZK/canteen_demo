<template>
  <div class="chat-chunk">
    <div class="chat-title">学校食谱录入趋势分析</div>
    <div class="chart-1"></div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, onBeforeUnmount, watch } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { dateFilter, timestampFilter } from '@/utils/Dayjs';
import _utils from '@/utils/index';

const props = defineProps({
  data: {
    type: Array<Obj>,
    default: [],
  }
});

const currentWeek = _utils.getCurrentWeekRange();
let Chart: any = null;
let xAxisData: Array<string> = [];
let seriesData: Array<number> = [];

/** 初始化图表配置 */
const initChart = () => {
  const chartDOM = document.querySelector('.chart-1') as HTMLElement;
  Chart = echarts.init(chartDOM);
  const option = {
    color: ['#3B82F6'],
    grid: {
      top: 30,
      right: 20,
      bottom: 10,
      left: 10,
      containLabel: true
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      data: xAxisData,
      boundaryGap: false,
      axisLabel: {
        color: '#333333'
      },
      axisTick: {
        show: false
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
    series: [{
      type: 'line',
      emphasis: {
        focus: 'series'
      },
      areaStyle: {
        color: 'rgba(59, 130, 246, 0.03)'
      },
      data: seriesData
    }]
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
      const date = dayjs(item.date).format('MM-DD');
      xAxisData.push(date);
      seriesData.push(item.count);
    };
  } else {
    for (let i=0; i<7; i++) {
      const timestamp = timestampFilter(currentWeek.start) + 1000 * 24 * 60 * 60 * i;
      const date = dayjs(timestamp).format('MM-DD');
      xAxisData.push(date);
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
  .chart-1 {
    height: 300px;
  }
</style>