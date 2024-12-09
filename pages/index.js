import Image from "next/image";
import { Montserrat } from "next/font/google";
import toast, { Toaster } from "react-hot-toast";
import { GoPlus, ErrorCode } from "goplus-sdk-js";

const inter = Montserrat({ subsets: ["latin"], weight: ["400", "600"] });
import {
  useContractRead,
  useContract,
  ConnectWallet,
  useContractWrite,
  Web3Button,
  useAddress,
  useBalance,
} from "@thirdweb-dev/react";
import ABI from "./ABI.json";
import { ethers } from "ethers";
import { useEffect, useState } from "react";
import axios from "axios";
export default function Home() {
  let app_key = "UQdBiNsdf7unvpYB0jPY";
  let app_secret = "0ovVH3ArSrGlFnNY9dXiNVL2HgnijxPn";
  let timeout = 1800; // default timeout is 30s
  GoPlus.config(app_key, app_secret, timeout);

  const CONTRACT_ADDRESS = "0xF4918b947b7e9819eB813dF276F54AD95D20417a";
  const [amount, setAmount] = useState(10);
  const [disable, setDisable] = useState({ value: false, message: "" });
  const address = useAddress();

  const { contract } = useContract(CONTRACT_ADDRESS, ABI);
  const { data: totalBurned } = useContractRead(contract, "totalBurned");
  const { data: totalSupply } = useContractRead(contract, "totalSupply");
  const { data: getCirculatingSupply } = useContractRead(
    contract,
    "getCirculatingSupply"
  );
  const { data: totalBurnRewards } = useContractRead(
    contract,
    "totalBurnRewards"
  );
  const { mutateAsync, isLoading, error } = useContractWrite(
    contract,
    "burnForEth"
  );
  const { data: balance } = useBalance(CONTRACT_ADDRESS);

  const [token, setToken] = useState(null);
  const [security, setSecurity] = useState(null);
  const getData = async () => {
    const resp = await axios.get("/api/getPrice");
    const data = resp.data.data;
    console.log(data);
    setToken(data);
  };

  const getSecurity = async () => {
    let chainId = "1";
    let addresses = [CONTRACT_ADDRESS.toLowerCase()];

    // It will only return 1 result for the 1st token address if not called getAccessToken before
    let res = await GoPlus.tokenSecurity(chainId, addresses);
    if (res.code != ErrorCode.SUCCESS) {
      console.error(res.message);
    } else {
      console.log(res);
      console.log(res.result[CONTRACT_ADDRESS.toLowerCase()], "yes");
      setSecurity(res.result[CONTRACT_ADDRESS.toLowerCase()]);
    }
  };

  useEffect(() => {
    getData();
    getSecurity();
  }, []);

  function nFormatter(num, digits = 2) {
    const lookup = [
      { value: 1, symbol: "" },
      { value: 1e3, symbol: "K" },
      { value: 1e6, symbol: "M" },
      // { value: 1e9, symbol: "G" },
      // { value: 1e12, symbol: "T" },
      // { value: 1e15, symbol: "P" },
      // { value: 1e18, symbol: "E" },
    ];
    const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
    var item = lookup
      .slice()
      .reverse()
      .find(function (item) {
        return num >= item.value;
      });
    return item
      ? (num / item.value).toFixed(digits).replace(rx, "$1") + item.symbol
      : "0";
  }

  useEffect(() => {
    console.log(balance?.displayValue);
    if (amount > Number(balance?.displayValue)) {
      console.log(amount);
      setDisable({ value: true, message: "Balance is lower than your amount" });
    } else {
      setDisable({ value: false, message: "" });
    }
    if (balance?.displayValue <= 0) {
      setDisable({ value: true, message: "Not enough balance" });
    }
  }, [amount, balance]);
  return (
    <main className={` ${inter.className} `}>
      <Toaster />
      <img
        src="/bg.png"
        className="fixed object-cover object-top h-full w-full inset-0 z-[-1]"
      />
      <header>
        <div className="container mx-auto px-6 py-8">
          <div className="flex justify-between flex-wrap gap-6 items-center">
            <img src="/logo.png" className="w-16" />
            <ConnectWallet className="!bg-[#F76A24] !py-5 !px-6 !text-white !uppercase" />
          </div>
        </div>
      </header>
      <div className="container mx-auto px-6 py-16">
        {token && (
          <>
            <div className="grid md:grid-cols-4 gap-8  w-full mx-auto">
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Token Name</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  {/* {token.baseTokenData.name} (${token.baseTokenData.symbol}) */}
                  Test
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Token Price</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  ${parseFloat(token.priceUsd).toFixed(4)}
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Total Supply</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  {/* {parseFloat(Number(security?.total_supply))} */}
                  {Number(totalSupply) / 10 ** 18}
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Market Cap</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  ${nFormatter(token.fdv)}
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-4 gap-8  w-full mx-auto mt-6">
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Holders</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  {security?.holder_count}
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">24H Volume</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  $
                  {token?.newInformation?.volume24h
                    ? nFormatter(token.newInformation?.volume24h)
                    : 0}
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">24H Price Change</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  {token?.newInformation?.priceChange24h
                    ? parseFloat(token.newInformation.priceChange24h).toFixed(2)
                    : 0}{" "}
                  %
                </div>
              </div>
              <div className="bg-white/10 p-4 text-center uppercase rounded-lg">
                <div className="text-lg lg:text-xl">Liquidity</div>
                <div className="text-xl lg:text-2xl font-bold mt-2 ">
                  ${nFormatter(token.liquidity)}
                </div>
              </div>
            </div>
          </>
        )}

        <div className="mt-6 lg:mt-16">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-16  w-full mx-auto">
            <div className="bg-[linear-gradient(180deg,#FDA50F_0%,#F76A24_100%)] p-6 text-center uppercase rounded-lg">
              <div className="text-lg lg:text-2xl">Total Burned</div>
              <div className="text-xl lg:text-3xl font-bold mt-2 lg:mt-3">
                {nFormatter(parseFloat(totalBurned / 10 ** 18).toFixed(2))} Test
              </div>
            </div>
            <div className="bg-[linear-gradient(180deg,#FDA50F_0%,#F76A24_100%)] p-6 text-center uppercase rounded-lg">
              <div className="text-lg lg:text-2xl">Total Burned REWARD</div>
              <div className="text-xl lg:text-3xl font-bold mt-1 lg:mt-3">
                {" "}
                {totalBurnRewards
                  ? parseFloat(totalBurnRewards / 10 ** 18).toFixed(8)
                  : 0}{" "}
                ETH
              </div>
            </div>
            <div className="bg-[linear-gradient(180deg,#FDA50F_0%,#F76A24_100%)] p-6 text-center uppercase rounded-lg">
              <div className="text-lg lg:text-2xl">Your Balance</div>
              <div className="text-xl lg:text-3xl font-bold mt-1 lg:mt-3">
                {" "}
                {nFormatter(balance?.displayValue)} Test
              </div>
            </div>
          </div>

          <div className="mt-12">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter Amount of tokens you want to burn"
              className="h-20 py-6 text-2xl font-bold bg-[#131313] w-full px-6 uppercase border border-[#F76A24] rounded-lg"
            />

            {/* <button className="bg-[#F76A24] text-xl hover:bg-[#f75524] py-4 rounded-lg px-6 w-full mt-6">
              BURN
            </button> */}
            <Web3Button
              contractAbi={ABI}
              contractAddress={CONTRACT_ADDRESS}
              isDisabled={disable.value}
              onSuccess={(e) => toast.success("Successfully Burned")}
              onError={({ message, name, stack }) =>
                toast.error("Something went wrong!")
              }
              className="!bg-[#F76A24] !text-xl !uppercase !text-white !hover:bg-[#f75524] !py-4 !rounded-lg !px-6 !w-full !mt-6 disabled:!bg-[#792E09]"
              // Calls the "setName" function on your smart contract with "My Name" as the first argument
              action={() =>
                mutateAsync({
                  args: [ethers.utils.parseUnits(amount, 18)],
                  overrides: {
                    from: address,
                  },
                })
              }
            >
              {disable.value ? disable.message : "BURN"}
            </Web3Button>
          </div>
        </div>
      </div>
    </main>
  );
}
