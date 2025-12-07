// ============================================
// Shared Symbol Definitions
// ============================================

export interface SymbolInfo {
	value: string;
	label: string;
	category?: string;
}

// ============================================
// CONTRACT SPECIFICATIONS
// Used for accurate P&L calculations
// ============================================

export interface ContractSpec {
	symbol: string;
	pointValue: number; // Dollar value per 1 point move
	tickSize: number; // Minimum price increment
	tickValue: number; // Dollar value per tick
	currency: string; // Settlement currency
}

// Futures contract specifications (CME/CBOT/NYMEX/COMEX)
export const FUTURES_CONTRACT_SPECS: Record<string, ContractSpec> = {
	// === EQUITIES ===
	ES: {
		symbol: "ES",
		pointValue: 50,
		tickSize: 0.25,
		tickValue: 12.5,
		currency: "USD",
	},
	NQ: {
		symbol: "NQ",
		pointValue: 20,
		tickSize: 0.25,
		tickValue: 5.0,
		currency: "USD",
	},
	YM: {
		symbol: "YM",
		pointValue: 5,
		tickSize: 1,
		tickValue: 5.0,
		currency: "USD",
	},
	RTY: {
		symbol: "RTY",
		pointValue: 50,
		tickSize: 0.1,
		tickValue: 5.0,
		currency: "USD",
	},
	// Micro Equities (1/10th of standard)
	MES: {
		symbol: "MES",
		pointValue: 5,
		tickSize: 0.25,
		tickValue: 1.25,
		currency: "USD",
	},
	MNQ: {
		symbol: "MNQ",
		pointValue: 2,
		tickSize: 0.25,
		tickValue: 0.5,
		currency: "USD",
	},
	MYM: {
		symbol: "MYM",
		pointValue: 0.5,
		tickSize: 1,
		tickValue: 0.5,
		currency: "USD",
	},
	M2K: {
		symbol: "M2K",
		pointValue: 5,
		tickSize: 0.1,
		tickValue: 0.5,
		currency: "USD",
	},
	// International
	NKD: {
		symbol: "NKD",
		pointValue: 5,
		tickSize: 5,
		tickValue: 25.0,
		currency: "USD",
	},

	// === ENERGY ===
	CL: {
		symbol: "CL",
		pointValue: 1000,
		tickSize: 0.01,
		tickValue: 10.0,
		currency: "USD",
	},
	MCL: {
		symbol: "MCL",
		pointValue: 100,
		tickSize: 0.01,
		tickValue: 1.0,
		currency: "USD",
	},
	NG: {
		symbol: "NG",
		pointValue: 10000,
		tickSize: 0.001,
		tickValue: 10.0,
		currency: "USD",
	},
	MNG: {
		symbol: "MNG",
		pointValue: 1000,
		tickSize: 0.001,
		tickValue: 1.0,
		currency: "USD",
	},

	// === METALS ===
	GC: {
		symbol: "GC",
		pointValue: 100,
		tickSize: 0.1,
		tickValue: 10.0,
		currency: "USD",
	},
	MGC: {
		symbol: "MGC",
		pointValue: 10,
		tickSize: 0.1,
		tickValue: 1.0,
		currency: "USD",
	},
	SI: {
		symbol: "SI",
		pointValue: 5000,
		tickSize: 0.005,
		tickValue: 25.0,
		currency: "USD",
	},
	SIL: {
		symbol: "SIL",
		pointValue: 1000,
		tickSize: 0.005,
		tickValue: 5.0,
		currency: "USD",
	},

	// === CURRENCIES (Futures) ===
	"6A": {
		symbol: "6A",
		pointValue: 100000,
		tickSize: 0.0001,
		tickValue: 10.0,
		currency: "USD",
	},
	"6B": {
		symbol: "6B",
		pointValue: 62500,
		tickSize: 0.0001,
		tickValue: 6.25,
		currency: "USD",
	},
	"6C": {
		symbol: "6C",
		pointValue: 100000,
		tickSize: 0.0001,
		tickValue: 10.0,
		currency: "USD",
	},
	"6E": {
		symbol: "6E",
		pointValue: 125000,
		tickSize: 0.0001,
		tickValue: 12.5,
		currency: "USD",
	},
	"6J": {
		symbol: "6J",
		pointValue: 12500000,
		tickSize: 0.0000005,
		tickValue: 6.25,
		currency: "USD",
	},
	"6M": {
		symbol: "6M",
		pointValue: 500000,
		tickSize: 0.00001,
		tickValue: 5.0,
		currency: "USD",
	},
	"6N": {
		symbol: "6N",
		pointValue: 100000,
		tickSize: 0.0001,
		tickValue: 10.0,
		currency: "USD",
	},
	"6S": {
		symbol: "6S",
		pointValue: 125000,
		tickSize: 0.0001,
		tickValue: 12.5,
		currency: "USD",
	},
	// Micro Currencies
	M6A: {
		symbol: "M6A",
		pointValue: 10000,
		tickSize: 0.0001,
		tickValue: 1.0,
		currency: "USD",
	},
	M6B: {
		symbol: "M6B",
		pointValue: 6250,
		tickSize: 0.0001,
		tickValue: 0.625,
		currency: "USD",
	},
	M6E: {
		symbol: "M6E",
		pointValue: 12500,
		tickSize: 0.0001,
		tickValue: 1.25,
		currency: "USD",
	},
	MCD: {
		symbol: "MCD",
		pointValue: 10000,
		tickSize: 0.0001,
		tickValue: 1.0,
		currency: "USD",
	},
	MSF: {
		symbol: "MSF",
		pointValue: 12500,
		tickSize: 0.0001,
		tickValue: 1.25,
		currency: "USD",
	},
	MBT: {
		symbol: "MBT",
		pointValue: 0.1,
		tickSize: 5,
		tickValue: 0.5,
		currency: "USD",
	}, // 0.1 BTC

	// === INTEREST RATES ===
	ZB: {
		symbol: "ZB",
		pointValue: 1000,
		tickSize: 0.03125,
		tickValue: 31.25,
		currency: "USD",
	}, // 1/32
	ZN: {
		symbol: "ZN",
		pointValue: 1000,
		tickSize: 0.015625,
		tickValue: 15.625,
		currency: "USD",
	}, // 1/64
	ZF: {
		symbol: "ZF",
		pointValue: 1000,
		tickSize: 0.0078125,
		tickValue: 7.8125,
		currency: "USD",
	}, // 1/128
	ZT: {
		symbol: "ZT",
		pointValue: 2000,
		tickSize: 0.0078125,
		tickValue: 15.625,
		currency: "USD",
	},
	TN: {
		symbol: "TN",
		pointValue: 1000,
		tickSize: 0.015625,
		tickValue: 15.625,
		currency: "USD",
	},
	UB: {
		symbol: "UB",
		pointValue: 1000,
		tickSize: 0.03125,
		tickValue: 31.25,
		currency: "USD",
	},

	// === AGRICULTURE ===
	ZC: {
		symbol: "ZC",
		pointValue: 50,
		tickSize: 0.25,
		tickValue: 12.5,
		currency: "USD",
	}, // Corn
	XC: {
		symbol: "XC",
		pointValue: 10,
		tickSize: 0.125,
		tickValue: 1.25,
		currency: "USD",
	}, // Mini Corn
	ZW: {
		symbol: "ZW",
		pointValue: 50,
		tickSize: 0.25,
		tickValue: 12.5,
		currency: "USD",
	}, // Wheat
	ZO: {
		symbol: "ZO",
		pointValue: 50,
		tickSize: 0.25,
		tickValue: 12.5,
		currency: "USD",
	}, // Oats
	ZR: {
		symbol: "ZR",
		pointValue: 20,
		tickSize: 0.005,
		tickValue: 0.1,
		currency: "USD",
	}, // Rough Rice
	ZS: {
		symbol: "ZS",
		pointValue: 50,
		tickSize: 0.25,
		tickValue: 12.5,
		currency: "USD",
	}, // Soybeans
	ZL: {
		symbol: "ZL",
		pointValue: 600,
		tickSize: 0.01,
		tickValue: 6.0,
		currency: "USD",
	}, // Soybean Oil
	ZM: {
		symbol: "ZM",
		pointValue: 100,
		tickSize: 0.1,
		tickValue: 10.0,
		currency: "USD",
	}, // Soybean Meal

	// === LIVESTOCK ===
	LE: {
		symbol: "LE",
		pointValue: 400,
		tickSize: 0.025,
		tickValue: 10.0,
		currency: "USD",
	}, // Live Cattle
	GF: {
		symbol: "GF",
		pointValue: 500,
		tickSize: 0.025,
		tickValue: 12.5,
		currency: "USD",
	}, // Feeder Cattle
	HE: {
		symbol: "HE",
		pointValue: 400,
		tickSize: 0.025,
		tickValue: 10.0,
		currency: "USD",
	}, // Lean Hogs
};

// Forex specifications
// For CFDs, pip value depends on lot size and quote currency
// Standard lot = 100,000 units, Mini = 10,000, Micro = 1,000
export interface ForexSpec {
	symbol: string;
	pipSize: number; // Size of 1 pip (0.0001 for most, 0.01 for JPY pairs)
	pipValuePerLot: number; // USD value of 1 pip per standard lot (approximate, varies with rates)
	baseCurrency: string;
	quoteCurrency: string;
}

export const FOREX_SPECS: Record<string, ForexSpec> = {
	// Major pairs (USD quote = fixed pip value)
	"EUR/USD": {
		symbol: "EUR/USD",
		pipSize: 0.0001,
		pipValuePerLot: 10,
		baseCurrency: "EUR",
		quoteCurrency: "USD",
	},
	"GBP/USD": {
		symbol: "GBP/USD",
		pipSize: 0.0001,
		pipValuePerLot: 10,
		baseCurrency: "GBP",
		quoteCurrency: "USD",
	},
	"AUD/USD": {
		symbol: "AUD/USD",
		pipSize: 0.0001,
		pipValuePerLot: 10,
		baseCurrency: "AUD",
		quoteCurrency: "USD",
	},
	"NZD/USD": {
		symbol: "NZD/USD",
		pipSize: 0.0001,
		pipValuePerLot: 10,
		baseCurrency: "NZD",
		quoteCurrency: "USD",
	},
	// USD base pairs (pip value varies with exchange rate)
	"USD/JPY": {
		symbol: "USD/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "USD",
		quoteCurrency: "JPY",
	},
	"USD/CHF": {
		symbol: "USD/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "USD",
		quoteCurrency: "CHF",
	},
	"USD/CAD": {
		symbol: "USD/CAD",
		pipSize: 0.0001,
		pipValuePerLot: 7.4,
		baseCurrency: "USD",
		quoteCurrency: "CAD",
	},
	// Cross pairs
	"EUR/JPY": {
		symbol: "EUR/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "EUR",
		quoteCurrency: "JPY",
	},
	"GBP/JPY": {
		symbol: "GBP/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "GBP",
		quoteCurrency: "JPY",
	},
	"AUD/JPY": {
		symbol: "AUD/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "AUD",
		quoteCurrency: "JPY",
	},
	"NZD/JPY": {
		symbol: "NZD/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "NZD",
		quoteCurrency: "JPY",
	},
	"CAD/JPY": {
		symbol: "CAD/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "CAD",
		quoteCurrency: "JPY",
	},
	"CHF/JPY": {
		symbol: "CHF/JPY",
		pipSize: 0.01,
		pipValuePerLot: 9.1,
		baseCurrency: "CHF",
		quoteCurrency: "JPY",
	},
	"EUR/GBP": {
		symbol: "EUR/GBP",
		pipSize: 0.0001,
		pipValuePerLot: 12.5,
		baseCurrency: "EUR",
		quoteCurrency: "GBP",
	},
	"EUR/AUD": {
		symbol: "EUR/AUD",
		pipSize: 0.0001,
		pipValuePerLot: 6.5,
		baseCurrency: "EUR",
		quoteCurrency: "AUD",
	},
	"EUR/CAD": {
		symbol: "EUR/CAD",
		pipSize: 0.0001,
		pipValuePerLot: 7.4,
		baseCurrency: "EUR",
		quoteCurrency: "CAD",
	},
	"EUR/CHF": {
		symbol: "EUR/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "EUR",
		quoteCurrency: "CHF",
	},
	"EUR/NZD": {
		symbol: "EUR/NZD",
		pipSize: 0.0001,
		pipValuePerLot: 5.9,
		baseCurrency: "EUR",
		quoteCurrency: "NZD",
	},
	"GBP/AUD": {
		symbol: "GBP/AUD",
		pipSize: 0.0001,
		pipValuePerLot: 6.5,
		baseCurrency: "GBP",
		quoteCurrency: "AUD",
	},
	"GBP/CAD": {
		symbol: "GBP/CAD",
		pipSize: 0.0001,
		pipValuePerLot: 7.4,
		baseCurrency: "GBP",
		quoteCurrency: "CAD",
	},
	"GBP/CHF": {
		symbol: "GBP/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "GBP",
		quoteCurrency: "CHF",
	},
	"GBP/NZD": {
		symbol: "GBP/NZD",
		pipSize: 0.0001,
		pipValuePerLot: 5.9,
		baseCurrency: "GBP",
		quoteCurrency: "NZD",
	},
	"AUD/CAD": {
		symbol: "AUD/CAD",
		pipSize: 0.0001,
		pipValuePerLot: 7.4,
		baseCurrency: "AUD",
		quoteCurrency: "CAD",
	},
	"AUD/CHF": {
		symbol: "AUD/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "AUD",
		quoteCurrency: "CHF",
	},
	"AUD/NZD": {
		symbol: "AUD/NZD",
		pipSize: 0.0001,
		pipValuePerLot: 5.9,
		baseCurrency: "AUD",
		quoteCurrency: "NZD",
	},
	"NZD/CAD": {
		symbol: "NZD/CAD",
		pipSize: 0.0001,
		pipValuePerLot: 7.4,
		baseCurrency: "NZD",
		quoteCurrency: "CAD",
	},
	"NZD/CHF": {
		symbol: "NZD/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "NZD",
		quoteCurrency: "CHF",
	},
	"CAD/CHF": {
		symbol: "CAD/CHF",
		pipSize: 0.0001,
		pipValuePerLot: 11.2,
		baseCurrency: "CAD",
		quoteCurrency: "CHF",
	},
};

// ============================================
// FUTURES SYMBOLS
// ============================================

export const FUTURES_SYMBOLS: SymbolInfo[] = [
	// Equities - US Index
	{ value: "ES", label: "ES - S&P 500", category: "Equities" },
	{ value: "NQ", label: "NQ - Nasdaq 100", category: "Equities" },
	{ value: "YM", label: "YM - Dow Jones", category: "Equities" },
	{ value: "RTY", label: "RTY - Russell 2000", category: "Equities" },
	// Equities - Micro Index
	{ value: "MES", label: "MES - Micro S&P 500", category: "Equities" },
	{ value: "MNQ", label: "MNQ - Micro Nasdaq", category: "Equities" },
	{ value: "MYM", label: "MYM - Micro Dow", category: "Equities" },
	{ value: "M2K", label: "M2K - Micro Russell 2000", category: "Equities" },
	// Equities - International
	{ value: "NKD", label: "NKD - Nikkei Dollar Index", category: "Equities" },
	// Energy
	{ value: "CL", label: "CL - Crude Oil", category: "Energy" },
	{ value: "MCL", label: "MCL - Micro Crude Oil", category: "Energy" },
	{ value: "NG", label: "NG - Natural Gas", category: "Energy" },
	{ value: "MNG", label: "MNG - Micro Natural Gas", category: "Energy" },
	// Metals
	{ value: "GC", label: "GC - Gold", category: "Metals" },
	{ value: "MGC", label: "MGC - Micro Gold", category: "Metals" },
	{ value: "SI", label: "SI - Silver", category: "Metals" },
	{ value: "SIL", label: "SIL - Micro Silver", category: "Metals" },
	// Currencies - Standard
	{ value: "6A", label: "6A - Australian Dollar", category: "Currencies" },
	{ value: "6B", label: "6B - British Pound", category: "Currencies" },
	{ value: "6C", label: "6C - Canadian Dollar", category: "Currencies" },
	{ value: "6E", label: "6E - Euro", category: "Currencies" },
	{ value: "6J", label: "6J - Japanese Yen", category: "Currencies" },
	{ value: "6M", label: "6M - Mexican Peso", category: "Currencies" },
	{ value: "6N", label: "6N - New Zealand Dollar", category: "Currencies" },
	{ value: "6S", label: "6S - Swiss Franc", category: "Currencies" },
	// Currencies - Micro
	{ value: "M6A", label: "M6A - Micro AUD", category: "Currencies" },
	{ value: "M6B", label: "M6B - Micro GBP", category: "Currencies" },
	{ value: "M6E", label: "M6E - Micro EUR", category: "Currencies" },
	{ value: "MCD", label: "MCD - Micro CAD", category: "Currencies" },
	{ value: "MSF", label: "MSF - Micro CHF", category: "Currencies" },
	{ value: "MBT", label: "MBT - Micro Bitcoin", category: "Currencies" },
	// Interest Rates
	{ value: "ZB", label: "ZB - 30-Year Treasury", category: "Interest Rates" },
	{ value: "ZN", label: "ZN - 10-Year Treasury", category: "Interest Rates" },
	{ value: "ZF", label: "ZF - 5-Year Treasury", category: "Interest Rates" },
	{ value: "ZT", label: "ZT - 2-Year Treasury", category: "Interest Rates" },
	{ value: "TN", label: "TN - T-Note", category: "Interest Rates" },
	{ value: "UB", label: "UB - Ultra 10-Year", category: "Interest Rates" },
	// Agriculture - Grains
	{ value: "ZC", label: "ZC - Corn", category: "Agriculture" },
	{ value: "XC", label: "XC - Mini Corn", category: "Agriculture" },
	{ value: "ZW", label: "ZW - Wheat", category: "Agriculture" },
	{ value: "ZO", label: "ZO - Oats", category: "Agriculture" },
	{ value: "ZR", label: "ZR - Rough Rice", category: "Agriculture" },
	// Agriculture - Soy
	{ value: "ZS", label: "ZS - Soybeans", category: "Agriculture" },
	{ value: "ZL", label: "ZL - Soybean Oil", category: "Agriculture" },
	{ value: "ZM", label: "ZM - Soybean Meal", category: "Agriculture" },
	// Livestock
	{ value: "LE", label: "LE - Live Cattle", category: "Livestock" },
	{ value: "GF", label: "GF - Feeder Cattle", category: "Livestock" },
	{ value: "HE", label: "HE - Lean Hogs", category: "Livestock" },
];

// ============================================
// FOREX SYMBOLS
// ============================================

export const FOREX_SYMBOLS: SymbolInfo[] = [
	// Majors
	{ value: "EUR/USD", label: "EUR/USD - Euro/US Dollar", category: "Majors" },
	{
		value: "GBP/USD",
		label: "GBP/USD - British Pound/US Dollar",
		category: "Majors",
	},
	{
		value: "USD/JPY",
		label: "USD/JPY - US Dollar/Japanese Yen",
		category: "Majors",
	},
	{
		value: "USD/CHF",
		label: "USD/CHF - US Dollar/Swiss Franc",
		category: "Majors",
	},
	{
		value: "AUD/USD",
		label: "AUD/USD - Australian Dollar/US Dollar",
		category: "Majors",
	},
	{
		value: "USD/CAD",
		label: "USD/CAD - US Dollar/Canadian Dollar",
		category: "Majors",
	},
	{
		value: "NZD/USD",
		label: "NZD/USD - New Zealand Dollar/US Dollar",
		category: "Majors",
	},
	// JPY Crosses
	{ value: "EUR/JPY", label: "EUR/JPY - Euro/Yen", category: "JPY Crosses" },
	{ value: "GBP/JPY", label: "GBP/JPY - Pound/Yen", category: "JPY Crosses" },
	{ value: "AUD/JPY", label: "AUD/JPY - Aussie/Yen", category: "JPY Crosses" },
	{ value: "NZD/JPY", label: "NZD/JPY - Kiwi/Yen", category: "JPY Crosses" },
	{ value: "CAD/JPY", label: "CAD/JPY - Loonie/Yen", category: "JPY Crosses" },
	{ value: "CHF/JPY", label: "CHF/JPY - Swissy/Yen", category: "JPY Crosses" },
	// EUR Crosses
	{ value: "EUR/GBP", label: "EUR/GBP - Euro/Pound", category: "EUR Crosses" },
	{ value: "EUR/AUD", label: "EUR/AUD - Euro/Aussie", category: "EUR Crosses" },
	{ value: "EUR/CAD", label: "EUR/CAD - Euro/Loonie", category: "EUR Crosses" },
	{ value: "EUR/CHF", label: "EUR/CHF - Euro/Swissy", category: "EUR Crosses" },
	{ value: "EUR/NZD", label: "EUR/NZD - Euro/Kiwi", category: "EUR Crosses" },
	// GBP Crosses
	{
		value: "GBP/AUD",
		label: "GBP/AUD - Pound/Aussie",
		category: "GBP Crosses",
	},
	{
		value: "GBP/CAD",
		label: "GBP/CAD - Pound/Loonie",
		category: "GBP Crosses",
	},
	{
		value: "GBP/CHF",
		label: "GBP/CHF - Pound/Swissy",
		category: "GBP Crosses",
	},
	{ value: "GBP/NZD", label: "GBP/NZD - Pound/Kiwi", category: "GBP Crosses" },
	// Other Crosses
	{
		value: "AUD/CAD",
		label: "AUD/CAD - Aussie/Loonie",
		category: "Other Crosses",
	},
	{
		value: "AUD/CHF",
		label: "AUD/CHF - Aussie/Swissy",
		category: "Other Crosses",
	},
	{
		value: "AUD/NZD",
		label: "AUD/NZD - Aussie/Kiwi",
		category: "Other Crosses",
	},
	{
		value: "NZD/CAD",
		label: "NZD/CAD - Kiwi/Loonie",
		category: "Other Crosses",
	},
	{
		value: "NZD/CHF",
		label: "NZD/CHF - Kiwi/Swissy",
		category: "Other Crosses",
	},
	{
		value: "CAD/CHF",
		label: "CAD/CHF - Loonie/Swissy",
		category: "Other Crosses",
	},
];

// ============================================
// ALL SYMBOLS (Combined)
// ============================================

export const ALL_SYMBOLS = [...FUTURES_SYMBOLS, ...FOREX_SYMBOLS];

// ============================================
// SYMBOL MAPPING FOR DATA PROVIDERS
// Maps our symbols to provider-specific formats
// ============================================

export const TWELVE_DATA_SYMBOL_MAP: Record<string, string> = {
	// Futures -> Twelve Data continuous contract format
	...Object.fromEntries(FUTURES_SYMBOLS.map((s) => [s.value, `${s.value}1!`])),
	// Forex stays the same
	...Object.fromEntries(FOREX_SYMBOLS.map((s) => [s.value, s.value])),
};

// ============================================
// HELPER FUNCTIONS
// ============================================

export function getSymbolInfo(symbol: string): SymbolInfo | undefined {
	return ALL_SYMBOLS.find((s) => s.value === symbol);
}

export function getSymbolLabel(symbol: string): string {
	return getSymbolInfo(symbol)?.label ?? symbol;
}

export function getSymbolsByType(type: "futures" | "forex"): SymbolInfo[] {
	return type === "futures" ? FUTURES_SYMBOLS : FOREX_SYMBOLS;
}

export function isValidSymbol(symbol: string): boolean {
	return ALL_SYMBOLS.some((s) => s.value === symbol);
}

export function getSymbolCategory(symbol: string): string | undefined {
	return getSymbolInfo(symbol)?.category;
}

// ============================================
// P&L CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate P&L for a futures trade
 * @param symbol - The futures symbol (e.g., "ES", "NQ")
 * @param entryPrice - Entry price
 * @param exitPrice - Exit price
 * @param contracts - Number of contracts
 * @param direction - "long" or "short"
 * @returns P&L in USD
 */
export function calculateFuturesPnL(
	symbol: string,
	entryPrice: number,
	exitPrice: number,
	contracts: number,
	direction: "long" | "short",
): number {
	const spec = FUTURES_CONTRACT_SPECS[symbol];
	if (!spec) {
		console.warn(`No contract spec found for ${symbol}, using raw calculation`);
		// Fallback: assume point value of 1
		const priceDiff =
			direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
		return priceDiff * contracts;
	}

	const priceDiff =
		direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
	return priceDiff * spec.pointValue * contracts;
}

/**
 * Calculate P&L for a forex/CFD trade
 * @param symbol - The forex pair (e.g., "EUR/USD")
 * @param entryPrice - Entry price
 * @param exitPrice - Exit price
 * @param lotSize - Lot size (1 = standard lot, 0.1 = mini, 0.01 = micro)
 * @param direction - "long" or "short"
 * @returns P&L in USD (approximate, uses static pip values)
 */
export function calculateForexPnL(
	symbol: string,
	entryPrice: number,
	exitPrice: number,
	lotSize: number,
	direction: "long" | "short",
): number {
	const spec = FOREX_SPECS[symbol];
	if (!spec) {
		console.warn(`No forex spec found for ${symbol}, using raw calculation`);
		const priceDiff =
			direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
		return priceDiff * lotSize * 100000; // Assume standard lot size
	}

	const priceDiff =
		direction === "long" ? exitPrice - entryPrice : entryPrice - exitPrice;
	const pips = priceDiff / spec.pipSize;
	// lotSize of 1 = standard lot (100k units), pip value is per standard lot
	return pips * spec.pipValuePerLot * lotSize;
}

/**
 * Calculate P&L for any trade based on instrument type
 */
export function calculatePnL(
	symbol: string,
	instrumentType: "futures" | "forex",
	entryPrice: number,
	exitPrice: number,
	quantity: number, // contracts for futures, lots for forex
	direction: "long" | "short",
): number {
	if (instrumentType === "futures") {
		return calculateFuturesPnL(
			symbol,
			entryPrice,
			exitPrice,
			quantity,
			direction,
		);
	} else {
		return calculateForexPnL(
			symbol,
			entryPrice,
			exitPrice,
			quantity,
			direction,
		);
	}
}

/**
 * Get the point/pip value for a symbol
 */
export function getPointValue(
	symbol: string,
	instrumentType: "futures" | "forex",
): number {
	if (instrumentType === "futures") {
		return FUTURES_CONTRACT_SPECS[symbol]?.pointValue ?? 1;
	} else {
		return FOREX_SPECS[symbol]?.pipValuePerLot ?? 10;
	}
}

/**
 * Get tick/pip size for a symbol
 */
export function getTickSize(
	symbol: string,
	instrumentType: "futures" | "forex",
): number {
	if (instrumentType === "futures") {
		return FUTURES_CONTRACT_SPECS[symbol]?.tickSize ?? 0.01;
	} else {
		return FOREX_SPECS[symbol]?.pipSize ?? 0.0001;
	}
}
