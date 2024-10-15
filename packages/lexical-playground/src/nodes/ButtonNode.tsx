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
  $createParagraphNode,
  $getSelection,
  $isParagraphNode,
  $isRangeSelection,
  $isRootNode,
  type BaseSelection,
  CLICK_COMMAND,
  COMMAND_PRIORITY_EDITOR,
  COMMAND_PRIORITY_LOW,
  type DOMConversionMap,
  type DOMConversionOutput,
  type DOMExportOutput,
  type ElementFormatType,
  KEY_ENTER_COMMAND,
  type LexicalEditor,
  LexicalNode,
  type NodeKey,
  SELECTION_CHANGE_COMMAND,
  type Spread,
} from 'lexical'
import { useCallback, useEffect, useRef, useState } from 'react'
import useModal from '../hooks/useModal'
import {
  DEFAULT_FONT_SIZE,
  DEFAULT_HEIGHT,
  DEFAULT_RADIUS,
  DEFAULT_WIDTH,
  UpdateButtonDialog,
} from '../plugins/ButtonPlugin'
import { convertStyleNumberToString } from '../utils/styleConvert'

export interface ButtonPayload {
  link: string
  text: string
  backgroundColor: string
  textColor: string
  fontSize?: string
  width?: string
  height?: string
  borderRadius?: string
  isNewTab?: boolean
  noFollow?: boolean
  format?: ElementFormatType
  key?: NodeKey
}

export type SerializedButtonNode = Spread<
  {
    link: string
    text: string
    backgroundColor: string
    textColor: string
    fontSize?: string
    width?: string
    height?: string
    borderRadius?: string
    isNewTab?: boolean
    noFollow?: boolean
  },
  SerializedDecoratorBlockNode
>

// 定义按钮的 DecoratorNode
export class ButtonNode extends DecoratorBlockNode {
  __link: string
  __noFollow: boolean
  __text: string
  __backgroundColor: string
  __textColor: string
  __isNewTab: boolean
  __fontSize: string
  __width: string
  __height: string
  __borderRadius: string

  static getType(): string {
    return 'button'
  }

  static clone(node: ButtonNode): ButtonNode {
    return new ButtonNode(
      node.__link,
      node.__text,
      node.__backgroundColor,
      node.__textColor,
      node.__fontSize,
      node.__width,
      node.__height,
      node.__borderRadius,
      node.__isNewTab,
      node.__noFollow,
      node.__format,
      node.__key,
    )
  }

  static importJSON(serializedNode: SerializedButtonNode): ButtonNode {
    const node = $createButtonNode({ ...serializedNode })
    node.setFormat(serializedNode.format)
    return node
  }

  static importDOM(): DOMConversionMap | null {
    return {
      a: (node: Node) => {
        if (
          node instanceof HTMLAnchorElement &&
          node.getAttribute('data-type') === 'button'
        ) {
          return {
            conversion: () => $convertButtonElement(node),
            priority: 2,
          }
        }

        return null
      },
    }
  }

  constructor(
    link: string,
    text: string,
    backgroundColor: string,
    textColor: string,
    fontSize = DEFAULT_FONT_SIZE,
    width = DEFAULT_WIDTH,
    height = DEFAULT_HEIGHT,
    borderRadius = DEFAULT_RADIUS,
    isNewTab = true,
    noFollow = false,
    format?: ElementFormatType,
    key?: NodeKey,
  ) {
    super(format, key)
    this.__link = link
    this.__text = text
    this.__backgroundColor = backgroundColor
    this.__noFollow = noFollow
    this.__textColor = textColor
    this.__isNewTab = isNewTab
    this.__fontSize = fontSize
    this.__width = width
    this.__height = height
    this.__borderRadius = borderRadius
  }

  getKey(): NodeKey {
    return this.__key
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('a')

    element.classList.add('hoh-theme__button')
    element.setAttribute('href', this.__link)
    if (this.__noFollow) {
      element.setAttribute('rel', 'nofollow')
    }
    element.setAttribute('target', this.__isNewTab ? '_blank' : '_self')
    element.setAttribute('data-type', 'button')
    element.innerText = this.__text
    element.style.backgroundColor = this.__backgroundColor
    element.style.color = this.__textColor
    element.style.fontSize = convertStyleNumberToString(this.__fontSize)
    element.style.width = convertStyleNumberToString(this.__width)
    element.style.height = convertStyleNumberToString(this.__height)
    element.style.lineHeight = convertStyleNumberToString(this.__height)
    element.style.borderRadius = convertStyleNumberToString(this.__borderRadius)
    element.style.textDecoration = 'none'

    return { element }
  }

  exportJSON(): SerializedButtonNode {
    return {
      ...super.exportJSON(),
      type: ButtonNode.getType(),
      link: this.__link,
      text: this.__text,
      backgroundColor: this.__backgroundColor,
      textColor: this.__textColor,
      noFollow: this.__noFollow,
      isNewTab: this.__isNewTab,
      fontSize: this.__fontSize,
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
      <ButtonComponent
        className={className}
        nodeKey={this.__key}
        link={this.__link}
        text={this.__text}
        backgroundColor={this.__backgroundColor}
        textColor={this.__textColor}
        format={this.__format}
        noFollow={this.__noFollow}
        isNewTab={this.__isNewTab}
        fontSize={this.__fontSize}
        width={this.__width}
        height={this.__height}
        borderRadius={this.__borderRadius}
      />
    )
  }
}

// 定义按钮的 React 组件
function ButtonComponent({
  nodeKey,
  link,
  text,
  backgroundColor,
  textColor,
  format,
  className,
  noFollow,
  isNewTab,
  fontSize,
  width,
  height,
  borderRadius,
}: Omit<ButtonPayload, 'key'> & {
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

  const convertedFontSize = fontSize && convertStyleNumberToString(fontSize)
  const convertedWidth = width
    ? convertStyleNumberToString(width)
    : DEFAULT_WIDTH
  const convertedHeight = height
    ? convertStyleNumberToString(height)
    : DEFAULT_HEIGHT
  const convertedBorderRadius = borderRadius
    ? convertStyleNumberToString(borderRadius)
    : DEFAULT_RADIUS

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
      <UpdateButtonDialog
        initData={{
          link,
          text,
          backgroundColor,
          textColor,
          noFollow,
          isNewTab,
          fontSize: convertedFontSize,
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
      editor.registerCommand(
        KEY_ENTER_COMMAND,
        () => {
          const selection = $getSelection()
          const childNode = selection?.getNodes()[0]

          if (childNode && $isButtonNode(childNode)) {
            const parentNode = childNode.getParent() // 获取父节点
            // 创建一个新的段落节点
            const paragraphNode = $createParagraphNode()
            // 插入到选中的 ButtonNode 之后
            parentNode?.insertAfter(paragraphNode)

            // * 通过 editor.update() 来延迟选中操作，避免重复插入
            setTimeout(() => {
              editor.update(() => {
                paragraphNode.select()
              })
            }, 0)

            // 阻止默认的回车行为
            return true
          }

          return false // 继续执行默认行为
        },
        COMMAND_PRIORITY_EDITOR,
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
          position: 'relative',
        }}
      >
        <a
          href={link}
          style={{
            backgroundColor,
            color: textColor,
            borderRadius: convertedBorderRadius,
            textDecoration: 'none',
            fontSize: convertedFontSize,
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
          {text}
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

export function $createButtonNode({
  link,
  text,
  backgroundColor,
  textColor,
  fontSize,
  width,
  height,
  borderRadius,
  isNewTab,
  noFollow,
  format,
  key,
}: ButtonPayload): ButtonNode {
  const buttonNode = new ButtonNode(
    link,
    text,
    backgroundColor,
    textColor,
    fontSize,
    width,
    height,
    borderRadius,
    isNewTab,
    noFollow,
    format,
    key,
  )

  // 获取当前的选区
  const selection = $getSelection()

  // 检查当前的父节点，如果它不是段落节点，那么就包裹一层段落节点
  if (selection !== null && $isRangeSelection(selection)) {
    const anchorNode = selection.anchor.getNode()
    const parentNode = anchorNode.getParent()

    if (parentNode !== null && !$isParagraphNode(parentNode)) {
      // 如果父节点不是段落节点，创建一个段落节点并包裹按钮节点
      const paragraphNode = $createParagraphNode()
      paragraphNode.append(buttonNode)
      return $applyNodeReplacement(paragraphNode)
    }
  }

  // 如果已经在段落里，直接返回按钮节点
  return $applyNodeReplacement(buttonNode)
}

function $convertButtonElement(domNode: Node): null | DOMConversionOutput {
  const button = domNode as HTMLAnchorElement
  const link = button.getAttribute('href') ?? ''
  const text = button.innerText
  const backgroundColor = button.style.backgroundColor
  const textColor = button.style.color
  const noFollow = button.getAttribute('rel') === 'nofollow'
  const isNewTab = button.getAttribute('target') === '_blank'
  const fontSize = button.style.fontSize
  const width = button.style.width
  const height = button.style.height
  const borderRadius = button.style.borderRadius

  const node = new ButtonNode(
    link,
    text,
    backgroundColor,
    textColor,
    fontSize,
    width,
    height,
    borderRadius,
    isNewTab,
    noFollow,
  )
  // const node = $applyNodeReplacement(buttonNode)
  return { node: $applyNodeReplacement(node) }
}

function $isButtonNode(node: LexicalNode): node is ButtonNode {
  return node instanceof ButtonNode
}
