import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Restaurant } from './schemas/restaurant.schema';
import mongoose from 'mongoose';
import { Query as ExpressQuery } from 'express-serve-static-core';
import ApiFeatures from 'src/utils/apiFeatures.utils';
import { User } from 'src/auth/schemas/user.schema';

@Injectable()
export class RestaurantsService {
  constructor(
    @InjectModel(Restaurant.name)
    private restaurantModel: mongoose.Model<Restaurant>,
  ) {}

  //Get all Restaurants => Get /restaurants/all
  async findAll(query: ExpressQuery): Promise<Restaurant[]> {
    const resPerPage = 12;
    const currentPage = Number(query.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    const keyword = query.keyword
      ? {
          name: {
            $regex: query.keyword,
            $options: 'i',
          },
        }
      : {};

    const restaurants = await this.restaurantModel
      .find({ ...keyword })
      .limit(resPerPage)
      .skip(skip);

    return restaurants;
  }

  //Create new Restaurant => POST /restaurants
  async create(restaurant: Restaurant, user: User): Promise<Restaurant> {
    const data = Object.assign(restaurant, { user: user._id });

    const res = await this.restaurantModel.create(data);
    return res;
  }

  //Get a restaurant by Id => /restaurants/:id
  async findById(id: string): Promise<Restaurant> {
    const res = await this.restaurantModel.findById(id);

    if (!res) {
      throw new NotFoundException('Restaurant not found.');
    }

    return res;
  }

  //Update a restaurant by Id => PUT /restaurants/:id
  async updateById(
    id: string,
    restaurant: Restaurant,
    user: User,
  ): Promise<Restaurant> {
    return await this.restaurantModel.findByIdAndUpdate(
      id,
      { ...restaurant, user: user._id },
      {
        new: true,
        runValidators: true,
      },
    );
  }

  //Delete a restaurant by ID => DELETE /restaurants/:id
  async deleteById(id: string) {
    const res = await this.restaurantModel.findByIdAndDelete(id);

    return res;
  }

  //Uploading images  => PUT /restaurants/upload/:id
  async uploadImages(id, files) {
    const images = await ApiFeatures.upload(files);

    const response = await this.restaurantModel.findByIdAndUpdate(
      id,
      {
        images: images as Object[],
      },
      {
        new: true,
        runValidators: true,
      },
    );

    return response;
  }

  //Delete images
  async deleteImages(images) {
    if (images.length === 0) return true;
    const res = await ApiFeatures.deleteImages(images);
    return res;
  }
}
