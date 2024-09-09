/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin'
import { CharacterLimitPlugin } from '@lexical/react/LexicalCharacterLimitPlugin'
import { CheckListPlugin } from '@lexical/react/LexicalCheckListPlugin'
import { ClearEditorPlugin } from '@lexical/react/LexicalClearEditorPlugin'
import { ClickableLinkPlugin } from '@lexical/react/LexicalClickableLinkPlugin'
import { CollaborationPlugin } from '@lexical/react/LexicalCollaborationPlugin'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HashtagPlugin } from '@lexical/react/LexicalHashtagPlugin'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin'
import { TablePlugin } from '@lexical/react/LexicalTablePlugin'
import { useLexicalEditable } from '@lexical/react/useLexicalEditable'
import { useEffect, useState } from 'react'
import { CAN_USE_DOM } from 'shared/canUseDOM'

import { $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $getRoot } from 'lexical'
import { createWebsocketProvider } from './collaboration'
import PostData from './components/postData'
import SideBar from './components/sideBar'
import { usePostContext } from './context/PostContext'
import { useSettings } from './context/SettingsContext'
import { useSharedHistoryContext } from './context/SharedHistoryContext'
import ActionsPlugin from './plugins/ActionsPlugin'
import AutoEmbedPlugin from './plugins/AutoEmbedPlugin'
import AutoLinkPlugin from './plugins/AutoLinkPlugin'
import AutocompletePlugin from './plugins/AutocompletePlugin'
import CodeActionMenuPlugin from './plugins/CodeActionMenuPlugin'
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin'
import CollapsiblePlugin from './plugins/CollapsiblePlugin'
import ComponentPickerPlugin from './plugins/ComponentPickerPlugin'
import ContextMenuPlugin from './plugins/ContextMenuPlugin'
import DragDropPaste from './plugins/DragDropPastePlugin'
import DraggableBlockPlugin from './plugins/DraggableBlockPlugin'
import EmojiPickerPlugin from './plugins/EmojiPickerPlugin'
import EmojisPlugin from './plugins/EmojisPlugin'
import EquationsPlugin from './plugins/EquationsPlugin'
import ExcalidrawPlugin from './plugins/ExcalidrawPlugin'
import FigmaPlugin from './plugins/FigmaPlugin'
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin'
import FloatingTextFormatToolbarPlugin from './plugins/FloatingTextFormatToolbarPlugin'
import ImagesPlugin from './plugins/ImagesPlugin'
import InlineImagePlugin from './plugins/InlineImagePlugin'
import KeywordsPlugin from './plugins/KeywordsPlugin'
import { LayoutPlugin } from './plugins/LayoutPlugin/LayoutPlugin'
import LinkPlugin from './plugins/LinkPlugin'
import ListMaxIndentLevelPlugin from './plugins/ListMaxIndentLevelPlugin'
import MarkdownShortcutPlugin from './plugins/MarkdownShortcutPlugin'
import { MaxLengthPlugin } from './plugins/MaxLengthPlugin'
import MentionsPlugin from './plugins/MentionsPlugin'
import PageBreakPlugin from './plugins/PageBreakPlugin'
import PollPlugin from './plugins/PollPlugin'
import SpeechToTextPlugin from './plugins/SpeechToTextPlugin'
import TabFocusPlugin from './plugins/TabFocusPlugin'
import TableCellActionMenuPlugin from './plugins/TableActionMenuPlugin'
import TableCellResizer from './plugins/TableCellResizer'
import TableHoverActionsPlugin from './plugins/TableHoverActionsPlugin'
import TableOfContentsPlugin from './plugins/TableOfContentsPlugin'
import ToolbarPlugin from './plugins/ToolbarPlugin'
import TreeViewPlugin from './plugins/TreeViewPlugin'
import TwitterPlugin from './plugins/TwitterPlugin'
import YouTubePlugin from './plugins/YouTubePlugin'
import ContentEditable from './ui/ContentEditable'
import { auth } from './utils/ghost'

const skipCollaborationInit =
  // @ts-expect-error
  window.parent != null && window.parent.frames.right === window

export default function Editor(): JSX.Element {
  const { historyState } = useSharedHistoryContext()
  const {
    settings: {
      isCollab,
      isAutocomplete,
      isMaxLength,
      isCharLimit,
      isCharLimitUtf8,
      isRichText,
      showTreeView,
      showTableOfContents,
      shouldUseLexicalContextMenu,
      shouldPreserveNewLinesInMarkdown,
      tableCellMerge,
      tableCellBackgroundColor,
    },
  } = useSettings()
  const isEditable = useLexicalEditable()
  const placeholder = isCollab
    ? 'Enter some collaborative rich text...'
    : isRichText
      ? 'Enter some rich text...'
      : 'Enter some plain text...'
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null)
  const [isSmallWidthViewport, setIsSmallWidthViewport] =
    useState<boolean>(false)
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
  const [editor] = useLexicalComposerContext()

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem)
    }
  }

  const postContext = usePostContext()

  useEffect(() => {
    const updateViewPortWidth = () => {
      const isNextSmallWidthViewport =
        CAN_USE_DOM && window.matchMedia('(max-width: 1025px)').matches

      if (isNextSmallWidthViewport !== isSmallWidthViewport) {
        setIsSmallWidthViewport(isNextSmallWidthViewport)
      }
    }
    updateViewPortWidth()
    window.addEventListener('resize', updateViewPortWidth)

    return () => {
      window.removeEventListener('resize', updateViewPortWidth)
    }
  }, [isSmallWidthViewport])

  useEffect(() => {
    auth()
  }, [])

  useEffect(() => {
    if (!postContext) {
      return
    }

    editor.update(() => {
      if (!postContext.post.html) {
        return
      }
      const parser = new DOMParser()

      const doc = parser.parseFromString(postContext.post.html, 'text/html')

      // 使用 $generateNodesFromDOM 将 HTML 转换为 Lexical 节点
      const nodes = $generateNodesFromDOM(editor, doc)

      // 清空当前编辑器内容并插入生成的节点
      const root = $getRoot()
      root.clear() // 清空编辑器内容
      root.append(...nodes) // 插入生成的节点
    })
  }, [postContext, editor])

  return (
    <>
      <div className='post-edit-area'>
        <div className='main-area'>
          <div className='post-content-container'>
            <div className='post-data-container'>
              <PostData />
            </div>
            <div className='editor-and-toolbar-container'>
              {isRichText && (
                <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
              )}
              <div
                className={`editor-container ${showTreeView ? 'tree-view' : ''} ${
                  !isRichText ? 'plain-text' : ''
                }`}
              >
                {isMaxLength && <MaxLengthPlugin maxLength={30} />}
                <DragDropPaste />
                <AutoFocusPlugin />
                <ClearEditorPlugin />
                <ComponentPickerPlugin />
                <EmojiPickerPlugin />
                <AutoEmbedPlugin />

                <MentionsPlugin />
                <EmojisPlugin />
                <HashtagPlugin />
                <KeywordsPlugin />
                <SpeechToTextPlugin />
                <AutoLinkPlugin />
                {/* 暂时关闭评论功能 */}
                {/* <CommentPlugin
          providerFactory={isCollab ? createWebsocketProvider : undefined}
        /> */}
                {isRichText ? (
                  <>
                    {isCollab ? (
                      <CollaborationPlugin
                        id='main'
                        providerFactory={createWebsocketProvider}
                        shouldBootstrap={!skipCollaborationInit}
                      />
                    ) : (
                      <HistoryPlugin externalHistoryState={historyState} />
                    )}
                    <RichTextPlugin
                      contentEditable={
                        <div className='editor-scroller'>
                          <div className='editor' ref={onRef}>
                            <ContentEditable placeholder={placeholder} />
                          </div>
                        </div>
                      }
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    <MarkdownShortcutPlugin />
                    <CodeHighlightPlugin />
                    <ListPlugin />
                    <CheckListPlugin />
                    <ListMaxIndentLevelPlugin maxDepth={7} />
                    <TablePlugin
                      hasCellMerge={tableCellMerge}
                      hasCellBackgroundColor={tableCellBackgroundColor}
                    />
                    <TableCellResizer />
                    <TableHoverActionsPlugin />
                    <ImagesPlugin />
                    <InlineImagePlugin />
                    <LinkPlugin />
                    <PollPlugin />
                    <TwitterPlugin />
                    <YouTubePlugin />
                    <FigmaPlugin />
                    <ClickableLinkPlugin disabled={isEditable} />
                    <HorizontalRulePlugin />
                    <EquationsPlugin />
                    <ExcalidrawPlugin />
                    <TabFocusPlugin />
                    <TabIndentationPlugin />
                    <CollapsiblePlugin />
                    <PageBreakPlugin />
                    <LayoutPlugin />
                    {floatingAnchorElem && !isSmallWidthViewport && (
                      <>
                        <DraggableBlockPlugin anchorElem={floatingAnchorElem} />
                        <CodeActionMenuPlugin anchorElem={floatingAnchorElem} />
                        <FloatingLinkEditorPlugin
                          anchorElem={floatingAnchorElem}
                          isLinkEditMode={isLinkEditMode}
                          setIsLinkEditMode={setIsLinkEditMode}
                        />
                        <TableCellActionMenuPlugin
                          anchorElem={floatingAnchorElem}
                          cellMerge={true}
                        />
                        <FloatingTextFormatToolbarPlugin
                          anchorElem={floatingAnchorElem}
                          setIsLinkEditMode={setIsLinkEditMode}
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <PlainTextPlugin
                      contentEditable={
                        <ContentEditable placeholder={placeholder} />
                      }
                      ErrorBoundary={LexicalErrorBoundary}
                    />
                    <HistoryPlugin externalHistoryState={historyState} />
                  </>
                )}
                {(isCharLimit || isCharLimitUtf8) && (
                  <CharacterLimitPlugin
                    charset={isCharLimit ? 'UTF-16' : 'UTF-8'}
                    maxLength={5}
                  />
                )}
                {isAutocomplete && <AutocompletePlugin />}
                <div>{showTableOfContents && <TableOfContentsPlugin />}</div>
                {shouldUseLexicalContextMenu && <ContextMenuPlugin />}
                <ActionsPlugin
                  isRichText={isRichText}
                  shouldPreserveNewLinesInMarkdown={
                    shouldPreserveNewLinesInMarkdown
                  }
                />
              </div>
            </div>
          </div>
        </div>
        {postContext?.isSidebarOpen && (
          <div className='post-right-sidebar'>
            <SideBar />
          </div>
        )}
      </div>
      {showTreeView && <TreeViewPlugin />}
    </>
  )
}
