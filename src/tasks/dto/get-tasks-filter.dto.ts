import { IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { TaskStatus } from '../entities/task.entity';

export class GetTasksFilterDto {
  @ApiPropertyOptional({ enum: TaskStatus, description: 'Filter tasks by status' })
  @IsEnum(TaskStatus, { message: 'Status must be TODO, IN_PROGRESS, or DONE' })
  @IsOptional()
  status?: TaskStatus;
}
