import './index.css'
import {
  Button,
  Form,
  Input,
  message,
  Modal,
  Select,
  type SelectProps,
} from 'antd'
import { TagsOutlined, LinkOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { usePostContext } from '../../context/PostContext'
import { deletePage, deletePost, getTags } from '../../utils/ghost'
import { set } from 'lodash-es'
const { TextArea } = Input

type MetaDataFieldType = {
  metaTitle?: string
  metaDescription?: string
}

export default function SideBar(): JSX.Element {
  const postContext = usePostContext()

  const [post, setPost] = useState(postContext?.post)
  const [allTags, setAllTags] = useState<any[]>([])

  // 删除确认 modal 的状态
  const [openModal, setOpenModal] = useState(false)
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [modalText, setModalText] = useState(
    'Are you sure you want to delete this post? This action cannot be undone.',
  )

  const tagOptions = useMemo(() => {
    return allTags.map((tag) => ({
      label: tag.name,
      value: tag.id,
    }))
  }, [allTags])

  useEffect(() => {
    if (!postContext?.post) {
      return
    }

    console.log(postContext.post)

    // 获取文章配置
    getPostConfig()

    setPost({ ...postContext.post })
  }, [postContext])

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!postContext?.post) {
      return
    }

    postContext.post.slug = e.target.value
    setPost({ ...postContext.post })
  }

  const handleMetaTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!postContext?.post) {
      return
    }

    postContext.post.meta_title = e.target.value
    setPost({ ...postContext.post })
  }

  const handleMetaDescriptionChange = (
    e: React.ChangeEvent<HTMLTextAreaElement>,
  ) => {
    if (!postContext?.post) {
      return
    }

    postContext.post.meta_description = e.target.value
    setPost({ ...postContext.post })
  }

  /**
   * 获取文章配置
   */
  const getPostConfig = async () => {
    // Tag
    const tagResponse = await getTags()
    if (!tagResponse.success) {
      return
    }

    setAllTags(tagResponse.tags)
  }

  const onTagChange = (ids: string[]) => {
    if (!postContext?.post) {
      return
    }

    // 根据 id 找到对应的 tag
    const tags = allTags.filter((tag) => ids.includes(tag.id))
    // 把 tag 赋值给 post
    postContext.post.tags = tags
  }

  const handleOk = async () => {
    if (!postContext?.post) {
      message.error('No post found')
      setOpenModal(false)
      return
    }

    setModalText('Deleting post...')
    setConfirmLoading(true)

    const type = postContext.type
    const deleteResponse =
      type === 'post'
        ? await deletePost(postContext.post.id)
        : await deletePage(postContext.post.id)

    if (deleteResponse.success) {
      // 重定向到列表页
      jumpToList()
    }

    setConfirmLoading(false)
    setOpenModal(false)
  }

  /**
   * 跳转到 post 列表页
   */
  const jumpToList = () => {
    // 根据 type 展示不同的列表名称
    const listDisplayName = postContext?.type === 'post' ? 'posts' : 'pages'
    const baseUrl = new URL(window.location.href)
    window.open(
      `${baseUrl.protocol}//${baseUrl.host}/ghost/${listDisplayName}`,
      '_self',
    )
  }

  return (
    <>
      <div className='sider-bar'>
        {/* Post URL */}
        <div>
          <div className='sidebar-post-data-title'>
            <LinkOutlined className='prefix-icon' />
            <div>Post URL</div>
          </div>
          <div className='sidebar-post-data-sub-container'>
            <Input
              placeholder='Leave empty to generate automatically'
              value={post?.slug ?? ''}
              onChange={handleSlugChange}
            />
          </div>
        </div>
        {/* meta data */}
        <div>
          <div className='sidebar-post-data-title'>
            <div className='google-icon prefix-icon' />
            <div>Meta Data</div>
          </div>
          <div className='sidebar-post-data-sub-container'>
            <div className='sidebar-post-data-subtitle'>Meta Title</div>
            <Input
              value={post?.meta_title ?? ''}
              onChange={handleMetaTitleChange}
            />
          </div>
          <div className='sidebar-post-data-sub-container'>
            <div className='sidebar-post-data-subtitle'>Meta Description</div>
            <TextArea
              rows={4}
              value={post?.meta_description ?? ''}
              onChange={handleMetaDescriptionChange}
            />
          </div>
        </div>
        {/* tags */}
        <div>
          <div className='sidebar-post-data-title'>
            <TagsOutlined className='prefix-icon' />
            <div>Tags</div>
          </div>
          <div className='sidebar-post-data-sub-container'>
            <Select
              mode='multiple'
              allowClear
              style={{ width: '100%' }}
              placeholder='Please select'
              defaultValue={post?.tags?.map((tag) => tag.id) ?? []}
              onChange={onTagChange}
              options={tagOptions}
            />
          </div>
        </div>
        {/* delete */}
        <div className='sidebar-post-data-sub-container delete-button-container'>
          <Button
            type='primary'
            danger
            style={{ width: '100%' }}
            onClick={() => setOpenModal(true)}
          >
            Delete Post
          </Button>
        </div>
      </div>
      <Modal
        // 确认删除
        title='Delete Post'
        open={openModal}
        onOk={handleOk}
        confirmLoading={confirmLoading}
        onCancel={() => {
          setOpenModal(false)
        }}
      >
        <p>{modalText}</p>
      </Modal>
    </>
  )
}
