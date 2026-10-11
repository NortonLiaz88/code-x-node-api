export interface SseEvent {
  event: string;
  data: string;
}

/** Formats one server-sent event. */
export const formatSse = (event: string, data: unknown): string =>
  `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;

/** Reads server-sent events from a byte stream, however the bytes are chunked. */
export async function* parseSse(
  stream: AsyncIterable<Buffer | string>,
): AsyncGenerator<SseEvent> {
  let buffer = '';
  const decoder = new TextDecoder();

  for await (const chunk of stream) {
    buffer +=
      typeof chunk === 'string'
        ? chunk
        : decoder.decode(chunk, { stream: true });
    buffer = buffer.replace(/\r\n/g, '\n');

    let end = buffer.indexOf('\n\n');
    while (end >= 0) {
      const event = toEvent(buffer.slice(0, end));
      buffer = buffer.slice(end + 2);
      if (event) yield event;
      end = buffer.indexOf('\n\n');
    }
  }

  const last = toEvent(buffer);
  if (last) yield last;
}

const toEvent = (block: string): SseEvent | null => {
  let event = 'message';
  const data: string[] = [];
  for (const line of block.split('\n')) {
    if (line.startsWith('event:')) event = line.slice(6).trim();
    else if (line.startsWith('data:')) data.push(line.slice(5).trimStart());
  }
  return data.length ? { event, data: data.join('\n') } : null;
};
