const Web3 = require("web3");
const rpcURL = "https://goerli.infura.io/v3/2d2c8426cde6446fa9185e2e0b01dcea"; // 원격 이더리움 노드에 접속할 수 있는 주소

const web3 = new Web3(rpcURL); // web3 객체 생성 -> Web3 라이브러리에 공급자를 인자로 넣어 web3 객체를 만든다.

// EIP-1139를 통해, 메타마스크와 같은 지갑 소프트웨어는 웹 페이지에 자바스크립트 객체 형태로 자신의 API를 노출합니다. 이 객체를 "공급자(provider)"라고 한다.
// EIP-1139는 이더리움 공급자 API를 통일하여 지갑 간 상호 운용이 가능하여지도록 하였다.
// Infura를 통해 얻은 API Key를 공급자로 지정
// rpcURL 변수는 Infura에서 받은 goerli 네트워크 엔드포인트로 초기화

const accountAddr = "0x279e774b2Fc2E9e995d2Cbadba1eC618Cba8d647";

const getBalance = (accountAddr) => {
  web3.eth
    .getBalance(accountAddr)
    .then((bal) => {
      console.log(`지갑 ${accountAddr}의 잔액은... ${bal} wei 입니다.`);
      return web3.utils.fromWei(bal, "ether"); // web3.utils.fromWei 를 사용해 ether 단위로 변경
    })
    .then((eth) => {
      console.log(`ether 단위로는 ${eth} eth 입니다.`);
    });
};

const txId =
  "0x1e355a34f0a0a0ee3814ed6d4c83cc9ff23b716e2f1113a62c20c4e00e892ea4";

const getTransaction = (txId) => {
  web3.eth.getTransaction(txId).then((obj) => {
    console.log(obj);
  });
};

const blockNum = "7719362";

const getBlock = (blockNum) => {
  web3.eth.getBlock(blockNum).then((obj) => {
    console.log(obj);
  });
};
// getBalance(accountAddr);
// getTransaction(txId);
getBlock(blockNum);

// web3.eth.getTransaction()과 web3.eth.getTransactionReceipt() 의 차이점에는 어떤 것이 있
// 트랜잭션의 정보를 불러오는 web3.eth.getPendingTransactions() , web3.eth.getTransactionFromBlock 등은 어떤 값을 반환하나요?
