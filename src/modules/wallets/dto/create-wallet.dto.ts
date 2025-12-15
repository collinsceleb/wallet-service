import { IsString, IsNumber, IsOptional, Min } from 'class-validator';

export class CreateWalletDto {
    @IsString()
    @IsOptional()
    currency?: string;

    @IsNumber()
    @Min(0)
    @IsOptional()
    balance?: number;
}
