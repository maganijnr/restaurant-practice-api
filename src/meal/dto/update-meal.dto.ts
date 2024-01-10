import {
  IsEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { MealCategory } from '../schemas/meal.schema';
import { User } from 'src/auth/schemas/user.schema';

export class UpdateMealDto {
  @IsString()
  @IsOptional()
  readonly name: string;

  @IsString()
  @IsOptional()
  readonly description: string;

  @IsNumber()
  @IsOptional()
  readonly price: number;

  @IsEnum(MealCategory, { message: 'Please select a correct meal category' })
  @IsOptional()
  readonly category: MealCategory;

  @IsEmpty({ message: 'You cannot provide the user ID' })
  readonly user: User;
}
