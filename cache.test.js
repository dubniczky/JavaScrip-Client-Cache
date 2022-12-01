import Cache from './cache'


describe('Caching', () => {
    test('should resolve a missing cache', async () => {
        let cache = new Cache({
            resolver: async (key) => {
                return key.toUpperCase()
            }
        })

        expect(await cache.get('test')).toBe('TEST')
    })

    test('should return an existing cache', async () => {
        let cache = new Cache({
            resolver: async (key) => {
                return key.toUpperCase()
            }
        })
        
        cache.set('test', 'NOT TEST')
        console.log(cache.capacity, cache.ttl, cache.size())
        expect(await cache.get('test')).toBe('NOT TEST')
    })
})
