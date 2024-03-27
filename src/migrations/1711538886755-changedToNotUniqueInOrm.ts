import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangedToNotUniqueInOrm1711538886755 implements MigrationInterface {
    name = 'ChangedToNotUniqueInOrm1711538886755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "UQ_054d88d0aa301cbe7d3cca953b8"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5"`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" DROP CONSTRAINT "UQ_7a78d03cf87a8d5e6b8a8dcade4"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD CONSTRAINT "UQ_7a78d03cf87a8d5e6b8a8dcade4" UNIQUE ("clientId")`);
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" ADD CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5" UNIQUE ("tenantId")`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "UQ_054d88d0aa301cbe7d3cca953b8" UNIQUE ("domain")`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b" UNIQUE ("apiKey")`);
    }

}
