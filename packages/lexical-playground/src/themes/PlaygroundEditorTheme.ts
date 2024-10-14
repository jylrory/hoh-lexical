/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { EditorThemeClasses } from 'lexical'

import type { CSSProperties } from 'react'
import './PlaygroundEditorTheme.css'

const theme: EditorThemeClasses = {
  autocomplete: 'hoh-theme__autocomplete',
  blockCursor: 'hoh-theme__blockCursor',
  characterLimit: 'hoh-theme__characterLimit',
  code: 'hoh-theme__code',
  codeHighlight: {
    atrule: 'hoh-theme__tokenAttr',
    attr: 'hoh-theme__tokenAttr',
    boolean: 'hoh-theme__tokenProperty',
    builtin: 'hoh-theme__tokenSelector',
    cdata: 'hoh-theme__tokenComment',
    char: 'hoh-theme__tokenSelector',
    class: 'hoh-theme__tokenFunction',
    'class-name': 'hoh-theme__tokenFunction',
    comment: 'hoh-theme__tokenComment',
    constant: 'hoh-theme__tokenProperty',
    deleted: 'hoh-theme__tokenProperty',
    doctype: 'hoh-theme__tokenComment',
    entity: 'hoh-theme__tokenOperator',
    function: 'hoh-theme__tokenFunction',
    important: 'hoh-theme__tokenVariable',
    inserted: 'hoh-theme__tokenSelector',
    keyword: 'hoh-theme__tokenAttr',
    namespace: 'hoh-theme__tokenVariable',
    number: 'hoh-theme__tokenProperty',
    operator: 'hoh-theme__tokenOperator',
    prolog: 'hoh-theme__tokenComment',
    property: 'hoh-theme__tokenProperty',
    punctuation: 'hoh-theme__tokenPunctuation',
    regex: 'hoh-theme__tokenVariable',
    selector: 'hoh-theme__tokenSelector',
    string: 'hoh-theme__tokenSelector',
    symbol: 'hoh-theme__tokenProperty',
    tag: 'hoh-theme__tokenProperty',
    url: 'hoh-theme__tokenOperator',
    variable: 'hoh-theme__tokenVariable',
  },
  embedBlock: {
    base: 'hoh-theme__embedBlock',
    focus: 'hoh-theme__embedBlockFocus',
  },
  hashtag: 'hoh-theme__hashtag',
  heading: {
    h1: 'hoh-theme__h1',
    h2: 'hoh-theme__h2',
    h3: 'hoh-theme__h3',
    h4: 'hoh-theme__h4',
    h5: 'hoh-theme__h5',
    h6: 'hoh-theme__h6',
  },
  hr: 'hoh-theme__hr',
  image: 'editor-image',
  indent: 'hoh-theme__indent',
  inlineImage: 'inline-editor-image',
  layoutContainer: 'hoh-theme__layoutContainer',
  layoutItem: 'hoh-theme__layoutItem',
  link: 'hoh-theme__link',
  list: {
    checklist: 'hoh-theme__checklist',
    listitem: 'hoh-theme__listItem',
    listitemChecked: 'hoh-theme__listItemChecked',
    listitemUnchecked: 'hoh-theme__listItemUnchecked',
    nested: {
      listitem: 'hoh-theme__nestedListItem',
    },
    olDepth: [
      'hoh-theme__ol1',
      'hoh-theme__ol2',
      'hoh-theme__ol3',
      'hoh-theme__ol4',
      'hoh-theme__ol5',
    ],
    ul: 'hoh-theme__ul',
  },
  ltr: 'hoh-theme__ltr',
  mark: 'hoh-theme__mark',
  markOverlap: 'hoh-theme__markOverlap',
  paragraph: 'hoh-theme__paragraph',
  quote: 'hoh-theme__quote',
  rtl: 'hoh-theme__rtl',
  table: 'hoh-theme__table',
  tableCell: 'hoh-theme__tableCell',
  tableCellActionButton: 'hoh-theme__tableCellActionButton',
  tableCellActionButtonContainer: 'hoh-theme__tableCellActionButtonContainer',
  tableCellEditing: 'hoh-theme__tableCellEditing',
  tableCellHeader: 'hoh-theme__tableCellHeader',
  tableCellPrimarySelected: 'hoh-theme__tableCellPrimarySelected',
  tableCellResizer: 'hoh-theme__tableCellResizer',
  tableCellSelected: 'hoh-theme__tableCellSelected',
  tableCellSortedIndicator: 'hoh-theme__tableCellSortedIndicator',
  tableResizeRuler: 'hoh-theme__tableCellResizeRuler',
  tableRowStriping: 'hoh-theme__tableRowStriping',
  tableSelected: 'hoh-theme__tableSelected',
  tableSelection: 'hoh-theme__tableSelection',
  text: {
    bold: 'hoh-theme__textBold',
    code: 'hoh-theme__textCode',
    italic: 'hoh-theme__textItalic',
    strikethrough: 'hoh-theme__textStrikethrough',
    subscript: 'hoh-theme__textSubscript',
    superscript: 'hoh-theme__textSuperscript',
    underline: 'hoh-theme__textUnderline',
    underlineStrikethrough: 'hoh-theme__textUnderlineStrikethrough',
  },
  button: 'hoh-theme__button',
}

export const themeVariables: Record<
  string,
  { [key in keyof CSSProperties]: string } | undefined
> = {
  paragraph: {
    fontSize: '14px'
  },
  h2: {
    fontSize: '24px',
  },
  h3: {
    fontSize: '16px',
  },
  tableCell: {
    fontSize: '16px',
  }
}

export default theme
