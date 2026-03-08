import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from './entities/task.entity';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(@InjectModel(Task) private readonly taskModel: typeof Task) { }

  create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    return this.taskModel.create({ ...createTaskDto, userId } as any);
  }

  findAll(userId: string): Promise<Task[]> {
    return this.taskModel.findAll({ where: { userId } });
  }

  async findOne(id: string, userId: string): Promise<Task> {
    const task = await this.taskModel.findByPk(id);
    if (!task) throw new NotFoundException(`Task #${id} not found`);
    if (task.userId !== userId) throw new ForbiddenException('Access denied');
    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto, userId: string): Promise<Task> {
    const task = await this.findOne(id, userId);
    await task.update(updateTaskDto);
    return task;
  }

  async remove(id: string, userId: string): Promise<void> {
    const task = await this.findOne(id, userId);
    await task.destroy();
  }
}
