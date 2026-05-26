import yfinance as yf
from ..normalization.schemas import OHLCV, BalanceSheet, IncomeStatement
from .base import MarketDataProvider

class YahooFinanceProvider(MarketDataProvider):
    async def get_ohlcv(self, ticker, start, end):
        ticker_obj = yf.Ticker(ticker)
        df = ticker_obj.history(start=start, end=end)
        ohlcv_list = []
        for idx, row in df.iterrows():
            ohlcv_list.append(OHLCV(
                ticker=ticker,
                date=idx.date(),
                open=row['Open'],
                high=row['High'],
                low=row['Low'],
                close=row['Close'],
                volume=row['Volume'],
                adjusted_close=row.get('Adj Close'),
                currency='USD'
            ))
        return ohlcv_list

    async def get_balance_sheet(self, ticker):
        t = yf.Ticker(ticker)
        bs = t.balance_sheet
        # ... parse and return BalanceSheet model