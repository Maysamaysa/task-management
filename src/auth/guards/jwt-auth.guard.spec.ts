import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';

describe('JwtAuthGuard', () => {
    let guard: JwtAuthGuard;
    let jwtService: { verifyAsync: jest.Mock };

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

    it('should be defined', () => {
        expect(guard).toBeDefined();
    });

    describe('canActivate', () => {
        let context: ExecutionContext;
        let request: any;

        beforeEach(() => {
            request = {
                headers: {},
            };
            context = {
                switchToHttp: () => ({
                    getRequest: () => request,
                }),
            } as any;
        });

        it('should return true if token is valid', async () => {
            request.headers.authorization = 'Bearer valid_token';
            jwtService.verifyAsync.mockResolvedValue({ id: 'u1' });

            const result = await guard.canActivate(context);
            expect(result).toBe(true);
            expect(request['user']).toEqual({ id: 'u1' });
        });

        it('should throw UnauthorizedException if token is missing', async () => {
            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Missing token'),
            );
        });

        it('should throw UnauthorizedException if header is incorrect (no Bearer)', async () => {
            request.headers.authorization = 'Basic token';
            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Missing token'),
            );
        });

        it('should throw UnauthorizedException if token is invalid', async () => {
            request.headers.authorization = 'Bearer invalid_token';
            jwtService.verifyAsync.mockRejectedValue(new Error('Invalid token'));

            await expect(guard.canActivate(context)).rejects.toThrow(
                new UnauthorizedException('Invalid or expired token'),
            );
        });
    });
});
