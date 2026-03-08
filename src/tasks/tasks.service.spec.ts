import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/sequelize';
import { Task, TaskStatus } from './entities/task.entity';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('TasksService', () => {
  let service: TasksService;

  const USER_ID = 'user-uuid-1';
  const TASK_ID = 'task-uuid-1';

  const mockTask = {
    id: TASK_ID,
    title: 'Fix bug',
    description: 'Fix the crash',
    status: TaskStatus.TODO,
    userId: USER_ID,
    update: jest.fn().mockResolvedValue(undefined),
    destroy: jest.fn().mockResolvedValue(undefined),
  };

  const mockTaskModel = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken(Task),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a task linked to the user', async () => {
      mockTaskModel.create.mockResolvedValue(mockTask);
      const dto = { title: 'Fix bug', description: 'Fix the crash' };
      const result = await service.create(dto, USER_ID);
      expect(mockTaskModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ userId: USER_ID, title: 'Fix bug' }),
      );
      expect(result).toEqual(mockTask);
    });
  });

  describe('findAll', () => {
    it('should return all tasks belonging to the user', async () => {
      mockTaskModel.findAll.mockResolvedValue([mockTask]);
      const result = await service.findAll(USER_ID);
      expect(mockTaskModel.findAll).toHaveBeenCalledWith({ where: { userId: USER_ID } });
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return a task if found and owned by user', async () => {
      mockTaskModel.findByPk.mockResolvedValue(mockTask);
      const result = await service.findOne(TASK_ID, USER_ID);
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException if task does not exist', async () => {
      mockTaskModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne(TASK_ID, USER_ID)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if task belongs to different user', async () => {
      mockTaskModel.findByPk.mockResolvedValue({ ...mockTask, userId: 'other-user' });
      await expect(service.findOne(TASK_ID, USER_ID)).rejects.toThrow(ForbiddenException);
    });
  });

  describe('update', () => {
    it('should update and return the task', async () => {
      mockTaskModel.findByPk.mockResolvedValue(mockTask);
      const dto = { title: 'Updated title' };
      const result = await service.update(TASK_ID, dto, USER_ID);
      expect(mockTask.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(mockTask);
    });
  });

  describe('remove', () => {
    it('should delete the task', async () => {
      mockTaskModel.findByPk.mockResolvedValue(mockTask);
      await service.remove(TASK_ID, USER_ID);
      expect(mockTask.destroy).toHaveBeenCalled();
    });
  });
});
