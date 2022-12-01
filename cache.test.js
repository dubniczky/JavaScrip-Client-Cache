import Cache from './cache'

// Create a new cache with local resolving
function createDemoUppercaseCache() {
    return new Cache({
        resolver: async (key) => {
            return key.toUpperCase()
        }
    })
}

describe('Correct caching', () => {
    test('should resolve a missing cache', async () => {
        const cache = createDemoUppercaseCache()

        expect(await cache.get('test')).toBe('TEST')
    })

    test('should return an existing cache', async () => {
        const cache = createDemoUppercaseCache()
        
        cache.set('test', 'NOT TEST')
        console.log(cache.capacity, cache.ttl, cache.size())
        expect(await cache.get('test')).toBe('NOT TEST')
    })
})
