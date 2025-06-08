import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFavoritesBetweenArticleAndUser1749386980412 implements MigrationInterface {
    name = 'AddFavoritesBetweenArticleAndUser1749386980412'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users_favorited_articles_articles" ("usersId" integer NOT NULL, "articlesId" integer NOT NULL, CONSTRAINT "PK_c0af5c5ee86eca7d506e997b232" PRIMARY KEY ("usersId", "articlesId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_00d9fb25d559db39cd06ac1434" ON "users_favorited_articles_articles" ("usersId") `);
        await queryRunner.query(`CREATE INDEX "IDX_bda16994c4d7ff0064ef530fed" ON "users_favorited_articles_articles" ("articlesId") `);
        await queryRunner.query(`ALTER TABLE "users_favorited_articles_articles" ADD CONSTRAINT "FK_00d9fb25d559db39cd06ac14343" FOREIGN KEY ("usersId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "users_favorited_articles_articles" ADD CONSTRAINT "FK_bda16994c4d7ff0064ef530fed7" FOREIGN KEY ("articlesId") REFERENCES "articles"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users_favorited_articles_articles" DROP CONSTRAINT "FK_bda16994c4d7ff0064ef530fed7"`);
        await queryRunner.query(`ALTER TABLE "users_favorited_articles_articles" DROP CONSTRAINT "FK_00d9fb25d559db39cd06ac14343"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bda16994c4d7ff0064ef530fed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_00d9fb25d559db39cd06ac1434"`);
        await queryRunner.query(`DROP TABLE "users_favorited_articles_articles"`);
    }

}
