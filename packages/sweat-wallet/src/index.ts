import type {
    WalletModuleFactory,
    InjectedWallet,
    WalletBehaviourFactory,
    FinalExecutionOutcome,
    SignedMessage
  } from "@near-wallet-selector/core";

import icon from "./icon";

interface Options {
    deprecated?: boolean
    iconUrl?: string
}

type SweatWalletInit = WalletBehaviourFactory<InjectedWallet>;

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
          useUrlAccountImport: false,
          downloadUrl: "https://sweateconomy.com",
          iconUrl,
          deprecated,
          available: true,
        },
        init: (config) => initSweatWallet(config),
      };
    };
}

const initSweatWallet: SweatWalletInit = async (config) => {
    const { logger } = config

    return {  
      async signIn(data) {
        logger.log("[SweatWallet]: signIn", data);
        const connector = createIframe("https://sweateconomy.com");
        connector.style.display = "block"
        return []
      },
  
      async signOut() {
        logger.log("[SweatWallet]: signOut");
        return Promise.resolve();
      },
  
      async getAccounts() {
        logger.log("[SweatWallet]: getAccounts");
        return []
      },
  
      async signAndSendTransaction(data) {
        logger.log("[SweatWallet]: signAndSendTransaction", data);
  
        return {} as FinalExecutionOutcome;
      },
  
      async verifyOwner() {
        throw Error(
          "[SweatWallet]: verifyOwner is deprecated, use signMessage method with implementation NEP0413 Standard"
        );
      },
  
      async signMessage(data) {
        logger.log("[SweatWallet]: signMessage", data);
        return Promise.resolve({
          accountId: "example-account",
          signature: "example-signature",
          publicKey: "example-public-key" // Ensure publicKey is included
        } as SignedMessage);
      },
  
      async signAndSendTransactions(data) {
        logger.log("[SweatWallet]: signAndSendTransactions", data);
        return [{} as FinalExecutionOutcome];
      },
    };
}

const createIframe = (widget: string) => {
  const connector = document.createElement("iframe");
  connector.src = widget;
  connector.style.border = "none";
  connector.style.zIndex = "10000";
  connector.style.position = "fixed";
  connector.style.display = "none";
  connector.style.top = "0";
  connector.style.left = "0";
  connector.style.width = "50%";
  connector.style.height = "50%";
  document.body.appendChild(connector);
  return connector;
};