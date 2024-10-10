import { BlockWithAlignableContents } from '@lexical/react/LexicalBlockWithAlignableContents'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {
  DecoratorBlockNode,
  type SerializedDecoratorBlockNode,
} from '@lexical/react/LexicalDecoratorBlockNode'
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection'
import { mergeRegister } from '@lexical/utils'
import {
  $applyNodeReplacement,
  $getSelection,
  type BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  DecoratorNode,
  type EditorConfig,
  type ElementFormatType,
  type LexicalEditor,
  type NodeKey,
  SELECTION_CHANGE_COMMAND,
  type Spread,
} from 'lexical'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import useModal from '../hooks/useModal'
import {
  UpdateButtonDialog,
} from '../plugins/ButtonPlugin'
import { UpdateBannerDialog } from '../plugins/BannerPlugin'
import { convertStyleNumberToString } from '../utils/styleConvert'

export interface BannerPayload {
  link: string
  image: string
  imageALT: string
  isNewTab: boolean
  noFollow: boolean
  width?: string
  height?: string
  borderRadius?: string
  format?: ElementFormatType
  key?: NodeKey
}

export type SerializedBannerNode = Spread<
  {
    link: string
    image: string
    imageALT: string
    isNewTab: boolean
    noFollow: boolean
    width?: string
    height?: string
    borderRadius?: string
  },
  SerializedDecoratorBlockNode
>

// 定义按钮的 DecoratorNode
export class BannerNode extends DecoratorBlockNode {
  __link: string
  __image: string
  __imageALT: string
  __isNewTab: boolean
  __noFollow: boolean
  __width: string
  __height: string
  __borderRadius: string

  static getType(): string {
    return 'banner'
  }

  static clone(node: BannerNode): BannerNode {
    return new BannerNode(
      node.__link,
      node.__image,
      node.__imageALT,
      node.__isNewTab,
      node.__noFollow,
      node.__width,
      node.__height,
      node.__borderRadius,
      node.__format,
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedBannerNode): BannerNode {
    const node = $createBannerNode({ ...serializedNode })
    node.setFormat(serializedNode.format)
    return node
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => {
        if (
          node instanceof HTMLAnchorElement &&
          node.getAttribute('data-type') === 'banner'
        ) {
          return {
            conversion: () => $convertBannerElement(node),
            priority: 2,
          }
        }

        return null
      },
    }
  }

  constructor(
    link: string,
    image: string,
    imageALT: string,
    isNewTab: boolean,
    noFollow: boolean,
    width = '100%',
    height = 'auto',
    borderRadius = '0px',
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key)
    this.__link = link
    this.__image = image
    this.__imageALT = imageALT
    this.__noFollow = noFollow
    this.__isNewTab = isNewTab
    this.__width = width
    this.__height = height
    this.__borderRadius = borderRadius
  }

  getKey(): NodeKey {
    return this.__key
  }

  exportDOM(): DOMExportOutput {
    const anchorElement = document.createElement('a')

    anchorElement.classList.add('hoh-theme__banner')
    anchorElement.setAttribute('href', this.__link)
    if (this.__noFollow) {
      anchorElement.setAttribute('rel', 'nofollow')
    }
    anchorElement.setAttribute('target', this.__isNewTab ? '_blank' : '_self')
    anchorElement.setAttribute('data-type', 'banner')
    anchorElement.style.width = convertStyleNumberToString(this.__width)
    anchorElement.style.height = convertStyleNumberToString(this.__height)
    anchorElement.style.borderRadius = convertStyleNumberToString(
      this.__borderRadius,
    )
    anchorElement.style.overflow = 'hidden'

    const imageElement = document.createElement('img')
    imageElement.setAttribute('src', this.__image)
    imageElement.setAttribute('alt', this.__imageALT)
    imageElement.style.width = '100%'
    imageElement.style.height = '100%'
    imageElement.style.objectFit = 'cover'
    console.log(imageElement)

    anchorElement.appendChild(imageElement)

    return { element: anchorElement }
  }

  exportJSON(): SerializedBannerNode {
    return {
      ...super.exportJSON(),
      type: BannerNode.getType(),
      link: this.__link,
      image: this.__image,
      imageALT: this.__imageALT,
      noFollow: this.__noFollow,
      isNewTab: this.__isNewTab,
      width: this.__width,
      height: this.__height,
      borderRadius: this.__borderRadius,
    }
  }

  decorate() {
    const className = {
      base: '',
      focus: '',
    }

    return (
      <BannerComponent
        className={className}
        nodeKey={this.__key}
        link={this.__link}
        image={this.__image}
        imageALT={this.__imageALT}
        format={this.__format}
        noFollow={this.__noFollow}
        isNewTab={this.__isNewTab}
        width={this.__width}
        height={this.__height}
        borderRadius={this.__borderRadius}
      />
    )
  }
}

// 定义按钮的 React 组件
function BannerComponent({
  nodeKey,
  link,
  image,
  imageALT,
  format,
  className,
  noFollow,
  isNewTab,
  width,
  height,
  borderRadius,
}: Omit<BannerPayload, 'key'> & {
  nodeKey: NodeKey
  format: ElementFormatType | null
  className: Readonly<{
    base: string
    focus: string
  }>
}) {
  const [editor] = useLexicalComposerContext()
  const [selection, setSelection] = useState<BaseSelection | null>(null)
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey)
  const activeEditorRef = useRef<LexicalEditor | null>(null)
  const [modal, showModal] = useModal()

  const [isEditing, setIsEditing] = useState(false)

  const convertedWidth = width ? convertStyleNumberToString(width) : 'auto'
  const convertedHeight = height ? convertStyleNumberToString(height) : 'auto'
  const convertedBorderRadius =
    borderRadius && convertStyleNumberToString(borderRadius)

  const buttonRef = useRef<HTMLDivElement>(null)

  const onClick = useCallback(
    (payload: MouseEvent) => {
      const event = payload

      if (buttonRef.current?.contains(event.target as Node)) {
        clearSelection()
        setSelected(true)
        return true
      }

      if (event.target === buttonRef.current) {
        if (event.shiftKey) {
          setSelected(!isSelected)
        } else {
          clearSelection()
          setSelected(true)
        }
        return true
      }

      return false
    },
    [isSelected, setSelected, clearSelection],
  )

  const handleEditClick = () => {
    showModal('Edit Button', (onClose) => (
      <UpdateBannerDialog
        initData={{
          link,
          image,
          imageALT,
          noFollow,
          isNewTab,
          width: convertedWidth,
          height: convertedHeight,
          borderRadius: convertedBorderRadius,
        }}
        nodeKey={nodeKey}
        activeEditor={editor}
        onClose={onClose}
      />
    ))
  }

  useEffect(() => {
    let isMounted = true
    const rootElement = editor.getRootElement()
    const unregister = mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        if (isMounted) {
          setSelection(editorState.read(() => $getSelection()))
        }
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_, activeEditor) => {
          activeEditorRef.current = activeEditor
          return false
        },
        COMMAND_PRIORITY_LOW,
      ),
      editor.registerCommand<MouseEvent>(
        CLICK_COMMAND,
        onClick,
        COMMAND_PRIORITY_LOW,
      ),
    )

    return () => {
      isMounted = false
      unregister()
    }
  }, [editor, onClick])

  return (
    <BlockWithAlignableContents
      format={format}
      nodeKey={nodeKey}
      className={className}
    >
      <div
        ref={buttonRef}
        style={{
          border: isSelected ? '1px solid blue' : 'none',
          cursor: 'pointer',
        }}
      >
        <a
          href={link}
          style={{
            borderRadius: convertedBorderRadius,
            width: convertedWidth,
            height: convertedHeight,
            lineHeight: convertedHeight,
          }}
          data-type='button'
          className='hoh-theme__button'
          onClick={(e) => {
            if (editor.isEditable()) {
              e.preventDefault()
            }
          }}
        >
          <img src={image} alt={imageALT} style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }} />
        </a>
        {isSelected && (
          <span
            style={{
              position: 'absolute',
              top: '0',
              right: '0',
              cursor: 'pointer',
            }}
            onClick={handleEditClick}
          >
            ✏️
          </span>
        )}
      </div>
      {modal}
    </BlockWithAlignableContents>
  )
}

export function $createBannerNode({
  link,
  image,
  imageALT,
  width,
  height,
  borderRadius,
  isNewTab,
  noFollow,
  format,
  key,
}: BannerPayload): BannerNode {
  return $applyNodeReplacement(
    new BannerNode(
      link,
      image,
      imageALT,
      isNewTab,
      noFollow,
      width,
      height,
      borderRadius,
      format,
      key,
    ),
  )
}

function $convertBannerElement(domNode: Node): null | DOMConversionOutput {
  const button = domNode as HTMLAnchorElement
  const imageElement = button.querySelector('img')
  const image = imageElement?.getAttribute('src') ?? ''
  const imageALT = imageElement?.getAttribute('alt') ?? ''
  const link = button.getAttribute('href') ?? ''
  const noFollow = button.getAttribute('rel') === 'nofollow'
  const isNewTab = button.getAttribute('target') === '_blank'
  const width = button.style.width
  const height = button.style.height
  const borderRadius = button.style.borderRadius

  const node = $createBannerNode({
    link,
    image,
    imageALT,
    noFollow,
    isNewTab,
    width,
    height,
    borderRadius,
  })
  return { node }
}
