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
    <main className="flex min-h-screen items-center justify-center p-24 flex-col">
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
      <div>
        <br />
        <div>Payment Address: {state.paymentAddress}</div>
        <div>Payment Public Key: {state.paymentPubKey}</div>
        <div>Address matches pubkey: {`${isValidPayment}`}</div>
        <br />
        <div>Ordinals Address: {state.ordinalsAddress}</div>
        <div>Ordinals Public Key: {state.ordinalsPubKey}</div>
        <div>Address matches pubkey: {`${isValidOrdinals}`}</div>

      </div>
    </main>
  );
}
