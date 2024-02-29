import { MigrationInterface, QueryRunner } from "typeorm";

export class RemovedSalt1708952130059 implements MigrationInterface {
    name = 'RemovedSalt1708952130059'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP COLUMN "salt"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP COLUMN "salt"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD "salt" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD "salt" character varying NOT NULL`);
    }

}
