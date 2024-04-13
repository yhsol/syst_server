import { Injectable } from '@nestjs/common';
import * as WebSocket from 'ws';

type ConnectionResponse = {
  status: string;
  resmsg: string;
};

type ReceivedDataFromSocket = {
  type: string;
  content: {
    volumePower: string;
    chgAmt: string;
    chgRate: string;
    prevClosePrice: string;
    buyVolume: string;
    sellVolume: string;
    volume: string;
    value: string;
    highPrice: string;
    lowPrice: string;
    closePrice: string;
    openPrice: string;
    time: string;
    date: string;
    tickType: string;
    symbol: string;
  };
};

@Injectable()
export class BithumbWebSocketService {
  private ws: WebSocket;

  constructor() {
    // this.connect();
  }

  public connect() {
    this.ws = new WebSocket('wss://pubwss.bithumb.com/pub/ws');

    this.ws.on('open', () => {
      console.log('Connected to Bithumb WebSocket Server!');
      this.subscribeToTopics();
    });

    this.ws.on('message', (data) => {
      const parsed = JSON.parse(data.toString()) as
        | ConnectionResponse
        | ReceivedDataFromSocket;

      // connection response
      if (parsed instanceof Object && 'status' in parsed) {
        console.log(
          'Received connection response:',
          parsed.status,
          parsed.resmsg,
        );
      }

      // received content
      if (parsed instanceof Object && 'content' in parsed) {
        console.log(
          'Received message:',
          parsed.content.symbol,
          parsed.content.closePrice,
        );
      }
    });

    this.ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      console.log('Disconnected from Bithumb WebSocket');
    }
  }

  private subscribeToTopics() {
    const message = JSON.stringify({
      type: 'ticker',
      symbols: ['BTC_KRW', 'ETH_KRW'],
      tickTypes: ['30M', '1H', '12H', '24H', 'MID'],
    });

    this.ws.send(message);
  }
}
