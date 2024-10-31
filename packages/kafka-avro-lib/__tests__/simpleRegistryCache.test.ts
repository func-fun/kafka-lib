import { SimpleRegistryCache } from '..';

describe('SimpleRegistryCache', () => {
  let cache: SimpleRegistryCache;

  beforeEach(() => {
    cache = new SimpleRegistryCache();
  });

  describe('set', () => {
    it('should store a value when version is a number', () => {
      cache.set('com.example.test', 1, 100);
      expect(cache['registryIdCache'].get('com.example.test_1')).toBe(100);
    });

    it('should not store a value when version is a string', () => {
      cache.set('com.example.test', 'latest', 100);
      expect(cache['registryIdCache'].has('com.example.test_latest')).toBe(false);
    });
  });

  describe('get', () => {
    it('should retrieve a stored value when version is a number', () => {
      cache.set('com.example.test', 1, 100);
      expect(cache.get('com.example.test', 1)).toBe(100);
    });

    it('should return null when version is a string', () => {
      cache.set('com.example.test', 1, 100);
      expect(cache.get('com.example.test', 'latest')).toBeNull();
    });

    it('should return null if the value is not in the cache', () => {
      expect(cache.get('com.example.test', 2)).toBeNull();
    });
  });

  describe('has', () => {
    it('should return true if a value is cached with a numeric version', () => {
      cache.set('com.example.test', 1, 100);
      expect(cache.has('com.example.test', 1)).toBe(true);
    });

    it('should return false if a value is not cached', () => {
      expect(cache.has('com.example.test', 2)).toBe(false);
    });

    it('should return false if the version is a string', () => {
      cache.set('com.example.test', 1, 100);
      expect(cache.has('com.example.test', 'latest')).toBe(false);
    });
  });
});
