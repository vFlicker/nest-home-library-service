import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  ClassSerializerInterceptor,
  UseGuards,
} from '@nestjs/common';

import { uuidV4Decorator } from '../../common/decorators';
import { AuthGuard } from '../auth/guards/auth.guard';
import { CreateUserDto, UpdatePasswordDto } from './dto';
import { UserEntity } from './entities/user.entity';
import { UserService } from './user.service';

@Controller('user')
@UseGuards(AuthGuard)
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  findOneById(@Param('id', uuidV4Decorator) id: string): Promise<UserEntity> {
    return this.userService.findOneById(id);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  findAll(): Promise<UserEntity[]> {
    return this.userService.findAll();
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createUserDto: CreateUserDto): Promise<UserEntity> {
    return this.userService.create(createUserDto);
  }

  @Put(':id')
  @HttpCode(HttpStatus.OK)
  updatePassword(
    @Param('id', uuidV4Decorator) id: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ): Promise<UserEntity> {
    return this.userService.updatePassword(id, updatePasswordDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', uuidV4Decorator) id: string): Promise<void> {
    return this.userService.remove(id);
  }
}