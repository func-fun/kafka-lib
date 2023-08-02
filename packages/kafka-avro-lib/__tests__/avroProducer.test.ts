import { jest } from '@jest/globals';
import { CompressionTypes, Kafka, Producer, RecordMetadata, ProducerConfig, Partitioners } from 'kafkajs';
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { AvroProducer } from '..';
import { TopicAvroSettings } from '../types';

describe('AvroProducer', () => {
  let avroProducer: AvroProducer;
  let kafka: Kafka;
  let producer: Producer;
  let schemaRegistry: SchemaRegistry;
  const topicAvroSettings: TopicAvroSettings[] = [
    {
      topicName: 'testTopic',
      compression: CompressionTypes.GZIP,
      keySubject: 'testTopic-key',
      payloadSubject: 'testTopic-value',
    },
  ];
  const defaultProducerConfig: ProducerConfig = {
    createPartitioner: Partitioners.DefaultPartitioner,
    idempotent: true,
  };

  beforeEach(() => {
    kafka = new Kafka({ brokers: ['localhost'] });
    producer = kafka.producer(defaultProducerConfig);
    schemaRegistry = new SchemaRegistry({ host: 'localhost' });
    avroProducer = new AvroProducer(kafka, schemaRegistry, topicAvroSettings, {
      createPartitioner: Partitioners.DefaultPartitioner,
      idempotent: true,
    });
    avroProducer['producer'] = producer;
  });

  afterEach(async () => {
    await avroProducer.disconnect();
  });

  describe('disconnect', () => {
    it('should disconnect the producer', async () => {
      // Mock the producer.disconnect method
      const mockDisconnect = jest.spyOn(producer, 'disconnect');

      // Call the disconnect method
      await avroProducer.disconnect();

      // Assertions
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });

  describe('produceMessage', () => {
    it('should produce a message with key and payload', async () => {
      // Mock the required methods and properties
      const mockConnect = jest.spyOn(producer, 'connect').mockResolvedValue(undefined);
      const mockSend = jest.spyOn(producer, 'send').mockResolvedValue([]);

      const encodedKey = Buffer.from('encodedKey');
      const encodedPayload = Buffer.from('encodedPayload');
      const mockGetEncodedMessage = jest
        .spyOn(avroProducer as any, 'getEncodedMessage')
        .mockResolvedValueOnce([encodedKey, encodedPayload]);
      const mockGetTopicAvroSettings = jest
        .spyOn(avroProducer as any, 'getTopicAvroSettings')
        .mockReturnValueOnce(topicAvroSettings);
      const mockGetMessage = jest.spyOn(avroProducer as any, 'getMessage');

      // Call the produceMessage method
      const result = await avroProducer.produceMessage('key', { payload: 'value' }, 'testTopic');

      // Assertions
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockGetEncodedMessage).toHaveBeenCalledWith('key', { payload: 'value' }, topicAvroSettings);
      expect(mockGetTopicAvroSettings).toHaveBeenCalledWith('testTopic');
      expect(mockGetMessage).toHaveBeenCalledWith(encodedKey, encodedPayload, undefined);
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('produceMessages', () => {
    it('should produce multiple messages', async () => {
      // Mock the required methods and properties
      const mockConnect = jest.spyOn(producer, 'connect').mockResolvedValue(undefined);
      const mockSend = jest.spyOn(producer, 'send').mockResolvedValue([]);
      const encodedMessages = [
        { key: Buffer.from('encodedKey1'), value: Buffer.from('encodedPayload1') },
        { key: Buffer.from('encodedKey2'), value: Buffer.from('encodedPayload2') },
      ];
      const mockGetEncodedMessages = jest
        .spyOn(avroProducer as any, 'getEncodedMessages')
        .mockResolvedValueOnce(encodedMessages);
      const mockGetTopicAvroSettings = jest
        .spyOn(avroProducer as any, 'getTopicAvroSettings')
        .mockReturnValueOnce(topicAvroSettings);

      // Call the produceMessages method
      const result = await avroProducer.produceMessages('testTopic', [
        { key: 'key1', value: 'value1' },
        { key: 'key2', value: 'value2' },
      ]);

      // Assertions
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(mockSend).toHaveBeenCalledTimes(1);
      expect(mockGetEncodedMessages).toHaveBeenCalledWith(
        [
          { key: 'key1', value: 'value1' },
          { key: 'key2', value: 'value2' },
        ],
        topicAvroSettings
      );
      expect(mockGetTopicAvroSettings).toHaveBeenCalledWith('testTopic');
      expect(result).toEqual(expect.any(Array));
    });
  });

  describe('produceSingleMessage', () => {
    it('should produce a single message and disconnect', async () => {
      // Mock the required methods
      const mockProduceMessage = jest.spyOn(avroProducer, 'produceMessage');
      const mockDisconnect = jest.spyOn(avroProducer, 'disconnect').mockResolvedValue(undefined);
      const expectedResult = [{} as RecordMetadata];

      // Set the mock implementation for produceMessage
      mockProduceMessage.mockResolvedValueOnce(expectedResult);

      // Call the produceSingleMessage method
      const result = await avroProducer.produceSingleMessage('key', { payload: 'value' }, 'testTopic');

      // Assertions
      expect(mockProduceMessage).toHaveBeenCalledWith('key', { payload: 'value' }, 'testTopic', undefined);
      expect(mockDisconnect).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('produceSingleMessage', () => {
    it('should throw an exception because of unknown topic', async () => {
  
      // Call the produceSingleMessage method and expect it to throw asynchronously
      try {
        await avroProducer.produceSingleMessage('key', { payload: 'value' }, 'unknown-topic');
        fail('Expected an error to be thrown.');
      } catch (error) {
        expect(error).toEqual('No avro settings for topic: unknown-topic');
      }
    });
  });
  
  
});
  