import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/sequelize';
import { User } from './entities/user.entity';
import { ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashedPassword'),
  compare: jest.fn(),
}));

describe('UsersService', () => {
  let service: UsersService;

  const mockUser = {
    id: 'uuid-001',
    email: 'jane@example.com',
    password: 'hashedPassword',
    firstName: 'Jane',
    lastName: 'Doe',
    update: jest.fn().mockImplementation(function (dto) {
      Object.assign(this, dto);
      return Promise.resolve(this);
    }),
    destroy: jest.fn().mockResolvedValue(undefined),
    toJSON: jest.fn().mockImplementation(function () {
      return { ...this };
    }),
  };

  const mockUserModel = {
    findOne: jest.fn(),
    findAll: jest.fn(),
    findByPk: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken(User), useValue: mockUserModel },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash password and create user when email is unique', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      mockUserModel.create.mockResolvedValue(mockUser);

      const dto = {
        email: 'jane@example.com',
        password: 'Str0ng@Pass',
        firstName: 'Jane',
        lastName: 'Doe',
      };

      const result = await service.create(dto);
      expect(bcrypt.hash).toHaveBeenCalledWith('Str0ng@Pass', 10);
      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashedPassword', role: 'employee' }),
      );

      const expected: any = { ...mockUser };
      delete expected.password;
      expect(result).toEqual(expected);
    });

    it('should throw ConflictException when email already exists', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      await expect(
        service.create({
          email: 'jane@example.com',
          password: 'Str0ng@Pass',
          firstName: 'Jane',
          lastName: 'Doe',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should ignore specified role and enforce employee role', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const dto = {
        email: 'bob@example.com',
        password: 'Str0ng@Pass',
        firstName: 'Bob',
        lastName: 'Builder',
        role: 'admin',
      } as any;
      mockUserModel.create.mockResolvedValue({ ...mockUser, role: 'employee', toJSON: () => ({ ...mockUser, role: 'employee' }) });
      const result = await service.create(dto);
      expect(mockUserModel.create).toHaveBeenCalledWith(
        expect.objectContaining({ role: 'employee' }),
      );
      expect(result.role).toEqual('employee');
    });
  });

  describe('findAll', () => {
    it('should return all users without passwords', async () => {
      mockUserModel.findAll.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(mockUserModel.findAll).toHaveBeenCalledWith({
        attributes: { exclude: ['password'] },
      });
      expect(result).toEqual([mockUser]);
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      mockUserModel.findByPk.mockResolvedValue(mockUser);
      const result = await service.findOne('uuid-001');
      expect(result).toEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('findOneByEmail', () => {
    it('should return user by email', async () => {
      mockUserModel.findOne.mockResolvedValue(mockUser);
      const result = await service.findOneByEmail('jane@example.com');
      expect(mockUserModel.findOne).toHaveBeenCalledWith({
        where: { email: 'jane@example.com' },
      });
      expect(result).toEqual(mockUser);
    });

    it('should return null when email not found', async () => {
      mockUserModel.findOne.mockResolvedValue(null);
      const result = await service.findOneByEmail('nobody@example.com');
      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return user', async () => {
      const userInstance = { ...mockUser, toJSON: function () { return { ...this }; } };
      mockUserModel.findByPk.mockResolvedValue(userInstance);
      const dto = { firstName: 'Janet' };
      const result = await service.update('uuid-001', dto);
      expect(result).toBeDefined();
    });

    it('should hash new password when updating', async () => {
      const userInstance = { ...mockUser, update: jest.fn().mockResolvedValue(mockUser), toJSON: function () { return { ...this }; } };
      mockUserModel.findByPk.mockResolvedValue(userInstance);
      await service.update('uuid-001', { password: 'NewPass1@' });
      expect(bcrypt.hash).toHaveBeenCalledWith('NewPass1@', 10);
    });
  });

  describe('remove', () => {
    it('should delete the user', async () => {
      const userInstance = { ...mockUser, destroy: jest.fn().mockResolvedValue(undefined) };
      mockUserModel.findByPk.mockResolvedValue(userInstance);
      await service.remove('uuid-001');
      expect(userInstance.destroy).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserModel.findByPk.mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toThrow(NotFoundException);
    });
  });
});
