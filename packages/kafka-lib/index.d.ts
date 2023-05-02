import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { Kafka, Message, ProducerConfig, RecordMetadata } from "kafkajs";
import { HeaderNames } from "./index";

export interface TopicAvroSettings {
    topicName: string,
    keySubject: string,
    payloadSubject: string,
    keyVersion?: number,
    payloadVersion?: number,
    compression?: number,
}

export type MessageHeaders = { [key in HeaderNames]?: string } | { [key: string]: any };

export class KafkaMessageHeaders {
    public static getHeaderValue(headers: MessageHeaders, header: HeaderNames): string | null;
}

export class AvroDecoder {
    constructor(schemaRegistry: SchemaRegistry);
    public decodeMessage(encodedKey: any, encodedPayload: any): Promise<any[]>;
}

export class AvroProducer {
    constructor(kafka: Kafka, schemaRegistry: SchemaRegistry, topicAvroSettings: TopicAvroSettings[], config?: ProducerConfig|null);
    public disconnect(): Promise<void>;
    public produceMessage(key: string, payload: Object|null, topicName: string, headers?: MessageHeaders): Promise<RecordMetadata[]>;
    public produceMessages(topicName: string, messages: Message[]): Promise<RecordMetadata[]>;
    public produceSingleMessage(key: string, payload: Object|null, topicName: string, headers?: MessageHeaders): Promise<RecordMetadata[]>;
}