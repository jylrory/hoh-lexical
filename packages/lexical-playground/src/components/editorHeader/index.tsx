import { LeftOutlined } from '@ant-design/icons'
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button, message } from 'antd'
import { $getRoot, type LexicalEditor } from 'lexical'
import { useCallback, useEffect, useState } from 'react'
import { usePostContext } from '../../context/PostContext'
import useModal from '../../hooks/useModal'
import type { Type } from '../../type'
import { DialogActions } from '../../ui/Dialog'
import {
  GHOST_URL,
  convertHtmlForGhost,
  createPage,
  createPost,
  isContentSame,
  isEmptyContent,
  publishPage,
  publishPost,
  unpublishPage,
  unpublishPost,
  updatePage,
  updatePost,
} from '../../utils/ghost'
import './index.css'

export default function EditorHeader(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const postContext = usePostContext()
  const [modal, showModal] = useModal()
  // 是否开始草稿保存倒计时
  const [isDraftSaving, setIsDraftSaving] = useState(false)

  // loading 状态
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  const [isPublishLoading, setIsPublishLoading] = useState(false)

  useEffect(() => {
    if (!postContext) {
      return
    }

    const id = postContext?.post.id || 'empty'
    const draft = localStorage.getItem(`draft-${id}`)
    const isSame = isContentSame(draft ?? '', postContext.post.html ?? '')

    if (draft && !isEmptyContent(draft) && !isSame) {
      showModal('Restore Draft', (onClose) => (
        <RestoreDraftDialog
          activeEditor={editor}
          onClose={() => {
            setIsDraftSaving(true)
            onClose()
          }}
          draft={draft}
        />
      ))
    } else {
      setIsDraftSaving(true)
    }
  }, [editor, postContext, showModal])

  useEffect(() => {
    if (!isDraftSaving) {
      return
    }

    const id = postContext?.post.id || 'empty'
    // 定时保存草稿
    const interval = setInterval(() => {
      if (!postContext?.post) {
        return
      }

      editor.read(async () => {
        const htmlString = $generateHtmlFromNodes(editor, null)
        if (
          isEmptyContent(htmlString) ||
          isContentSame(htmlString, postContext.post.html ?? '')
        ) {
          return
        }
        localStorage.setItem(`draft-${id}`, htmlString)
      })
    }, 30 * 1000)

    return () => {
      clearInterval(interval)
    }
  }, [isDraftSaving, editor, postContext])

  // 根据 type 展示不同的列表名称
  const listDisplayName = postContext?.type === 'post' ? 'posts' : 'pages'

  // 是否 publish 根据这个值展示不同的 ui，实现不同的功能
  const isPublished = postContext?.post?.status === 'published'

  const handleSave = () => {
    if (!postContext) {
      message.error('Post context not found')
      return
    }

    editor.read(async () => {
      const htmlString = $generateHtmlFromNodes(editor, null)
      // 为了让 Ghost 识别，不转换格式
      const htmlForGhost = convertHtmlForGhost(htmlString)
      const isNewPost = !postContext.post?.id

      setIsSaveLoading(true)
      isNewPost
        ? await createNewPost(htmlForGhost, postContext.type)
        : await updateCurrentPost(htmlForGhost, postContext.type)

      // 清除草稿
      const id = postContext.post.id || 'empty'
      localStorage.removeItem(`draft-${id}`)

      setIsSaveLoading(false)
    })
  }

  const updateCurrentPost = async (htmlForGhost: string, type: Type) => {
    if (!postContext) {
      message.error('No post found')
      return
    }

    const options = {
      id: postContext.post.id,
      html: htmlForGhost,
      title: postContext.post.title,
      updated_at: new Date(postContext.post.updated_at ?? ''),
      featureImage: postContext?.post.feature_image || undefined,
      metaTitle: postContext?.post.meta_title || undefined,
      metaDescription: postContext?.post.meta_description || undefined,
      tags: postContext?.post.tags,
      slug: postContext?.post.slug,
      featured: postContext?.post.featured,
    }

    const updatedPostResponse =
      type === 'post' ? await updatePost(options) : await updatePage(options)

    if (!updatedPostResponse.success) {
      return
    }

    postContext.updatePost({
      ...updatedPostResponse.data,
      updated_at: updatedPostResponse.data.updated_at,
      html: htmlForGhost,
    })
  }

  const createNewPost = async (htmlForGhost: string, type: Type) => {
    const options = {
      title: postContext?.post.title ?? '(untitled)',
      html: htmlForGhost,
      featureImage: postContext?.post.feature_image || undefined,
      metaTitle: postContext?.post.meta_title || undefined,
      metaDescription: postContext?.post.meta_description || undefined,
      tags: postContext?.post.tags,
      slug: postContext?.post.slug,
    }

    const createResponse =
      type === 'post' ? await createPost(options) : await createPage(options)

    if (!createResponse.success || !createResponse.data) {
      return
    }

    postContext?.updatePost(createResponse.data)

    const url = new URL(window.location.href)
    url.searchParams.set('id', createResponse.data.id)
    history.pushState({}, '', url)
  }

  const handlePublishAndUnpublish = async () => {
    if (!postContext?.post) {
      message.error('No post found')
      return
    }

    setIsPublishLoading(true)

    const response = isPublished ? await unpublish() : await publish()

    setIsPublishLoading(false)

    if (response?.success) {
      postContext.updatePost(response.data)
    }
  }

  const publish = useCallback(async () => {
    if (!postContext?.post) {
      return
    }

    const { post } = postContext
    const type = postContext.type
    const options = {
      id: post.id,
      updated_at: new Date(post.updated_at ?? ''),
    }

    const response =
      type === 'post' ? await publishPost(options) : await publishPage(options)

    if (response.success) {
      postContext.updatePost(response.data)
    }

    return response
  }, [postContext])

  const unpublish = useCallback(async () => {
    if (!postContext?.post) {
      return
    }

    const { post } = postContext
    const type = postContext.type
    const options = {
      id: post.id,
      updated_at: new Date(post.updated_at ?? ''),
    }

    const response =
      type === 'post'
        ? await unpublishPost(options)
        : await unpublishPage(options)

    if (response.success) {
      postContext.updatePost(response.data)
    }

    return response
  }, [postContext])

  /**
   * 跳转到预览链接，未发布的跳转到 preview 页面，发布的跳转到正式页面
   */
  const handlePreview = () => {
    if (!postContext?.post) {
      message.error('No post found')
      return
    }

    if (isPublished) {
      window.open(postContext.post.url ?? '', '_blank')
    } else {
      window.open(`${GHOST_URL}/p/${postContext.post.uuid}`, '_blank')
    }
  }

  /**
   * 跳转到 post 列表页
   */
  const jumpToList = () => {
    const baseUrl = new URL(window.location.href)
    window.open(
      `${baseUrl.protocol}//${baseUrl.host}/ghost/${listDisplayName}`,
      '_self',
    )
  }

  return postContext ? (
    <div className='post-header'>
      <div className='post-actions-container'>
        <Button type='text' icon={<LeftOutlined />} onClick={jumpToList}>
          {listDisplayName}
        </Button>
      </div>
      <div className='post-actions-container'>
        <Button
          type='text'
          style={{ color: '#30cf43' }}
          className='post-actions-action-button'
          loading={isSaveLoading}
          onClick={handleSave}
        >
          {isSaveLoading ? 'Saving' : isPublished ? 'Update' : 'Save'}
        </Button>
        <Button
          className='post-actions-action-button'
          onClick={handlePreview}
          type='text'
        >
          {isPublished ? 'View' : 'Preview'}
        </Button>
        <Button
          type='text'
          danger
          className='post-actions-action-button'
          loading={isPublishLoading}
          onClick={handlePublishAndUnpublish}
          disabled={!postContext?.post?.id}
        >
          {isPublished ? 'Unpublish' : 'Publish'}
        </Button>
        <Button
          type='text'
          danger
          className='post-actions-action-button'
          onClick={postContext?.toggleSidebar}
        >
          <span
            className={`${
              postContext?.isSidebarOpen
                ? 'sidebar-open-icon'
                : 'sidebar-collapse-icon'
            } post-actions-action-button-icon`}
          />
        </Button>
      </div>
      {modal}
    </div>
  ) : (
    <></>
  )
}

// 是否需要还原草稿的对话框
function RestoreDraftDialog({
  activeEditor,
  onClose,
  draft,
}: {
  draft: string
  activeEditor: LexicalEditor
  onClose: () => void
}): JSX.Element {
  const restoreDraft = useCallback(() => {
    activeEditor.update(() => {
      // 使用 draft 更新编辑器内容
      const parser = new DOMParser()
      const doc = parser.parseFromString(draft, 'text/html')
      // 使用 $generateNodesFromDOM 将 HTML 转换为 Lexical 节点
      const nodes = $generateNodesFromDOM(activeEditor, doc)
      // 清空当前编辑器内容并插入生成的节点
      const root = $getRoot()
      root.clear() // 清空编辑器内容
      root.append(...nodes) // 插入生成的节点
    })
    onClose()
  }, [activeEditor, draft, onClose])

  return (
    <>
      <div>
        There is a draft available for this post. Would you like to restore it?
      </div>
      <DialogActions>
        <Button onClick={restoreDraft}>Restore</Button>
      </DialogActions>
    </>
  )
}
