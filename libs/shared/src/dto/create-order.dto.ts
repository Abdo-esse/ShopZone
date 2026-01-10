import { IsString, IsNotEmpty, IsNumber, IsOptional, ValidateNested, IsUUID, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class OrderItemDto {
    @IsString()
    @IsNotEmpty()
    @IsUUID()
    productId!: string;

    @IsNumber()
    @Min(1)
    quantity!: number;

    @IsNumber()
    @Min(0)
    price!: number;
}

export class CreateOrderDto {
    @ValidateNested({ each: true })
    @Type(() => OrderItemDto)
    items!: OrderItemDto[];

    @IsString()
    @IsNotEmpty()
    shippingAddress!: string;
}
