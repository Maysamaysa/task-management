import { IsEmail, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'jane@example.com', description: 'User email' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Str0ng@Pass', description: 'User password' })
  @IsString()
  password: string;
}
