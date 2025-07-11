import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDb1746549266529 implements MigrationInterface {
  name = 'SeedDb1746549266529';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`INSERT INTO tags (name) VALUES ('dragons'), ('coffee'), ('nestjs')`);

    // password123
    await queryRunner.query(
      `INSERT INTO users (name, email, password) VALUES ('john_doe', 'john@example.com', '$2b$10$pV99sUyPM9XIyCmE/2DQwePIm.9qc770HwDg2AE4ss9AYYfw5HcLW')`
    );

    await queryRunner.query(
      `INSERT INTO articles (title, slug, description, body, "tagList", "authorId") VALUES ('Dragons are real', 'dragons-are-real', 'This is a description for dragons are real', 'Body of the article about dragons', 'dragons,coffee', 1)`
    );

    await queryRunner.query(
      `INSERT INTO articles (title, slug, description, body, "tagList", "authorId") VALUES ('Coffee is life', 'coffee-is-life', 'This is a description for coffee is life', 'Body of the article about coffee', 'coffee,nestjs', 1)`
    );
  }

  public async down(): Promise<void> {}
}
