npm_username := dubniczky
keychain_id := npm-publisher

# Run automatic tests
test::
	node --experimental-vm-modules node_modules/jest/bin/jest.js

# Publish package to npm package registry
publish::
	npm set \
		"//registry.npmjs.org/:_authToken" \
		"$(shell security find-generic-password -w -s '$(keychain_id)' -a '$(npm_username)')" \
	&& npm publish
