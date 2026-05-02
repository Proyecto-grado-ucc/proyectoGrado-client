import { MigrationInterface, QueryRunner } from 'typeorm';

export class MotorEvaluacion1700000000002 implements MigrationInterface {
  name = 'MotorEvaluacion1700000000002';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "horario" (
        "id"          SERIAL NOT NULL,
        "periodo_id"  INTEGER NOT NULL,
        "asignaciones" JSONB NOT NULL,
        "fitness"     FLOAT NOT NULL,
        "generaciones" INTEGER NOT NULL,
        "tiempo_ms"   INTEGER NOT NULL,
        "metadatos"   JSONB,
        "creado_en"   TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_horario" PRIMARY KEY ("id"),
        CONSTRAINT "FK_horario_periodo" FOREIGN KEY ("periodo_id")
          REFERENCES "periodo_academico" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."tipo_pregunta_enum" AS ENUM ('ABIERTA', 'ESCALA', 'OPCION_MULTIPLE')
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."estado_evaluacion_enum" AS ENUM ('PENDIENTE', 'EN_PROGRESO', 'COMPLETADA')
    `);

    await queryRunner.query(`
      CREATE TABLE "formulario" (
        "id"          SERIAL NOT NULL,
        "titulo"      VARCHAR(200) NOT NULL,
        "descripcion" TEXT,
        "periodo_id"  INTEGER NOT NULL,
        "activo"      BOOLEAN NOT NULL DEFAULT true,
        CONSTRAINT "PK_formulario" PRIMARY KEY ("id"),
        CONSTRAINT "FK_formulario_periodo" FOREIGN KEY ("periodo_id")
          REFERENCES "periodo_academico" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "dimension" (
        "id"           SERIAL NOT NULL,
        "nombre"       VARCHAR(200) NOT NULL,
        "descripcion"  TEXT,
        "peso"         FLOAT NOT NULL DEFAULT 1.0,
        "formulario_id" INTEGER NOT NULL,
        CONSTRAINT "PK_dimension" PRIMARY KEY ("id"),
        CONSTRAINT "FK_dimension_formulario" FOREIGN KEY ("formulario_id")
          REFERENCES "formulario" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "pregunta" (
        "id"           SERIAL NOT NULL,
        "texto"        TEXT NOT NULL,
        "tipo"         "public"."tipo_pregunta_enum" NOT NULL DEFAULT 'ESCALA',
        "orden_idx"    INTEGER NOT NULL DEFAULT 0,
        "dimension_id" INTEGER NOT NULL,
        CONSTRAINT "PK_pregunta" PRIMARY KEY ("id"),
        CONSTRAINT "FK_pregunta_dimension" FOREIGN KEY ("dimension_id")
          REFERENCES "dimension" ("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "evaluacion" (
        "id"                  SERIAL NOT NULL,
        "formulario_id"       INTEGER NOT NULL,
        "docente_evaluado_id" INTEGER NOT NULL,
        "evaluador_id"        INTEGER,
        "estado"              "public"."estado_evaluacion_enum" NOT NULL DEFAULT 'PENDIENTE',
        "creado_en"           TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_evaluacion" PRIMARY KEY ("id"),
        CONSTRAINT "FK_evaluacion_formulario" FOREIGN KEY ("formulario_id")
          REFERENCES "formulario" ("id") ON DELETE RESTRICT,
        CONSTRAINT "FK_evaluacion_docente" FOREIGN KEY ("docente_evaluado_id")
          REFERENCES "docente" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "respuesta" (
        "id"              SERIAL NOT NULL,
        "evaluacion_id"   INTEGER NOT NULL,
        "pregunta_id"     INTEGER NOT NULL,
        "valor_numerico"  FLOAT,
        "valor_texto"     TEXT,
        CONSTRAINT "PK_respuesta" PRIMARY KEY ("id"),
        CONSTRAINT "FK_respuesta_evaluacion" FOREIGN KEY ("evaluacion_id")
          REFERENCES "evaluacion" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_respuesta_pregunta" FOREIGN KEY ("pregunta_id")
          REFERENCES "pregunta" ("id") ON DELETE RESTRICT
      )
    `);

    await queryRunner.query(`CREATE INDEX "IDX_evaluacion_docente" ON "evaluacion" ("docente_evaluado_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_respuesta_evaluacion" ON "respuesta" ("evaluacion_id")`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_respuesta_evaluacion"`);
    await queryRunner.query(`DROP INDEX "IDX_evaluacion_docente"`);
    await queryRunner.query(`DROP TABLE "respuesta"`);
    await queryRunner.query(`DROP TABLE "evaluacion"`);
    await queryRunner.query(`DROP TABLE "pregunta"`);
    await queryRunner.query(`DROP TABLE "dimension"`);
    await queryRunner.query(`DROP TABLE "formulario"`);
    await queryRunner.query(`DROP TYPE "public"."estado_evaluacion_enum"`);
    await queryRunner.query(`DROP TYPE "public"."tipo_pregunta_enum"`);
    await queryRunner.query(`DROP TABLE "horario"`);
  }
}
