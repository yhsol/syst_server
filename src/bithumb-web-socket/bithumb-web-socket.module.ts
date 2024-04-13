import { Module } from '@nestjs/common';
import { BithumbWebSocketService } from './bithumb-web-socket.service';

@Module({
  providers: [BithumbWebSocketService]
})
export class BithumbWebSocketModule {}
