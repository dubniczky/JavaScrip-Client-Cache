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

        // Added duplicate (2 items)
        cache.set('test2', 'NOT TEST')
        expect(cache.size()).toBe(2)
    })

    test('should reset correctly', async () => {
        const cache = createDemoUppercaseCache()

        // Fill
        cache.set('test', 'NOT TEST')
        cache.set('test2', 'NOT TEST')
        cache.set('test3', 'NOT TEST')
        expect(cache.size()).toBe(3)

        // Reset
        cache.reset()
        expect(cache.size()).toBe(0)
    })

    test('should invalidate correctly', async () => {
        const cache = createDemoUppercaseCache()

        // Fill
        cache.set('test', 'NOT TEST')
        cache.set('test2', 'NOT TEST')
        cache.set('test3', 'NOT TEST')
        expect(cache.size()).toBe(3)

        // Reset
        cache.invalidate('test3')
        expect(cache.size()).toBe(2)
        cache.invalidate('test2')
        expect(cache.size()).toBe(1)
    })

    test('should reload correctly', async () => {
        const cache = createDemoUppercaseCache()

        // Fill
        cache.set('test1', '1')
        expect(await cache.get('test1')).toBe('1')

        // Reload
        await cache.reload('test1')
        expect(await cache.get('test1')).toBe('TEST1')
    })
})
