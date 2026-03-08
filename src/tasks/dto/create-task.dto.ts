import { IsString, IsNotEmpty, IsOptional, IsEnum, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class CreateTaskDto {
    @ApiProperty({ example: 'Fix login bug', description: 'Task title', maxLength: 255 })
    @IsString()
    @IsNotEmpty({ message: 'Title is required' })
    @MaxLength(255, { message: 'Title must not exceed 255 characters' })
    title: string;

    @ApiPropertyOptional({ example: 'The login page crashes on Safari', description: 'Optional task description' })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiPropertyOptional({ enum: TaskStatus, default: TaskStatus.TODO, description: 'Task status' })
    @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
    @IsOptional()
    status?: TaskStatus;
}
