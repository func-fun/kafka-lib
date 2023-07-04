import { HeaderNames, MessageHeaders } from "./types";

export const getMessageHeaderValue = (headers: MessageHeaders, header: HeaderNames | string): string | null => {
    for (const key in headers) {
      if (header === key) {
        return Buffer.from(headers[header]).toString();
      }
    }

    return null;
};