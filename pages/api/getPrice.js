import axios from "axios";
export default async function handler(req, res) {
  try {
    const resp = await axios.get(
      "https://api.dexview.com/pair?baseToken=0x16D07efb7bc3A3BdEA09F19EC5fB4178e640E089&chainId=1",
      {
        headers: {
          secret: "5ff3a258-2700-11ed-a261-0242ac120002",
          origin: "https://www.dexview.com",
          "Content-Type": "application/json; charset=utf-8",
          "Access-Control-Allow-Credentials": true,
          "Access-Control-Allow-Origin": "*",
          "User-Agent":
            "Mozilla/5.0 (iPhone; CPU iPhone OS 13_2_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.3 Mobile/15E148 Safari/604.1",
        },
      }
    );
    //   console.log();
    res.status(200).json({ data: resp.data.data });
  } catch (error) {
    res.status(200).json({ data: null });
  }
}
