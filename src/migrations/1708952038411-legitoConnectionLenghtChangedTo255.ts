import { MigrationInterface, QueryRunner } from "typeorm";

export class LegitoConnectionLenghtChangedTo2551708952038411 implements MigrationInterface {
    name = 'LegitoConnectionLenghtChangedTo2551708952038411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP COLUMN "apiKey"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD "apiKey" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b" UNIQUE ("apiKey")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP COLUMN "apiKey"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD "apiKey" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b" UNIQUE ("apiKey")`);
    }

}
