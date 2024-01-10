import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Meal } from './schemas/meal.schema';
import * as mongoose from 'mongoose';
import { Restaurant } from 'src/restaurants/schemas/restaurant.schema';
import { User } from 'src/auth/schemas/user.schema';
import { CreateMealDto } from './dto/create-meal.dto';
import { UpdateMealDto } from './dto/update-meal.dto';

@Injectable()
export class MealService {
  constructor(
    @InjectModel(Meal.name)
    private mealModel: mongoose.Model<Meal>,

    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  //Create a meal from
  async createRestaurantMeal(meal: Meal, user: User): Promise<Meal> {
    const data = Object.assign(meal, { user: user._id });

    //Getting the restaurant to save the meal too
    const restaurant = await this.restaurantModel.findById(meal.restaurant);

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found with this ID.');
    }

    //Check ownership of restaurant
    if (restaurant.user.toString() !== user._id.toString()) {
      throw new ForbiddenException('You cannot add meal to this restaurant.');
    }

    const mealCreated = await this.mealModel.create(data);

    restaurant.menu.push(mealCreated);

    await restaurant.save();

    return mealCreated;
  }

  //Get meal by Id
  async findSingleMealById(id: string): Promise<Meal> {
    const meal = await this.mealModel.findById(id);

    if (!meal) {
      throw new NotFoundException('Meal not found with this ID.');
    }

    return meal;
  }

  //Get all meals
  async findAllMeals(): Promise<Meal[]> {
    const meals = await this.mealModel.find();

    return meals;
  }

  //GET  meals that belong to a  restaurant
  async findMealByRestaurantId(id: string): Promise<Meal[]> {
    const meals = await this.mealModel.find({ restaurant: id });
    return meals;
  }

  //Delete a meal
  async deleteMealById(id: string) {
    const response = await this.mealModel.findByIdAndDelete(id);

    return response;
  }

  //Update a meal that belongs to a restaurant
  async updateMeal(id: string, mealDto: UpdateMealDto): Promise<Meal> {
    const meal = await this.mealModel.findByIdAndUpdate(id, mealDto, {
      new: true,
      runValidators: true,
    });

    return meal;
  }
}
