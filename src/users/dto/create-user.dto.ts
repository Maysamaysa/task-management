import { IsEmail, IsString, IsNotEmpty, MinLength, MaxLength, Matches, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
    @ApiProperty({ example: 'jane@example.com', description: 'User email address' })
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @ApiProperty({
        example: 'Str0ng@Pass',
        description: 'Password (8-32 chars, must include uppercase, lowercase, number, special char)',
        minLength: 8,
        maxLength: 32,
    })
    @IsString()
    @IsNotEmpty({ message: 'Password is required' })
    @MinLength(8, { message: 'Password must be at least 8 characters' })
    @MaxLength(32, { message: 'Password must not exceed 32 characters' })
    @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/, {
        message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    })
    password: string;

    @ApiProperty({ example: 'Jane', description: 'First name', maxLength: 100 })
    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MaxLength(100, { message: 'First name must not exceed 100 characters' })
    firstName: string;

    @ApiProperty({ example: 'Doe', description: 'Last name', maxLength: 100 })
    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MaxLength(100, { message: 'Last name must not exceed 100 characters' })
    lastName: string;

    @ApiPropertyOptional({ enum: UserRole, default: UserRole.EMPLOYEE, description: 'Role assigned to the user' })
    @IsEnum(UserRole, { message: 'Role must be admin or employee' })
    @IsOptional()
    role?: UserRole;
}