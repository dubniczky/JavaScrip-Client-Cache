# Remote Cache

A front-end module for automating the caching of server-side requests

## Usage

The `resolver` property must be specified with an asynchronous function that accepts a single key value and eventually returns a value from an (optionally) remote provider. It could be used for long calculations as well.

The data between acquiring the request for the key and the eventual return of the value can be modified freely and any type of data may be returned.

```js
import RemoteCache from 'remote-cache'

const cache = new RemoteCache({
    resolver: async (key) => {
        return await (await fetch(`example.com/api/items/${key}`)).text()
    },
    expiry: null,
    capacity: null,
})

// ...

let item = await cache.get('keyname')
cache.set('keyname', 8)

```
