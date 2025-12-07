"use client";

import {
	createContext,
	type ReactNode,
	useContext,
	useEffect,
	useState,
} from "react";
import { api } from "@/trpc/react";

interface Account {
	id: number;
	name: string;
	broker: string | null;
	accountType: "live" | "demo" | "paper";
	initialBalance: string | null;
	currency: string | null;
	isActive: boolean | null;
	isDefault: boolean | null;
	color: string | null;
}

interface AccountContextType {
	accounts: Account[];
	selectedAccount: Account | null;
	selectedAccountId: number | null;
	setSelectedAccountId: (id: number | null) => void;
	isLoading: boolean;
	refetchAccounts: () => void;
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export function AccountProvider({ children }: { children: ReactNode }) {
	const [selectedAccountId, setSelectedAccountId] = useState<number | null>(
		null,
	);

	const {
		data: accounts = [],
		isLoading,
		refetch,
	} = api.accounts.getActive.useQuery();

	// Set default account on initial load
	useEffect(() => {
		if (accounts.length > 0 && selectedAccountId === null) {
			// Find the default account or use the first one
			const defaultAccount = accounts.find((a) => a.isDefault) ?? accounts[0];
			if (defaultAccount) {
				setSelectedAccountId(defaultAccount.id);
			}
		}
	}, [accounts, selectedAccountId]);

	// Persist selected account to localStorage
	useEffect(() => {
		if (selectedAccountId !== null) {
			localStorage.setItem("selectedAccountId", selectedAccountId.toString());
		}
	}, [selectedAccountId]);

	// Load from localStorage on mount
	useEffect(() => {
		const stored = localStorage.getItem("selectedAccountId");
		if (stored) {
			const id = parseInt(stored, 10);
			// Verify the account still exists and belongs to user
			if (accounts.some((a) => a.id === id)) {
				setSelectedAccountId(id);
			}
		}
	}, [accounts]);

	const selectedAccount =
		accounts.find((a) => a.id === selectedAccountId) ?? null;

	return (
		<AccountContext.Provider
			value={{
				accounts,
				selectedAccount,
				selectedAccountId,
				setSelectedAccountId,
				isLoading,
				refetchAccounts: refetch,
			}}
		>
			{children}
		</AccountContext.Provider>
	);
}

export function useAccount() {
	const context = useContext(AccountContext);
	if (context === undefined) {
		throw new Error("useAccount must be used within an AccountProvider");
	}
	return context;
}
