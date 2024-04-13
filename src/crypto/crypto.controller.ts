import { Controller, Get, Param, Post } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { ChartIntervals, CoinInfo } from './crypto.types';
import { BithumbWebSocketService } from 'src/bithumb-web-socket/bithumb-web-socket.service';

@Controller('crypto')
export class CryptoController {
  constructor(
    private readonly cryptoService: CryptoService,
    private readonly bithumbWebSocketService: BithumbWebSocketService,
  ) {
    console.log('CryptoController created');
  }

  // coinsData
  @Get('currentPrice/:ticker')
  getCurrentPrice(@Param('ticker') ticker: string) {
    return this.cryptoService.currentPriceInfo(ticker);
  }

  // coins by value
  @Get('coinsByValue')
  getCoinsByValue(
    @Param('coinsData') coinsData: CoinInfo,
    @Param('limit') limit: number,
  ) {
    return this.cryptoService.filterCoinsByValue(coinsData, limit);
  }

  // coins by rise
  @Get('coinsByRise')
  getCoinsByRise(
    @Param('coinsData') coinsData: CoinInfo,
    @Param('limit') limit: number,
  ) {
    return this.cryptoService.filterCoinsByRiseRate(coinsData, limit);
  }

  // fetch all coins candlestick
  @Get('allCoinsCandlestick')
  getAllCoinsCandlestick(
    @Param('symbols') symbols: string[],
    @Param('chartIntervals') chartIntervals: ChartIntervals,
  ) {
    return this.cryptoService.fetchAllCandlestickData(symbols, chartIntervals);
  }

  @Post('wsconnect')
  connectToWebSocket() {
    this.bithumbWebSocketService.connect();
    return { message: 'Connecting to Bithumb WebSocket...' };
  }

  @Post('wsclose')
  closeWebSocket() {
    this.bithumbWebSocketService.disconnect();
    return { message: 'Closing Bithumb WebSocket...' };
  }
}
