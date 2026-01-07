import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller()
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) { }

    @MessagePattern('catalog.category.create')
    create(@Payload() createCategoryDto: CreateCategoryDto) {
        return this.categoryService.create(createCategoryDto);
    }

    @MessagePattern('catalog.category.findAll')
    findAll() {
        return this.categoryService.findAll();
    }

    @MessagePattern('catalog.category.findOne')
    findOne(@Payload() id: string) {
        return this.categoryService.findOne(id);
    }

    @MessagePattern('catalog.category.update')
    update(@Payload() data: { id: string; updateCategoryDto: UpdateCategoryDto }) {
        return this.categoryService.update(data.id, data.updateCategoryDto);
    }

    @MessagePattern('catalog.category.remove')
    remove(@Payload() id: string) {
        return this.categoryService.remove(id);
    }
}
