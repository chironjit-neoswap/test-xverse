"use client"
import React, { useState } from "react";
import { getAddress, signTransaction, signMessage  } from "sats-connect";
import * as btc from '@scure/btc-signer';
import { hex } from '@scure/base';

export default function Home() {
  
  const [state, setState] = useState({
    paymentAddress: "",
    paymentPubKey: "",
    ordinalsAddress: "",
    ordinalsPubKey: "",
  });

  const [isValidOrdinals, setIsValidOrdinals] = useState(false);
  const [isValidPayment, setIsValidPayment] = useState(false);

  const onConnectClick = async () => {
    const getAddressOptions = {
      payload: {
        purposes: ['ordinals', 'payment'],
        message: 'Address for receiving Ordinals and payments',
        network: {
          type:'Mainnet'
        },
      },
      onFinish: (response) => {
        console.log(response)
        setState({
          ordinalsAddress: response.addresses[0].address,
          ordinalsPubKey: response.addresses[0].publicKey,
          paymentAddress: response.addresses[1].address,
          paymentPubKey: response.addresses[1].publicKey,
        });
        validatePubKey({addresses: response.addresses});
      },
      onCancel: () => alert('Request canceled'),
      }
        
    await getAddress(getAddressOptions);
    
  };

  const validatePubKey = async({addresses}) => {
    const network = btc.NETWORK;

    console.log('addresses', addresses);

    // format ordinals (taproot) address data
    const userInternalPubKey = hex.decode(addresses[0].publicKey);
    const ordinals = btc.p2tr(userInternalPubKey, undefined, network);

    // format payment (wrapped-segwit) address data
    const userPubKey = hex.decode(addresses[1].publicKey);
    const userP2wpkh = btc.p2wpkh(userPubKey, network);
    const payment = btc.p2sh(userP2wpkh, network);

  
    if(ordinals.address === addresses[0].address) setIsValidOrdinals(true);
    if(payment.address === addresses[1].address) setIsValidPayment(true);
    
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4 sm:p-8 lg:p-12 flex-col">
      <div className="mb-4">
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" onClick={onConnectClick}>
          Connect
        </button>
      </div>
      <div>
        <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Show wallet info
        </button>
      </div>
      <div className="mb-4 flex flex-wrap justify-center">
        <div className="my-4 lg:mx-4 w-full sm:w-auto flex flex-col sm:flex-row items-center">
          <div className="w-1/2 sm:w-auto text-center">Payment Address:</div>
          <div className="overflow-auto break-words w-1/2 sm:w-auto text-center">{state.paymentAddress}</div>
          <div className="w-1/2 sm:w-auto text-center">Payment Public Key:</div>
          <div className="overflow-auto break-words w-1/2 sm:w-auto text-center">{state.paymentPubKey}</div>
          <div className="w-1/2 sm:w-auto text-center">Address matches pubkey:</div>
          <div className="w-1/2 sm:w-auto text-center">{`${isValidPayment}`}</div>
        </div>
        <div className="my-4 lg:mx-4 w-full sm:w-auto flex flex-col sm:flex-row items-center">
          <div className="w-1/2 sm:w-auto text-center">Ordinals Address:</div>
          <div className="overflow-x-hidden break-words w-1/2 sm:w-auto text-center"> {state.ordinalsAddress}</div>
          <div className="w-1/2 sm:w-auto text-center">Ordinals Public Key:</div>
          <div className="overflow-auto break-words w-1/2 sm:w-auto text-center"> {state.ordinalsPubKey}</div>
          <div className="w-1/2 sm:w-auto text-center">Address matches pubkey:</div>
          <div className="w-1/2 sm:w-auto text-center">{`${isValidOrdinals}`}</div>
        </div>
      </div>

    </main>
  );
}
