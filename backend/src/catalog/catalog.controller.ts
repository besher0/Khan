import { Controller, Get, Param, Query } from '@nestjs/common';
import { CatalogService } from './catalog.service';
import { ProductQueryDto, SearchQueryDto } from './dto';

@Controller()
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get('home')
  home() {
    return this.catalog.home();
  }

  @Get('categories')
  categories() {
    return this.catalog.categories();
  }

  @Get('products')
  products(@Query() query: ProductQueryDto) {
    return this.catalog.products(query);
  }

  @Get('products/:id')
  product(@Param('id') id: string) {
    return this.catalog.product(id);
  }

  @Get('stores/:id')
  store(@Param('id') id: string) {
    return this.catalog.store(id);
  }

  @Get('stores/:id/products')
  storeProducts(@Param('id') id: string, @Query() query: ProductQueryDto) {
    return this.catalog.products({ ...query, storeId: id });
  }

  @Get('search')
  search(@Query() query: SearchQueryDto) {
    return this.catalog.search(query);
  }

  @Get('reels')
  reels(@Query() query: ProductQueryDto) {
    return this.catalog.reels(query);
  }
}
