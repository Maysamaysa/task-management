import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/sequelize';
import { Task } from './entities/task.entity';
import { JwtService } from '@nestjs/jwt';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: Partial<TasksService>;

  beforeEach(async () => {
    tasksService = {
      findAll: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        { provide: TasksService, useValue: tasksService },
        { provide: getModelToken(Task), useValue: {} },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should require at least employee role on controller', () => {
    const roles = Reflect.getMetadata('roles', TasksController);
    expect(roles).toEqual(['admin', 'employee']);
  });

  describe('create', () => {
    it('should forward create DTO and user id to service', () => {
      const req: any = { user: { sub: 'user-1' } };
      const dto = { title: 'foo' } as any;
      (tasksService.create as jest.Mock) = jest.fn().mockReturnValue({ id: '1' });
      const result = controller.create(dto, req);
      expect(tasksService.create).toHaveBeenCalledWith(dto, 'user-1');
      expect(result).toEqual({ id: '1' });
    });
  });

  describe('findAll', () => {
    it('should forward user id and filter to service', () => {
      const req: any = { user: { sub: 'user-1', role: 'employee' } };
      const filter = { status: 'DONE' } as any;

      (tasksService.findAll as jest.Mock).mockReturnValue([]);
      controller.findAll(req, filter);
      expect(tasksService.findAll).toHaveBeenCalledWith('user-1', 'DONE', 'employee');
    });

    it('should forward admin role to service as well', () => {
      const req: any = { user: { sub: 'user-1', role: 'admin' } };
      const filter = {} as any;
      (tasksService.findAll as jest.Mock).mockReturnValue([]);
      controller.findAll(req, filter);
      expect(tasksService.findAll).toHaveBeenCalledWith('user-1', undefined, 'admin');
    });
  });

  describe('findOne', () => {
    it('should call service with id and role', () => {
      const req: any = { user: { sub: 'user-1', role: 'employee' } };
      (tasksService.findOne as jest.Mock) = jest.fn().mockReturnValue('task');
      const result = controller.findOne('123', req);
      expect(tasksService.findOne).toHaveBeenCalledWith('123', 'user-1', 'employee');
      expect(result).toEqual('task');
    });
  });

  describe('update', () => {
    it('should forward update DTO, id and role', () => {
      const req: any = { user: { sub: 'user-1', role: 'employee' } };
      const dto = { title: 'bar' } as any;
      (tasksService.update as jest.Mock) = jest.fn().mockReturnValue('updated');
      const result = controller.update('123', dto, req);
      expect(tasksService.update).toHaveBeenCalledWith('123', dto, 'user-1', 'employee');
      expect(result).toEqual('updated');
    });
  });

  describe('remove', () => {
    it('should return deletion message', async () => {
      const req: any = { user: { sub: 'user-1', role: 'employee' } };
      (tasksService.remove as jest.Mock) = jest.fn().mockResolvedValue(undefined);
      const result = await controller.remove('task-1', req);
      expect(tasksService.remove).toHaveBeenCalledWith('task-1', 'user-1', 'employee');
      expect(result).toEqual({ message: 'Task deleted' });
    });
  });

  describe('constructor', () => {
    it('should instantiate directly', () => {
      const ctrl = new TasksController(tasksService as any);
      expect(ctrl).toBeDefined();
    });
  });
});
