import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CryptoModule } from './crypto/crypto.module';
import { BithumbWebSocketModule } from './bithumb-web-socket/bithumb-web-socket.module';
import { BithumbWebSocketService } from './bithumb-web-socket/bithumb-web-socket.service';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    CryptoModule,
    BithumbWebSocketModule,
  ],
  controllers: [AppController],
  providers: [AppService, BithumbWebSocketService],
})
export class AppModule {}
