export default class RemoteCache {
    cache = null // {value, expiry}
    resolver = null
    capacity = null

    /**
     * @param expiry Expiry time in milliseconds
     * @param resolver A pomise accepting a key to resolve the request
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
    
    // Get the value from the cache or download with the resolver
    async get(key) {
        if (this.cache[key] && !!this.cache[key].expiry && this.cache[key].expiry > Date.now()) {
            return this.cache[key].value
        }
        else {
            const value = await this.resolver(key)
            this.cache[key] = {
                value: value,
                expiry: Date.now() + this.expiry
            }
            return value
        }
    }

    /**
     * Force this key to be reloaded from the resolver
     */
    async cache(key) {
        const value = await this.resolver(key)
        this.cache[key] = {
            value: value,
            expiry: Date.now() + this.expiry
        }
    }
    
    /**
     * Set the local key manually
     */
    set(key, value, expiry = null) {
        this.cache[key] = value
    }

    /**
     * Delete a single key in the cache
     */a
    invalidate(key) {
        delete this.cache[key]
    }

    /**
     * Remove all the keys in the cache
     */
    reset() {
        this.cache = {}
    }
}