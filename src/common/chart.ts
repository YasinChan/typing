import YStorage from '@/common/YStorage';

// 处理图表数据，包括存储到本地缓存
export function handleChart(typingChartRecord: any, currentTitle: string) {
  let typingChartSpeed = [];
  let lastTypingChartSpeed = [];
  let typingChartAccuracy = [];
  let lastTypingChartAccuracy = [];
  if (typingChartRecord && typingChartRecord.speed) {
    typingChartSpeed = typingChartRecord.speed;
    const yStorage = YStorage.get('Y_STORAGE') || {};

    if (yStorage.typingChartSpeed && yStorage.typingChartSpeed[currentTitle]) {
      lastTypingChartSpeed = yStorage.typingChartSpeed[currentTitle] || [];
    }

    YStorage.set(
      'Y_STORAGE',
      Object.assign(yStorage, {
        typingChartSpeed: { [currentTitle]: typingChartSpeed }
      })
    );
  }
  if (typingChartRecord && typingChartRecord.accuracy) {
    typingChartAccuracy = typingChartRecord.accuracy;
    const yStorage = YStorage.get('Y_STORAGE') || {};

    if (yStorage.typingChartAccuracy && yStorage.typingChartAccuracy[currentTitle]) {
      lastTypingChartAccuracy = yStorage.typingChartAccuracy[currentTitle] || [];
    }

    YStorage.set(
      'Y_STORAGE',
      Object.assign(yStorage, {
        typingChartAccuracy: { [currentTitle]: typingChartAccuracy }
      })
    );
  }

  return {
    typingChartSpeed,
    lastTypingChartSpeed,
    typingChartAccuracy,
    lastTypingChartAccuracy
  };
}
