# npns-tag-service
Tag service for npns

## Generating migrations
* `npm run orm -- migration:generate -n <<MIGRATION_NAME>>`
  * `<<MIGRATION_NAME>>: string`
* Executing in docker compose:
* `docker-compose exec -- gateway npm run orm -- migration:generate -n <<MIGRATION_NAME>>`

## TODO
* Model hierarchical data with postgres ltree instead
* Fix typeorm parent response bug
* Relay Model with Node interface
