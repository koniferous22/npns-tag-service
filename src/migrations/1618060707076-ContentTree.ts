import { MigrationInterface, QueryRunner } from 'typeorm';

export class ContentTree1618060707076 implements MigrationInterface {
  name = 'ContentTree1618060707076';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "challenge_edit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "challengeId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_c819ab3ffce14f6d4b8c5bcfcdb" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_6d9782638ee5a86a042e06c464" ON "challenge_edit" ("challengeId") `
    );
    await queryRunner.query(
      `CREATE TABLE "submission_edit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "submissionId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_c52e4fa96f700038007beb61968" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_73dd4959464326f1e6c26d0dad" ON "submission_edit" ("submissionId") `
    );
    await queryRunner.query(
      `CREATE TABLE "reply_edit" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "replyId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_973da367e11ed6f5dba8d01a5f6" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_2c81072d435019bc790a9baec1" ON "reply_edit" ("replyId") `
    );
    await queryRunner.query(
      `CREATE TABLE "reply" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "submissionId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_94fa9017051b40a71e000a2aff9" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c049d3e73f07c135c8af579199" ON "reply" ("submissionId") `
    );
    await queryRunner.query(
      `CREATE TABLE "submission" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "challengeId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_7faa571d0e4a7076e85890c9bd0" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_d3af0954e5f8c6c9ee89e9dd98" ON "submission" ("challengeId") `
    );
    await queryRunner.query(
      `CREATE TABLE "wallet" ("id" character varying NOT NULL, "score" integer NOT NULL, "tagId" uuid, CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE TABLE "challenge" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL, "isActive" boolean NOT NULL, "views" integer NOT NULL, "boost" double precision NOT NULL, "title" character varying NOT NULL, "tagId" uuid, "posterUser" character varying NOT NULL, CONSTRAINT "PK_5f31455ad09ea6a836a06871b7a" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_fefa10acf1ea48ce3bb18512b8" ON "challenge" ("tagId") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_ad81c50cce5278fc9c2733e7bb" ON "challenge" ("views") `
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_c8b7af046ae523a3035e214278" ON "challenge" ("boost") `
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_edit" ADD CONSTRAINT "FK_6d9782638ee5a86a042e06c464f" FOREIGN KEY ("challengeId") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "submission_edit" ADD CONSTRAINT "FK_73dd4959464326f1e6c26d0dada" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reply_edit" ADD CONSTRAINT "FK_2c81072d435019bc790a9baec14" FOREIGN KEY ("replyId") REFERENCES "reply"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "reply" ADD CONSTRAINT "FK_c049d3e73f07c135c8af5791999" FOREIGN KEY ("submissionId") REFERENCES "submission"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD CONSTRAINT "FK_d3af0954e5f8c6c9ee89e9dd989" FOREIGN KEY ("challengeId") REFERENCES "challenge"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_69adf80bed5897c9ab3c681a82d" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb" FOREIGN KEY ("parentId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_fefa10acf1ea48ce3bb18512b83" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_fefa10acf1ea48ce3bb18512b83"`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_69adf80bed5897c9ab3c681a82d"`
    );
    await queryRunner.query(
      `ALTER TABLE "submission" DROP CONSTRAINT "FK_d3af0954e5f8c6c9ee89e9dd989"`
    );
    await queryRunner.query(
      `ALTER TABLE "reply" DROP CONSTRAINT "FK_c049d3e73f07c135c8af5791999"`
    );
    await queryRunner.query(
      `ALTER TABLE "reply_edit" DROP CONSTRAINT "FK_2c81072d435019bc790a9baec14"`
    );
    await queryRunner.query(
      `ALTER TABLE "submission_edit" DROP CONSTRAINT "FK_73dd4959464326f1e6c26d0dada"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_edit" DROP CONSTRAINT "FK_6d9782638ee5a86a042e06c464f"`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb" FOREIGN KEY ("parentId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`DROP INDEX "IDX_c8b7af046ae523a3035e214278"`);
    await queryRunner.query(`DROP INDEX "IDX_ad81c50cce5278fc9c2733e7bb"`);
    await queryRunner.query(`DROP INDEX "IDX_fefa10acf1ea48ce3bb18512b8"`);
    await queryRunner.query(`DROP TABLE "challenge"`);
    await queryRunner.query(`DROP TABLE "wallet"`);
    await queryRunner.query(`DROP INDEX "IDX_d3af0954e5f8c6c9ee89e9dd98"`);
    await queryRunner.query(`DROP TABLE "submission"`);
    await queryRunner.query(`DROP INDEX "IDX_c049d3e73f07c135c8af579199"`);
    await queryRunner.query(`DROP TABLE "reply"`);
    await queryRunner.query(`DROP INDEX "IDX_2c81072d435019bc790a9baec1"`);
    await queryRunner.query(`DROP TABLE "reply_edit"`);
    await queryRunner.query(`DROP INDEX "IDX_73dd4959464326f1e6c26d0dad"`);
    await queryRunner.query(`DROP TABLE "submission_edit"`);
    await queryRunner.query(`DROP INDEX "IDX_6d9782638ee5a86a042e06c464"`);
    await queryRunner.query(`DROP TABLE "challenge_edit"`);
  }
}
