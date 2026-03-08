import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let jwtService: { verifyAsync: jest.Mock };

    const mockRequestFactory = (authHeader?: string) => ({
        headers: { authorization: authHeader },
        user: undefined as any,
    });

    const mockContext = (request: object): ExecutionContext =>
        ({
            switchToHttp: () => ({
                getRequest: () => request,
            }),
        }) as unknown as ExecutionContext;

    beforeEach(async () => {
        jwtService = { verifyAsync: jest.fn() };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                JwtAuthGuard,
                { provide: JwtService, useValue: jwtService },
            ],
        }).compile();

        guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    });

    it('should return true and attach user on valid Bearer token', async () => {
        const payload = { sub: 'uuid-1', email: 'jane@example.com' };
        jwtService.verifyAsync.mockResolvedValue(payload);

        const request = mockRequestFactory('Bearer valid.token.here');
        const result = await guard.canActivate(mockContext(request));

        expect(result).toBe(true);
        expect((request as any).user).toEqual(payload);
    });

    it('should throw UnauthorizedException when Authorization header is missing', async () => {
        const request = mockRequestFactory(undefined);
        await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
            new UnauthorizedException('Missing token'),
        );
    });

    it('should throw UnauthorizedException when token type is not Bearer', async () => {
        const request = mockRequestFactory('Basic sometoken');
        await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
            UnauthorizedException,
        );
    });

    it('should throw UnauthorizedException when token is invalid or expired', async () => {
        jwtService.verifyAsync.mockRejectedValue(new Error('jwt expired'));
        const request = mockRequestFactory('Bearer bad.token');
        await expect(guard.canActivate(mockContext(request))).rejects.toThrow(
            new UnauthorizedException('Invalid or expired token'),
        );
    });
});
