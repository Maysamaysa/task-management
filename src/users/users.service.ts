import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User) private readonly userModel: typeof User) { }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existing = await this.userModel.findOne({
      where: { email: createUserDto.email },
    });
    if (existing) {
      throw new ConflictException('Email is already in use');
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const userPayload: any = {
      ...createUserDto,
      password: hashedPassword,
      role: 'employee',
    };

    const user = await this.userModel.create(userPayload as any);
    const userObj = user.toJSON();
    delete userObj.password;
    return userObj as User;
  }

  findAll(): Promise<User[]> {
    return this.userModel.findAll({
      attributes: { exclude: ['password'] },
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.userModel.findByPk(id, {
      attributes: { exclude: ['password'] },
    });
    if (!user) throw new NotFoundException(`User #${id} not found`);
    return user;
  }

  findOneByEmail(email: string): Promise<User | null> {
    return this.userModel.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }
    await user.update(updateUserDto);
    const userObj = user.toJSON();
    delete userObj.password;
    return userObj as User;
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await user.destroy();
  }
}

