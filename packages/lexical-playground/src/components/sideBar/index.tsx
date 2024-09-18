import './index.css'
import { Button, Form, Input, Select, type SelectProps } from 'antd'
import { TagsOutlined } from '@ant-design/icons'
import { useEffect, useMemo, useState } from 'react'
import { usePostContext } from '../../context/PostContext'
import { getTags } from '../../utils/ghost'
const { TextArea } = Input

type MetaDataFieldType = {
  metaTitle?: string
  metaDescription?: string
}

export default function SideBar(): JSX.Element {
  const postContext = usePostContext()

  const [post, setPost] = useState(postContext?.post)

  const [allTags, setAllTags] = useState<any[]>([])

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

    console.log(tagResponse.tags)

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

  return (
    <div className='sider-bar'>
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
      {/* <div className='sidebar-post-data-sub-container delete-button-container'>
        <Button type='primary' danger style={{ width: '100%' }}>
          Delete Post
        </Button>
      </div> */}
    </div>
  )
}
