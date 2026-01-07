import { Controller, Get, Post, Body, Patch, Param, Delete, Inject } from '@nestjs/common';
import { KafkaClientService } from '../kafka/kafka-client.service';
import { firstValueFrom } from 'rxjs';

@Controller('catalog')
export class CatalogController {
    constructor(private readonly kafkaClient: KafkaClientService) { }

    // Categories
    @Post('categories')
    createCategory(@Body() createCategoryDto: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.category.create', createCategoryDto),
        );
    }

    @Get('categories')
    findAllCategories() {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.category.findAll', {}),
        );
    }

    @Get('categories/:id')
    findOneCategory(@Param('id') id: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.category.findOne', id),
        );
    }

    @Patch('categories/:id')
    updateCategory(@Param('id') id: string, @Body() updateCategoryDto: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.category.update', { id, updateCategoryDto }),
        );
    }

    @Delete('categories/:id')
    removeCategory(@Param('id') id: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.category.remove', id),
        );
    }

    // Products
    @Post('products')
    createProduct(@Body() createProductDto: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.product.create', createProductDto),
        );
    }

    @Get('products')
    findAllProducts() {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.product.findAll', {}),
        );
    }

    @Get('products/:id')
    findOneProduct(@Param('id') id: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.product.findOne', id),
        );
    }

    @Patch('products/:id')
    updateProduct(@Param('id') id: string, @Body() updateProductDto: any) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.product.update', { id, updateProductDto }),
        );
    }

    @Delete('products/:id')
    removeProduct(@Param('id') id: string) {
        return firstValueFrom(
            this.kafkaClient.getClient().send('catalog.product.remove', id),
        );
    }
}
