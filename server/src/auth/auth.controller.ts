import { Body, Controller, Post } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user-dto';
import { User } from 'src/users/create-user-entity';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dto/login-dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private userService: UsersService,
    private authService: AuthService,
  ) {}
  @Post('signup')
  signup(@Body() userDto: CreateUserDto): Promise<User> {
    return this.userService.create(userDto);
  }

  @Post('login')
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
