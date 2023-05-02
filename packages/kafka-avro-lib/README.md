# kafka-avro-lib
## Description
This is a helper lib that leverages [kafkajs](https://github.com/tulios/kafkajs) to give you  
some conveniance wrappers for producing and decoding Avro messages.

### AvroProducer
Example for avro producer
```
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Kafka, CompressionTypes } from 'kafkajs';
import { Agent } from 'https';

// Create Kafka instance
// Just an example, check KafkaJS for more options
const kafka = new Kafka({
    clientId: 'my-client',
    brokers: [ 'my broker' ],
    ssl: true,
    sasl: {
      mechanism: 'scram-sha-512',
      username: 'username',
      password: 'password',
    },
  });

// Create SR instance
const agent = new Agent();
const schemaRegistry = new SchemaRegistry(
    {
        host: 'registry url',
        auth: {
            username: 'foo',
            password: 'bar',
        },
        agent: agent
    }
);


// Create AvroProducer

// Define topic settings
const topicAvroSettings: TopicAvroSettings[] = [
    {
        topicName: 'com.func-fun.event.foo',
        keySubject: 'com.func-fun.event.foo-key',
        payloadSubject: 'com.func-fun.event.foo-value',
        keyVersion: 1,
        payloadVersion: 1,
        compression: CompressionTypes.GZIP
    }
];

const avroProducer = new AvroProducer(kafka, schemaRegistry, topicAvroSettings);

await avroProducer.produceSingleMessage(payload.id, payload, 'com.func-fun.event.foo', headers);

// or alternativly if you need to send more messages, it is better to use
await avroProducer.Message(payload.id, payload, 'com.func-fun.event.foo', headers);
... more produce
await avroProducer.disconnect();
```

## AvroDecoder
Example on how to:
```
import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';
import { Agent } from 'https';

// Create SR instance
const agent = new Agent();
const schemaRegistry = new SchemaRegistry(
    {
        host: 'registry url',
        auth: {
            username: 'foo',
            password: 'bar',
        },
        agent: agent
    }
);

// Loop over some kafka messages (e.g. in a lambda triggered by Kafka)
for (let idx in event.records) {    
    for (const [index, record] of event.records[idx].entries()) {
        try {
            let [key, payload] = await avroDecoder.decodeMessage(record.key, record.value);
            
            //do some stuff with payload
            
            console.log('Successfully persisted record:', key);
        } catch(exception) {
            console.error('Processing failed:', exception);
        }
    }
}

```