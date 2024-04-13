import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { BithumbWebSocketModule } from './bithumb-web-socket/bithumb-web-socket.module';
import { BithumbWebSocketService } from './bithumb-web-socket/bithumb-web-socket.service';

@Module({
  imports: [CryptoModule, BithumbWebSocketModule],
  controllers: [AppController],
  providers: [AppService, BithumbWebSocketService],
})
export class AppModule {}
