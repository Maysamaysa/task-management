import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/sequelize';
import { Task, TaskStatus } from './entities/task.entity';
import { UserRole } from 'src/users/entities/user.entity';
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

    it('should filter tasks by status when provided', async () => {
      mockTaskModel.findAll.mockResolvedValue([mockTask]);
      const result = await service.findAll(USER_ID, TaskStatus.DONE);
      expect(mockTaskModel.findAll).toHaveBeenCalledWith({
        where: { userId: USER_ID, status: TaskStatus.DONE },
      });
      expect(result).toEqual([mockTask]);
    });

    it('should allow admin to retrieve all tasks ignoring userId', async () => {
      mockTaskModel.findAll.mockResolvedValue([mockTask]);
      const result = await service.findAll(USER_ID, undefined, UserRole.ADMIN);
      expect(mockTaskModel.findAll).toHaveBeenCalledWith({ where: {} });
      expect(result).toEqual([mockTask]);
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

    it('should allow admin to fetch any user task', async () => {
      mockTaskModel.findByPk.mockResolvedValue({ ...mockTask, userId: 'other-user' });
      const result = await service.findOne(TASK_ID, USER_ID, UserRole.ADMIN);
      expect(result).toEqual(expect.objectContaining({ userId: 'other-user' }));
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

    it('should allow admin to update other users tasks', async () => {
      const otherTask = { ...mockTask, userId: 'other-user', update: jest.fn().mockResolvedValue(undefined) };
      mockTaskModel.findByPk.mockResolvedValue(otherTask);
      const dto = { title: 'Admin change' };
      const result = await service.update(TASK_ID, dto, USER_ID, UserRole.ADMIN);
      expect(otherTask.update).toHaveBeenCalledWith(dto);
      expect(result).toEqual(otherTask);
    });
  });

  describe('remove', () => {
    it('should delete the task', async () => {
      mockTaskModel.findByPk.mockResolvedValue(mockTask);
      await service.remove(TASK_ID, USER_ID);
      expect(mockTask.destroy).toHaveBeenCalled();
    });

    it('should allow admin to delete other users task', async () => {
      const otherTask = { ...mockTask, userId: 'other-user', destroy: jest.fn().mockResolvedValue(undefined) };
      mockTaskModel.findByPk.mockResolvedValue(otherTask);
      await service.remove(TASK_ID, USER_ID, UserRole.ADMIN);
      expect(otherTask.destroy).toHaveBeenCalled();
    });
  });
});
