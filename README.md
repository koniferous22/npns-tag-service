# npns-challegne-service
Challenge service for npns

## Generating migrations
* `npm run orm -- migration:generate -n <<MIGRATION_NAME>>`
  * `<<MIGRATION_NAME>>: string`
* Executing in docker compose:
* `docker-compose exec -- challenge_service npm run orm -- migration:generate -n <<MIGRATION_NAME>>`

## TODO
* Authorization (authChecker) for tag management
* Relay Model with Node interface
* Optimize dockerfile build context
* Migrate to prisma when it makes sense
