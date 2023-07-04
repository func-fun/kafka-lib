import { jest } from '@jest/globals';

import { SchemaRegistry } from "@kafkajs/confluent-schema-registry";
import { AvroDecoder } from "..";

describe("AvroDecoder", () => {
  let avroDecoder: AvroDecoder;
  let schemaRegistry: SchemaRegistry;

  beforeEach(() => {
    schemaRegistry = new SchemaRegistry({ host: 'localhost' });
    avroDecoder = new AvroDecoder(schemaRegistry);
  });

  describe("decodeMessage", () => {
    it("should decode key and payload when both are provided", async () => {
      // Mock the schemaRegistry.decode method
      const mockDecode = jest.spyOn(schemaRegistry, "decode");
      const encodedKey = "encodedKey";
      const encodedPayload = "encodedPayload";

      // Mock the decode calls
      const decodedKey = { key: "decodedKey" };
      const decodedPayload = { payload: "decodedPayload" };
      mockDecode
        .mockResolvedValueOnce(decodedKey)
        .mockResolvedValueOnce(decodedPayload);

      // Call the decodeMessage method
      const result = await avroDecoder.decodeMessage(encodedKey, encodedPayload);

      // Assertions
      expect(mockDecode).toHaveBeenCalledTimes(2);
      expect(mockDecode).toHaveBeenCalledWith(Buffer.from(encodedKey, "base64"));
      expect(mockDecode).toHaveBeenCalledWith(Buffer.from(encodedPayload, "base64"));
      expect(result).toEqual([decodedKey, decodedPayload]);
    });

    it("should decode key and return null payload when only key is provided", async () => {
      // Mock the schemaRegistry.decode method
      const mockDecode = jest.spyOn(schemaRegistry, "decode");
      const encodedKey = "encodedKey";
      const encodedPayload = null;

      // Mock the decode call for the key
      const decodedKey = { key: "decodedKey" };
      mockDecode.mockResolvedValueOnce(decodedKey);

      // Call the decodeMessage method
      const result = await avroDecoder.decodeMessage(encodedKey, encodedPayload);

      // Assertions
      expect(mockDecode).toHaveBeenCalledTimes(1);
      expect(mockDecode).toHaveBeenCalledWith(Buffer.from(encodedKey, "base64"));
      expect(result).toEqual([decodedKey, null]);
    });

    it("should decode key and return null payload when payload is undefined", async () => {
      // Mock the schemaRegistry.decode method
      const mockDecode = jest.spyOn(schemaRegistry, "decode");
      const encodedKey = "encodedKey";
      const encodedPayload = undefined;

      // Mock the decode call for the key
      const decodedKey = { key: "decodedKey" };
      mockDecode.mockResolvedValueOnce(decodedKey);

      // Call the decodeMessage method
      const result = await avroDecoder.decodeMessage(encodedKey, encodedPayload);

      // Assertions
      expect(mockDecode).toHaveBeenCalledTimes(1);
      expect(mockDecode).toHaveBeenCalledWith(Buffer.from(encodedKey, "base64"));
      expect(result).toEqual([decodedKey, null]);
    });
  });
});
