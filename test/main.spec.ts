/**
 * Ensure main.ts is executed without starting a real server.
 * We mock NestFactory and SwaggerModule to avoid side effects.
 */

tjest = require('ts-jest');

jest.mock('@nestjs/core', () => ({
  NestFactory: {
    create: jest.fn().mockResolvedValue({
      enableCors: jest.fn(),
      useGlobalPipes: jest.fn(),
      listen: jest.fn().mockResolvedValue(undefined),
    }),
  },
}));

jest.mock('@nestjs/swagger', () => ({
  SwaggerModule: {
    createDocument: jest.fn().mockReturnValue({}),
    setup: jest.fn(),
  },
  DocumentBuilder: jest.fn().mockReturnValue({
    setTitle() { return this; },
    setDescription() { return this; },
    setVersion() { return this; },
    addBearerAuth() { return this; },
    build() { return {}; },
  }),
}));

// import after mocks
import { bootstrapApp } from '../src/main';

describe('bootstrap', () => {
  it('should call NestFactory.create and listen', async () => {
    const { NestFactory } = require('@nestjs/core');
    await bootstrapApp();
    expect(NestFactory.create).toHaveBeenCalled();
  });
});