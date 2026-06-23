/**
 * Executes a mapping function over an array of items with a limit on concurrent executions.
 */
export async function runWithConcurrency<T, R>(
  items: T[],
  fn: (item: T, index: number) => Promise<R>,
  concurrencyLimit: number
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  const worker = async () => {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex++;
      if (currentIndex >= items.length) break;
      try {
        results[currentIndex] = await fn(items[currentIndex], currentIndex);
      } catch (err) {
        // Individual item execution errors should be caught inside fn.
      }
    }
  };

  const workers = [];
  const activePoolSize = Math.min(concurrencyLimit, items.length);
  for (let i = 0; i < activePoolSize; i++) {
    workers.push(worker());
  }

  await Promise.all(workers);
  return results;
}
