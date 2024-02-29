import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1709213868596 implements MigrationInterface {
    name = 'Sh1709213868596'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" RENAME COLUMN "hashSecret" TO "clientSecret"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "sharepoint_connection" RENAME COLUMN "clientSecret" TO "hashSecret"`);
    }

}
