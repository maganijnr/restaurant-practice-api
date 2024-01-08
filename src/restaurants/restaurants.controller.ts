import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  Query,
  Req,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { RestaurantsService } from './restaurants.service';
import { Restaurant } from './schemas/restaurant.schema';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { Query as ExpressQuery } from 'express-serve-static-core';
import { FilesInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { ApiResponse } from '@nestjs/swagger';
import { RolesGuard } from 'src/auth/guard/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';

@Controller('restaurants')
export class RestaurantsController {
  constructor(private restaurantsService: RestaurantsService) {}

  @Get('all')
  @ApiResponse({ status: 200, description: 'Restaurants fetched successfully' })
  async getAllRestaurants(
    @Query()
    query: ExpressQuery,
  ): Promise<Restaurant[]> {
    return this.restaurantsService.findAll(query);
  }

  @Post()
  @UseGuards(AuthGuard(), RolesGuard)
  @Roles('ADMIN', 'USER')
  async createRestaurant(
    @Body()
    restaurant: CreateRestaurantDto,
    @CurrentUser()
    user: User,
  ): Promise<Restaurant> {
    return this.restaurantsService.create(restaurant, user);
  }

  @Get(':id')
  async getRestaurant(
    @Param('id')
    id: string,
  ): Promise<Restaurant> {
    return this.restaurantsService.findById(id);
  }

  @Put(':id')
  @UseGuards(AuthGuard())
  async updateRestaurant(
    @Body()
    restaurant: UpdateRestaurantDto,
    @Param('id')
    id: string,
    @CurrentUser()
    user: User,
  ): Promise<Restaurant> {
    const response = await this.restaurantsService.findById(id);

    if (response.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You cannot update this restaurant.');
    }
    return this.restaurantsService.updateById(id, restaurant, user);
  }

  @Delete(':id')
  @UseGuards(AuthGuard())
  async delete(
    @Param('id')
    id: string,
    @CurrentUser()
    user: User,
  ) {
    const restaurant = await this.restaurantsService.findById(id);
    

    if (restaurant.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You cannot delete this restaurant.');
    }

    const isImageDeleted = await this.restaurantsService.deleteImages(
      restaurant.images,
    );

    if (isImageDeleted) {
      this.restaurantsService.deleteById(id);

      return {
        deleted: true,
      };
    } else {
      return {
        deleted: false,
      };
    }
  }

  @Put('upload/:id')
  @UseInterceptors(FilesInterceptor('files'))
  async uploadFiles(
    @Param('id')
    id: string,

    @UploadedFiles()
    files: Array<Express.Multer.File>,
  ) {
    await this.restaurantsService.findById(id);
    const response = await this.restaurantsService.uploadImages(id, files);

    return response;
  }
}
