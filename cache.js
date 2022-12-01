/**
 * Resolves a request from a remote resource to the cache
 * @name ResolverFunction
 * @function
 * @async
 * @param {string|number} key - The key to be resolved
 * @return {Object|null} - Object to be cached, null if not found
*/

/**
 * @typedef {Object} CacheOptions
 * @property {ResolverFunction} resolver - The function to resolve a request
 * @property {number} [ttl=0] - The time to live for a cached item in seconds
 * @property {number} [capacity=0] - The maximum number of items to cache
 */


export default class RemoteCache {
    cache = null // { key1: {value, expiry}, key2: {value, expiry}, ... }
    resolver = null
    ttl = 0
    capacity = 0

    /**
     * @param {CacheOptions} options - The initialisation options for the cache
     */
    constructor(options) {
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
     * @param {string|number} key - The object key to retreieve
     * @return {Object|null} - Retrieved data or null if not found
     */
    async get(key) {
        if (this.cache[key] && (this.cache[key].expiry == null || this.cache[key].expiry > Date.now())) {
            return this.cache[key].value
        }
        else {
            const value = await this.resolver(key)
            this.set(key, value)
            return value
        }
    }

    /**
     * Set the local key manually
     *
     * @param {string|number} key - The object key to store
     * @param {Object} value - The value to be stored
     * @param {number?} ttl - Override the default expiry time (default if 0, no expiry if null)
     * @return {boolean} - True if a key was overwritten, false if not
     */
    set(key, value, ttl = 0) {
        let overwritten = false
        if (this.cache[key]) {
            overwritten = true
        }

        let expiry = Date.now()
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
     * Download the key with the resolver and store it in the cache
     *
     * @param {string|number} key - The object key to retreieve
     * @return {Object|null} - Retrieved data or null if not found
     */
    async reload(key) {
        const value = await this.resolver(key)
        this.set(key, value)
    }

    /**
     * Download the keys with the resolver and store it in the cache
     *
     * @param {string[]|number[]|null} keys - List of keys to reload, null to reload all currently in cache
     * @return {number} - Number of keys reloaded
     */
    async reloadAll(keys = null) {
        if (keys == null) {
            keys = Object.keys(this.cache)
        }
        for (const key of keys) {
            await this.reload(key)
        }
        return keys.length
    }

    /**
     * Invlidate a key in the cache by removing it
     *
     * @param {string|number} key - The key to invalidate
     * @return {boolean} - True if a key was invalidated, false if it did not exist
     */
    invalidate(key) {
        if (!this.cache[key]) {
            return false
        }

        delete this.cache[key]
        return true
    }

    /**
     * Invalidate all keys in the cache
     *
     * @return {number} - Number of items invalidated
     */
    reset() {
        const count = Object.keys(this.cache).length
        this.cache = {}
        return count
    }

    /**
     * Get the number of cached items
     * Some cached items might have expired
     *
     * @return {number} - Number of cached items
     */
    size() {
        return Object.keys(this.cache).length
    }

    /**
     * Remove invalid and expired items from the cache
     *
     * @return {number} - Number of cached items
     */
    clean() {
        for (const key in this.cache) {
            if (this.cache[key].expiry && this.cache[key].expiry < Date.now()) {
                delete this.cache[key]
            }
        }
    }
}

export { RemoteCache }
