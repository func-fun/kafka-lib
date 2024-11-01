export enum HeaderNames {
  'Action' = 'Action',
  'Authentication' = 'Authentication',
  'Correlation-Id' = 'Correlation-Id',
  'Expiry' = 'Expiry',
  'Reply-To' = 'Reply-To',
  'Type' = 'Type',
}

export enum Action {
  'CREATE' = 'create',
  'UPDATE' = 'update',
  'DELETE' = 'delete',
}

export interface RegistryCacheInterface {
  set(subject: string, version: number | string, value: number): void;
  get(subject: string, version: number | string): number | null;
  has(subject: string, version: number | string): boolean;
}

export interface TopicAvroSettings {
  topicName: string;
  keySubject: string;
  payloadSubject: string;
  keyVersion?: number;
  payloadVersion?: number;
  compression?: number;
}

export type MessageHeaders = { [key in HeaderNames]?: Buffer } | { [key: string]: Buffer };
export type MessagePayload = Record<string, string | number | boolean | Array<unknown> | Record<string, unknown>>;
