import React, { useState } from 'react';
import BuyCryptoView from './BuyCryptoView'
import styles from './styles.module.css'
import { NavProvider, NavContainer } from './wrappers/context';
import { APIProvider } from './context'

const defaultColor = `#${getParam('color', '31a5ff')}`
const defaultAddrs = JSON.stringify({
  BTC: ['btcAddr1', 'btcAddr2'],
  ETH: ['ethAddr1'],
  NEO: ['neoAddr1', 'neoAddr2', 'neoAddr3', 'neoAddr4']
})
const addresses = JSON.parse(getParam('addresses', defaultAddrs))
const defaultAmount = Number(getParam('defaultAmount', '100'))
const defaultCrypto = getParam('defaultCrypto', '')

const onlyCryptos = JSON.parse(getParam('onlyCryptos', JSON.stringify([])))
const excludeCryptos = JSON.parse(getParam('excludeCryptos', JSON.stringify([])))

function App() {
  const [color, setColor] = useState(defaultColor)
  return (
    <>
      <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
      <div className={`${styles['views-container']}`}>
        <OnramperWidget color={color} defaultAddrs={addresses} defaultAmount={defaultAmount} defaultCrypto={defaultCrypto} onlyCryptos={onlyCryptos} excludeCryptos={excludeCryptos} />
      </div>
    </>
  );
}

type OnramperWidgetProps = {
  color?: string
  defaultAmount?: number
  defaultCrypto?: string
  defaultAddrs?: {
    [key: string]: string[]
  }
  onlyCryptos?: string[]
  excludeCryptos?: string[]
}

const OnramperWidget: React.FC<OnramperWidgetProps> = ({ color, defaultAddrs, defaultAmount, defaultCrypto, excludeCryptos, onlyCryptos }) => {
  var style = { "--primary-color": color } as React.CSSProperties;
  return (
    <div style={style} className={`${styles['theme']}`}>
      <APIProvider defaultAmount={defaultAmount} defaultAddrs={defaultAddrs} defaultCrypto={defaultCrypto} onlyCryptos={onlyCryptos} excludeCryptos={excludeCryptos} >
        <NavProvider>
          <NavContainer home={<BuyCryptoView />} />
        </NavProvider>
      </APIProvider>
    </div>
  )
}

function getParam(name: string, defaultValue?: string): string {
  const value = new URLSearchParams(window.location.search).get(name)
  if (value === null) {
    if (defaultValue !== undefined) {
      return defaultValue
    } else {
      throw new Error(`Parameter ${name} has not been provided in the query string`)
    }
  }
  return value
}

export default App;
