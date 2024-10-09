import type {
    WalletModuleFactory,
    InjectedWallet,
    WalletBehaviourFactory,
    FinalExecutionOutcome,
  } from "@near-wallet-selector/core";

import icon from "./icon";

interface Options {
    deprecated?: boolean
    iconUrl?: string
}

type SelectorInit = WalletBehaviourFactory<InjectedWallet>;

export function setupSweatWallet({
    deprecated = false,
    iconUrl = icon,
  }: Options = {}): WalletModuleFactory<InjectedWallet> {
    return async () => {
      return {
        id: "sweat-wallet",
        type: "injected",
        metadata: {
          name: "Sweat Wallet",
          description: "Mobile wallet for NEAR Protocol",
          useUrlAccountImport: true,
          downloadUrl: "https://sweateconomy.com",
          topLevelInjected: true,
          iconUrl,
          deprecated,
          available: true,
        },
        init: (config) => initSweatWallet(config),
      };
    };
}

const initSweatWallet: SelectorInit = async (config) => {
  // Add your implementation here
  // Return a Promise<Omit<InjectedWallet, "id" | "type" | "metadata">>
  return Promise.resolve({
    signIn: async () => {
      // Implement signIn logic here
      return []; // Should return a Promise<Account[]>
    },
    signOut: async () => {
      // Implement signOut logic here
    },
    getAccounts: async () => {
      // Implement getAccounts logic here
      return []; // Should return a Promise<Account[]>
    },
    verifyOwner: async () => {
        // Implement verifyOwner logic here
        return Promise.resolve();
      },
      signAndSendTransaction: async () => {
        // Implement signAndSendTransaction logic here
        return Promise.resolve({} as FinalExecutionOutcome); // Should return a Promise<FinalExecutionOutcome>
      },
      signAndSendTransactions: async () => {
        // Implement signAndSendTransactions logic here
        return Promise.resolve([{} as FinalExecutionOutcome]); // Should return a Promise<FinalExecutionOutcome>
      },
  });
}