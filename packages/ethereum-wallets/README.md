# @near-wallet-selector/ethereum-wallets

This is the Ethereum Wallets package for NEAR Wallet Selector.
The package adds support for Ethereum wallets by creating Ethereum-compatible transactions from NEAR transaction inputs.

Ethereum wallet support NEP: https://github.com/near/NEPs/issues/518

Any Ethereum wallet can be connected via Web3Modal: the App can chose which wallets to support and a multichain App can switch networks using the same wallet connection.

SignIn requires switching to NEAR network to ensure that the wallet is compatible, if the user switches to other networks he will be prompted to switch back to NEAR before making a transaction.

Sign out prompts to remove the FunctionCall access key if there is one, this action is non blocking and the user can sign out without executing the transaction.

A NEAR App can connect to multiple Ethereum wallet addresses. If the user switches to a new address from the Ethereum wallet, the NEAR wallet will be disconnected so that it can reconnect with the signIn flow. If the App doesn't require a FunctionCall access key or the Ethereum wallet address already signed in, then the address connects automatically when changed.

NEP-518 doesn't support multiple actions within the same transaction, so when multiple actions are requested, they are split into separate transactions and executed 1 by 1.

NEP-518 rpc relayer uses a FunctionCall access key to execute transactions on behalf of the user by calling `rlp_execute`. If this key is not yet added, the wallet will be onboarded before the first transaction is made.

`signMessage` and `verifyOwner` are not implemented because Ethereum wallets are not compatible with these standards, instead Apps can use `personal_sign` or `eth_signTypedData_v4` to authenticate the wallet by interacting with it directly.

## Installation and Usage

```bash
# Using Yarn
yarn add near-api-js @web3modal/wagmi wagmi viem @tanstack/react-query @near-wallet-selector/ethereum-wallets

# Using NPM.
npm install near-api-js @web3modal/wagmi wagmi viem @tanstack/react-query @near-wallet-selector/ethereum-wallets
```

Then use it in your App:

Visit https://docs.walletconnect.com for the latest configuration of Web3Modal.

Tested versions from `/examples`:
```json
"dependencies": {
  "@web3modal/wagmi": "5.0.6",
  "@tanstack/react-query": "5.24.8",
  "viem": "2.16.2",
  "wagmi": "2.10.9",
}
```

```ts
import type { Config } from "@wagmi/core";
import type { Chain } from "@wagmi/core/chains";
import { reconnect, http, createConfig } from "@wagmi/core";
import { walletConnect, injected } from "@wagmi/connectors";
import { setupWalletSelector } from "@near-wallet-selector/core";
import { setupModal } from "@near-wallet-selector/modal-ui";
import { setupEthereumWallets } from "@near-wallet-selector/ethereum-wallets";

// Mainnet
const near: Chain = {
  id: 397,
  name: "NEAR Protocol",
  nativeCurrency: {
    decimals: 18,
    name: "NEAR",
    symbol: "NEAR",
  },
  rpcUrls: {
    default: { http: ["https://eth-rpc.mainnet.near.org"] },
    public: { http: ["https://eth-rpc.mainnet.near.org"] },
  },
  blockExplorers: {
    default: {
      name: "NEAR Explorer",
      url: "https://eth-explorer.near.org",
    },
  },
}

// Testnet
/*
const near: Chain = {
  id: 398,
  name: "NEAR Protocol Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "NEAR",
    symbol: "NEAR",
  },
  rpcUrls: {
    default: { http: ["https://eth-rpc.testnet.near.org"] },
    public: { http: ["https://eth-rpc.testnet.near.org"] },
  },
  blockExplorers: {
    default: {
      name: "NEAR Explorer",
      url: "https://eth-explorer-testnet.near.org",
    },
  },
  testnet: true,
};
*/

// Get a project ID at https://cloud.walletconnect.com
const projectId = ""

const wagmiConfig: Config = createConfig({
  chains: [near],
  transports: {
    [near.id]: http(),
  },
  connectors: [
    walletConnect({
      projectId,
      metadata: {
        name: "NEAR Guest Book",
        description: "A guest book with comments stored on the NEAR blockchain",
        url: "https://near.github.io/wallet-selector",
        icons: ["https://near.github.io/wallet-selector/favicon.ico"],
      },
      showQrModal: false
    }),
    injected({ shimDisconnect: true }),
  ],
});

const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId,
});

export const WalletSelectorContextProvider = () => {
  const init = useCallback(async () => {
    const _selector = await setupWalletSelector({
      network: "mainnet",
      modules: [
        setupEthereumWallets({ wagmiConfig, web3Modal }),
      ],
    });
    const _modal = setupModal(_selector, { contractId: "" })
  }, []);
}
```

## Wallet Connect Configuration

Project ID is required, please obtain it from [walletconnect.com](https://walletconnect.com/)

## Options

- `wagmiConfig`: Wagmi Config for interacting with Ethereum wallets.
- `web3Modal` (`Web3Modal?`): Web3Modal object for connecting an Ethereum wallet. If not provided this module will connect to the default injected wallet (MetaMask browser extension, embedded browser wallets...).
- `chainId` (`number?`): Chain ID of the NEAR web3 rpc to connect to. Defaults to `397` (`mainnet`) or `398` (`testnet`) depending on the `setupWalletSelector` network configuration.
- `iconUrl` (`string?`): Image URL for the icon shown in the modal. This can also be a relative path or base64 encoded image. Defaults to `./assets/ethereum-wallets-icon.png`.
- `wagmiCore` (`typeof import("@wagmi/core")?`): Optional, @wagmi/core functions can be overidden by the App to interract with the wallet.
- `alwaysOnboardDuringSignIn` (`boolean?`): Apps without SignIn access key will not onboard the relayer by default, this option does the relayer onboarding during login.
- `skipSignInAccessKey` (`boolean?`): Allows connecting Ethereum wallets without adding a Limited Access Key which would require owning NEAR to execute the transaction (for rainbowbridge.app and welcome.near.org).
- `nearNodeUrl` (`string?`): NEAR node url to query the NEAR transaction status and onboarding access key.

Development options (before the NEAR protocol upgrade to support 0x accounts natively):

- `devMode` (`boolean?`): During development NEAR protocol doesn't yet support `0x123...abc` accounts natively so in devMode the account with format `0x123...abc.eth-wallet.testnet` is used insead. Setup your devMode account at https://near-wallet-playground.testnet.aurora.dev
- `devModeAccount` (`string?`): Modify the namespace of the devMode root accounts.

## Log in with Ethereum flow

Apps can connect to Ethereum wallets directly without opening the NEAR modal (using a dedicated button).

```js
const loginWithEthereum = () => {
  selector.wallet("ethereum-wallets").then((wallet) =>
    wallet.signIn({
      contractId: CONTRACT_ID,
    })
  )
}
```

## Use without Web3Modal

Web3Modal is the preferred UX for connecting to any Ethereum wallet.
But `ethereum-wallets` is also available to use without Web3Modal: it will connect to the default injected wallet (Metamask browser extension, embedded browser wallets...).

## License

This repository is distributed under the terms of both the MIT license and the Apache License (Version 2.0).
