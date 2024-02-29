import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedLegitoAndSharepointConnection1708951790599 implements MigrationInterface {
    name = 'CreatedLegitoAndSharepointConnection1708951790599'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "legito_connection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apiKey" character varying(20) NOT NULL, "domain" character varying(255) NOT NULL, "hashSecret" character varying NOT NULL, "salt" character varying NOT NULL, "sharepointConnectionId" uuid, CONSTRAINT "UQ_e883d9d56a80ce36323a712df2b" UNIQUE ("apiKey"), CONSTRAINT "UQ_054d88d0aa301cbe7d3cca953b8" UNIQUE ("domain"), CONSTRAINT "REL_27284ed7c756b026b7057829ed" UNIQUE ("sharepointConnectionId"), CONSTRAINT "PK_5acf6754e9ffb67e5866077b005" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "sharepoint_connection" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "tenantId" character varying(20) NOT NULL, "clientId" character varying(255) NOT NULL, "hashSecret" character varying NOT NULL, "salt" character varying NOT NULL, CONSTRAINT "UQ_23b9287da0a4c6e6551a10ce0e5" UNIQUE ("tenantId"), CONSTRAINT "UQ_7a78d03cf87a8d5e6b8a8dcade4" UNIQUE ("clientId"), CONSTRAINT "PK_4dfa7eb0669afc18d40a14b1d41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "legito_connection" ADD CONSTRAINT "FK_27284ed7c756b026b7057829ed7" FOREIGN KEY ("sharepointConnectionId") REFERENCES "sharepoint_connection"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "legito_connection" DROP CONSTRAINT "FK_27284ed7c756b026b7057829ed7"`);
        await queryRunner.query(`DROP TABLE "sharepoint_connection"`);
        await queryRunner.query(`DROP TABLE "legito_connection"`);
    }

}
