import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { CoinInfo, DataObject, Price } from './crypto.types.js';
import { XCoinAPI } from 'src/lib/XCoinAPI';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

const DEFAULT_TICKER = 'ALL_KRW';
const TRADINGVIEW_BASE_URL = 'https://kr.tradingview.com/chart';

@Injectable()
export class CryptoService {
  private readonly api_key = process.env.BITHUMB_CON_KEY;
  private readonly api_secret = process.env.BITHUMB_SEC_KEY;
  private readonly xcoinAPI = new XCoinAPI(this.api_key, this.api_secret);

  constructor(private httpService: HttpService) {}

  formatTradingViewLink(coin: string) {
    return `[${coin}](${TRADINGVIEW_BASE_URL}/m0kspXtg/?symbol=BITHUMB%3A${coin}KRW)`;
  }

  async sendTelegramMessage(message: string): Promise<void> {
    const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_BOT_ID;

    const url = `https://api.telegram.org/bot${telegramBotToken}/sendMessage`;
    try {
      await lastValueFrom(
        this.httpService.post(url, {
          chat_id: chatId,
          text: message,
          parse_mode: 'Markdown',
        }),
      );
    } catch (error) {
      console.error('Telegram send error:', error);
    }
  }

  async generateShortTermAnalysisMessage(): Promise<string> {
    console.log('Starting short-term analysis...');

    const coinsData = await this.currentPriceInfo('ALL_KRW');
    const topValueCoins = await this.filterCoinsByValue(coinsData, 100);
    const topRiseCoins = await this.filterCoinsByRiseRate(coinsData, 100);

    const [oneMinuteCandlestickData, tenMinuteCandlestickData] =
      await Promise.all([
        this.fetchAllCandlestickData(topValueCoins, '1m'),
        this.fetchAllCandlestickData(topValueCoins, '10m'),
      ]);

    const commonCoins = await this.findCommonCoins(
      topValueCoins,
      topRiseCoins,
      'rise',
    );
    const oneMinuteRisingCoins = await this.filterContinuousRisingCoins(
      topValueCoins,
      oneMinuteCandlestickData,
      2,
    );
    const oneMinuteGreenCandlesCoins = await this.filterContinuousGreenCandles(
      topValueCoins,
      oneMinuteCandlestickData,
      2,
    );
    const oneMinuteRisingAndGreenCandlesCoins =
      oneMinuteGreenCandlesCoins.filter((coin) =>
        oneMinuteRisingCoins.includes(coin),
      );

    const risingCoins = await this.filterContinuousRisingCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      2,
    );
    const greenCandlesCoins = await this.filterContinuousGreenCandles(
      topValueCoins,
      tenMinuteCandlestickData,
      2,
    );
    const risingGreenCandlesCoins = greenCandlesCoins.filter((coin) =>
      risingCoins.includes(coin),
    );

    const fallingCoins = await this.filterContinuousFallingCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      2,
    );

    const redCandlesCoins = await this.filterContinuousRedCandles(
      topValueCoins,
      tenMinuteCandlestickData,
      2,
    );

    const fallingRedCandlesCoins = redCandlesCoins.filter((coin) =>
      fallingCoins.includes(coin),
    );

    const volumeSpikeCoins = await this.filterVolumeSpikeCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      1.5,
    );
    const oneMinuteGoldenCrossCoins = await this.findGoldenCrossCoins(
      topValueCoins,
      oneMinuteCandlestickData,
    );
    const tenMinuteGoldenCrossCoinsInTwo = await this.findGoldenCrossCoins(
      topValueCoins,
      tenMinuteCandlestickData,
      2,
      7,
      15,
    );

    const message = `
🐅 Sustainability - Short Term
🐅
🐅
🐅
🐅

🟢 *1분봉 지속 상승 + 지속 양봉* 🟢
${oneMinuteRisingAndGreenCandlesCoins
  .map(this.formatTradingViewLink)
  .join(', ')}
  
🟢 *10분봉 지속 상승 + 지속 양봉* 🟢
${risingGreenCandlesCoins.map(this.formatTradingViewLink).join(', ')}

🔴 *10분봉 지속 하락 + 지속 음봉* 🔴
${fallingRedCandlesCoins.map(this.formatTradingViewLink).join(', ')}

🌟 *1m Golden Cross* 🌟
${oneMinuteGoldenCrossCoins.map(this.formatTradingViewLink).join(', ')}

🌟 *10m Golden Cross* 🌟
${tenMinuteGoldenCrossCoinsInTwo.map(this.formatTradingViewLink).join(', ')}

📈 *지속 상승* 📈
${risingCoins.map(this.formatTradingViewLink).join(', ')}

📊 *지속 양봉* 📊
${greenCandlesCoins.map(this.formatTradingViewLink).join(', ')}

💹 *거래량 급증* 💹
${volumeSpikeCoins.map(this.formatTradingViewLink).join(', ')}

🔥 *거래량 + 상승률* 🔥
${commonCoins.slice(0, 20).map(this.formatTradingViewLink).join(', ')}

🐅
🐅
🐅
🐅
🐅    
`;

    return message;
  }

  async generateLongTermAnalysisMessage(): Promise<string> {
    console.log('Starting long-term analysis...');
    const coinsData = await this.currentPriceInfo('ALL_KRW');
    const topValueCoins = await this.filterCoinsByValue(coinsData, 100);

    const oneHourCandlestickData = await this.fetchAllCandlestickData(
      topValueCoins,
      '1h',
    );

    const oneHourGoldenCrossCoinsInTwo = await this.findGoldenCrossCoins(
      topValueCoins,
      oneHourCandlestickData,
      2,
      7,
      15,
    );

    const oneHourGoldenCrossCoinsInFive = await this.findGoldenCrossCoins(
      topValueCoins,
      oneHourCandlestickData,
      5,
      7,
      15,
    );

    const risingCoins = await this.filterContinuousRisingCoins(
      topValueCoins,
      oneHourCandlestickData,
      2,
    );
    const greenCandlesCoins = await this.filterContinuousGreenCandles(
      topValueCoins,
      oneHourCandlestickData,
      2,
    );
    const risingGreenCandlesCoins = greenCandlesCoins.filter((coin) =>
      risingCoins.includes(coin),
    );

    const fallingCoins = await this.filterContinuousFallingCoins(
      topValueCoins,
      oneHourCandlestickData,
      2,
    );
    const redCandlesCoins = await this.filterContinuousRedCandles(
      topValueCoins,
      oneHourCandlestickData,
      2,
    );
    const fallingRedCandlesCoins = redCandlesCoins.filter((coin) =>
      fallingCoins.includes(coin),
    );

    const message = `
🐅 Sustainability - Long Term
🐅
🐅
🐅
🐅

🌟 *1h Golden Cross in Two* 🌟
${oneHourGoldenCrossCoinsInTwo.map(this.formatTradingViewLink).join(', ')}

🌟 *1h Golden Cross in Five* 🌟
${oneHourGoldenCrossCoinsInFive
  // Remove coins that are already in the 2-hour golden cross list
  .filter((coin) => !oneHourGoldenCrossCoinsInTwo.includes(coin))
  .map(this.formatTradingViewLink)
  .join(', ')}

🟢 *지속 상승 + 지속 양봉* 🟢
${risingGreenCandlesCoins.map(this.formatTradingViewLink).join(', ')}

🔴 *지속 하락 + 지속 음봉* 🔴
${fallingRedCandlesCoins.map(this.formatTradingViewLink).join(', ')}

🐅
🐅
🐅
🐅
🐅
`;

    return message;
  }

  async performAnalysisAndNotify(
    type: 'long-term' | 'short-term',
  ): Promise<void> {
    console.log('Starting analysis... Type:', type);
    const message =
      type === 'long-term'
        ? await this.generateLongTermAnalysisMessage()
        : await this.generateShortTermAnalysisMessage();

    console.log('Generated message: ', !!message);
    await this.sendTelegramMessage(message);
    console.log('Message sent to Telegram successfully.');
  }

  async currentPriceInfo(ticker = DEFAULT_TICKER) {
    const options = {
      method: 'GET',
      url: `https://api.bithumb.com/public/ticker/${ticker}`,
      headers: { accept: 'application/json' },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async orderbookInfo(ticker = DEFAULT_TICKER) {
    const options = {
      method: 'GET',
      url: `https://api.bithumb.com/public/orderbook/${ticker}`,
      headers: { accept: 'application/json' },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async recentTransactions(ticker = 'BTC_KRW') {
    const options = {
      method: 'GET',
      url: `https://api.bithumb.com/public/transaction_history/${ticker}`,
      headers: { accept: 'application/json' },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async accountInfo() {
    const rgParams = {
      order_currency: 'BTC',
      payment_currency: 'KRW',
    };

    try {
      const res = (await this.xcoinAPI.xcoinApiCall(
        '/info/account',
        rgParams,
      )) as any;
      return res.body;
    } catch (error) {
      console.error('error???: ', error);
    }
  }

  filterPositiveTotals = (data: DataObject): DataObject => {
    const result: DataObject = {};

    // 객체의 각 키-값 쌍을 순회
    Object.keys(data).forEach((key) => {
      if (key.startsWith('total_') && parseFloat(data[key]) > 0) {
        result[key] = data[key];
      }
    });

    return result;
  };

  parseJSON(jsonString: string): any {
    try {
      return JSON.parse(jsonString);
    } catch (error) {
      console.error('JSON 파싱 중 에러 발생:', error);
      return null;
    }
  }

  async balance(currency = 'ALL') {
    const rgParams = {
      currency,
    };

    try {
      const res = (await this.xcoinAPI.xcoinApiCall(
        '/info/balance',
        rgParams,
      )) as any;
      const data = this.parseJSON(res.body);

      if (!data) {
        console.error('JSON 파싱 실패');
        return null;
      }

      return this.filterPositiveTotals(data.data);
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async filterValuableAssets(): Promise<{
    [key: string]: {
      quantity: number;
      currentPrice: number;
      totalValue: number;
    };
  }> {
    const balances = await this.balance();
    const valuableAssets = {};

    for (const [key, value] of Object.entries(balances)) {
      if (!key.startsWith('total_')) continue;
      const ticker = key.replace('total_', '').toUpperCase();
      const prices = await this.currentPriceInfo(ticker);

      if (!prices || !prices.data) {
        console.error('Failed to fetch current price:', prices);
        continue;
      }

      const quantity = parseFloat(value);
      const currentPrice = parseFloat(prices.data.closing_price);
      const totalValue = quantity * currentPrice;

      if (totalValue >= 1000) {
        // 1천원 이상인 자산만 추출
        valuableAssets[ticker] = {
          quantity,
          currentPrice,
          totalValue,
        };
      }
    }

    return valuableAssets;
  }

  async recentTransactionsInfo(orderCurrency = 'BTC') {
    const endPoint = '/info/ticker';

    const encodedParams = new URLSearchParams();
    encodedParams.set('order_currency', orderCurrency);
    encodedParams.set('payment_currency', 'KRW');

    const rgParams = {
      order_currency: orderCurrency,
      payment_currency: 'KRW',
    };

    const options = {
      method: 'POST',
      url: `https://api.bithumb.com${endPoint}`,
      headers: this.xcoinAPI._getHttpHeaders(
        endPoint,
        rgParams,
        this.api_key,
        this.api_secret,
      ),
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error(error);
    }
  }

  async orderInfo(orderCurrency = 'BTC') {
    const endPoint = '/info/orders';

    const encodedParams = new URLSearchParams();
    encodedParams.set('order_currency', orderCurrency);

    const rgParams = {
      order_currency: orderCurrency,
    };

    const options = {
      method: 'POST',
      url: `https://api.bithumb.com${endPoint}`,
      headers: this.xcoinAPI._getHttpHeaders(
        endPoint,
        rgParams,
        this.api_key,
        this.api_secret,
      ),
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async orderDetailInfo(orderId: string, orderCurrency = 'BTC') {
    const endPoint = '/info/order_detail';

    const encodedParams = new URLSearchParams();
    encodedParams.set('order_id', orderId);
    encodedParams.set('order_currency', orderCurrency);

    const rgParams = {
      order_id: orderId,
      order_currency: orderCurrency,
    };

    const options = {
      method: 'POST',
      url: `https://api.bithumb.com${endPoint}`,
      headers: this.xcoinAPI._getHttpHeaders(
        endPoint,
        rgParams,
        this.api_key,
        this.api_secret,
      ),
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async tradeHistory(orderCurrency = 'BTC', paymentCurrency = 'KRW') {
    const endPoint = '/info/user_transactions';

    const encodedParams = new URLSearchParams();
    encodedParams.set('order_currency', orderCurrency);
    encodedParams.set('payment_currency', paymentCurrency);

    const rgParams = {
      order_currency: orderCurrency,
      payment_currency: paymentCurrency,
    };

    const options = {
      method: 'POST',
      url: `https://api.bithumb.com${endPoint}`,
      headers: this.xcoinAPI._getHttpHeaders(
        endPoint,
        rgParams,
        this.api_key,
        this.api_secret,
      ),
      data: encodedParams,
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async candlestick(
    orderCurrency = 'BTC',
    paymentCurrency = 'KRW',
    chartIntervals = '24h',
  ) {
    const options = {
      method: 'GET',
      url: `https://api.bithumb.com/public/candlestick/${orderCurrency}_${paymentCurrency}/${chartIntervals}`,
      headers: { accept: 'application/json' },
    };

    try {
      const response = await axios.request(options);
      return response.data;
    } catch (error) {
      console.error('error: ', error);
    }
  }

  async fetchAllCandlestickData(symbols: string[], chartIntervals = '1h') {
    const candlestickData = {};

    for (const symbol of symbols) {
      const data = await this.candlestick(symbol, 'KRW', chartIntervals);
      candlestickData[symbol] = data;
    }

    return candlestickData;
  }

  async filterCoinsByValue(coinsData: CoinInfo, limit = 100) {
    const coins = Object.entries(coinsData.data)
      .map(([key, value]) => ({
        symbol: key,
        tradeVolume: parseFloat(value['units_traded_24H']),
        tradeValue: parseFloat(value['acc_trade_value_24H']),
        data: value,
      }))
      .filter((coin) => !isNaN(coin.tradeVolume) && !isNaN(coin.tradeValue));

    // 거래량 또는 거래대금 기준으로 정렬하고 상위 100개 코인을 반환
    // const sortedByVolume = [...coins]
    //   .sort((a, b) => b.tradeVolume - a.tradeVolume)
    //   .slice(0, 100);
    const sortedByValue = [...coins]
      .sort((a, b) => b.tradeValue - a.tradeValue)
      .slice(0, limit);

    return sortedByValue.map((coin) => coin.symbol);
  }

  async filterCoinsByRiseRate(coinsData: CoinInfo, limit = 100) {
    const coinsArray = Object.entries(coinsData.data)
      .map(([key, value]) => ({
        symbol: key,
        openPrice: parseFloat(value['opening_price']),
        closePrice: parseFloat(value['closing_price']),
        data: value,
      }))
      .filter((coin) => !isNaN(coin.openPrice) && !isNaN(coin.closePrice));

    const coinsArrayWithRiseRate = coinsArray.map((coin) => {
      const riseRate = (coin.closePrice - coin.openPrice) / coin.openPrice;
      return {
        ...coin,
        riseRate,
      };
    });

    const sortedByRiseRate = [...coinsArrayWithRiseRate]
      .sort((a, b) => b.riseRate - a.riseRate)
      .slice(0, limit);

    return sortedByRiseRate.map((coin) => coin.symbol);
  }

  async findCommonCoins(
    byValueSymbols: string[],
    byRiseSymbols: string[],
    filter = 'rise',
  ) {
    // 겹치는 심볼 찾기
    const commonSymbols = byValueSymbols.filter((symbol) =>
      byRiseSymbols.includes(symbol),
    );

    const base = filter === 'value' ? byValueSymbols : byRiseSymbols;

    // 겹치는 심볼을 가진 코인 정보 반환
    const commonCoins = base.filter((symbol) => commonSymbols.includes(symbol));
    return commonCoins;
  }

  async filterContinuousRisingCoins(
    symbols: string[],
    candlestickData: any,
    minRisingCandles = 3,
  ) {
    let risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];

        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= minRisingCandles
        ) {
          const candles = candleData.data.slice(-minRisingCandles - 1); // 연속 상승을 판단하기 위한 최소 캔들 수 + 1
          let isRising = true; // 현재 코인이 연속 상승 중인지 판단하는 플래그

          // 첫 번째 캔들을 제외하고 나머지 캔들을 순회하며 연속 상승 판단
          for (let i = 1; i < candles.length; i++) {
            if (parseFloat(candles[i][2]) <= parseFloat(candles[i - 1][2])) {
              // 종가가 이전 캔들의 종가보다 낮거나 같으면
              isRising = false; // 연속 상승이 아님
              break;
            }
          }

          if (isRising) {
            risingCoins.push(symbol); // 연속 상승 중인 코인 추가
          }
        }
      }
    } catch (error) {
      risingCoins = ['error_filterContinuousRisingCoins'];
    }

    return risingCoins;
  }

  async filterContinuousFallingCoins(
    symbols: string[],
    candlestickData: any,
    minFallingCandles = 3,
  ) {
    let fallingCoins = []; // 연속 하락 중인 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= minFallingCandles
        ) {
          const candles = candleData.data.slice(-minFallingCandles); // 연속 하락을 판단하기 위한 최소 캔들 수
          let isFalling = true; // 현재 코인이 연속 하락 중인지 판단하는 플래그

          // 캔들을 순회하며 연속 하락 판단
          for (let i = 1; i < candles.length; i++) {
            if (parseFloat(candles[i][2]) >= parseFloat(candles[i - 1][2])) {
              // 종가가 이전 캔들의 종가보다 높거나 같으면
              isFalling = false; // 연속 하락이 아님
              break;
            }
          }

          if (isFalling) {
            fallingCoins.push(symbol); // 연속 하락 중인 코인 추가
          }
        }
      }
    } catch (error) {
      fallingCoins = ['error_filterContinuousFallingCoins'];
    }

    return fallingCoins;
  }

  async filterContinuousGreenCandles(
    symbols: string[],
    candlestickData: any,
    minGreenCandles = 3,
  ) {
    let greenCandlesCoins = []; // 연속 양봉 중인 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= minGreenCandles
        ) {
          const recentCandles = candleData.data.slice(-minGreenCandles); // 최근 캔들 데이터
          const isAllGreen = recentCandles.every((candle) => {
            const openPrice = parseFloat(candle[1]);
            const closePrice = parseFloat(candle[2]);
            return closePrice > openPrice; // 종가가 시가보다 높은 경우 양봉
          });

          if (isAllGreen) {
            greenCandlesCoins.push(symbol); // 연속 양봉 중인 코인 추가
          }
        }
      }
    } catch (error) {
      greenCandlesCoins = ['error_filterContinuousGreenCandles'];
    }

    return greenCandlesCoins;
  }

  async filterContinuousRedCandles(
    symbols: string[],
    candlestickData: any,
    minRedCandles = 3,
  ) {
    let redCandlesCoins = []; // 연속 음봉 중인 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= minRedCandles
        ) {
          const recentCandles = candleData.data.slice(-minRedCandles); // 최근 캔들 데이터
          const isAllRed = recentCandles.every((candle) => {
            const openPrice = parseFloat(candle[1]);
            const closePrice = parseFloat(candle[2]);
            return closePrice < openPrice; // 종가가 시가보다 낮은 경우 음봉
          });

          if (isAllRed) {
            redCandlesCoins.push(symbol); // 연속 음봉 중인 코인 추가
          }
        }
      }
    } catch (error) {
      redCandlesCoins = ['error_filterContinuousRedCandles'];
    }

    return redCandlesCoins;
  }

  async filterVolumeSpikeCoins(
    symbols: string[],
    candlestickData: any,
    volumeIncreaseFactor = 1.5,
  ) {
    let volumeSpikeCoins = []; // 거래량이 급증한 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= 8
        ) {
          const recentCandles = candleData.data.slice(-8); // 최근 8개의 캔들 데이터
          const volumes = recentCandles.map((candle) => parseFloat(candle[5])); // 각 캔들의 거래량

          // EMA 계산
          const emaVolumes = this.calculateEMA(volumes, 3); // 짧은 기간 EMA
          const averageVolume = emaVolumes[emaVolumes.length - 1]; // 가장 최근 EMA 값

          // 마지막 캔들 거래량이 EMA 대비 지정된 배수 이상인지 확인
          const lastVolume = volumes[volumes.length - 1];
          if (lastVolume > averageVolume * volumeIncreaseFactor) {
            const maxVolume = Math.max(...volumes);
            volumeSpikeCoins.push({ symbol, maxVolume }); // 거래량 급증 코인 추가 (최대 거래량 포함)
          }
        }
      }

      // 최대 거래량을 기준으로 코인들을 정렬
      volumeSpikeCoins.sort((a, b) => b.maxVolume - a.maxVolume);

      // 코인 심볼만 배열로 추출
      volumeSpikeCoins = volumeSpikeCoins.map((coin) => coin.symbol);
    } catch (error) {
      console.error('Error in filterVolumeSpikeCoins:', error);
      volumeSpikeCoins = ['error_filterVolumeSpikeCoins'];
    }

    console.log('server => volumeSpikeCoins: ', volumeSpikeCoins);
    return volumeSpikeCoins;
  }

  calculateEMA(data: any, period: number) {
    const ema = [];
    const k = 2 / (period + 1);
    // 첫 EMA는 단순 평균 사용
    const emaBase =
      data.slice(0, period).reduce((acc, val) => acc + val, 0) / period;
    ema.push(emaBase);

    // 이후 EMA 계산
    for (let i = period; i < data.length; i++) {
      ema.push(data[i] * k + ema[ema.length - 1] * (1 - k));
    }

    return ema;
  }

  async findGoldenCrossCoins(
    symbols: string[],
    candlestickData: any,
    candleCount = 10,
    shortPeriod = 50,
    longPeriod = 200,
  ) {
    let goldenCrossCoins = [];

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (candleData.status !== '0000' || !candleData.data) {
          continue; // 데이터가 유효하지 않은 경우 건너뛰기
        }

        const closingPrices = candleData.data.map((candle) =>
          parseFloat(candle[2]),
        ); // 종가 데이터 추출
        const shortPeriodMa = this.calculateMovingAverage(
          closingPrices,
          shortPeriod,
        ); // {shortPeriod}분 이동평균 계산
        const longPeriodMa = this.calculateMovingAverage(
          closingPrices,
          longPeriod,
        ); // {longPeriod}분 이동평균 계산

        // 골든크로스 확인
        for (
          let i = closingPrices.length - candleCount;
          i < closingPrices.length;
          i++
        ) {
          if (
            shortPeriodMa[i] > longPeriodMa[i] &&
            shortPeriodMa[i - 1] <= longPeriodMa[i - 1]
          ) {
            goldenCrossCoins.push(symbol);
            break; // 최근 {candleCount}개 캔들 내 골든크로스 발견 시 추가하고 다음 코인으로 넘어감
          }
        }
      }
    } catch (error) {
      goldenCrossCoins = ['error_findGoldenCrossCoins'];
    }

    return goldenCrossCoins; // 골든크로스가 발생한 코인 리스트 반환
  }

  async lowToHigh(
    symbols: string[],
    candlestickData: any,
    minRisingCandles = 5,
  ) {
    let risingCoins = []; // 연속 상승 중인 코인들을 저장할 배열

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= minRisingCandles
        ) {
          const firstCandle = candleData.data[0]; // 첫 번째 캔들
          const lastCandle = candleData.data[candleData.data.length - 1]; // 마지막 캔들

          // 첫 번째 캔들의 시가보다 마지막 캔들의 종가가 높은 경우
          if (parseFloat(lastCandle[2]) > parseFloat(firstCandle[2])) {
            risingCoins.push(symbol); // 조건에 맞는 코인 추가
          }
        }
      }
    } catch (error) {
      risingCoins = ['error_lowToHigh'];
    }

    return risingCoins;
  }

  async filterBullishEngulfing(symbols: string[], candlestickData: any) {
    let bullishEngulfingCoins = [];

    try {
      for (const symbol of symbols) {
        const candleData = candlestickData[symbol];
        if (
          candleData.status === '0000' &&
          candleData.data &&
          candleData.data.length >= 2
        ) {
          const lastCandle = candleData.data[candleData.data.length - 1];
          const secondLastCandle = candleData.data[candleData.data.length - 2];

          const lastOpen = parseFloat(lastCandle[1]);
          const lastClose = parseFloat(lastCandle[2]);
          const secondLastOpen = parseFloat(secondLastCandle[1]);
          const secondLastClose = parseFloat(secondLastCandle[2]);

          // 불리시 엔가프 조건 확인
          if (
            secondLastOpen > secondLastClose &&
            lastOpen < lastClose &&
            lastOpen < secondLastClose &&
            lastClose > secondLastOpen
          ) {
            bullishEngulfingCoins.push(symbol);
          }
        }
      }
    } catch (error) {
      console.error('Error in filterBullishEngulfing:', error);
      bullishEngulfingCoins = ['error_filterBullishEngulfing'];
    }

    console.log('server => bullishEngulfingCoins: ', bullishEngulfingCoins);
    return bullishEngulfingCoins;
  }

  // 매매와 관련된 메소드들
  calculateMovingAverage(prices, period) {
    return prices.map((val, idx, arr) => {
      if (idx < period - 1) return null; // 이동평균을 계산할 수 없는 경우 null 반환
      let sum = 0;
      for (let i = idx; i > idx - period; i--) {
        sum += arr[i];
      }
      return sum / period;
    });
  }

  async calculateProfit(): Promise<{
    [key: string]: {
      averageBuyPrice: number;
      currentPrice: number;
      profit: string;
      quantity: number;
      totalValue: number;
    };
  }> {
    const assets = await this.filterValuableAssets();
    const results = {};

    for (const [key, value] of Object.entries(assets)) {
      const averageBuyPrice = await this.getAverageBuyPrice(key); // 평균 매수가 계산 메소드

      if (averageBuyPrice === 0) {
        console.error('Failed to calculate average buy price:', key);
        continue;
      }

      const prices: Price = await this.currentPriceInfo(key);

      if (prices.status !== '0000' || !prices.data) {
        console.error('Failed to fetch current price:', prices);
        continue;
      }

      const currentPrice = parseFloat(prices.data.closing_price);

      const profit = ((currentPrice - averageBuyPrice) / averageBuyPrice) * 100;
      results[key] = {
        averageBuyPrice,
        currentPrice,
        profit: profit.toFixed(2) + '%',
        ...value,
      };
    }

    return results;
  }

  // TODO: 오차가 있음. 수정 필요
  async getAverageBuyPrice(symbol: string): Promise<number> {
    // 매수 거래 내역 조회
    const response = await this.tradeHistory(symbol, 'KRW');
    if (!response || response.status !== '0000' || !response.data) {
      return 0;
    }

    // 매수 완료된 거래만 필터링
    const buys = response.data.filter((item) => item.search === '1');
    let totalSpent = 0;
    let totalUnits = 0;

    // 매수 거래의 총 지출 금액과 총 매수 수량 계산
    for (const buy of buys) {
      totalSpent += parseFloat(buy.price) * parseFloat(buy.units);
      totalUnits += parseFloat(buy.units);
    }

    // 평균 매수가 계산
    return totalUnits > 0 ? totalSpent / totalUnits : 0;
  }
}
