function calculateMaxGasCost(gasLimit, maxFee) {
    const limit = BigInt(gasLimit);
    const max = BigInt(maxFee);

    return limit * max;
}


function canSendETH(balance, amount, gasLimit, maxFee) {
    // ① 残高と送金額をBigIntに変換
const walletBalance = BigInt(balance);
const sendAmount = BigInt(amount);

    // ② calculateMaxGasCost()を呼び出す
const maxGasCost = calculateMaxGasCost(gasLimit, maxFee);

    // ③ 送金額と最大Gas代を合計する
const totalCost = sendAmount + maxGasCost;

    // ④ 残高と比較してtrueまたはfalseを返す
return walletBalance >= totalCost;
}


const RPC_URL = "https://ethereum-rpc.publicnode.com";

async function getETHBalance(address) {
    try {
        // ① RPCに送るデータを作成
        const payload = {
            jsonrpc: "2.0",
            method: "eth_getBalance",
            params: [address, "latest"],
            id: 1
        };

        // ② fetchでRPCにリクエスト
        const response = await fetch(RPC_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
     throw new Error("HTTPエラー");
        }
        // ③ JSONをJavaScriptのデータに変換
        const data = await response.json();


                if (data.error) {
                throw new Error(data.error.message);
        }
        // ④ 16進数の残高をBigIntに変換
        const balanceWei = BigInt(data.result);

        // ⑤ 残高を返す
        return balanceWei;

    } catch (error) {
        console.log("エラー:", error.message);
        throw error;
    }
}


function formatWeiToEth(wei) {
    const value = BigInt(wei);

    const divisor = 10n ** 18n;

    // ① ETHの整数部分
    const whole = value / divisor;

    // ② ETHの小数部分
    const fraction = value % divisor;

    // ③ 小数部分を18桁にそろえる
    const fractionString =
        fraction.toString().padStart(18, "0").replace(/0+$/, "");

    // ④ ETH形式の文字列を返す
    return fractionString
    ? `${whole}.${fractionString}`
    : whole.toString();
}


async function showETHBalance(address) {
    try {
        // ① RPCから残高を取得
        const balanceWei = await getETHBalance(address);

        // ② WeiをETH形式に変換
        const balanceEth = formatWeiToEth(balanceWei);

        // ③ 結果を表示
        console.log("ETH残高:", balanceEth);

    } catch (error) {
        console.log("残高取得エラー:", error.message);
    }
}

async function checkWallet(address, amount, gasLimit, maxFee) {
    try {
        // ① RPCからウォレット残高を取得
        const balance = await getETHBalance(address);

        // ② 取得した残高で送金可否を判定
        const canSend = canSendETH(balance, amount, gasLimit,maxFee);

        // ③ 結果を表示
        if (canSend) {
            console.log("送金可能です");
        } else {
            console.log("残高不足です");
        }

    } catch (error) {
        console.log("エラー:", error.message);
    }
}

const address = "0x00000000219ab540356cBB839Cbe05303d7705Fa";

checkWallet(
    address,
    "500000000000000000", // 0.5 ETH
    "21000",              // Gas Limit
    "30000000000"        // Max Fee：30 Gwei
);