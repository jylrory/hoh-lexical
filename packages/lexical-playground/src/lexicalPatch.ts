/**
 * 被官方认证的 patch 但是没有写进正式代码 但是好用
 */

import {
  $isTextNode,
  type DOMConversion,
  type DOMConversionOutput,
  type LexicalEditor,
  type TextFormatType,
  TextNode,
} from 'lexical'

const createMissedFormatConverter = (format: TextFormatType) => {
  return (): DOMConversionOutput => {
    return {
      forChild: (lexicalNode) => {
        if ($isTextNode(lexicalNode)) {
          lexicalNode.toggleFormat(format)
        }

        return lexicalNode
      },
      node: null,
    }
  }
}

const patchStyleConversion = (
  originalDOMConverter?: (node: HTMLElement) => DOMConversion | null,
): ((node: HTMLElement) => DOMConversionOutput | null) => {
  return (node) => {
    const original = originalDOMConverter?.(node)
    if (!original) {
      return null
    }

    const originalOutput = original.conversion(node)

    if (!originalOutput) {
      return originalOutput
    }

    const backgroundColor = node.style.backgroundColor
    const color = node.style.color
    const fontSize = node.style.fontSize

    return {
      ...originalOutput,
      forChild: (lexicalNode, parent) => {
        const originalForChild = originalOutput?.forChild ?? ((x) => x)
        const result = originalForChild(lexicalNode, parent)
        if ($isTextNode(result)) {
          const style = [
            backgroundColor ? `background-color: ${backgroundColor}` : null,
            color ? `color: ${color}` : null,
            fontSize ? `font-size: ${fontSize}` : null,
          ]
            .filter((item) => item !== null)
            .join('; ')
          if (style.length) {
            return result.setStyle(style)
          }
        }
        return result
      },
    }
  }
}

export function applyHtmlToRichContentPatches() {
  const importers = TextNode.importDOM()
  TextNode.importDOM = function _() {
    return {
      ...importers,
      span: () => ({
        conversion: patchStyleConversion(importers?.span),
        priority: 0,
      }),
      sub: () => ({
        conversion: createMissedFormatConverter('subscript'),
        priority: 0,
      }),
      sup: () => ({
        conversion: createMissedFormatConverter('superscript'),
        priority: 0,
      }),
      s: () => ({
        conversion: createMissedFormatConverter('strikethrough'),
        priority: 0,
      }),
    }
  }

  const missedFormatTag: Array<[TextFormatType, string]> = [
    ['underline', 'u'],
    ['strikethrough', 's'],
  ]

  const exportDOM = TextNode.prototype.exportDOM
  TextNode.prototype.exportDOM = function _(
    this: TextNode,
    editor: LexicalEditor,
  ) {
    const { element } = exportDOM.apply(this, [editor])
    if (!element) {
      return { element }
    }

    let wrapped = element

    for (const [format, tag] of missedFormatTag) {
      if ($hasFormat(this, format)) {
        const wrapper = document.createElement(tag)
        wrapper.appendChild(element)
        wrapped = wrapper
      }
    }

    return { element: wrapped }
  }
}

export function $hasFormat(node: TextNode, format: TextFormatType): boolean {
  const currentFormat = node.getFormat()
  return node.getFormatFlags(format, null) < currentFormat
}
