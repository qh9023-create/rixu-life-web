/// <reference lib="webworker" />
import { createArchive, readArchive, type Snapshot } from '@/features/backup/core';
self.onmessage = async (
  event: MessageEvent<{
    action: string;
    payload: { snapshot: Snapshot; mode: 'complete' | 'attachments' } | Uint8Array;
  }>,
) => {
  try {
    const progress = (value: number) => self.postMessage({ type: 'progress', value });
    const payload = event.data.payload;
    const result =
      event.data.action === 'pack'
        ? await createArchive(
            (payload as { snapshot: Snapshot }).snapshot,
            (payload as { mode: 'complete' | 'attachments' }).mode,
            progress,
          )
        : await readArchive(payload as Uint8Array, progress);
    self.postMessage({ type: 'done', result });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : '处理失败。',
    });
  }
};
