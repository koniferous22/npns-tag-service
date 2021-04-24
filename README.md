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
* Make content type abstraction as soon as it makes sense
* Content owner decorator
* Find better workaround for reference resolving
* Design better challenge lifecycle, shouldn't be determined by single boolean `isActive`
* Document Mwp transactions with directives
  * Not possible atm, bc apollo/federation, doesn't have config parameter for custom directives :(
