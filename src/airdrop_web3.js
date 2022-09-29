import ethers from 'ethers';
import web3 from 'web3';
import { signTypedData } from '@metamask/eth-sig-util';

import {airdropabi} from '../config/airdrop.js';

(async() => {
    const currentweb3 = new web3(new web3.providers.HttpProvider("https://data-seed-prebsc-2-s1.binance.org:8545/"));

    const FROM_KEY =  process.env.PRIVATE_KEY;
    const userAddress =  (await currentweb3.eth.accounts.privateKeyToAccount(secretkey)).address;    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const amount = "10000000000000000000";

    const chainId = await currentweb3.eth.getChainId();
    let contract = new currentweb3.eth.Contract(airdropabi, contractAddress);
    await currentweb3.eth.accounts.wallet.add(FROM_KEY);

    const nonces  = await contract.methods.nonces(userAddress).call();
    console.log("nonces", nonces.toString());
    const deadline = Math.floor(new Date().getTime() / 1000) + 180;

    const msgParams = {
      types: {
          EIP712Domain:  [
              {name: "name", type: "string"},
              {name: "version", type: "string"},
              {name: "chainId", type: "uint256"},
              {name: "verifyingContract", type: "address"}
          ],
          Permit: [
              {name: "user", type: "address"},
              {name: "value", type: "uint256"},
              {name: "nonce", type: "uint256"},
              {name: "deadline", type: "uint256"},
          ],
      },
      domain: {
          name: "MetaVerseGame_V1.0",
          version: "1.0",
          chainId: chainId,
          verifyingContract: contractAddress,
      },
      primaryType: "Permit",
      message: {
        user: userAddress,
        value: amount,
        nonce: nonces,
        deadline: deadline
      },
  };

    const domain = {
      name: 'MetaVerseGame_V1.0',
      version: '1.0',
      chainId: chainId,
      verifyingContract: contractAddress,
    };
    const types = {
        Permit: [
            { name: 'user', type: 'address' },
            { name: 'value', type: 'uint256' },
            { name: 'nonce', type: 'uint256' },
            { name: 'deadline', type: 'uint256' }
        ]
    };
    const value = {
        user: userAddress,
        value: amount,
        nonce: nonces,
        deadline: deadline
    }; 

    const typedData = JSON.stringify({domain,types,value})

  // const sign = await web3.eth.signTypedData(typedData, userAddress);

  //  await currentweb3.currentProvider.sendAsync({
  //   method: 'eth_signTypedData',
  //   params: [typedData, userAddress],
  //   from: userAddress,
  // }); 

    // const sign = await currentweb3.eth.accounts.sign(typedData,privateKey,true);
    // console.log("sign", sign);

    // const tx = await contract.methods.claim(
    //   amount,
    //   deadline,
    //   sign.v,
    //   sign.r,
    //   sign.s
    // ).estimateGas({
    //     from: userAddress
    // }); 

   // console.log("transaction hash", tx);
   
  //  const method = 'eth_signTypedDataV3';
  //  const params =  [userAddress, typedData];

  //  currentweb3.currentProvider.send(
  //   {
  //     method,
  //     params: [userAddress, typedData],
  //     from: userAddress
  //   //   jsonrpc: '2.0',
  //   //   id: new Date().getTime(),
  //   },
  //   (err, result) => {
  //     if (err) {
  //       console.log("err", err)
  //     } else {
  //      // resolve(result.result);
  //      console.log("result", result)
  //     }
  //   }
  // );

//    currentweb3.currentProvider.sendAsync(
//     {
//       method,
//       params,
//       userAddress,
//     },
//     function (err, result) {
//       if (err) return console.dir(err);
//       if (result.error) {
//         alert(result.error.message);
//       }
//       if (result.error) return console.error('ERROR', result);
//       console.log('TYPED SIGNED:' + JSON.stringify(result.result));
//   })
  
  const privateKey = Buffer.from(FROM_KEY.slice(2), 'hex')

  const signResult = await signTypedData({ privateKey, data: msgParams, version: 'V4'});
  console.log('signResult', signResult)

  const sig0 = signResult.substring(2);
  const r = "0x" + sig0.substring(0, 64);
  const s = "0x" + sig0.substring(64, 128);
  const v = parseInt(sig0.substring(128, 130), 16);

  console.log("vrs", v,r,s);

  const split_vrs = ethers.utils.splitSignature(signResult);
  console.log("split vrs", split_vrs);


   const tx = await contract.methods.claim(
      amount,
      deadline,
      split_vrs.v,
      split_vrs.r,
      split_vrs.s
    ).estimateGas({
        from: userAddress
    }); 

    const address = await currentweb3.eth.accounts.privateKeyToAccount(FROM_KEY);
    console.log("address", address);

    console.log("pk", process.env.PRIVATE_KEY)



})();


