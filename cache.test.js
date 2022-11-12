import Cache from './cache'


describe('Caching', () => {
    test('should cache the result of a function', async () => {
        let cache = new Cache({
            resolver: async (key) => {
                return key.toUpperCase()
            }
        })

        expect(await cache.get('test')).toBe('TEST')
    })
})
