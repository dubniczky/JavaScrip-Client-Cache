import RemoteCache from './cache'

// Create a new cache with local resolving
function createDemoUppercaseCache() {
    return new RemoteCache({
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

    test('should reloadAll from cache correctly', async () => {
        const cache = createDemoUppercaseCache()

        // Fill
        cache.set('test1', '1')
        cache.set('test2', '2')
        expect(await cache.get('test1')).toBe('1')
        expect(await cache.get('test2')).toBe('2')

        // Reload
        const count = await cache.reloadAll()
        expect(await cache.get('test1')).toBe('TEST1')
        expect(await cache.get('test2')).toBe('TEST2')
        expect(count).toBe(2)
    })

    test('should reloadAll from list correctly', async () => {
        const cache = createDemoUppercaseCache()

        // Fill
        cache.set('test1', '1')
        cache.set('test2', '2')
        cache.set('test3', '3')
        expect(await cache.get('test1')).toBe('1')
        expect(await cache.get('test2')).toBe('2')
        expect(await cache.get('test3')).toBe('3')

        // Reload
        const count = await cache.reloadAll(['test1', 'test2'])
        expect(await cache.get('test1')).toBe('TEST1')
        expect(await cache.get('test2')).toBe('TEST2')
        expect(await cache.get('test3')).toBe('3')
        expect(count).toBe(2)
    })

    test('should handle error', async () => {
        const cache = new RemoteCache({
            resolver: async (key) => {
                if (key % 2 == 0) {
                    throw new Error('Test error')
                }
            }
        })

        cache.get(0).catch((err) => {
            expect(err.message).toBe('Test error')
        })
    })
})
