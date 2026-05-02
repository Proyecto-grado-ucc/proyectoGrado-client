import { MigrationInterface, QueryRunner } from 'typeorm';

export class KddAlertas1700000000003 implements MigrationInterface {
  name = 'KddAlertas1700000000003';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "resultado_kdd" (
        "id"                   SERIAL NOT NULL,
        "periodo_id"           INTEGER NOT NULL,
        "docente_id"           INTEGER NOT NULL,
        "puntuacion_global"    FLOAT NOT NULL,
        "total_evaluaciones"   INTEGER NOT NULL,
        "detalle_dimensiones"  JSONB NOT NULL,
        "creado_en"            TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_resultado_kdd" PRIMARY KEY ("id"),
        CONSTRAINT "FK_resultado_kdd_periodo" FOREIGN KEY ("periodo_id")
          REFERENCES "periodo_academico" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_resultado_kdd_docente" FOREIGN KEY ("docente_id")
          REFERENCES "docente" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_resultado_kdd_periodo" ON "resultado_kdd" ("periodo_id")`,
    );

    await queryRunner.query(`
      CREATE TYPE "public"."tipo_alerta_enum" AS ENUM (
        'BAJO_RENDIMIENTO', 'MEJORA_NOTABLE', 'SIN_EVALUACIONES'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."nivel_alerta_enum" AS ENUM (
        'INFO', 'ADVERTENCIA', 'CRITICO'
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "alerta" (
        "id"          SERIAL NOT NULL,
        "docente_id"  INTEGER NOT NULL,
        "periodo_id"  INTEGER NOT NULL,
        "tipo"        "public"."tipo_alerta_enum" NOT NULL,
        "nivel"       "public"."nivel_alerta_enum" NOT NULL,
        "mensaje"     TEXT NOT NULL,
        "leida"       BOOLEAN NOT NULL DEFAULT false,
        "creado_en"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_alerta" PRIMARY KEY ("id"),
        CONSTRAINT "FK_alerta_docente" FOREIGN KEY ("docente_id")
          REFERENCES "docente" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_alerta_periodo" FOREIGN KEY ("periodo_id")
          REFERENCES "periodo_academico" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_alerta_periodo_nivel" ON "alerta" ("periodo_id", "nivel")`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_alerta_periodo_nivel"`);
    await queryRunner.query(`DROP TABLE "alerta"`);
    await queryRunner.query(`DROP TYPE "public"."nivel_alerta_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_alerta_enum"`);
    await queryRunner.query(`DROP INDEX "IDX_resultado_kdd_periodo"`);
    await queryRunner.query(`DROP TABLE "resultado_kdd"`);
  }
}
