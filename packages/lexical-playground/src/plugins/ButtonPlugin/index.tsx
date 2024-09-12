import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $wrapNodeInElement, mergeRegister } from '@lexical/utils'
import {
  $createParagraphNode,
  $getNodeByKey,
  $insertNodes,
  $isRootOrShadowRoot,
  COMMAND_PRIORITY_EDITOR,
  type LexicalCommand,
  type LexicalEditor,
  type NodeKey,
  createCommand,
} from 'lexical'
import { useEffect, useMemo, useState } from 'react'
import {
  $createButtonNode,
  ButtonNode,
  type ButtonPayload,
} from '../../nodes/ButtonNode'
import Button from '../../ui/Button'
import { toHex } from '../../ui/ColorPicker'
import { DialogActions } from '../../ui/Dialog'
import DropdownColorPicker from '../../ui/DropdownColorPicker'
import TextInput from '../../ui/TextInput'
import './index.css'

export type InsertButtonPayload = Readonly<ButtonPayload>

export const INSERT_BUTTON_COMMAND: LexicalCommand<InsertButtonPayload> =
  createCommand('INSERT_BUTTON_COMMAND')

export function InsertButtonDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const onConfirm = (payload: InsertButtonPayload) => {
    activeEditor.dispatchCommand(INSERT_BUTTON_COMMAND, payload)
    onClose()
  }

  return (
    <>
      <ButtonForm onConfirm={onConfirm} />
    </>
  )
}

export function UpdateButtonDialog({
  nodeKey,
  initData,
  activeEditor,
  onClose,
}: {
  nodeKey: NodeKey
  activeEditor: LexicalEditor
  onClose: () => void
  initData: Partial<InsertButtonPayload>
}) {
  const onConfirm = (payload: InsertButtonPayload) => {
    activeEditor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node instanceof ButtonNode) {
        const newNode = $createButtonNode({ ...payload })
        node.replace(newNode)
      }
    })
    onClose()
  }

  return (
    <>
      <ButtonForm initData={initData} onConfirm={onConfirm} />
    </>
  )
}

function ButtonForm({
  initData,
  onConfirm,
}: {
  onConfirm: (payload: InsertButtonPayload) => void
  initData?: Partial<InsertButtonPayload>
}) {
  const [link, setLink] = useState(initData?.link || '')
  const [text, setText] = useState(initData?.text || '')
  const [backgroundColor, setBackgroundColor] = useState(
    toHex(initData?.backgroundColor || '#3264ff'),
  )
  const [textColor, setTextColor] = useState(
    toHex(initData?.textColor || '#ffffff'),
  )
  const [noFollow, setNoFollow] = useState(initData?.noFollow ?? false)
  const [isNewTab, setIsNewTab] = useState(initData?.isNewTab ?? true)
  const [fontSize, setFontSize] = useState(initData?.fontSize || '16')
  const [width, setWidth] = useState(initData?.width ?? 'auto')
  const [height, setHeight] = useState(initData?.height ?? 'auto')
  const [borderRadius, setBorderRadius] = useState(
    initData?.borderRadius ?? '8px',
  )

  const isConfirmDisabled = useMemo(() => {
    return link === '' || text === ''
  }, [link, text])

  return (
    <>
      <div className='button-form row'>
        <TextInput
          label='Link URL'
          placeholder='i.e. https://trip.com'
          value={link}
          onChange={setLink}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Link Text'
          placeholder='Text on the button'
          value={text}
          onChange={setText}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Font Size'
          placeholder='i.e. 16px'
          value={fontSize}
          onChange={setFontSize}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Width'
          placeholder='i.e. 40px'
          value={width}
          onChange={setWidth}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Height'
          placeholder='i.e. 100px'
          value={height}
          onChange={setHeight}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Radius'
          placeholder='i.e. 8px'
          value={borderRadius}
          onChange={setBorderRadius}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='BG Color'
          placeholder='i.e #3264ff'
          value={backgroundColor}
          onChange={setBackgroundColor}
        />
        <DropdownColorPicker
          buttonClassName='toolbar-item color-picker'
          buttonAriaLabel='Formatting button background color'
          buttonIconClassName='icon font-color'
          color={backgroundColor}
          onChange={setBackgroundColor}
          title='button background color'
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Text Color'
          placeholder='i.e #3264ff'
          value={textColor}
          onChange={setTextColor}
        />
        <DropdownColorPicker
          buttonClassName='toolbar-item color-picker'
          buttonAriaLabel='Formatting button background color'
          buttonIconClassName='icon font-color'
          color={textColor}
          onChange={setTextColor}
          title='button background color'
        />
      </div>
      <div className='button-form row'>
        <div className='switch-container'>
          <label htmlFor={'is-new-tab'}>New Tab</label>
          <button
            className='switch-button'
            role='switch'
            aria-checked={isNewTab}
            id={'is-new-tab'}
            onClick={() => {
              setIsNewTab((prev) => !prev)
            }}
          >
            <span />
          </button>
        </div>
      </div>
      <div className='button-form row'>
        <div className='switch-container'>
          <label htmlFor={'no-follow'}>No Follow</label>
          <button
            className='switch-button'
            role='switch'
            aria-checked={noFollow}
            id={'no-follow'}
            onClick={() => {
              setNoFollow((prev) => !prev)
            }}
          >
            <span />
          </button>
        </div>
      </div>
      <DialogActions>
        <Button
          disabled={isConfirmDisabled}
          onClick={() => {
            onConfirm({
              link,
              text,
              backgroundColor,
              textColor,
              noFollow,
              isNewTab,
              fontSize: fontSize || '16px',
              width: width || 'auto',
              height: height || 'auto',
              borderRadius,
            })
          }}
        >
          Confirm
        </Button>
      </DialogActions>
    </>
  )
}

// 定义插件组件
function ButtonPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([ButtonNode])) {
      throw new Error(
        'ButtonPlugin: ButtonNode is not registered in the editor',
      )
    }

    // 注册插入按钮的命令
    return mergeRegister(
      editor.registerCommand<InsertButtonPayload>(
        INSERT_BUTTON_COMMAND,
        (payload) => {
          const buttonNode = $createButtonNode(payload)
          $insertNodes([buttonNode])
          if ($isRootOrShadowRoot(buttonNode.getParentOrThrow())) {
            $wrapNodeInElement(buttonNode, $createParagraphNode).selectEnd()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  return null
}

export function convertStyleNumberToString(string: string, suffix = 'px') {
  // css 属性保留字段
  const reserved = ['auto', 'inherit', 'initial', 'unset']
  if (reserved.includes(string)) {
    return string
  }

  return `${Number.parseInt(string || '0', 10)}${suffix}`
}

export default ButtonPlugin
