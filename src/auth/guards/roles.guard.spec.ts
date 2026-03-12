import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from 'src/users/entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: { getAllAndOverride: jest.Mock };

  beforeEach(async () => {
    reflector = { getAllAndOverride: jest.fn() };
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: reflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    let context: ExecutionContext;
    let request: any;

    beforeEach(() => {
      request = {
        user: {},
      };
      context = {
        switchToHttp: () => ({
          getRequest: () => request,
        }),
        getHandler: jest.fn(),
        getClass: jest.fn(),
      } as any;
    });

    it('should return true if no roles are required', () => {
      reflector.getAllAndOverride.mockReturnValue(null);
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should return true if user has required role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      request.user.role = UserRole.ADMIN;
      const result = guard.canActivate(context);
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user has insufficient role', () => {
      reflector.getAllAndOverride.mockReturnValue([UserRole.ADMIN]);
      request.user.role = UserRole.EMPLOYEE;
      expect(() => guard.canActivate(context)).toThrow(
        new ForbiddenException('Insufficient role'),
      );
    });
  });
});