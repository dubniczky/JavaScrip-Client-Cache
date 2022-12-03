npm_username := dubniczky
keychain_id := npm-publisher

# Install required packages
install::
	pnpm install

# Compile typescript to commonjs
build::
	npx tsc

# Format typescipt code using prettier
format::
	npx prettier --write \"src/**/*.ts\" \"src/**/*.js\"

# Run eslint on all typescript files
lint::
	npx eslint src/**/*.ts

# Run jest tests
test::
	@npx jest --config .jestrc.json

# Publish package to npm package registry
publish::
	@npm set \
		"//registry.npmjs.org/:_authToken" \
		"$(shell security find-generic-password -w -s '$(keychain_id)' -a '$(npm_username)')" \
	&& npm publish

# Save updated package version as a git tag
tag::
	git tag "v$(shell cat package.json | jq ".version" -crM)"
	git push --tags
