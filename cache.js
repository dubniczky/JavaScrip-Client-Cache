/**
 * Resolves a request from a remote resource to the cache
 * @name ResolverFunction
 * @function
 * @async
 * @param {string|number} key - The key to be resolved
 * @return {Object|null} - Object to be cached, null if not found
*/


export default class RemoteCache {
    cache = null // { key1: {value, expiry}, key2: {value, expiry}, ... }
    resolver = null
    expiry = null
    capacity = null

    /**
     * @param {Object} options - The options object, see details for each option
     * @param {ResolverFunction} options.resolver - A pomise accepting a key to resolve the request
     * @param {number?} options.expiry - Default expiry time in for objects in milliseconds
     * @param {capacity?} options.capacity - Maximum number of objects to store in the cache
     */
    constructor(options) {
        if (options == null) {
            throw new Error('Creating a cache requires a resolver')
        }

        this.cache = {}
        this.resolver = options.resolver

        // Default is no expiry
        this.expiry = options.expiry == null || options.expiry == 0 ? null : options.expiry

        // Default is no capacity cap
        this.capacity = options.capacity == null || options.capacity == 0 ? null : options.capacity
    }
    
    /**
     * Get the value from the cache or download with the resolver
     *
     * @param {string|number} key - The object key to retreieve
     * @return {Object|null} - Retrieved data or null if not found
     */
    async get(key) {
        if (this.cache[key] && !!this.cache[key].expiry && this.cache[key].expiry > Date.now()) {
            return this.cache[key].value
        }
        else {
            const value = await this.resolver(key)
            this.set(key, value)
            return value
        }
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
                expiry = this.expiry == null ? null : expiry + this.expiry
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