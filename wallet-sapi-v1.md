## 充值

[代码参见此](./code/deposit.js)

### 配置说明

|参数|说明|
|:-:|:-:|
|web3|根据不同网络选择不同链接<br><br>eg:前往 https://app.infura.io/dashboard 申请|
|NETWORK|ETH/BSC/Polygon<br><br>eg:BSC|
|API_KEY|binance的api key|
|API_SECRET|binance的api key|
|BASE_URL|sapi链接<br><br>eg:https://api.binance.com|
|BULK_CONTRACT_ADDRESS|合约地址<br><br>ETH:0x869a5d85a71830a8c34934101c20671c272c3807<br>BSC:0x869a5d85a71830a8c34934101c20671c272c3807<br>Polygon:0x869a5d85a71830a8c34934101c20671c272c3807<br>|
|ERC721_CONTRACT_ADDRESS|待充值的ERC721合约|
|ERC721_TOKEN_IDS|待充值的tokenId列表|
|PRIVATE_KEY|钱包私钥(需要在最前面加上0x)|

## 提现