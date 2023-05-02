import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Partitioners, Kafka, CompressionTypes, Message, Producer, RecordMetadata, ProducerConfig } from 'kafkajs';
import { MessageHeaders, TopicAvroSettings } from '.';

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
    'DELETE' = 'delete'
}

class AvroDecoder {
    private schemaRegistry: SchemaRegistry;

    constructor(schemaRegistry: SchemaRegistry) {
        this.schemaRegistry = schemaRegistry;
    }

    public async decodeMessage(encodedKey: any, encodedPayload: any): Promise<any[]> {
        if (null === encodedPayload || undefined === encodedPayload) {
            return Promise.all(
                [
                    this.schemaRegistry.decode(Buffer.from(encodedKey, 'base64')),
                    null
                ]
            );
        }

        return Promise.all(
            [
                this.schemaRegistry.decode(Buffer.from(encodedKey, 'base64')),
                this.schemaRegistry.decode(Buffer.from(encodedPayload, 'base64'))
            ]
        );
    }
}

class AvroProducer {
    private kafka: Kafka;
    private producer: Producer;
    private schemaRegistry: SchemaRegistry;
    private topicAvroSettings: TopicAvroSettings[];
    private defaultProducerConfig: ProducerConfig = { createPartitioner: Partitioners.DefaultPartitioner, idempotent: true }

    constructor(
        kafka: Kafka,
        schemaRegistry: SchemaRegistry,
        topicAvroSettings: TopicAvroSettings[],
        config: ProducerConfig|null = null
    ) {
        config = config ?? this.defaultProducerConfig;
        this.kafka = kafka;
        this.producer = this.kafka.producer(config);
        this.schemaRegistry = schemaRegistry;
        this.topicAvroSettings = topicAvroSettings;
    }

    public async disconnect(): Promise<void> {
        await this.producer.disconnect();
    }

    public async produceMessage(
        key: string,
        payload: Object|null,
        topicName: string,
        headers?: MessageHeaders
    ): Promise<RecordMetadata[]> {
        var topicAvroSettings = this.getTopicAvroSettings(topicName);
        const [encodedKey, encodedPayload] = await this.getEncodedMessage(key, payload, topicAvroSettings);

        await this.producer.connect();
            
        return this.producer.send(
          {
            topic: topicAvroSettings.topicName,
            compression: topicAvroSettings.compression ?? CompressionTypes.GZIP,
            messages: [
              this.getMessage(encodedKey, encodedPayload, headers)
            ]
          }
        );        
    }

    public async produceMessages(
        topicName: string,
        messages: Message[]
    ): Promise<RecordMetadata[]> {
        var topicAvroSettings = this.getTopicAvroSettings(topicName);
        let encodedMessages: Message[] = await this.getEncodedMessages(messages, topicAvroSettings);

        await this.producer.connect();
        return this.producer.send(
          {
            topic: topicAvroSettings.topicName,
            compression: topicAvroSettings.compression ?? CompressionTypes.GZIP,
            messages: encodedMessages
          }
        );
    }

    public async produceSingleMessage(
        key: string,
        payload: Object|null,
        topicName: string,
        headers?: MessageHeaders
    ): Promise<RecordMetadata[]> {
        let result = await this.produceMessage(key, payload, topicName, headers);
        await this.disconnect();

        return result;
    }

    private async getEncodedMessage(
        key: string,
        payload: Object|null,
        topicAvroSettings: TopicAvroSettings
    ): Promise<[Buffer, null] | [Buffer, Buffer]> {
        const [keyId, payloadId] = await Promise.all(
            [
                this.getKeySchemaId(topicAvroSettings),
                this.getPayloadSchemaId(topicAvroSettings)
            ]
        );

        if (null === payload) {
            return Promise.all(
                [
                    this.schemaRegistry.encode(keyId, key),
                    null
                ]
            );
        }
        
        return Promise.all(
            [
                this.schemaRegistry.encode(keyId, key),
                this.schemaRegistry.encode(payloadId, payload)
            ]
        );
    }

    private async getEncodedMessages(messages: Message[], topicConfig: TopicAvroSettings): Promise<Message[]> {
        const [keyId, payloadId] = await Promise.all(
            [
                this.getKeySchemaId(topicConfig),
                this.getPayloadSchemaId(topicConfig)
            ]
        );

        const encodedMessages: Promise<Message>[] = messages.map(
            async (message) => {
                const [key, value] = await Promise.all(
                    [
                        this.schemaRegistry.encode(keyId, message.key),
                        null === message.value ? null : this.schemaRegistry.encode(payloadId, message.value)
                    ]
                );

                if (undefined !== message.headers) {
                    return { key, value, headers: message.headers }
                }

                return { key, value };
            }
        )

        return Promise.all(encodedMessages);
    }

    private getMessage(encodedKey: Buffer, encodedPayload: Buffer|null, headers?: MessageHeaders): Message {
        if (undefined === headers) {
            return {
                key: encodedKey,
                value: encodedPayload
            };
        }

        return {
            key: encodedKey,
            value: encodedPayload,
            headers: headers
        };
    }

    private async getKeySchemaId(topicConfig: TopicAvroSettings): Promise<number> {
        return this.getSchemaId(topicConfig.keySubject, topicConfig.keyVersion);
    }

    private async getPayloadSchemaId(topicConfig: TopicAvroSettings): Promise<number> {
        return this.getSchemaId(topicConfig.payloadSubject, topicConfig.payloadVersion);
    }

    private async getSchemaId(subject: string, version: number | undefined): Promise<number> {
        if (undefined === version) {
            return this.schemaRegistry.getLatestSchemaId(subject);
        }

        return this.schemaRegistry.getRegistryId(subject, version);
    }

    private getTopicAvroSettings(topicName: string): TopicAvroSettings {
        const selectedSetting =  this.topicAvroSettings.find(setting => setting.topicName === topicName)
        if (selectedSetting) return selectedSetting;
        throw `No avro settings for topic: ${topicName}`;
    }

}

class KafkaMessageHeaders {
    public static getHeaderValue(headers: MessageHeaders[], header: HeaderNames|string): string | null {
        const selected = headers.find(h => header in h );
        if (!selected) return null;
        return Buffer.from(selected[header]).toString()
    }
}

export { AvroProducer, AvroDecoder, KafkaMessageHeaders }
