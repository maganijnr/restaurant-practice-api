import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum UserRoles {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

@Schema({ timestamps: true })
export class User extends Document {
  @Prop()
  name: string;

  @Prop({ unique: [true, 'Email already exist'] })
  email: string;

  //Select : false, whenever the user is fetched, the password will not be availbale in the user object
  @Prop({ select: false })
  password: string;

  @Prop({
    enum: UserRoles,
    default: UserRoles.USER,
  })
  role: UserRoles;
}

export const UserSchema = SchemaFactory.createForClass(User);
