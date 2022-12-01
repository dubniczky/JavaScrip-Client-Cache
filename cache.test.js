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
        expect(await cache.get('test')).toBe('NOT TEST')
    })

    test('should return correct sizes', async () => {
        const cache = createDemoUppercaseCache()
        expect(cache.size()).toBe(0)

        // 1 item
        cache.set('test', 'NOT TEST')
        expect(cache.size()).toBe(1)

        // 2 items
        cache.set('test2', 'NOT TEST')
        expect(cache.size()).toBe(2)

        // added duplicate (2 items)
        cache.set('test2', 'NOT TEST')
        expect(cache.size()).toBe(2)
    })
})
