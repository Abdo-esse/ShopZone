import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProductService } from './product.service';
import { CreateProductDto } from '../../../../libs/shared/src/dto/create-product.dto';
import { UpdateProductDto } from '../../../../libs/shared/src/dto/update-product.dto';

@Controller()
export class ProductController {
    constructor(private readonly productService: ProductService) { }

    @MessagePattern('catalog.product.create')
    create(@Payload() createProductDto: CreateProductDto) {
        console.log(createProductDto,"in catalog service");
        return this.productService.create(createProductDto);
    }

    @MessagePattern('catalog.product.findAll')
    findAll() {
        console.log('findAll');
        return this.productService.findAll();
    }

    @MessagePattern('catalog.product.findOne')
    findOne(@Payload() id: string) {
        return this.productService.findOne(id);
    }

    @MessagePattern('catalog.product.update')
    update(@Payload() data: { id: string; updateProductDto: UpdateProductDto }) {
        return this.productService.update(data.id, data.updateProductDto);
    }

    @MessagePattern('catalog.product.remove')
    remove(@Payload() id: string) {
        return this.productService.remove(id);
    }
}
