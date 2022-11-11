/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { FunctionComponent } from 'react'
import { Input, Dropdown } from 'vtex.styleguide'
import { helpers } from 'vtex.address-form'
import { useCssHandles } from 'vtex.css-handles'

import { getListOfOptions, hasOptions } from './fields'
import { labels } from '../../../../messages/labels'
import { findBestMatch } from 'string-similarity'
import { useCallback, useEffect } from 'react'

const { injectRules } = helpers

const CSS_HANDLES = ['addressInputContainer'] as const

const AddressInput: FunctionComponent<any> = ({
  intl,
  field,
  rules,
  handleAddrForm,
  disabled,
  currentAddrForm
}) => {
  const { handles } = useCssHandles(CSS_HANDLES)

  useEffect(() => {
    if (options && options.length > 0 && addressData?.value)
      formatSelectedAddress()
  }, [])

  const formatSelectedAddress = useCallback(() => {
    const arrayOfOptions = options.map((option: any) => option.value)
    const match: any = findBestMatch(addressData?.value, arrayOfOptions)

    handleAddrForm({
      [name]: { value: match.bestMatch.target }
    })
  }, [])

  if (!rules || (rules.country && currentAddrForm.country.value !== rules.country))
    return null

  const { name, label, hidden, required } = field

  if (hidden || name === 'receiverName' || name === 'complement') {
    return null
  }

  let addressData: any = currentAddrForm[name] ? currentAddrForm[name] : ''
  let state: string = ''

  if (!addressData) return null

  function checkType(str: string) {
    str = String(str).trim();
    const regx = {
      "upper": /^[A-Z0-9 ]+$/
    }
    if (regx.upper.test(str)) {
      return true
    }

    return false
  }

  if (name === 'state' && addressData.value && checkType(addressData.value)) {
    state = upperCaseFirstLetter(addressData.value.toLowerCase())
  }

  const options = hasOptions(field, currentAddrForm)
    ? getListOfOptions(field, currentAddrForm, rules)
    : undefined
  const addClasses = () => {
    if (name === 'city' || name === 'state') {
      return 'w-50 ph1 pb5'
    }

    if (name === 'postalCode') {
      return 'w-100 pb5'
    }

    return 'pb5 w-100'
  }

  function upperCaseFirstLetter(s: string) {
    return s.replace(/^.{1}/g, s[0].toUpperCase());
  }

  const getPlaceholder = () => {
    if (required) {
      return null
    }

    return intl.formatMessage({
      id: 'store/shopper-location.change-location.optional',
    })
  }

  const getLabel = () => {
    return intl.formatMessage(
      label
        ? labels[label as keyof typeof labels]
        : labels[name as keyof typeof labels]
    )
  }

  const getErrorMessage = () => {
    if (addressData.valid !== false) {
      return null
    }

    const key = addressData.reason as keyof typeof labels

    if (key === 'ERROR_EMPTY_FIELD' || key === 'ERROR_POSTAL_CODE') {
      return intl.formatMessage(labels[key])
    }

    return intl.formatMessage(labels.generic)
  }

  const onChangeField = (e: any) => {
    let newValues: any = {
      [name]: { value: e.target.value }
    }
    if (name === 'state') {
      newValues.city = { value: '' }
      newValues.neighborhood = { value: '' }
    }
    if (name === 'city') {
      newValues.neighborhood = { value: '' }
    }
    handleAddrForm(newValues)
  }


  return (
    <div className={`${handles.addressInputContainer} ${addClasses()}`}>
      {options && options.length > 0 ? (
        <Dropdown
          placeholder={getPlaceholder()}
          label={getLabel()}
          options={options}
          value={name === 'state' && state ? state : addressData.value || ''}
          onChange={onChangeField}
          errorMessage={getErrorMessage()}
          disabled={disabled}
        />
      ) : (
        <Input
          placeholder={getPlaceholder()}
          label={getLabel()}
          value={addressData.value}
          onChange={(e: any) =>
            handleAddrForm({ [name]: { value: e.target.value } })
          }
          errorMessage={getErrorMessage()}
        />
      )}
    </div>
  )
}

export default injectRules(AddressInput)
