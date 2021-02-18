import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialTagMigration1613427603971 implements MigrationInterface {
  name = 'InitialTagMigration1613427603971';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "tag" ("id" uuid NOT NULL, "name" character varying NOT NULL, "nsleft" integer NOT NULL DEFAULT '1', "nsright" integer NOT NULL DEFAULT '2', "parentId" uuid, CONSTRAINT "UQ_6a9775008add570dc3e5a0bab7b" UNIQUE ("name"), CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb" FOREIGN KEY ("parentId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `INSERT INTO "tag"("id","name","parentId") VALUES ('f387a698-9769-45e2-84e2-7296ae60548b','Index',NULL)`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "tag" WHERE "id" = 'f387a698-9769-45e2-84e2-7296ae60548b'`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb"`
    );
    await queryRunner.query(`DROP TABLE "tag"`);
  }
}
