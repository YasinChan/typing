let lastIndex: number = -1;

export function getRandomNonRepeatingElement<T>(arr: T[]): T | null {
  // 如果数组为空，返回 null 或者适当的值
  if (arr.length === 0) {
    return null;
  }

  // 如果数组中只有一个元素，直接返回该元素
  if (arr.length === 1) {
    return arr[0];
  }

  let randomIndex: number = lastIndex;

  // 确保每次随机选择的索引与上次不同
  while (randomIndex === lastIndex) {
    randomIndex = Math.floor(Math.random() * arr.length);
  }

  lastIndex = randomIndex;
  return arr[randomIndex];
}
