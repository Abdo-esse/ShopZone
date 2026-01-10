import { IsNumber, IsString, IsOptional, IsPositive, Min } from 'class-validator';

export class UpdateFullInventoryDto {
    @IsString()
    @IsOptional()
    location?: string;

    @IsNumber()
    @IsOptional()
    @Min(0)
    minStock?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    maxStock?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    quantity?: number;

    @IsNumber()
    @IsOptional()
    @Min(0)
    reserved?: number;
}
