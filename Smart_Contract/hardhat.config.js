require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.14",
  networks: {
    ganache: {
      url: "HTTP://127.0.0.1:7545",
    },
    georli: {
      url: "https://goerli.infura.io/v3",
      accounts: [
        "0x","0x",
      ],
    },
  },
};
