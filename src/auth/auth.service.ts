import { JwtService } from '@nestjs/jwt';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schemas/user.schema';
import { Model } from 'mongoose';
import { SignUpDto } from './dto/signup-user.dto';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/login-user.dto';
import ApiFeatures from 'src/utils/apiFeatures.utils';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private userModel: Model<User>,
    private jwtService: JwtService,
  ) {}

  //Register User
  async signUp(signUpDto: SignUpDto): Promise<{ token: string }> {
    const { name, email, password } = signUpDto;

    const hashedPassword = await bcrypt.hash(password, 10);

    const emailExist = await this.userModel.findOne({ email: email });

    if (emailExist) {
      throw new ConflictException('Email already in use');
    }

    const user = this.userModel.create({
      name,
      email,
      password: hashedPassword,
    });

    const token = await ApiFeatures.assignJwtToken(
      //@ts-ignore
      user._id.toString(),
      this.jwtService,
    );

    return {
      token,
    };
  }

  //Login user
  async login(loginDto: LoginDto): Promise<{ token: string }> {
    const { email, password } = loginDto;

    const user = await this.userModel
      .findOne({ email: email })
      .select('+password');

    if (!user) {
      throw new UnauthorizedException('Invalid email address or password');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email address or password');
    }

    const token = await ApiFeatures.assignJwtToken(
      user._id.toString(),
      this.jwtService,
    );

    return { token };
  }
}
