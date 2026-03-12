import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  let appService: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        {
          provide: AppService,
          useValue: {
            getHello: jest.fn().mockReturnValue('Api is running!'),
          },
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService);
  });

  describe('root', () => {
    it('should return api running message', () => {
      expect(appController.getHello()).toBe('Api is running!');
      expect(appService.getHello).toHaveBeenCalled();
    });
  });

  describe('constructor', () => {
    it('should be defined when compiled directly', () => {
      const mockAppService = { getHello: jest.fn() } as any;
      const controller = new AppController(mockAppService);
      expect(controller).toBeDefined();
    });
  });
});
