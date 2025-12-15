import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIdempotencyKeyToTransactions1765822495866 implements MigrationInterface {
    name = 'AddIdempotencyKeyToTransactions1765822495866'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transactions" ADD "idempotency_key" character varying`);
        await queryRunner.query(`CREATE UNIQUE INDEX "UQ_transaction_wallet_idempotency" ON "transactions" ("wallet_id", "idempotency_key") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."UQ_transaction_wallet_idempotency"`);
        await queryRunner.query(`ALTER TABLE "transactions" DROP COLUMN "idempotency_key"`);
    }

}
