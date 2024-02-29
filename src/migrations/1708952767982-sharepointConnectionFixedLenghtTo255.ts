import { MigrationInterface, QueryRunner } from "typeorm";

export class SharepointConnectionFixedLenghtTo2551708952767982 implements MigrationInterface {
    name = 'SharepointConnectionFixedLenghtTo2551708952767982'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP COLUMN "tenantId"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD "tenantId" character varying(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5" UNIQUE ("tenantId")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP COLUMN "tenantId"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD "tenantId" character varying(20) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5" UNIQUE ("tenantId")`);
    }

}
