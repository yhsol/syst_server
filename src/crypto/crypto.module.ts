import { Module } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoController } from './crypto.controller';
import { BithumbWebSocketService } from 'src/bithumb-web-socket/bithumb-web-socket.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  providers: [CryptoService, BithumbWebSocketService],
  controllers: [CryptoController],
  imports: [HttpModule],
})
export class CryptoModule {}
