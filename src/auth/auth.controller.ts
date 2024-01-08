import { Body, Controller, Get, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup-user.dto';
import { LoginDto } from './dto/login-user.dto';
import { User } from './schemas/user.schema';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  //Register a new user
  @Post('/signup')
  signUp(
    @Body()
    signUpDto: SignUpDto,
  ): Promise<{token: string}> {
    return this.authService.signUp(signUpDto);
  }

  //Login a user
  @Get('/login')
  loginUser(
    @Body()
    loginDto: LoginDto,
  ): Promise<{token: string}> {
    return this.authService.login(loginDto);
  }
}
