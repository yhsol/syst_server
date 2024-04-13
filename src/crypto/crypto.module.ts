import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { BithumbWebSocketService } from 'src/bithumb-web-socket/bithumb-web-socket.service';

@Module({
  providers: [CryptoService, BithumbWebSocketService],
  controllers: [CryptoController],
})
export class CryptoModule {}
