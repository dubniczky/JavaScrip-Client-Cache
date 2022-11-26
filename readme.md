# Remote Cache

A front-end module for automating the caching of server-side requests

## Usage

The `resolver` property must be specified with an asynchronous function that accepts a single key value and eventually returns a value from an (optionally) remote provider.

It could be used for long calculations as well.

```js
import RemoteCache from './cache'

let cache = new RemoteCache({
    resolver: async (key) => {
        return await (await fetch(`example.com/api/items/${key}`)).text()
    },
    expiry: null,
    capacity: null,
})
```
