import web3 from 'web3';
import { signTypedData } from '@metamask/eth-sig-util';
import {airdropabi} from '../config/airdrop.js';
import dotenv from 'dotenv';
dotenv.config();

(async() => {
    const currentweb3 = new web3(new web3.providers.HttpProvider("https://data-seed-prebsc-2-s1.binance.org:8545/"));
    const secretkey = process.env.PRIVATE_KEY;
    const userAddress = (await currentweb3.eth.accounts.privateKeyToAccount(secretkey)).address;    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const amount = "10000000000000000000";

    const chainId = await currentweb3.eth.getChainId();
    let contract = new currentweb3.eth.Contract(airdropabi, contractAddress);
    await currentweb3.eth.accounts.wallet.add(secretkey);

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
    const privateKey = Buffer.from(secretkey.slice(2), 'hex');
    const signResult = await signTypedData({ privateKey, data: msgParams, version: 'V4'});
    const sig0 = signResult.substring(2);
    const r = "0x" + sig0.substring(0, 64);
    const s = "0x" + sig0.substring(64, 128);
    const v = parseInt(sig0.substring(128, 130), 16);    
    const gas = await contract.methods.claim(
      amount,
      deadline,
      v,
      r,
      s
    ).estimateGas({
        from: userAddress
    }); 
    console.log("gas", gas);

    const tx = await contract.methods.claim(
        amount,
        deadline,
        v,
        r,
        s
    ).send({
        from: userAddress,
        gas: gas
    }); 

    console.log("tx", tx.transactionHash)

})();


