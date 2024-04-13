import { Injectable } from '@nestjs/common';
import axios from 'axios';

import { CoinInfo, DataObject } from './crypto.types.js';
import { XCoinAPI } from 'src/lib/XCoinAPI';

const DEFAULT_TICKER = 'ALL_KRW';

@Injectable()
export class CryptoService {
  private readonly api_key = process.env.BITHUMB_CON_KEY;
  private readonly api_secret = process.env.BITHUMB_SEC_KEY;
  private readonly xcoinAPI = new XCoinAPI(this.api_key, this.api_secret);

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
        console.log('log=> candleData: ', candleData);

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

    console.log('server => risingCoins: ', risingCoins);
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

    console.log('server => fallingCoins: ', fallingCoins);
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

    console.log('server => greenCandlesCoins: ', greenCandlesCoins);
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

    console.log('server => redCandlesCoins: ', redCandlesCoins);
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

          // 최대 거래량 캔들 찾기
          const maxVolume = Math.max(...volumes);
          const averageVolume =
            volumes.slice(0, 5).reduce((acc, val) => acc + val, 0) / 5; // 첫 5개 캔들의 평균 거래량

          // 마지막 세 개 캔들 중 하나라도 평균의 {volumeIncreaseFactor}배 이상인 경우 확인
          const hasVolumeSpike = volumes
            .slice(-3)
            .some((volume) => volume > averageVolume * volumeIncreaseFactor);

          if (hasVolumeSpike) {
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

    console.log('server => goldenCrossCoins: ', goldenCrossCoins);
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
}
