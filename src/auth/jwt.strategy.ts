import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
  ) {
    //Super has to be used to call the Parent class PassportStrategy
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECERET_KEY,
    });
  }

  async validate(payload) {
    const { id } = payload;

    const user = await this.userModel.findById(id);

    if (!user) {
      throw new UnauthorizedException('Login first to access this resource.');
    }

    return user;
  }
}
