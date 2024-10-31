import { RegistryCacheInterface } from './types';

export class SimpleRegistryCache implements RegistryCacheInterface {
  private registryIdCache = new Map<string, number>();

  private generateCacheKey(subject: string, version: number | string): string {
    return `${subject}_${version}`;
  }

  public set(subject: string, version: number | string, value: number): void {
    // Don't cache latest, etc.
    if (typeof version === 'string') {
      return;
    }

    const cacheKey = this.generateCacheKey(subject, version);
    this.registryIdCache.set(cacheKey, value);
  }

  public get(subject: string, version: number | string): number | null {
    // Don't cache latest, etc.
    if (typeof version === 'string') {
      return null;
    }

    const cacheKey = this.generateCacheKey(subject, version);
    return this.registryIdCache.get(cacheKey) ?? null;
  }

  public has(subject: string, version: number | string): boolean {
    // Don't cache latest, etc.
    if (typeof version === 'string') {
      return false;
    }

    const cacheKey = this.generateCacheKey(subject, version);
    return this.registryIdCache.has(cacheKey);
  }
}
