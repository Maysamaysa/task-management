import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task, TaskStatus } from './entities/task.entity';
import { UserRole } from 'src/users/entities/user.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task) private readonly taskModel: typeof Task) { }

  create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    return this.taskModel.create({ ...createTaskDto, userId } as any);
  }

  findAll(userId: string, status?: TaskStatus, userRole?: UserRole): Promise<Task[]> {
    const whereClause: any = {};

    if (userRole !== UserRole.ADMIN) {
      whereClause.userId = userId;
    }

    if (status) {
      whereClause.status = status;
    }
    return this.taskModel.findAll({ where: whereClause });
  }

  async findOne(id: string, userId: string, userRole?: UserRole): Promise<Task> {
    const task = await this.taskModel.findByPk(id);
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    if (userRole !== UserRole.ADMIN && task.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string, userRole?: UserRole): Promise<Task> {
    const task = await this.findOne(id, userId, userRole);
    await task.update(updateTaskDto);
    return task;
  }

  async remove(id: string, userId: string, userRole?: UserRole): Promise<void> {
    const task = await this.findOne(id, userId, userRole);
    await task.destroy();
  }
}
