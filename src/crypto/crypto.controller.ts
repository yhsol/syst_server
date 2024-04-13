import { Controller, Get, Param, Post, Query } from '@nestjs/common';
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

  @Get('analyze')
  async triggerAnalysis(
    @Query('type') type: 'long-term' | 'short-term',
  ): Promise<string> {
    await this.cryptoService.performAnalysisAndNotify(type);
    return `Type ${type} analysis initiated and message sent to Telegram.`;
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

  @Get('currentPrice/:ticker')
  getCurrentPrice(@Param('ticker') ticker: string) {
    return this.cryptoService.currentPriceInfo(ticker);
  }

  @Get('coinsByValue')
  getCoinsByValue(
    @Param('coinsData') coinsData: CoinInfo,
    @Param('limit') limit: number,
  ) {
    return this.cryptoService.filterCoinsByValue(coinsData, limit);
  }

  @Get('coinsByRise')
  getCoinsByRise(
    @Param('coinsData') coinsData: CoinInfo,
    @Param('limit') limit: number,
  ) {
    return this.cryptoService.filterCoinsByRiseRate(coinsData, limit);
  }

  @Get('allCoinsCandlestick')
  getAllCoinsCandlestick(
    @Param('symbols') symbols: string[],
    @Param('chartIntervals') chartIntervals: ChartIntervals,
  ) {
    return this.cryptoService.fetchAllCandlestickData(symbols, chartIntervals);
  }

  @Get('commonCoins')
  getCommonCoins(
    @Param('symbols1') symbols1: string[],
    @Param('symbols2') symbols2: string[],
    @Param('filter') filter: 'rise' | 'value' = 'rise',
  ) {
    return this.cryptoService.findCommonCoins(symbols1, symbols2, filter);
  }

  @Get('continuousRisingCoins')
  getContinuousRisingCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
    @Param('minRisingCandles') minRisingCandles: number,
  ) {
    return this.cryptoService.filterContinuousRisingCoins(
      symbols,
      candlestickData,
      minRisingCandles,
    );
  }

  @Get('continuousGreenCandlesCoins')
  getContinuousGreenCandlesCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
    @Param('minGreenCandles') minGreenCandles: number,
  ) {
    return this.cryptoService.filterContinuousGreenCandles(
      symbols,
      candlestickData,
      minGreenCandles,
    );
  }

  @Get('continuousFallingCoins')
  getContinuousFallingCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
    @Param('minFallingCandles') minFallingCandles: number,
  ) {
    return this.cryptoService.filterContinuousFallingCoins(
      symbols,
      candlestickData,
      minFallingCandles,
    );
  }

  @Get('continuousRedCandlesCoins')
  getContinuousRedCandlesCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
    @Param('minRedCandles') minRedCandles: number,
  ) {
    return this.cryptoService.filterContinuousRedCandles(
      symbols,
      candlestickData,
      minRedCandles,
    );
  }

  @Get('volumeSpikeCoins')
  getVolumeSpikeCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
    @Param('volumeIncreaseFactor') volumeIncreaseFactor: number,
  ) {
    return this.cryptoService.filterVolumeSpikeCoins(
      symbols,
      candlestickData,
      volumeIncreaseFactor,
    );
  }

  @Get('goldenCrossCoins')
  getGoldenCrossCoins(
    @Param('symbols') symbols: string[],
    @Param('candlestickData') candlestickData: any,
  ) {
    return this.cryptoService.findGoldenCrossCoins(symbols, candlestickData);
  }

  @Get('assets')
  async getAssets() {
    const results = await this.cryptoService.filterValuableAssets();
    return results;
  }

  @Get('orderInfo')
  async getOrderInfo(@Query('orderCurrency') orderCurrency: string) {
    const results = await this.cryptoService.orderInfo(orderCurrency);
    return results;
  }

  @Get('tradeHistory')
  async getTradeHistory(
    @Query('orderCurrency') orderCurrency: string,
    @Query('paymentCurrency') paymentCurrency: string,
  ) {
    const results = await this.cryptoService.tradeHistory(
      orderCurrency,
      paymentCurrency,
    );
    return results;
  }

  @Get('profit')
  async profit() {
    const results = await this.cryptoService.calculateProfit();
    return results;
  }
}
