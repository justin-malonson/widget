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
  const { nextScreen, backScreen } = useContext(NavContext);
  const { data, api, remote, collected } = useContext(APIContext);

  useEffect(() => {
    async function getExpectedCrypto() {
      let r = await remote.getExpectedCrypto(collected.amount);
      setExpectedAmount(r)
    }
    getExpectedCrypto()
  }, [collected.amount, remote])

  const handleItemClick = (index: number) => {
    console.log('Selected', index)
    backScreen()
  }

  return (
    <div className={styles.view}>
      <Header title="Buy crypto" />
      <BodyBuyCrypto
        onBuyCrypto={() => nextScreen(<ChooseGatewayView />)}
        openPickCrypto={() => nextScreen(<PickView title="Select cryptocurrency" items={data.aviableCryptos} onItemClick={handleItemClick} />)}
        openPickCurrency={() => nextScreen(<PickView title="Select fiat currency" items={data.aviableCurrencies} onItemClick={handleItemClick} />)}
        openPickPayment={() => nextScreen(<PickView title="Select payment method" items={data.aviablePaymentMethods} onItemClick={handleItemClick} />)}
        selectedCrypto={data.aviableCryptos[0]}
        selectedCurrency={data.aviableCurrencies[0]}
        selectedPaymentMethod={data.aviablePaymentMethods[0]}
        expectedAmount={expectedAmount}
        amountValue={collected.amount}
        handleInputChange={api.handleInputChange}
      />
      <Footer />
    </div>
  );
};

export default BuyCryptoView;