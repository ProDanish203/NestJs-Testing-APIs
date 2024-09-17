import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  ValidationPipe,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { QueryParams } from 'common/types/type';
import { Request } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants';
import { UpdateUserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll(@Query() query: QueryParams) {
    return this.usersService.findAll(query);
  }

  @Get('current-user')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  currentUser(@Req() req: Request) {
    return this.usersService.currentUser(req);
  }

  @Get('profile')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  profile(@Req() req: Request) {
    return this.usersService.profile(req);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  update(
    @Req() req: Request,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(req, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  remove(@Req() req: Request) {
    return this.usersService.remove(req);
  }
}
