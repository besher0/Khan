import { IsOptional, IsString } from 'class-validator';
import { PaginationDto } from '../common/dto/pagination.dto';

export class ProductQueryDto extends PaginationDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  categoryId?: string;

  @IsOptional()
  @IsString()
  storeId?: string;
}

export class SearchQueryDto extends PaginationDto {
  @IsString()
  q: string;
}
