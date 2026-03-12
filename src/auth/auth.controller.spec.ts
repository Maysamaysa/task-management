import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { signIn: jest.Mock; refresh: jest.Mock };
  let usersService: { create: jest.Mock };

  beforeEach(async () => {
    authService = { signIn: jest.fn(), refresh: jest.fn() };
    usersService = { create: jest.fn(), findOneByEmail: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: { signAsync: jest.fn(), verifyAsync: jest.fn() } },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should forward to usersService.create', async () => {
      const dto = { email: 'a@b.com' } as any;
      usersService.create.mockResolvedValue({ id: '1', ...dto });
      const result = await controller.register(dto);
      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result).toEqual({ id: '1', ...dto });
    });
  });

  describe('signIn', () => {
    it('should call authService.signIn with body data', async () => {
      const body = { email: 'x', password: 'y' } as any;
      authService.signIn.mockResolvedValue({ accessToken: 'at', refreshToken: 'rt' });
      const result = await controller.signIn(body);
      expect(authService.signIn).toHaveBeenCalledWith('x', 'y');
      expect(result).toEqual({ accessToken: 'at', refreshToken: 'rt' });
    });
  });

  describe('refresh', () => {
    it('should call authService.refresh with token', async () => {
      authService.refresh.mockResolvedValue({ accessToken: 'new_at' });
      const result = await controller.refresh('tok');
      expect(authService.refresh).toHaveBeenCalledWith('tok');
      expect(result).toEqual({ accessToken: 'new_at' });
    });
  });

  describe('getProfile', () => {
    it('should return user from request', () => {
      const fakeReq: any = { user: { id: 'u1' } };
      const result = controller.getProfile(fakeReq);
      expect(result).toEqual({ id: 'u1' });
    });
  });

  describe('constructor', () => {
    it('should instantiate directly', () => {
      const authCtrl = new AuthController(
        authService as any,
        usersService as any,
      );
      expect(authCtrl).toBeDefined();
    });
  });
});
