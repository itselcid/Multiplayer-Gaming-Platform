import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { defineConfig } from "hardhat/config";
import * as dotenv from "dotenv";
dotenv.config();

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
		settings: {
			viaIR: true
		}
      },
      production: {
        version: "0.8.28",
        settings: {
		  viaIR: true,
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    fuji: {
      type: "http",
      chainType: "l1",
      url: process.env.FUJI_RPC_URL as string,
      accounts: process.env.FUJI_PRIVATE_KEY ? [process.env.FUJI_PRIVATE_KEY] : [],
    },
  },
});
