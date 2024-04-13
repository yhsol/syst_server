export type PriceInfo = {
  acc_trade_value: string;
  acc_trade_value_24H: string;
  closing_price: string;
  fluctate_24H: string;
  fluctate_rate_24H: string;
  max_price: string;
  min_price: string;
  opening_price: string;
  prev_closing_price: string;
  units_traded: string;
  units_traded_24H: string;
};

export type CoinInfo = {
  symbol: string;
  data: PriceInfo;
};

export type ChartIntervals =
  | '1m'
  | '3m'
  | '5m'
  | '10m'
  | '30m'
  | '1h'
  | '6h'
  | '12h'
  | '24h';

export type DataObject = { [key: string]: string };
