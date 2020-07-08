import React, { useContext, useEffect, useState } from 'react';
import Header from '../common/Header'
import Footer from '../common/Footer'
import BodyBuyCrypto from './BodyBuyCrypto'
import styles from '../styles.module.css'
import PickView from '../PickView'
import ChooseGatewayView from '../ChooseGatewayView'

import { NavContext } from '../wrappers/context'
import { APIContext } from '../wrappers/APIContext'

const BuyCryptoView: React.FC = () => {
  const [expectedAmount, setExpectedAmount] = useState(0)
  const [selectedCryptoIndex, setSelectedCryptoIndex] = useState(0)
  const [selectedCurrencyIndex, setSelectedCurrencyIndex] = useState(0)
  const [selectedPaymentMethodIndex, setSelectedPaymentMethodIndex] = useState(0)

  const { nextScreen, backScreen } = useContext(NavContext);
  const { data, inputInterface, remote, collected } = useContext(APIContext);

  useEffect(() => {
    async function getExpectedCrypto() {
      let r = await remote.getExpectedCrypto(collected.amount);
      setExpectedAmount(r)
    }
    getExpectedCrypto()
  }, [collected.amount, remote])

  useEffect(() => {
    async function getData() {
      let r = await remote.getData();
      data.addData(r)
    }
    getData()
  }, [data, remote])

  const handleItemClick = (name: string, index: number) => {
    if (name === 'crypto')
      setSelectedCryptoIndex(index)
    else if (name === 'currency')
      setSelectedCurrencyIndex(index)
    else if (name === 'paymentMethod')
      setSelectedPaymentMethodIndex(index)
    backScreen()
  }

  return (
    <div className={styles.view}>
      <Header title="Buy crypto" />
      <BodyBuyCrypto
        onBuyCrypto={() => nextScreen(<ChooseGatewayView />)}
        openPickCrypto={() => nextScreen(<PickView name='crypto' title="Select cryptocurrency" items={data.availableCryptos} onItemClick={handleItemClick} />)}
        openPickCurrency={() => nextScreen(<PickView name='currency' title="Select fiat currency" items={data.availableCurrencies} onItemClick={handleItemClick} />)}
        openPickPayment={() => nextScreen(<PickView name='paymentMethod' title="Select payment method" items={data.availablePaymentMethods} onItemClick={handleItemClick} />)}
        selectedCrypto={data.availableCryptos[selectedCryptoIndex]}
        selectedCurrency={data.availableCurrencies[selectedCurrencyIndex]}
        selectedPaymentMethod={data.availablePaymentMethods[selectedPaymentMethodIndex]}
        expectedAmount={expectedAmount}
        amountValue={collected.amount}
        handleInputChange={inputInterface.handleInputChange}
      />
      <Footer />
    </div>
  );
};

export default BuyCryptoView;