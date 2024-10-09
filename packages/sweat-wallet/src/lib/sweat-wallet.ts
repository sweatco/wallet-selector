import type {
  WalletModuleFactory,
  InjectedWallet,
} from "@near-wallet-selector/core";
import { initSweatWallet } from "@sweatco/wallet-selector";

import iconUrl from "./icon";

export function setupSweatWallet(): WalletModuleFactory<InjectedWallet> {
  return async () => {
    return {
      id: "sweat-wallet",
      type: "injected",
      metadata: {
        iconUrl,
        name: "SWEAT Wallet",
        description: "SWEAT Wallet for NEAR Protocol",
        downloadUrl: "https://sweateconomy.org",
        deprecated: false,
        available: true,
      },
      init: initSweatWallet,
    };
  };
}
