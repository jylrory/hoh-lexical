import { LeftOutlined } from '@ant-design/icons'
import { $generateHtmlFromNodes } from '@lexical/html'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { Button, message } from 'antd'
import { useState } from 'react'
import { usePostContext } from '../../context/PostContext'
import {
  GHOST_URL,
  createPost,
  publishPost,
  unpublishPost,
  updatePost,
} from '../../utils/ghost'
import './index.css'

export default function EditorHeader(): JSX.Element {
  const [editor] = useLexicalComposerContext()
  const postContext = usePostContext()

  // loading 状态
  const [isSaveLoading, setIsSaveLoading] = useState(false)
  const [isPublishLoading, setIsPublishLoading] = useState(false)

  // 是否 publish 根据这个值展示不同的 ui，实现不同的功能
  const isPublished = postContext?.post?.status === 'published'

  const handleSave = () => {
    editor.read(async () => {
      const htmlString = $generateHtmlFromNodes(editor, null)
      // 为了让 Ghost 识别，不转换格式
      const htmlForGhost = `<!--kg-card-begin: html-->\n${htmlString}\n<!--kg-card-end: html-->`
      const isNewPost = !postContext?.post?.id

      setIsSaveLoading(true)
      isNewPost
        ? await createNewPost(htmlForGhost)
        : await updateCurrentPost(htmlForGhost)

      setIsSaveLoading(false)
    })
  }

  const updateCurrentPost = async (htmlForGhost: string) => {
    if (!postContext) {
      message.error('No post found')
      return
    }

    const updatedPostResponse = await updatePost({
      id: postContext.post.id,
      html: htmlForGhost,
      title: postContext.post.title,
      updated_at: new Date(postContext.post.updated_at ?? ''),
      featureImage: postContext?.post.feature_image || undefined,
      metaTitle: postContext?.post.meta_title || undefined,
      metaDescription: postContext?.post.meta_description || undefined,
      tags: postContext?.post.tags,
    })

    if (!updatedPostResponse.success) {
      return
    }

    postContext.updatePost({
      updated_at: updatedPostResponse.post.updated_at,
      html: htmlForGhost,
    })
  }

  const createNewPost = async (htmlForGhost: string) => {
    const createResponse = await createPost({
      title: postContext?.post.title ?? '(untitled)',
      html: htmlForGhost,
      featureImage: postContext?.post.feature_image || undefined,
      metaTitle: postContext?.post.meta_title || undefined,
      metaDescription: postContext?.post.meta_description || undefined,
      tags: postContext?.post.tags,
    })

    if (!createResponse.success) {
      return
    }

    postContext?.updatePost(createResponse.post)

    const url = new URL(window.location.href)
    url.searchParams.set('id', createResponse.post.id)
    history.pushState({}, '', url)
  }

  const handlePublishAndUnpublish = async () => {
    if (!postContext?.post) {
      message.error('No post found')
      return
    }

    setIsPublishLoading(true)

    const { post } = postContext
    // 根据是否 publish 来调用不同的接口
    const options = {
      id: post.id,
      updated_at: new Date(post.updated_at ?? ''),
    }
    const response = isPublished
      ? await unpublishPost(options)
      : await publishPost(options)

    setIsPublishLoading(false)

    if (response.success) {
      postContext.updatePost(response.post)
    }
  }

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
  const jumpToPostList = () => {
    const baseUrl = new URL(window.location.href)
    window.open(`${baseUrl.protocol}//${baseUrl.host}/ghost/posts`, '_self')
  }

  return (
    <div className='post-header'>
      <div className='post-actions-container'>
        <Button type='text' icon={<LeftOutlined />} onClick={jumpToPostList}>
          Posts
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
          disabled={!postContext?.post.id}
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
    </div>
  )
}
