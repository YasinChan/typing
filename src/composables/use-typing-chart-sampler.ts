import { ref, onUnmounted, type Ref } from 'vue';

interface SamplerSource {
  wordLength: Ref<number> | { value: number } | (() => number);
  wrongLength: Ref<number> | { value: number } | (() => number);
}

function read(v: SamplerSource['wordLength']): number {
  if (typeof v === 'function') return v();
  return v.value;
}

export function useTypingChartSampler(
  source: SamplerSource,
  intervalMs = 1000,
  speedDivisor = 1
) {
  const accuracyRecord = ref<number[]>([]);
  const speedRecord = ref<number[]>([]);
  let timer: number | null = null;

  function start() {
    stop();
    accuracyRecord.value = [];
    speedRecord.value = [];
    let relativeTime = 0;
    timer = window.setInterval(() => {
      const wl = read(source.wordLength);
      const wr = read(source.wrongLength);
      accuracyRecord.value.push(wl ? Math.round(((wl - wr) / wl) * 100) : 0);
      if (relativeTime) {
        const divisor = speedDivisor || 1;
        speedRecord.value.push(Math.round(((wl - wr) / relativeTime) * 60 / divisor));
      } else {
        speedRecord.value = [0];
      }
      relativeTime++;
    }, intervalMs);
  }

  function stop() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  }

  onUnmounted(stop);

  return { accuracyRecord, speedRecord, start, stop };
}
