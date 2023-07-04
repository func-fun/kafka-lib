import { SchemaRegistry } from '@kafkajs/confluent-schema-registry';

export class AvroDecoder {
  private schemaRegistry: SchemaRegistry;

  constructor(schemaRegistry: SchemaRegistry) {
    this.schemaRegistry = schemaRegistry;
  }

  // typing disabled, because it makes sense to comply with the return type of the 3rd party lib
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public async decodeMessage(encodedKey: string, encodedPayload: string): Promise<any[]> {
    if (null === encodedPayload || undefined === encodedPayload) {
      return Promise.all([this.schemaRegistry.decode(Buffer.from(encodedKey, 'base64')), null]);
    }

    return Promise.all([
      this.schemaRegistry.decode(Buffer.from(encodedKey, 'base64')),
      this.schemaRegistry.decode(Buffer.from(encodedPayload, 'base64')),
    ]);
  }
}
