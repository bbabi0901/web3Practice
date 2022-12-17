require("dotenv").config();
const Web3 = require("web3");

// GOERLI_URL infura를 통해 원격 이더리움 노드에 접속할 수 있는 주소
const { GOERLI_ADDRESS, GOERLI_URL } = process.env;

const web3 = new Web3(new Web3.providers.HttpProvider(GOERLI_URL)); // web3 객체 생성 -> Web3 라이브러리에 공급자를 인자로 넣어 web3 객체를 만든다.
// EIP-1139를 통해, 메타마스크와 같은 지갑 소프트웨어는 웹 페이지에 자바스크립트 객체 형태로 자신의 API를 노출합니다. 이 객체를 "공급자(provider)"라고 한다.
// EIP-1139는 이더리움 공급자 API를 통일하여 지갑 간 상호 운용이 가능하여지도록 하였다.
// Infura를 통해 얻은 API Key를 공급자로 지정
// rpcURL 변수는 Infura에서 받은 goerli 네트워크 엔드포인트로 초기화

const txId =
  "0x1e355a34f0a0a0ee3814ed6d4c83cc9ff23b716e2f1113a62c20c4e00e892ea4";
const blockNum = 8089979;

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

const getTransaction = (txId) => {
  web3.eth.getTransaction(txId).then((obj) => {
    console.log(obj);
  });
};

const getBlock = (blockNum) => {
  web3.eth.getBlock(blockNum).then((obj) => {
    console.log(obj);
  });
};

// getBalance(GOERLI_ADDRESS);
// getTransaction(txId);
// getBlock(blockNum);

const getBlockTx = async (txId, startBlock, endBlock) => {
  const result = [];

  for (let i = startBlock; i <= endBlock; i++) {
    const block = await web3.eth.getBlock(i);
    for (let tx of block.transactions) {
      if (tx === txId) {
        result.push(tx);
      }
    }
  }
  console.log(result);
};

// getBlockTx(txId, blockNum - 3, blockNum + 3);

const getTxByAcc = async (account, startBlock, endBlock) => {
  const result = [];
  for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
    const block = await web3.eth.getBlock(blockNum);
    block.transactions.forEach(async (txId) => {
      const tx = await web3.eth.getTransaction(txId);
      if (tx.from === account || tx.to === account) {
        result.push(tx.hash);
      }
    });
  }
  console.log(result);
};

// (async () => {
//   console.time("foreach");
//   await getTxByAcc(GOERLI_ADDRESS, blockNum - 3, blockNum + 3);
//   console.timeEnd("foreach");
// })();

const getTxByAccObj = async (account, startBlock, endBlock) => {
  const result = [];
  for (let blockNum = startBlock; blockNum <= endBlock; blockNum++) {
    const block = await web3.eth.getBlock(blockNum);
    block.transactions.forEach(async (txId) => {
      const tx = await web3.eth.getTransaction(txId);
      if (tx.from === account || tx.to === account) {
        const txInfo = { hash: tx.hash, nonce: tx.nonce };
        txInfo.type = tx.from === account ? "from" : "to";
        result.push(txInfo);
      }
    });
  }
  console.log(result);
};

(async () => {
  console.time("foreachObj");
  await getTxByAccObj(GOERLI_ADDRESS, blockNum - 3, blockNum + 3);
  console.timeEnd("foreachObj");
})();

// forEach는 배열 요소를 돌면서 callback을 실행할 뿐, 한 callback이 끝날 때까지 기다렸다가 다음 callback을 실행하는 것이 아니다
// forEach를 비롯한 배열의 요소에 callback을 실행하는 방식인 ES5 array methods (map, filter, reduce...) 를 사용할 땐, callback이 async 하더라도 전체 method는 async 하지 않음을 유의해야 한다.
// 일반적으로 순차 처리는 for 또는 for...of문을 통해,
// 병렬 처리는 map + Promise.all 을 통해 구현할 수 있다.

async function getTxByAccPromise(account, startBlock, endBlock) {
  const finalResult = [];

  while (startBlock < endBlock) {
    const promises = [];
    const blockInfo = await web3.eth.getBlock(startBlock++);
    const transactions = await blockInfo.transactions;

    // transaction의 값을 반환하는 프라미즈를 만들어 배열에 저장한다.
    for (let elem of transactions) {
      const tx = web3.eth
        .getTransaction(elem)
        .then((txHash) => {
          if (txHash.from === account) {
            return txHash;
          }
        })
        .catch((err) => {
          return;
        });
      promises.push(tx);
    }

    Promise.allSettled(promises).then((subResult) => {
      subResult.forEach((elem) => {
        if (elem.value !== undefined) {
          finalResult.push(elem);
        }
      });
      console.log(finalResult);
    });
  }
}

// web3.eth.getTransaction()과 web3.eth.getTransactionReceipt() 의 차이점에는 어떤 것이 있는가?
// 트랜잭션의 정보를 불러오는 web3.eth.getPendingTransactions() , web3.eth.getTransactionFromBlock 등은 어떤 값을 반환하는가?

// function arrayTest() {
//   const promiseFunc = (num) => {
//     return new Promise((resolve, reject) => {
//       setTimeout(() => {
//         console.log(num);
//         resolve(num);
//       });
//     });
//   };

//   let arr = [1, 2, 3, 4, 5, 6, 7, 8, 9];

//   async function parallelAll(arr) {
//     const promises = arr.map((el) => promiseFunc(el));
//     await Promise.all(promises);
//     console.log("all done :)");
//   }

//   async function parallelForEach(arr) {
//     arr.forEach(async (num) => {
//       await promiseFunc(num);
//     });
//     console.log("all done :)");
//   }

//   parallelAll(arr);
//   // parallelForEach(arr);
// }
// arrayTest();
