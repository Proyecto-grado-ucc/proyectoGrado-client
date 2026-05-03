import { MigrationInterface, QueryRunner } from 'typeorm';

export class RecuperacionContrasena1746239000000 implements MigrationInterface {
  name = 'RecuperacionContrasena1746239000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuario"
        ADD COLUMN IF NOT EXISTS "reset_token"       VARCHAR(255) NULL,
        ADD COLUMN IF NOT EXISTS "reset_token_expiry" TIMESTAMPTZ NULL
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "usuario"
        DROP COLUMN IF EXISTS "reset_token",
        DROP COLUMN IF EXISTS "reset_token_expiry"
    `);
  }
}
