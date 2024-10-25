import { Kafka, Producer, RecordMetadata, CompressionTypes } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { AvroProducer } from '..';
import { MessagePayload, MessageHeaders, RegistryCacheInterface, TopicAvroSettings } from '../types';

// Mock implementations
const mockKafka = {
  producer: jest.fn(() => mockProducer),
} as unknown as Kafka;
const mockProducer = {
  connect: jest.fn(),
  disconnect: jest.fn(),
  send: jest.fn(),
  sendBatch: jest.fn(),
};

const mockSchemaRegistry = {
  encode: jest.fn(),
  getLatestSchemaId: jest.fn(),
  getRegistryId: jest.fn(),
};

const mockRegistryCache: jest.Mocked<RegistryCacheInterface | undefined> = {
  get: jest.fn(),
  set: jest.fn(),
  has: jest.fn(),
};

// Setup topic settings
const topicAvroSettings: TopicAvroSettings[] = [
  {
    topicName: 'test-topic',
    keySubject: 'key-subject',
    keyVersion: undefined,
    payloadSubject: 'payload-subject',
    payloadVersion: undefined,
    compression: CompressionTypes.GZIP,
  },
];

// Set up AvroProducer instance
let avroProducer: AvroProducer;

beforeEach(() => {
  jest.clearAllMocks();
  mockKafka.producer = jest.fn(() => mockProducer) as any;
  avroProducer = new AvroProducer(mockKafka as unknown as Kafka, mockSchemaRegistry as unknown as SchemaRegistry, topicAvroSettings, null, mockRegistryCache);
});

describe('AvroProducer', () => {
  describe('produceMessage', () => {
    it('should produce a single message successfully', async () => {
      const key = 'test-key';
      const payload: MessagePayload = { data: 'test-data' };
      const topicName = 'test-topic';
      const headers: MessageHeaders = { 'header-key': Buffer.from('header-value') };

      mockSchemaRegistry.encode
        .mockResolvedValueOnce(Buffer.from('encoded-key'))
        .mockResolvedValueOnce(Buffer.from('encoded-payload'));
      mockProducer.send.mockResolvedValueOnce([{ topicName: 'test-topic', partition: 0, offset: '1', timestamp: 'timestamp' }]);

      const result = await avroProducer.produceMessage(key, payload, topicName, headers);

      expect(mockProducer.connect).toHaveBeenCalled();
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: topicAvroSettings[0].topicName,
        compression: CompressionTypes.GZIP,
        messages: [{
          key: expect.any(Buffer),
          value: expect.any(Buffer),
          headers: headers,
        }],
      });
      expect(result).toEqual([{ topicName: 'test-topic', partition: 0, offset: '1', timestamp: 'timestamp' }]);
      await avroProducer.disconnect();
    });

    it('should throw an error if topic settings are not found', async () => {
      const key = 'test-key';
      const payload: MessagePayload = { data: 'test-data' };
      const topicName = 'non-existing-topic';

      await expect(avroProducer.produceMessage(key, payload, topicName)).rejects.toThrow('No avro settings for topic: non-existing-topic');
    });
  });

  describe('produceMessages', () => {
    it('should produce multiple messages successfully', async () => {
      const topicName = 'test-topic';
      const messages = [{ key: 'key1', value: 'value1' }, { key: 'key2', value: 'value2' }];
  
      mockSchemaRegistry.encode
        .mockResolvedValueOnce(Buffer.from('encoded-key1'))
        .mockResolvedValueOnce(Buffer.from('encoded-value1'))
        .mockResolvedValueOnce(Buffer.from('encoded-key2'))
        .mockResolvedValueOnce(Buffer.from('encoded-value2'));
      mockProducer.send.mockResolvedValueOnce([{ topicName: 'test-topic', partition: 0, offset: '2', timestamp: 'timestamp' }]);
  
      const result = await avroProducer.produceMessages(topicName, messages);
  
      expect(mockProducer.connect).toHaveBeenCalled();
      expect(mockProducer.send).toHaveBeenCalledWith({
        topic: topicName,
        compression: topicAvroSettings[0].compression,
        messages: [
          { key: Buffer.from('encoded-key1'), value: Buffer.from('encoded-value1') },
          { key: Buffer.from('encoded-key2'), value: Buffer.from('encoded-value2') },
        ],
      });
      expect(result).toEqual([{ topicName: 'test-topic', partition: 0, offset: '2', timestamp: 'timestamp' }]);
      await avroProducer.disconnect();
    });
  });

  describe('getEncodedMessage', () => {
    it('should encode key and payload', async () => {
      const key = 'test-key';
      const payload: MessagePayload = { data: 'test-data' };
      const topicName = 'test-topic';
      const topicAvroSetting = topicAvroSettings[0];

      mockSchemaRegistry.encode
        .mockResolvedValueOnce(Buffer.from('encoded-key'))
        .mockResolvedValueOnce(Buffer.from('encoded-payload'));

      const result = await avroProducer['getEncodedMessage'](key, payload, topicAvroSetting);

      expect(result).toEqual([Buffer.from('encoded-key'), Buffer.from('encoded-payload')]);
    });

    it('should encode only key when payload is null', async () => {
      const key = 'test-key';
      const payload: MessagePayload | null = null;
      const topicName = 'test-topic';
      const topicAvroSetting = topicAvroSettings[0];

      mockSchemaRegistry.encode.mockResolvedValueOnce(Buffer.from('encoded-key'));

      const result = await avroProducer['getEncodedMessage'](key, payload, topicAvroSetting);

      expect(result).toEqual([Buffer.from('encoded-key'), null]);
    });
  });

  describe('getEncodedMessages', () => {
    it('should encode multiple messages', async () => {
      const messages = [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ];
      const topicConfig = topicAvroSettings[0];

      mockSchemaRegistry.encode
        .mockResolvedValueOnce(Buffer.from('encoded-key1'))
        .mockResolvedValueOnce(Buffer.from('encoded-value1'))
        .mockResolvedValueOnce(Buffer.from('encoded-key2'))
        .mockResolvedValueOnce(Buffer.from('encoded-value2'));

      const result = await avroProducer['getEncodedMessages'](messages, topicConfig);

      expect(result).toEqual([
        { key: Buffer.from('encoded-key1'), value: Buffer.from('encoded-value1') },
        { key: Buffer.from('encoded-key2'), value: Buffer.from('encoded-value2') },
      ]);
    });

    it('should handle null payloads', async () => {
      const messages = [
        { key: 'key1', value: null },
        { key: 'key2', value: 'value2' },
      ];
      const topicConfig = topicAvroSettings[0];

      mockSchemaRegistry.encode
        .mockResolvedValueOnce(Buffer.from('encoded-key1'))
        .mockResolvedValueOnce(Buffer.from('encoded-key2'))
        .mockResolvedValueOnce(Buffer.from('encoded-value2'));

      const result = await avroProducer['getEncodedMessages'](messages, topicConfig);

      expect(result).toEqual([
        { key: Buffer.from('encoded-key1'), value: null },
        { key: Buffer.from('encoded-key2'), value: Buffer.from('encoded-value2') },
      ]);
    });
  });

  describe('getMessage', () => {
    it('should create a message object with headers', () => {
      const encodedKey = Buffer.from('encoded-key');
      const encodedPayload = Buffer.from('encoded-payload');
      const headers: MessageHeaders = { 'header-key': Buffer.from('header-value') };

      const result = avroProducer['getMessage'](encodedKey, encodedPayload, headers);

      expect(result).toEqual({
        key: encodedKey,
        value: encodedPayload,
        headers: headers,
      });
    });

    it('should create a message object without headers', () => {
      const encodedKey = Buffer.from('encoded-key');
      const encodedPayload = Buffer.from('encoded-payload');

      const result = avroProducer['getMessage'](encodedKey, encodedPayload);

      expect(result).toEqual({
        key: encodedKey,
        value: encodedPayload,
      });
    });
  });

  describe('getKeySchemaId', () => {
    it('should retrieve the key schema ID', async () => {
      const topicConfig = topicAvroSettings[0];
      mockSchemaRegistry.getLatestSchemaId.mockResolvedValue(1);

      const result = await avroProducer['getKeySchemaId'](topicConfig);

      expect(result).toBe(1);
      expect(mockSchemaRegistry.getLatestSchemaId).toHaveBeenCalledWith(topicConfig.keySubject);
    });
  });

  describe('getPayloadSchemaId', () => {
    it('should retrieve the payload schema ID', async () => {
      const topicConfig = topicAvroSettings[0];
      mockSchemaRegistry.getLatestSchemaId.mockResolvedValue(2);

      const result = await avroProducer['getPayloadSchemaId'](topicConfig);

      expect(result).toBe(2);
      expect(mockSchemaRegistry.getLatestSchemaId).toHaveBeenCalledWith(topicConfig.payloadSubject);
    });
  });

  describe('getSchemaId', () => {
    it('should retrieve schema ID from cache if available', async () => {
      const subject = 'key-subject';
      mockRegistryCache.get.mockReturnValue(1);

      const result = await avroProducer['getSchemaId'](subject, undefined);

      expect(result).toBe(1);
      expect(mockRegistryCache.get).toHaveBeenCalledWith(subject);
    });

    it('should retrieve schema ID from schema registry if not in cache', async () => {
      const subject = 'key-subject';
      mockRegistryCache.get.mockReturnValue(null);
      mockSchemaRegistry.getLatestSchemaId.mockResolvedValue(1);
      
      const result = await avroProducer['getSchemaId'](subject, 1);

      expect(result).toBe(1);
      expect(mockSchemaRegistry.getLatestSchemaId).toHaveBeenCalledWith(subject);
      expect(mockRegistryCache.set).toHaveBeenCalledWith(subject, 1);
    });
  });

  describe('getTopicAvroSettings', () => {
    it('should return topic avro settings', () => {
      const topicName = 'test-topic';
      const settings = avroProducer['getTopicAvroSettings'](topicName);

      expect(settings).toEqual(topicAvroSettings[0]);
    });

    it('should throw an error if no settings found', () => {
      const topicName = 'non-existing-topic';

      expect(() => avroProducer['getTopicAvroSettings'](topicName)).toThrow('No avro settings for topic: non-existing-topic');
    });
  });
});
