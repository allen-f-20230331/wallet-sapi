const Web3                      = require("web3");
const axios                     = require("axios");
const crypto                    = require("crypto");

// 初始化web3
const web3                      = new Web3("wait to add");
const NETWORK                   = "wait to add";
// API
const API_KEY                   = "wait to add";
const API_SECRET                = "wait to add";
// 请求
const BASE_URL                  = "wait to add";
const GET_RAND_ID_URL           = BASE_URL + "/sapi/v1/nft/wallet/deposit-rand-id";
// 批量划转
const BULK_CONTRACT_ADDRESS     = "wait to add";
const BULK_ABI                  = [{"inputs":[{"components":[{"internalType":"address","name":"token","type":"address"},{"internalType":"uint256","name":"identifier","type":"uint256"}],"internalType":"struct DepositItem[]","name":"items","type":"tuple[]"},{"internalType":"uint256","name":"requestId","type":"uint256"}],"name":"bulkDeposit","outputs":[],"stateMutability":"nonpayable","type":"function"}]
const BULK_CONTRACT             = new web3.eth.Contract(BULK_ABI,BULK_CONTRACT_ADDRESS);
// ERC721
const ERC721_CONTRACT_ADDRESS   = "wait to add";
const ERC721_TOKEN_IDS          = ["wait to add","wait to add"];
const ERC721_ABI                = [{"inputs":[{"internalType":"address","name":"owner","type":"address"},{"internalType":"address","name":"operator","type":"address"}],"name":"isApprovedForAll","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"operator","type":"address"},{"internalType":"bool","name":"approved","type":"bool"}],"name":"setApprovalForAll","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"tokenId","type":"uint256"}],"name":"ownerOf","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"}]
const ERC721_CONTRACT           = new web3.eth.Contract(ERC721_ABI,ERC721_CONTRACT_ADDRESS);
//账户
const PRIVATE_KEY               = "wait to add";
const ACCOUNT                   = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
web3.eth.accounts.wallet.add(ACCOUNT);


//axios配置
axios.defaults.transformResponse = [
    data => {
        try{
            return data;
        }catch(error){
            return {
                data
            };
        }
    }
];

// 检查是否允许充值
async function check_owner(){

    for(index in ERC721_TOKEN_IDS){

        var owner = await ERC721_CONTRACT.methods
            .ownerOf(ERC721_TOKEN_IDS[index])
            .call()
            .then(result => {
                return result;
            })
        
        console.log(`${ERC721_TOKEN_IDS[index]}'s owner is ${owner},deposit able : ${owner.toUpperCase() === ACCOUNT.address.toUpperCase()}`);

        if(owner.toUpperCase() !== ACCOUNT.address.toUpperCase()){
            return false;
        }
    }

    return true;
}

// 授权
async function approve_if_need(){
    
    //检查是否授权
    var approved = await ERC721_CONTRACT.methods
        .isApprovedForAll(ACCOUNT.address,BULK_CONTRACT_ADDRESS)
        .call()
        .then(result => {
            return result;
        });

    if (approved){
        return true;
    }

    //授权
    var approve_params = {
        from: ACCOUNT.address,
        to: ERC721_CONTRACT_ADDRESS,
        value: "0x0",
        data: ERC721_CONTRACT.methods.setApprovalForAll(BULK_CONTRACT_ADDRESS,true).encodeABI(),
        gas: 200000
    }

    var tx = await web3.eth.accounts.signTransaction(approve_params,PRIVATE_KEY)
        .then((tx) => {
            return tx;
        });
    
    await web3.eth.sendSignedTransaction(tx.rawTransaction).then((receipt) => {
        console.log(`approve transaction hash : ${receipt.transactionHash}`);
    })
    
    //重新检查是否授权
    return await ERC721_CONTRACT.methods
                    .isApprovedForAll(ACCOUNT.address,BULK_CONTRACT_ADDRESS)
                    .call()
                    .then(result => {
                        return result;
                    });
}

// 获取用户关联的随机数
async function get_rand_id(){

    var header  = {
        "Content-Type": "application/json",
        "X-MBX-APIKEY": API_KEY
    }

    var current = Date.now();
    var message = `networkType=${NETWORK}&timestamp=${current}`;
    var hash    = crypto.createHmac('sha256',API_SECRET).update(message).digest('hex');

    return await axios.get(GET_RAND_ID_URL + "?" + message + `&signature=${hash}`,{
                        headers:header,
                    })
                    .then(res => {
                        console.log(`fetch rand id success,result : ${res.data}`);
                        return res.data;
                    }).catch(err => {
                        console.log(`get result error : ${err.response.data}`);
                        return -1;
                    });
}

// 充值
async function deposit(){

    //check owner
    var deposit_able = await check_owner();
    if(!deposit_able){
        return;
    }

    //授权
    var approved = await approve_if_need();

    console.log(`in contract [ ${NETWORK} ] [ ${ERC721_CONTRACT_ADDRESS} ], [ ${ACCOUNT.address} ] approve for [ ${BULK_CONTRACT_ADDRESS} ]'s result : ${approved}`);
    if(!approved){
        return;
    }

    //获取随机数
    var rand_id = await get_rand_id();
    if(!rand_id || rand_id === -1){
        return;
    }
    
    //批量充值
    var CALL_ITEMS  = ERC721_TOKEN_IDS.map((x) => { return {"token":ERC721_CONTRACT_ADDRESS,"identifier":x}})
    var bulk_params = {
        from: ACCOUNT.address,
        to: BULK_CONTRACT_ADDRESS,
        value: "0x0",
        data: BULK_CONTRACT.methods.bulkDeposit(CALL_ITEMS,rand_id).encodeABI(),
        gas: 200000 * ERC721_TOKEN_IDS.length
    }

    var tx = await web3.eth.accounts.signTransaction(bulk_params,PRIVATE_KEY).then((tx) => {
        return tx;
    })
    await web3.eth.sendSignedTransaction(tx.rawTransaction).then((receipt) => {
        console.log(`bulk deposit transaction hash : ${receipt.transactionHash}`);
    })
}

deposit();