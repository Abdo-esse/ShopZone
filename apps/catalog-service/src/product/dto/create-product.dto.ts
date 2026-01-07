import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsUUID } from 'class-validator';

export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    price: number;

    @IsString()
    @IsNotEmpty()
    sku: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsBoolean()
    @IsOptional()
    isActive?: boolean;
}
