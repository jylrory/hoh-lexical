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
import { $createBannerNode, BannerNode, type BannerPayload } from '../../nodes/BannerNode'
import Button from '../../ui/Button'
import { DialogActions } from '../../ui/Dialog'
import TextInput from '../../ui/TextInput'
import './index.css'
import FileInput from '../../ui/FileInput'
import { uploadImage } from '../../utils/ghost'

export type InsertBannerPayload = Readonly<BannerPayload>

export const INSERT_BANNER_COMMAND: LexicalCommand<InsertBannerPayload> =
  createCommand('INSERT_BANNER_COMMAND')

export function InsertBannerDialog({
  activeEditor,
  onClose,
}: {
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const onConfirm = (payload: InsertBannerPayload) => {
    activeEditor.dispatchCommand(INSERT_BANNER_COMMAND, payload)
    onClose()
  }

  return (
    <>
      <BannerForm onConfirm={onConfirm} />
    </>
  )
}

export function UpdateBannerDialog({
  nodeKey,
  initData,
  activeEditor,
  onClose,
}: {
  nodeKey: NodeKey
  activeEditor: LexicalEditor
  onClose: () => void
  initData: Partial<InsertBannerPayload>
}) {
  const onConfirm = (payload: InsertBannerPayload) => {
    activeEditor.update(() => {
      const node = $getNodeByKey(nodeKey)
      if (node instanceof BannerNode) {
        const newNode = $createBannerNode({ ...payload })
        node.replace(newNode)
      }
    })
    onClose()
  }

  return (
    <>
      <BannerForm initData={initData} onConfirm={onConfirm} />
    </>
  )
}

function BannerForm({
  initData,
  onConfirm,
}: {
  onConfirm: (payload: InsertBannerPayload) => void
  initData?: Partial<InsertBannerPayload>
}) {
  const [link, setLink] = useState(initData?.link || '')
  const [image, setImage] = useState(initData?.image || '')
  const [imageALT, setImageALT] = useState(initData?.imageALT || '')
  const [noFollow, setNoFollow] = useState(initData?.noFollow ?? false)
  const [isNewTab, setIsNewTab] = useState(initData?.isNewTab ?? true)
  const [width, setWidth] = useState(initData?.width ?? '100%')
  const [height, setHeight] = useState(initData?.height ?? 'auto')
  const [borderRadius, setBorderRadius] = useState(
    initData?.borderRadius ?? '0px',
  )
  const [isUploading, setIsUploading] = useState(false)

  const isConfirmDisabled = useMemo(() => {
    return image === '' || isUploading
  }, [image, isUploading])

  const onUploadImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files === null) {
      return
    }

    setIsUploading(true)
    const file = files[0]
    const { data } = await uploadImage(file)
    setIsUploading(false)
    if (!data) {
      return
    }

    setImage(data.url)
  }

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
          label='Image URL'
          placeholder='i.e. https://trip.com'
          value={image}
          onChange={setImage}
        />
      </div>
      <div className='button-form row'>
          <input
            type='file'
            accept='image/*'
            className='Input__input'
            onChange={onUploadImageChange}
          />
        </div>
      <div className='button-form row'>
        <TextInput
          label='Image ALT'
          placeholder='Image ALT'
          value={imageALT}
          onChange={setImageALT}
        />
      </div>
      <div className='button-form row'>
        <TextInput
          label='Width'
          placeholder='i.e. 100%'
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
              image,
              imageALT,
              noFollow,
              isNewTab,
              width: width || '100%',
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
function BannerPlugin() {
  const [editor] = useLexicalComposerContext()

  useEffect(() => {
    if (!editor.hasNodes([BannerNode])) {
      throw new Error(
        'BannerPlugin: BannerNode is not registered in the editor',
      )
    }

    // 注册插入按钮的命令
    return mergeRegister(
      editor.registerCommand<InsertBannerPayload>(
        INSERT_BANNER_COMMAND,
        (payload) => {
          const bannerNode = $createBannerNode(payload)
          $insertNodes([bannerNode])
          if ($isRootOrShadowRoot(bannerNode.getParentOrThrow())) {
            $wrapNodeInElement(bannerNode, $createParagraphNode).selectEnd()
          }

          return true
        },
        COMMAND_PRIORITY_EDITOR,
      ),
    )
  }, [editor])

  return null
}

export default BannerPlugin
