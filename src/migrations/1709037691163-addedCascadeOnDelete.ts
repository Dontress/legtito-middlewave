import { MigrationInterface, QueryRunner } from "typeorm";

export class AddedCascadeOnDelete1709037691163 implements MigrationInterface {
    name = 'AddedCascadeOnDelete1709037691163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "FK_27284ed7c756b026b7057829ed7"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "FK_27284ed7c756b026b7057829ed7" FOREIGN KEY ("sharepointConnectionId") REFERENCES "sharepoint_connection"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "FK_27284ed7c756b026b7057829ed7"`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "FK_27284ed7c756b026b7057829ed7" FOREIGN KEY ("sharepointConnectionId") REFERENCES "sharepoint_connection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
