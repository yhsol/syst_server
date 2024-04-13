import { Test, TestingModule } from '@nestjs/testing';
import { BithumbWebSocketService } from './bithumb-web-socket.service';

describe('BithumbWebSocketService', () => {
  let service: BithumbWebSocketService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BithumbWebSocketService],
    }).compile();

    service = module.get<BithumbWebSocketService>(BithumbWebSocketService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
