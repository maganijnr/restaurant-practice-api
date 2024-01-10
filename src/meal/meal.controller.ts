import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { MealService } from './meal.service';
import { CreateMealDto } from './dto/create-meal.dto';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/auth/schemas/user.schema';
import { Meal } from './schemas/meal.schema';
import { UpdateMealDto } from './dto/update-meal.dto';

@Controller('meals')
export class MealController {
  constructor(private mealService: MealService) {}

  //Create a meal for a restaurant
  @Post()
  @UseGuards(AuthGuard())
  createMeal(
    @Body()
    mealDto: CreateMealDto,
    @CurrentUser()
    user: User,
  ): Promise<Meal> {
    return this.mealService.createRestaurantMeal(mealDto, user);
  }

  //GET ALL MEALS
  @Get()
  getAllMeals(): Promise<Meal[]> {
    return this.mealService.findAllMeals();
  }

  //GET MEALS THAT BELONG TO A RESTAURANT
  @Get('restaurant/:id')
  @UseGuards(AuthGuard())
  getRestaurantMeals(
    @Param('id')
    id: string,
  ): Promise<Meal[]> {
    return this.mealService.findMealByRestaurantId(id);
  }

  //Update a meal
  @Put('restaurant/:id')
  @UseGuards(AuthGuard())
  async updateMeal(
    @Param('id')
    id: string,
    @Body()
    mealDto: UpdateMealDto,
    @CurrentUser()
    user: User,
  ): Promise<Meal> {
    const meal = await this.mealService.findSingleMealById(id);

    if (meal.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You cannot update this meal.');
    }

    const updatedMeal = await this.mealService.updateMeal(id, mealDto);

    return updatedMeal;
  }

  //Delete meal by ID
  @Delete('restaurant/:id')
  @UseGuards(AuthGuard())
  async deleteMeal(
    @Param('id')
    id: string,

    @CurrentUser()
    user: User,
  ) {
    const mealExist = await this.mealService.findSingleMealById(id);

    if (mealExist.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('Cannot delete meal, Not owner.');
    }

    const response = this.mealService.deleteMealById(id);

    if (response) {
      return {
        deleted: true,
      };
    } else {
      return {
        deleted: false,
      };
    }
  }
}
