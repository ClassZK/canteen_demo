<template>
    <div class="overview-chunk tendency" v-loading="chatModel.vLoading" element-loading-text="数据加载中">
        <div class="overview-header">
            <p class="title">近15天报警趋势分析</p>
        </div>
        <div class="tendency-chat"></div>
    </div>
</template>

<script lang="ts" setup>
import { reactive, watch, onMounted, onBeforeUnmount } from 'vue';
import * as echarts from 'echarts';
import dayjs from 'dayjs';
import { Message } from '@/global/const';
import { apiWarehouseInventoryTrend } from '@/api/warehouse';

let Chart: any = null;
let xAxisData: Array<string> = [];
let seriesData: Array<number> = [];
let seriesData2: Array<number> = [];
let seriesData3: Array<number> = [];

const chatModel = reactive({
  vLoading: false,
});

/** 初始化图表配置 */
const initChart = () => {
  const chartDOM = document.querySelector('.tendency-chat') as HTMLElement;
  Chart = echarts.init(chartDOM);
  const option = {
    color: ['#E6A23C', '#67C23A', '#409EFF'],
    legend: {
      top: 20,
      right: 10,
      itemGap: 20,
    },
    tooltip: {
      trigger: 'axis'
    },
    grid: {
      top: 80,
      right: 20,
      bottom: 10,
      left: 10,
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: xAxisData,
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
    series: [{
      name: '食材过期',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      barMaxWidth: '30px',
      stack: 'total',
      data: seriesData
    }, {
      name: '日采购',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      barMaxWidth: '30px',
      stack: 'total',
      data: seriesData
    }, {
      name: '月采购',
      type: 'bar',
      emphasis: {
        focus: 'series'
      },
      barMaxWidth: '30px',
      stack: 'total',
      data: seriesData
    }]
  };
  Chart.setOption(option);
};

const windowResize = () => {
  Chart.resize();
};

const getApiWarehouseInventoryTrend = async () => {
  chatModel.vLoading = true;
  const { success, data, message } = await apiWarehouseInventoryTrend();
    if (success) {
      getChartData(data);
    } else {
        Message.warning(message);
    }
    chatModel.vLoading = false;
};
getApiWarehouseInventoryTrend();

/** 刷新图表数据 */
const getChartData = (data: Obj) => {
  if (data) {
    xAxisData =  [];
    seriesData = [];
    seriesData2 = [];
    seriesData3 = [];
    if (Array.isArray(data.warn_record)) {
      for (const item of data.warn_record) {
        const date = dayjs(item.date).format('MM-DD');
        xAxisData.push(date);
        seriesData.push(item.count);
      };
    }
    if (Array.isArray(data.price_warn_record)) {
      for (const item of data.price_warn_record) {
        seriesData2.push(item.count);
      };
    }
    if (Array.isArray(data.month_price_warn_record)) {
      for (const item of data.month_price_warn_record) {
        seriesData3.push(item.count);
      };
    }
    Chart.setOption({
      xAxis: {
        data: xAxisData
      },
      series: [{
        data: seriesData
      }, {
        data: seriesData2
      }, {
        data: seriesData3
      }]
    });
  }
  windowResize();
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
</script>

<style lang="scss" scoped>
  .tendency {
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    flex: auto;
    .overview-header {
      flex: none;
    }
    .tendency-chat {
      overflow: hidden;
      flex: auto;
    }
  }
</style>