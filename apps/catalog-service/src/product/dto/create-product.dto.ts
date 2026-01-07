import { IsString, IsNotEmpty, IsOptional, IsNumber, IsUUID, IsEnum } from 'class-validator';

export enum ProductStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED',
    ARCHIVED = 'ARCHIVED',
}
export class CreateProductDto {
    @IsString()
    @IsNotEmpty()
    name!: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsNumber()
    @IsNotEmpty()
    price!: number;

    @IsString()
    @IsNotEmpty()
    sku!: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsEnum(ProductStatus)
    @IsOptional()
    status?: ProductStatus;
}
