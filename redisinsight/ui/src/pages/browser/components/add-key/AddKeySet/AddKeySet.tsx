import React, { ChangeEvent, FormEvent, useState, useEffect, useRef } from 'react'
import cx from 'classnames'
import { useDispatch, useSelector } from 'react-redux'
import {
  EuiButton,
  EuiFieldText,
  EuiFormRow,
  EuiTextColor,
  EuiForm,
  EuiFlexGroup,
  EuiFlexItem,
  EuiPanel,
} from '@elastic/eui'
import { Maybe } from 'uiSrc/utils'
import {
  addSetKey, addKeyStateSelector,
} from 'uiSrc/slices/keys'
import AddKeyCommonFields from 'uiSrc/pages/browser/components/add-key/AddKeyCommonFields/AddKeyCommonFields'
import AddItemsActions from 'uiSrc/pages/browser/components/add-items-actions/AddItemsActions'
import { CreateSetWithExpireDto } from 'apiSrc/modules/browser/dto/set.dto'

import {
  AddCommonFieldsFormConfig as defaultConfig,
  AddSetFormConfig as config
} from '../constants/fields-config'
import AddKeyFooter from '../AddKeyFooter/AddKeyFooter'

import {
  INITIAL_SET_MEMBER_STATE,
  ISetMemberState
} from '../../key-details-add-items/add-set-members/AddSetMembers'

import styles from '../../key-details-add-items/styles.module.scss'

export interface Props {
  onCancel: (isCancelled?: boolean) => void;
}

const AddKeySet = (props: Props) => {
  const { loading } = useSelector(addKeyStateSelector)
  const [keyName, setKeyName] = useState<string>('')
  const [keyTTL, setKeyTTL] = useState<Maybe<number>>(undefined)
  const [members, setMembers] = useState<ISetMemberState[]>([{ ...INITIAL_SET_MEMBER_STATE }])
  const [isFormValid, setIsFormValid] = useState<boolean>(false)
  const lastAddedMemberName = useRef<HTMLInputElement>(null)
  const prevCountMembers = useRef<number>(0)

  const dispatch = useDispatch()

  useEffect(() => {
    setIsFormValid(keyName.length > 0)
  }, [keyName])

  useEffect(() => {
    if (prevCountMembers.current !== 0 && prevCountMembers.current < members.length) {
      lastAddedMemberName.current?.focus()
    }
    prevCountMembers.current = members.length
  }, [members.length])

  const addMember = () => {
    const lastMember = members[members.length - 1]
    const newState = [
      ...members,
      {
        ...INITIAL_SET_MEMBER_STATE,
        id: lastMember.id + 1
      }
    ]
    setMembers(newState)
  }

  const removeMember = (id: number) => {
    const newState = members.filter((item) => item.id !== id)
    setMembers(newState)
  }

  const clearMemberValues = (id: number) => {
    const newState = members.map((item) => (item.id === id
      ? {
        ...item,
        name: '',
      } : item))
    setMembers(newState)
  }

  const handleMemberChange = (
    formField: string,
    id: number,
    value: string
  ) => {
    const newState = members.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          [formField]: value
        }
      }
      return item
    })
    setMembers(newState)
  }

  const onFormSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault()
    if (isFormValid) {
      submitData()
    }
  }

  const submitData = (): void => {
    const data: CreateSetWithExpireDto = {
      keyName,
      members: members.map((item) => item.name)
    }
    if (keyTTL !== undefined) {
      data.expire = keyTTL
    }
    dispatch(addSetKey(data, props.onCancel))
  }

  const isClearDisabled = (item: ISetMemberState): boolean => members.length === 1 && !item.name.length

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
      <EuiFormRow label="Members" fullWidth>
        <EuiFlexItem grow>
          {
            members.map((item, index) => (
              <EuiFlexItem
                style={{ marginBottom: '8px' }}
                className={cx('flexItemNoFullWidth', 'inlineFieldsNoSpace')}
                grow
                key={item.id}
              >
                <EuiFlexGroup gutterSize="m">
                  <EuiFlexItem grow>
                    <EuiFlexGroup gutterSize="none" alignItems="center">
                      <EuiFlexItem grow>
                        <EuiFormRow fullWidth>
                          <EuiFieldText
                            fullWidth
                            name={`member-${item.id}`}
                            id={`member-${item.id}`}
                            placeholder={config.member.placeholder}
                            value={item.name}
                            onChange={(e: ChangeEvent<HTMLInputElement>) =>
                              handleMemberChange(
                                'name',
                                item.id,
                                e.target.value
                              )}
                            inputRef={index === members.length - 1 ? lastAddedMemberName : null}
                            disabled={loading}
                            data-testid="member-name"
                          />
                        </EuiFormRow>
                      </EuiFlexItem>
                    </EuiFlexGroup>
                  </EuiFlexItem>
                  <AddItemsActions
                    id={item.id}
                    index={index}
                    length={members.length}
                    addItem={addMember}
                    removeItem={removeMember}
                    removeCanClear
                    clearIsDisabled={isClearDisabled(item)}
                    clearItemValues={clearMemberValues}
                    loading={loading}
                    anchorClassName={styles.refreshKeyTooltip}
                  />
                </EuiFlexGroup>
              </EuiFlexItem>
            ))
          }
        </EuiFlexItem>
      </EuiFormRow>
      <EuiButton type="submit" fill style={{ display: 'none' }}>
        Submit
      </EuiButton>
      <AddKeyFooter>
        <EuiPanel
          color="transparent"
          className="flexItemNoFullWidth"
          hasShadow={false}
          borderRadius="none"
          style={{ border: 'none' }}
        >
          <EuiFlexGroup justifyContent="flexEnd">
            <EuiFlexItem grow={false}>
              <EuiButton
                color="secondary"
                onClick={() => props.onCancel(true)}
                className="btn-cancel btn-back"
              >
                <EuiTextColor>Cancel</EuiTextColor>
              </EuiButton>
            </EuiFlexItem>
            <EuiFlexItem grow={false}>
              <EuiButton
                fill
                size="m"
                color="secondary"
                className="btn-add"
                isLoading={loading}
                onClick={submitData}
                disabled={!isFormValid || loading}
                data-testid="add-key-set-btn"
              >
                Add Key
              </EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup>
        </EuiPanel>
      </AddKeyFooter>
    </EuiForm>
  )
}

export default AddKeySet
