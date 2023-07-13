import { HeaderNames, MessageHeaders } from './types';

export const getMessageHeaderValue = (headers: MessageHeaders[], header: HeaderNames | string): string | null => {
  for (const headerEntry of headers) {
    const headerValue = headerEntry[header as keyof MessageHeaders];

    if (undefined !== headerValue) {
      return Buffer.from(headerValue).toString();
    }
  }

  return null;
};
