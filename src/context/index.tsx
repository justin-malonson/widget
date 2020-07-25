import React, { createContext, useReducer, useCallback, useEffect } from 'react';

import { StateType, initialState } from './initialState'
import { mainReducer, CollectedActionsType, DataActionsType } from './reducers'

import { arrayUnique } from '../wrappers/utils'

import IconUSD from '../icons/usd.svg'
import IconCC from '../icons/ccs.svg'
import LogoOnramper from '../icons/logo.svg'

import * as API from './remote'
import * as DATAS from './maps'

//Creating context
const APIContext = createContext<StateType>(initialState);

const APIProvider: React.FC<{ defaultAmount?: number, defaultAddrs?: { [key: string]: string[] } }> = (props) => {
  const { defaultAmount = 100, defaultAddrs = {} } = props
  const iniState = {
    ...initialState,
    collected: {
      ...initialState.collected,
      amount: defaultAmount,
      defaultAddrs: defaultAddrs
    }
  }
  const [state, dispatch] = useReducer(mainReducer, iniState);

  /* DEFINING INPUT INTERFACES */
  const handleInputChange = useCallback(
    (name: string, value: string | number) => dispatch({ type: CollectedActionsType.AddField, payload: { name, value } }),
    [],
  )

  const handleFilesAdded = useCallback(
    (name: string, files: File[], maxFiles: number) => {
      const existingFiles = state.collected['files-id'].map(f => f.name)
      files = files.filter(f => !existingFiles.includes(f.name))
      if (existingFiles.length + files.length > maxFiles) return false
      dispatch({ type: CollectedActionsType.AddFile, payload: { name, value: files } })
      return true;
    },
    [state.collected],
  )

  const handleFileDeleted = useCallback(
    (name: string, fileName: string) => dispatch({ type: CollectedActionsType.DeleteFile, payload: { name, value: fileName } }),
    [],
  )

  /* *********** */

  const addData = useCallback(
    (data: any) => dispatch({ type: DataActionsType.AddData, payload: { value: data } }),
    [],
  )

  /* *********** */
  const init = useCallback(
    async (country?: string) => {
      const response_gateways = await API.gateways({ country, includeIcons: true })

      addData({ response_gateways: response_gateways })

      const ICONS_MAP = response_gateways.icons

      let availableCryptos: any[] = []
      for (var i in response_gateways.gateways) {
        availableCryptos = availableCryptos.concat(response_gateways.gateways[i].supportedCrypto)
      }
      availableCryptos = arrayUnique(availableCryptos)
      availableCryptos = availableCryptos.map((item) => ({ name: item, symbol: '', info: ICONS_MAP[item].name, icon: ICONS_MAP[item].icon }))
      addData({ availableCryptos })

    }, [addData])

  const handleCryptoChange = useCallback(
    async (crypto?: string) => {

      const selectedCrypto = state.data.availableCryptos[state.collected.selectedCrypto]

      let gateways = state.data.response_gateways.gateways

      if (!gateways) return
      if (state.data.availableCryptos.length <= 0) return

      const actualCrypto = crypto || selectedCrypto.name || state.data.availableCryptos[0].name

      const filtredGatewaysByCrypto = gateways.filter((item: any) => item.supportedCrypto.includes(actualCrypto))

      let availableCurrencies: any[] = []
      for (var i in filtredGatewaysByCrypto) {
        availableCurrencies = availableCurrencies.concat(filtredGatewaysByCrypto[i].supportedCurrencies)
      }
      availableCurrencies = arrayUnique(availableCurrencies)
      availableCurrencies = availableCurrencies.map((item) => ({ name: item, symbol: '$', info: 'currency', icon: IconUSD }))
      addData({ availableCurrencies, filtredGatewaysByCrypto })

    }, [state.data.response_gateways.gateways, state.data.availableCryptos, addData, state.collected.selectedCrypto],
  )

  const handleCurrencyChange = useCallback(
    async (currency?: string) => {

      const selectedCurrency = state.data.availableCurrencies[state.collected.selectedCurrency]

      const filtredGatewaysByCrypto = state.data.filtredGatewaysByCrypto

      if (!filtredGatewaysByCrypto) return
      if (state.data.availableCurrencies.length <= 0) return

      const actualCurrency = currency || selectedCurrency.name || state.data.availableCurrencies[0].name
      const filtredGatewaysByCurrency = filtredGatewaysByCrypto.filter((item: any) => item.supportedCurrencies.includes(actualCurrency))

      let availablePaymentMethods: any[] = []
      for (var i in filtredGatewaysByCurrency) {
        availablePaymentMethods = availablePaymentMethods.concat(filtredGatewaysByCurrency[i].paymentMethods)
      }

      availablePaymentMethods = arrayUnique(availablePaymentMethods)
      availablePaymentMethods = availablePaymentMethods.map((item) => ({ name: item, symbol: '', info: '', icon: IconCC }))
      addData({ availablePaymentMethods, filtredGatewaysByCurrency })
    }, [addData, state.data.filtredGatewaysByCrypto, state.data.availableCurrencies, state.collected.selectedCurrency],
  )

  const handlePaymentMethodChange = useCallback(
    async (paymentMehtod?: string) => {

      const selectedPaymentMethod = state.data.availablePaymentMethods[state.collected.selectedPaymentMethod]

      if (state.data.availablePaymentMethods.length <= 0) return

      const actualPaymentMethod = paymentMehtod || selectedPaymentMethod.name || state.data.availablePaymentMethods[0].name
      const actualAmount = state.collected.amount || 0

      const response_rate = await API.rate(
        state.data.availableCurrencies[state.collected.selectedCurrency].name,
        state.data.availableCryptos[state.collected.selectedCrypto].name,
        actualAmount,
        actualPaymentMethod
      )

      const filtredRatesByAviability = response_rate.filter((item: any) => item.available === true)
      const availableRates = filtredRatesByAviability.map((item: any) => ({
        receivedCrypto: item.receivedCrypto,
        fees: item.fees,
        name: item.identifier,
        txTime: item.duration.replace(' ' + item.duration.split(' ')[1], DATAS.TXTIMES_MAP[item.duration.split(' ')[1]]),
        kycLevel: `${item.requiredKYC.length}`,
        rate: item.rate,
        fee: (item.fees / state.collected.amount * 100),
        logo: LogoOnramper,
        nextStep: item.nextStep
      }))

      addData({ availableRates, response_rate, filtredRatesByAviability })
    }, [addData, state.collected.selectedCrypto, state.collected.selectedCurrency, state.data.availablePaymentMethods, state.collected.amount, state.data.availableCryptos, state.data.availableCurrencies, state.collected.selectedPaymentMethod])

  /* SET NEXTSTEP ON SELECTEDGATEWAY CHANGE */
  useEffect(() => {
    const nextStep = state.data.availableRates.length > 0 ? state.data.availableRates[state.collected.selectedGateway].nextStep : {}
    addData({ nextStep })
  }, [state.collected.selectedGateway, state.data.availableRates, addData])

  const sendCodeEmail = useCallback(async () => {
    if (!state.data.nextStep.url) return false
    await API.email(state.data.nextStep.url, state.collected.email)
    return true
  }, [state.data.nextStep.url, state.collected.email])

  return (
    <APIContext.Provider value={{
      ...state,
      inputInterface: {
        handleInputChange,
        handleFilesAdded,
        handleFileDeleted
      },
      data: {
        ...state.data,
        init,
        handleCryptoChange,
        handleCurrencyChange,
        handlePaymentMethodChange
      },
      apiInterface: {
        sendCodeEmail
      }
    }}>
      {props.children}
    </APIContext.Provider>
  )
}

export { APIProvider, APIContext };