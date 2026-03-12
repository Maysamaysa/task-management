import { Body, Controller, Post, Get, UseGuards, Request } from '@nestjs/common';
import {
  ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiBody,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) { }

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully.' })
  @ApiResponse({ status: 409, description: 'Email already in use.' })
  register(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login and receive JWT tokens' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'Returns accessToken and refreshToken.' })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  signIn(@Body() body: LoginDto) {
    return this.authService.signIn(body.email, body.password);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Refresh access token using a refresh token' })
  @ApiBody({ schema: { type: 'object', properties: { refreshToken: { type: 'string', description: 'JWT refresh token' } }, required: ['refreshToken'] } })
  @ApiResponse({ status: 200, description: 'Returns new accessToken.' })
  @ApiResponse({ status: 401, description: 'Invalid or expired refresh token.' })
  refresh(@Body('refreshToken') refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  @ApiOperation({ summary: 'Get authenticated user profile from JWT' })
  @ApiResponse({ status: 200, description: 'JWT payload of the current user.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  getProfile(@Request() req) {
    return req.user;
  }
}