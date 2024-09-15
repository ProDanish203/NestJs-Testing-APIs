import {
  Controller,
  Post,
  Body,
  Res,
  ValidationPipe,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { Response } from 'express';
import { AuthGuard } from 'src/guards/auth.guard';
import { Roles } from 'common/decorators/roles.decorator';
import { ROLES } from 'common/constants';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(
    @Res({ passthrough: true }) response: Response,
    @Body(ValidationPipe) loginDto: LoginDto,
  ) {
    return this.authService.login(response, loginDto);
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @Roles(...Object.values(ROLES))
  logout(@Res({ passthrough: true }) response: Response) {
    return this.authService.logout(response);
  }
}
