import ethers from 'ethers';
import {airdropabi} from '../config/airdrop.js';
import dotenv from 'dotenv';
dotenv.config();

(async() => {
    const provider = new ethers.providers.JsonRpcBatchProvider("https://data-seed-prebsc-2-s1.binance.org:8545/");

    const privateKey = process.env.PRIVATE_KEY;    
    const contractAddress = process.env.CONTRACT_ADDRESS;
    const amount = "10000000000000000000";

    const { chainId } = await provider.getNetwork();
    let contract = new ethers.Contract(contractAddress, airdropabi, provider);
    let wallet = new ethers.Wallet(privateKey, provider);
    const userAddress = await wallet.getAddress();    
    let contractWithSigner = contract.connect(wallet);

    const nonces  = await contract.nonces(userAddress);
    console.log("nonces", nonces.toString());
    const deadline = Math.floor(new Date().getTime() / 1000) + 180;

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
    
    let signature = await wallet._signTypedData(domain, types, value);

    const split_vrs = ethers.utils.splitSignature(signature);
    console.log("split vrs", split_vrs);

    let tx = await contractWithSigner.claim(
      amount,
      deadline,
      split_vrs.v,
      split_vrs.r,
      split_vrs.s
    );

    await tx.wait();

    console.log("transaction hash", tx.hash);
})();


