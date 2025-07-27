import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './create-user-entity';
import { CreateUserDto } from './dto/create-user-dto';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcryptjs';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from 'src/auth/dto/login-dto';
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(userDto: CreateUserDto): Promise<User> {
    const salt = await bcrypt.genSalt();
    userDto.password = await bcrypt.hash(userDto.password, salt);

    const user = await this.usersRepository.save(userDto);

    return plainToInstance(User, user);
  }

  async findOne(data: LoginDto): Promise<User> {
    const user = await this.usersRepository.findOneBy({ email: data.email });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
