import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateColumnForPosts1618132434932 implements MigrationInterface {
  name = 'UpdateColumnForPosts1618132434932';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "challenge_edit" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "submission_edit" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reply_edit" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "reply" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "submission" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD "updatedAt" TIMESTAMP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" DROP CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" DROP CONSTRAINT "FK_fefa10acf1ea48ce3bb18512b83"`
    );
    await queryRunner.query(
      `ALTER TABLE "wallet" DROP CONSTRAINT "FK_69adf80bed5897c9ab3c681a82d"`
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
      `ALTER TABLE "wallet" ADD CONSTRAINT "FK_69adf80bed5897c9ab3c681a82d" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge" ADD CONSTRAINT "FK_fefa10acf1ea48ce3bb18512b83" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "tag" ADD CONSTRAINT "FK_5f4effb7cd258ffa9ef554cfbbb" FOREIGN KEY ("parentId") REFERENCES "tag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(`ALTER TABLE "challenge" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "submission" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "reply" DROP COLUMN "updatedAt"`);
    await queryRunner.query(`ALTER TABLE "reply_edit" DROP COLUMN "updatedAt"`);
    await queryRunner.query(
      `ALTER TABLE "submission_edit" DROP COLUMN "updatedAt"`
    );
    await queryRunner.query(
      `ALTER TABLE "challenge_edit" DROP COLUMN "updatedAt"`
    );
  }
}
