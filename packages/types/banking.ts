export interface Banking {
  accessToken: string;
  itemId: string;
  transactionCursor?: string;
  // sub collection
  transactions?: Transaction[];
}

export interface Transaction {
  transactionId: string;
  amount: number;
  date: number;
  currency: Currency | null;
  name: string;
  category: {
    confidence: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
    primary: string | null;
    detailed: string | null;
  };
  merchant: {
    name: string | null;
    website: string | null;
  };
  // channel:
  //   | "ATM"
  //   | "DEBIT"
  //   | "CREDIT"
  //   | "TRANSFER"
  //   | "CASH"
  //   | "IN_STORE"
  //   | "OTHER";
  location: {
    address: string | null;
    city: string | null;
    country: string | null;
    postalCode: string | null;
    region: string | null;
    storeNumber: string | null;
    lat: number | null;
    lon: number | null;
  };

  // Raw data received from the provider
  raw: {
    provider: "plaid";
    data: any;
  };
}

export type Currency = "USD" | "GBP" | "EUR";
