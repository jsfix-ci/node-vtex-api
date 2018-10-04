import { slice } from 'ramda'
import { Stats } from './LRUCache'

const findIndex = async <T> (func: (item: T) => Promise<boolean>, array: T[]): Promise<number> => {
  for(let index=0; index < array.length; index++) {
    const hasKey = await func(array[index])
    if (hasKey) {
      return index
    }
  }
  return -1
}

export class MultilayeredCache <K, V> implements CacheLayer<K, V>{

  constructor(private caches: Array<CacheLayer<K, V>>) {
  }

  public get = async (key: K, fetcher?: () => V): Promise<V | void> => {
    let value: V | void
    let successIndex = await findIndex(async (cache: CacheLayer<K, V>) => {
      const [getValue, hasKey] = await Promise.all([cache.get(key), cache.has(key)])
      value = getValue
      return hasKey
    },this.caches)
    if (successIndex === -1) {
      if (fetcher) { 
        //
      }
      value = undefined //
      successIndex = Infinity
    }
    const failedCaches = slice(0, successIndex, this.caches)
    failedCaches.forEach(cache => cache.set(key, value as V))
    return value
  }

  public set = async (key: K, value: V) => {
    this.caches.forEach(async (cache: CacheLayer<K, V>) => {
      await cache.set(key, value)
    })
  }

  public has = async (key: K): Promise<boolean> => {
    let hasInAtLeastOneCache = false
    this.caches.forEach(async (cache: CacheLayer<K, V>) => {
      hasInAtLeastOneCache = hasInAtLeastOneCache || await cache.has(key)
    })
    return hasInAtLeastOneCache
  }
}


export interface CacheLayer<K, V> {
  get(key: K, fetcher?: () => V): Promise<V | void>,
  has(key: K): Promise<boolean>,
  set(key: K, value: V): void,
  getStats?(): Stats,
}
