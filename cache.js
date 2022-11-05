export default class ClientCache {
    cache = null // {value, expiry}
    resolver = null
    expiry = 10

    /**
     * @param expiry Expiry time in milliseconds
     * @param resolver A pomise accepting a key to resolve the request
     */
    constructor(expiry, resolver) {
        this.cache = {}
        this.expiry = expiry
        this.resolver = resolver
    }
    
    // Get the value from the cache or download with the resolver
    async get(key) {
        if (this.cache[key] && this.cache[key].expiry > Date.now()) {
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
    
    // Set the local key manually
    set(key, value, expiry = null) {
        this.cache[key] = value
    }

    /**
     * Delete a single key in the cache
     */
    unset(key) {
        delete this.cache[key]
    }

    /**
     * Clear the entire cache
     */
    clear() {
        this.cache = {}
    }
}