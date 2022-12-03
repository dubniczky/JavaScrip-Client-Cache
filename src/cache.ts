type CacheValue = Object | null

interface CacheOptions {
    /** Function to resolve a request */
    resolver: ResolverFunction
    /** Time to live for a cached item in seconds */
    ttl?: number
    /** Maximum number of items to cache */
    capacity?: number
}

interface ResolverFunction {
    (key: string): Promise<CacheValue>
}

interface CacheItem {
    value: CacheValue
    expiry: number | null
}

type Cache = {
    [key: string]: CacheItem
}


export default class RemoteCache {
    cache : Cache
    resolver : ResolverFunction
    ttl : number
    capacity : number

    constructor(options : CacheOptions) {
        if (options == null) {
            throw new Error('Creating a cache requires a resolver')
        }

        this.cache = {}
        this.resolver = options.resolver

        // Default is no expiry
        this.ttl = options.ttl == null ? 0 : options.ttl

        // Default is no capacity cap
        this.capacity = options.capacity == null ? 0 : options.capacity
    }
    
    /**
     * Get the value from the cache or download with the resolver
     *
     * @param key The object key to retreieve from local or remote cache
     * @return Retrieved data or null if unable to resolve
     */
    async get(key : string) : Promise<CacheValue> {
        // Cache miss
        if (!this.cache[key]) {
            return await this.reload(key)
        }

        // Expired
        const expiry = this.cache[key].expiry
        if (expiry != null && expiry < Date.now()) {
            return await this.reload(key)
        }

        // Cache hit
        return this.cache[key].value
    }

    /**
     * Set the local key manually
     *
     * @param key The object key to store
     * @param value The value to be stored
     * @param ttl Override the default expiry time (default if 0, no expiry if null)
     * @return True if a key was overwritten, false if not
     */
    set(key : string, value : CacheValue, ttl : number|null = 0) : boolean {
        let overwritten : boolean = false
        if (this.cache[key]) {
            overwritten = true
        }

        let expiry : number|null = Date.now()
        switch (ttl) {
            // No expiry
            case null:
                expiry = null
                break
            // Default expiry
            case 0:
                expiry = this.ttl == 0 ? null : expiry + this.ttl
                break
            // Custom expiry
            default:
                expiry = expiry + ttl
        }
        
        this.cache[key] = {
            value: value,
            expiry: expiry
        }

        return overwritten
    }

    /**
     * Resolve the key with the resolver and store it in the cache
     *
     * @param key The object key to retreieve
     * @return Retrieved data or null if not found
     */
    async reload(key : string) : Promise<CacheValue> {
        try {
            const value = await this.resolver(key)
            this.set(key, value)
        } catch (e) {
            //console.log(`Unable to resolve key (${key}):`, e)
            delete this.cache[key]
            return null
        }
        return this.cache[key].value
    }

    /**
     * Resolve the keys with the resolver and store them in the cache
     *
     * @param keys List of keys to reload, null to reload all currently in cache
     * @return Number of keys reloaded
     */
    async reloadAll(keys : string[]|null = null) : Promise<number> {
        if (keys == null) {
            keys = Object.keys(this.cache)
        }
        for (const key of keys) {
            await this.reload(key)
        }
        return keys.length
    }

    /**
     * Invalidate a key in the cache by removing it
     *
     * @param key The key to invalidate
     * @return True if a key was invalidated, false if it did not exist
     */
    invalidate(key : string) : boolean {
        if (!this.cache[key]) {
            return false
        }

        delete this.cache[key]
        return true
    }

    /**
     * Invalidate all keys in the cache
     *
     * @return Number of items invalidated
     */
    reset() : number {
        const count = Object.keys(this.cache).length
        this.cache = {}
        return count
    }

    /**
     * Get the number of cached items
     * Some cached items might have expired
     *
     * @return Number of cached items
     */
    size() : number {
        return Object.keys(this.cache).length
    }

    /**
     * Remove invalid and expired items from the cache
     *
     * @return Number of cached items
     */
    clean() : number {
        let count : number = 0
        for (const key in this.cache) {
            const expiry = this.cache[key].expiry
            if (expiry && expiry < Date.now()) {
                delete this.cache[key]
                count++
            }
        }
        return count
    }
}

export {
    RemoteCache,
    CacheItem,
    CacheValue,
    CacheOptions,
    ResolverFunction
}
