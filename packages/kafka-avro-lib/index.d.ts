import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { IHeaders, Kafka, Message, ProducerConfig, RecordMetadata } from 'kafkajs';
import { HeaderNames } from './index';

export interface TopicAvroSettings {
  topicName: string;
  keySubject: string;
  payloadSubject: string;
  keyVersion?: number;
  payloadVersion?: number;
  compression?: number;
}

export type MessageHeaders = { [key in HeaderNames]?: string } | IHeaders;
export type MessagePayload = Record<string, string | number | boolean | Array<unknown> | Record<string, unknown>>;

export class KafkaMessageHeaders {
  public static getHeaderValue(headers: MessageHeaders, header: HeaderNames): string | null;
}

export class AvroDecoder {
  constructor(schemaRegistry: SchemaRegistry);
  // typing disabled, because it makes sense to comply with the return type of the 3rd party lib
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public decodeMessage(encodedKey: string, encodedPayload: string): Promise<any[]>;
}

export class AvroProducer {
  constructor(
    kafka: Kafka,
    schemaRegistry: SchemaRegistry,
    topicAvroSettings: TopicAvroSettings[],
    config?: ProducerConfig | null
  );
  public disconnect(): Promise<void>;
  public produceMessage(
    key: string,
    payload: MessagePayload | null,
    topicName: string,
    headers?: MessageHeaders
  ): Promise<RecordMetadata[]>;
  public produceMessages(topicName: string, messages: Message[]): Promise<RecordMetadata[]>;
  public produceSingleMessage(
    key: string,
    payload: MessagePayload | null,
    topicName: string,
    headers?: MessageHeaders
  ): Promise<RecordMetadata[]>;
}
