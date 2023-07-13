import { HeaderNames, MessageHeaders } from './types';

export const getMessageHeaderValue = (headers: MessageHeaders, header: HeaderNames | string): string | null => {
  for (const key in headers) {
    const headerValue = headers[header as keyof MessageHeaders];

    if (header === key && undefined !== headerValue) {
      return Buffer.from(headerValue).toString();
    }
  }

  return null;
};
