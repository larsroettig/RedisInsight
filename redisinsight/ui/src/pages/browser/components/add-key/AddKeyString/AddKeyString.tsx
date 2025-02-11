import React, { ChangeEvent, FormEvent, useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  EuiButton,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel, EuiTextArea,
} from '@elastic/eui'
import { Maybe } from 'uiSrc/utils'

import { addKeyStateSelector, addStringKey } from 'uiSrc/slices/keys'

import AddKeyCommonFields from 'uiSrc/pages/browser/components/add-key/AddKeyCommonFields/AddKeyCommonFields'
import { SetStringWithExpireDto } from 'apiSrc/modules/browser/dto'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'
import {
  AddCommonFieldsFormConfig as defaultConfig,
  AddStringFormConfig as config
} from '../constants/fields-config'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddKeyString = (props: Props) => {
  const { loading } = useSelector(addKeyStateSelector)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)
  const [value, setValue] = useState<string>('')
  const [isFormValid, setIsFormValid] = useState<boolean>(false)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: SetStringWithExpireDto = {
      keyName,
      value
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addStringKey(data, props.onCancel))
  }

  return (
    <EuiForm component="form" onSubmit={onFormSubmit}>
      <AddKeyCommonFields
        config={defaultConfig}
        loading={loading}
        keyName={keyName}
        setKeyName={setKeyName}
        keyTTL={keyTTL}
        setKeyTTL={setKeyTTL}
      />
      <EuiFormRow label={config.value.label} fullWidth>
        <EuiTextArea
          fullWidth
          name="value"
          id="value"
          resize="vertical"
          placeholder={config.value.placeholder}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) =>
            setValue(e.target.value)}
          disabled={loading}
          data-testid="string-value"
        />
      </EuiFormRow>
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel style={{ border: 'none' }} color="transparent" hasShadow={false} borderRadius="none">
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  color="secondary"
                  onClick={() => props.onCancel(true)}
                  className="btn-cancel btn-back"
                >
                  <EuiTextColor>Cancel</EuiTextColor>
                </EuiButton>
              </div>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <div>
                <EuiButton
                  fill
                  size="m"
                  color="secondary"
                  className="btn-add"
                  isLoading={loading}
                  onClick={submitData}
                  disabled={!isFormValid || loading}
                  data-testid="add-key-string-btn"
                >
                  Add Key
                </EuiButton>
              </div>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeyString
