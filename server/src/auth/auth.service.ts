import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/create-user-entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login-dto';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async login(loginDto: LoginDto): Promise<User> {
    const user = await this.usersService.findOne(loginDto);

    if (!user) {
      throw new UnauthorizedException('Invalid Credentials');
    }
    const passwordMatched = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!passwordMatched) {
      throw new UnauthorizedException('Password does not match');
    }

    return plainToInstance(User, user);
  }
}
