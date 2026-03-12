import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { UserRole } from 'src/users/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { TasksService } from './tasks.service';
import { TaskStatus } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@ApiTags('tasks')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.EMPLOYEE)
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  @ApiResponse({ status: 201, description: 'Task created successfully.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  create(@Body() createTaskDto: CreateTaskDto, @Request() req) {
    return this.tasksService.create(createTaskDto, req.user.sub);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks for the authenticated user (optional status filter)' })
  @ApiQuery({ name: 'status', enum: TaskStatus, required: false, description: 'Only return tasks with the given status' })
  @ApiResponse({ status: 200, description: 'List of tasks.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  findAll(@Request() req, @Query() filterDto: GetTasksFilterDto) {
    return this.tasksService.findAll(req.user.sub, filterDto.status, req.user.role);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific task by ID' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task details.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your task.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.tasksService.findOne(id, req.user.sub, req.user.role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task (title, description, status)' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task updated.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your task.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateTaskDto: UpdateTaskDto,
    @Request() req,
  ) {
    return this.tasksService.update(id, updateTaskDto, req.user.sub, req.user.role);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task UUID' })
  @ApiResponse({ status: 200, description: 'Task deleted.' })
  @ApiResponse({ status: 403, description: 'Forbidden - not your task.' })
  @ApiResponse({ status: 404, description: 'Task not found.' })
  remove(@Param('id', ParseUUIDPipe) id: string, @Request() req) {
    return this.tasksService.remove(id, req.user.sub, req.user.role).then(() => ({ message: 'Task deleted' }));
  }
}
