import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

// Mock bcrypt at the module level so spyOn works correctly
jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let authService: AuthService;
  let usersService: { findOneByEmail: jest.Mock };
  let jwtService: { signAsync: jest.Mock; verifyAsync: jest.Mock };

  const mockUser = {
    id: 'uuid-1234',
    email: 'jane@example.com',
    password: 'hashedPassword',
    firstName: 'Jane',
    lastName: 'Doe',
  };

  beforeEach(async () => {
    usersService = { findOneByEmail: jest.fn() };
    jwtService = {
      signAsync: jest.fn().mockResolvedValue('mock.jwt.token'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should return access and refresh tokens on valid credentials', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.signAsync.mockResolvedValue('mock.jwt.token');

      const result = await authService.signIn('jane@example.com', 'Str0ng@Pass');

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
      expect(usersService.findOneByEmail).toHaveBeenCalledWith('jane@example.com');
    });

    it('should throw UnauthorizedException when user is not found', async () => {
      usersService.findOneByEmail.mockResolvedValue(null);

      await expect(
        authService.signIn('nobody@example.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when password is wrong', async () => {
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        authService.signIn('jane@example.com', 'WrongPass1@'),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('refresh', () => {
    it('should return a new access token on a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({ sub: mockUser.id, email: mockUser.email });
      usersService.findOneByEmail.mockResolvedValue(mockUser);
      jwtService.signAsync.mockResolvedValue('new.access.token');

      const result = await authService.refresh('valid.refresh.token');
      expect(result).toHaveProperty('accessToken');
    });

    it('should throw UnauthorizedException on invalid refresh token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));

      await expect(authService.refresh('bad.token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
