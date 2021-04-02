# npns-tag-service
Tag service for npns

## Generating migrations
* `npm run orm -- migration:generate -n <<MIGRATION_NAME>>`
  * `<<MIGRATION_NAME>>: string`
* Executing in docker compose:
* `docker-compose exec -- gateway npm run orm -- migration:generate -n <<MIGRATION_NAME>>`

## TODO
* Think of better name, bc I don't like this that much
  * metadata service (for example)
* Authorization (authChecker) for tag management
* Relay Model with Node interface
* Optimize dockerfile build context

