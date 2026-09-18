import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../common/types/authenticated-request';
import { CreateReviewDto } from './dto';
import { ReviewSort } from './review-sort';
import { ReviewsService } from './reviews.service';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviews: ReviewsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateReviewDto) {
    return this.reviews.create(user.id, dto);
  }

  @Get('stores/:storeId')
  storeReviews(@Param('storeId') storeId: string, @Query() query: { sort?: ReviewSort }) {
    return this.reviews.storeReviews(storeId, query.sort);
  }

  @UseGuards(JwtAuthGuard)
  @Get('stores/:storeId/eligibility')
  storeEligibility(@CurrentUser() user: AuthenticatedUser, @Param('storeId') storeId: string) {
    return this.reviews.storeReviewEligibility(user.id, storeId);
  }

  @Get('products/:productId')
  productReviews(@Param('productId') productId: string, @Query() query: { sort?: ReviewSort }) {
    return this.reviews.productReviews(productId, query.sort);
  }

  @UseGuards(JwtAuthGuard)
  @Get('products/:productId/eligibility')
  productEligibility(@CurrentUser() user: AuthenticatedUser, @Param('productId') productId: string) {
    return this.reviews.productReviewEligibility(user.id, productId);
  }
}
