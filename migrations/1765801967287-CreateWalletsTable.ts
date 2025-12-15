import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateWalletsTable1765801967287 implements MigrationInterface {
    name = 'CreateWalletsTable1765801967287'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "wallets" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "currency" character varying NOT NULL DEFAULT 'USD', "balance" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_wallet_id" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "wallets"`);
    }

}
