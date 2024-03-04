import { MigrationInterface, QueryRunner } from "typeorm";

export class FixedLegitoConnEntity1709559835156 implements MigrationInterface {
    name = 'FixedLegitoConnEntity1709559835156'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" RENAME COLUMN "hashSecret" TO "clientSecret"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" RENAME COLUMN "clientSecret" TO "hashSecret"`);
    }

}
