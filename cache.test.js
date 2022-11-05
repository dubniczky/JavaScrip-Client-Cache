import Cache from './cache'


describe('Caching', () => {
    it('should cache the result of a function', async () => {
        let cache = new Cache(1000, (key) => {
            return key.toUpperCase()
        })

        expect(await cache.get('test')).toBe('TEST')
    })
})
