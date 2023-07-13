import { HeaderNames, MessageHeaders } from './types';

export const getMessageHeaderValue = (headers: MessageHeaders[], header: HeaderNames | string): string | null => {
  const selected = headers.find(h => header in h );

  if (undefined === selected) {
      return null;
  }

  return Buffer.from(selected[header]).toString()
};
