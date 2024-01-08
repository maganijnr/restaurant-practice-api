import { Schema, Prop, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';

export enum Category {
  FAST_FOOD = 'Fast Food',
  CAFE = 'Cafe',
  FINE_DINNING = 'Fine Dinning',
}

@Schema({ timestamps: true })
export class Restaurant {
  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop()
  email: string;

  @Prop()
  phoneNo: number;

  @Prop()
  address: string;

  @Prop()
  category: Category;

  @Prop()
  images?: object[];

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  user: User;

  // @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Meal' })
  // menu?: Meal[]
}

export const RestaurantSchema = SchemaFactory.createForClass(Restaurant);
