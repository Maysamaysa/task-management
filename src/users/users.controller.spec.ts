import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { JwtService } from '@nestjs/jwt';

describe('UsersController', () => {
  let controller: UsersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        { provide: getModelToken(User), useValue: {} },
        { provide: JwtService, useValue: { verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should have admin role metadata on protected methods', () => {
    const rolesAll = Reflect.getMetadata('roles', UsersController.prototype.findAll);
    const rolesOne = Reflect.getMetadata('roles', UsersController.prototype.findOne);
    const rolesUpdate = Reflect.getMetadata('roles', UsersController.prototype.update);
    const rolesRemove = Reflect.getMetadata('roles', UsersController.prototype.remove);
    expect(rolesAll).toEqual(['admin']);
    expect(rolesOne).toEqual(['admin']);
    expect(rolesUpdate).toEqual(['admin']);
    expect(rolesRemove).toEqual(['admin']);
  });

  describe('create', () => {
    it('should call service with create DTO', () => {
      const usersService: any = controller['usersService'];
      usersService.create = jest.fn().mockReturnValue('u');
      const dto: any = { email: 'x' };
      const result = controller.create(dto);
      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual('u');
    });
  });

  describe('findAll', () => {
    it('should call service', () => {
      const usersService: any = controller['usersService'];
      usersService.findAll = jest.fn().mockReturnValue(['u']);
      const result = controller.findAll();
      expect(usersService.findAll).toHaveBeenCalled();
      expect(result).toEqual(['u']);
    });
  });

  describe('findOne', () => {
    it('should call service with id', () => {
      const usersService: any = controller['usersService'];
      usersService.findOne = jest.fn().mockReturnValue('u');
      const result = controller.findOne('id');
      expect(usersService.findOne).toHaveBeenCalledWith('id');
      expect(result).toEqual('u');
    });
  });

  describe('update', () => {
    it('should call service with id and dto', () => {
      const usersService: any = controller['usersService'];
      usersService.update = jest.fn().mockReturnValue('u');
      const dto: any = { firstName: 'x' };
      const result = controller.update('id', dto);
      expect(usersService.update).toHaveBeenCalledWith('id', dto);
      expect(result).toEqual('u');
    });
  });

  describe('remove', () => {
    it('should return confirmation message', async () => {
      const usersService: any = controller['usersService'];
      usersService.remove = jest.fn().mockResolvedValue(undefined);
      const result = await controller.remove('user-1');
      expect(usersService.remove).toHaveBeenCalledWith('user-1');
      expect(result).toEqual({ message: 'User deleted' });
    });
  });

  describe('constructor', () => {
    it('should instantiate directly', () => {
      const usersService: any = {};
      const ctrl = new UsersController(usersService);
      expect(ctrl).toBeDefined();
    });
  });
});
