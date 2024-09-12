import './index.css'
import { Button, Form, Input } from 'antd'
import { useEffect, useState } from 'react'
import { usePostContext } from '../../context/PostContext'
const { TextArea } = Input

type MetaDataFieldType = {
  metaTitle?: string
  metaDescription?: string
}

export default function SideBar(): JSX.Element {
  const postContext = usePostContext()

  const [post, setPost] = useState(postContext?.post)

  useEffect(() => {
    console.log('in')
    console.log(postContext?.post)
    if (!postContext?.post) {
      return
    }

    console.log(postContext.post.meta_title)
    console.log(postContext.post.meta_description)
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

  return (
    <>
      <div className='sidebar-post-data-title'>
        <div className='google-icon prefix-icon' />
        <div>Meta Data</div>
      </div>
      <div>
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
    </>
  )
}
