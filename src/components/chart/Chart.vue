<script setup lang="ts">
import { ref, provide, onMounted } from 'vue';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  TitleComponent,
  TooltipComponent,
  GridComponent,
  VisualMapComponent,
  LegendComponent
} from 'echarts/components';
import VChart, { THEME_KEY } from 'vue-echarts';
import { useI18n } from 'vue-i18n';

// common
import { getCustomCssValue, addOpacityToHex } from '@/common/color';

use([
  CanvasRenderer,
  LineChart,
  TooltipComponent,
  TitleComponent,
  GridComponent,
  VisualMapComponent,
  LegendComponent
]);

provide(THEME_KEY, 'dark');

const { t } = useI18n();
const option = ref();

const props = defineProps({
  currentData: {
    type: Array,
    default: () => []
  },
  lastData: {
    type: Array,
    default: () => []
  },
  yName: {
    type: String,
    default: '速度（字/每分钟）'
  },
  title: {
    type: String,
    default: '速度'
  },
  tooltipFormatter: {
    type: Function,
    default: null
  }
});

onMounted(() => {
  // 用可读的主色文字色，浅色主题下不会出现亮青线压白底
  const mainColor = getCustomCssValue('--accent-text');
  const gray06 = getCustomCssValue('--gray-06');
  const gray08 = getCustomCssValue('--gray-08');
  const mainColor2 = addOpacityToHex(mainColor, 0.2);

  let xAxisData = props.currentData.map((_, i) => i);
  if (props.lastData.length && props.currentData.length) {
    if (props.lastData.length > props.currentData.length) {
      xAxisData = props.lastData.map((_, i) => i);
    }
  }

  const options = {
    title: {
      text: props.title,
      left: 'center',
      bottom: 0,
      textStyle: {
        color: gray08
      }
    },
    grid: {
      left: '2%',
      right: '4%',
      bottom: '18%',
      top: '18%',
      containLabel: true
    },
    tooltip: {
      trigger: 'axis',
      className: 'y-chart__tooltip',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      borderColor: 'rgba(0, 0, 0, 0.8)',
      extraCssText: 'max-width: 360px; white-space: normal; word-break: break-all;',
      textStyle: {
        color: '#fff',
        lineHeight: 20
      },
      formatter: props.tooltipFormatter || undefined
    },
    // visualMap: {
    //   show: false,
    //   type: 'continuous',
    //   dimension: 0,
    //   min: 0
    // },
    legend: {
      data: ['这次', '上次'],
      top: 0,
      textStyle: {
        color: gray06
      }
    },
    xAxis: {
      name: t('sec'),
      boundaryGap: false,
      type: 'category',
      nameTextStyle: {
        color: gray06
      },
      axisLabel: {
        alignMinLabel: 'left',
        color: gray06,
        align: 'center' // 将类目的值显示在刻度线上
      },
      axisLine: {
        lineStyle: {
          color: gray06
        }
      },
      data: xAxisData
    },
    yAxis: {
      name: props.yName,
      type: 'value',
      nameTextStyle: {
        align: 'left',
        color: gray06
      }
    },
    series: [
      {
        name: '这次',
        data: props.currentData,
        type: 'line',
        smooth: true,
        color: mainColor
      }
    ],
    backgroundColor: 'transparent'
  };
  if (props.lastData.length) {
    options.series.push({
      name: '上次',
      data: props.lastData,
      type: 'line',
      smooth: true,
      color: mainColor2
    });
  }
  option.value = options;
});
</script>

<template>
  <v-chart class="y-chart" :option="option" autoresize />
</template>

<style lang="scss">
.y-chart {
  height: 180px;
  background: transparent;
  //.y-chart__tooltip {
  //  border-radius: 2px;
  //  color: $gray-08;
  //}
}
</style>
