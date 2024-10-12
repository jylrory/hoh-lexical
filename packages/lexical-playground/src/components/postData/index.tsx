import { Image, Input } from 'antd'
import { useEffect, useState } from 'react'
import { usePostContext } from '../../context/PostContext'
import './index.css'
import { placeholderImage } from './placeholder'
import FileInput from '../../ui/FileInput'
import { uploadImage } from '../../utils/ghost'

export default function PostData(): JSX.Element {
  const postContext = usePostContext()

  const [post, setPost] = useState(postContext?.post)

  const [src, setSrc] = useState(postContext?.post.feature_image ?? '')
  const [isUploading, setIsUploading] = useState(false)

  useEffect(() => {
    if (!postContext?.post) {
      return
    }
    setPost({ ...postContext.post })
  }, [postContext])

  /**
   * 处理标题改变
   */
  const onTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!postContext?.post) {
      return
    }

    postContext.post.title = e.target.value
    setPost({ ...postContext.post })
  }

  /**
   * 处理头图改变
   */
  const onFeatureImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!postContext?.post) {
      return
    }

    postContext.post.feature_image = e.target.value
    setPost({ ...postContext.post })
  }

  /**
   * 处理文件改变
   */
  const onUploadImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!postContext?.post) {
      return
    }

    const files = event.target.files

    if (files === null) {
      return
    }
    setIsUploading(true)
    const file = files[0]
    const { data } = await uploadImage(file)
    setIsUploading(false)
    if (!data) {
      return
    }

    postContext.post.feature_image = data.url
    setPost({ ...postContext.post })
  }

  return (
    <>
      {/* 标题 */}
      <div className='post-data-input-container'>
        <div className='post-data-input-title'>Title</div>
        <Input type='text' value={post?.title} onChange={onTitleChange} />
      </div>
      {/* 头图 */}
      <div className='post-data-input-container'>
        <div className='post-data-input-title'>Feature Image</div>
        {post?.feature_image && (
          <Image
            className='post-data-input-feature-image'
            src={post?.feature_image ?? ''}
            alt={post?.feature_image_alt ?? ''}
            fallback={placeholderImage}
          />
        )}
        <div className='post-data-input-sub-container'>
          <div className='post-data-input-subtitle'>Image URL</div>
          <Input
            type='text'
            value={post?.feature_image ?? ''}
            onChange={onFeatureImageChange}
          />
        </div>
        <div className='post-data-input-sub-container'>
          <input
            type='file'
            accept='image/*'
            className='Input__input'
            onChange={onUploadImageChange}
          />
        </div>
      </div>
    </>
  )
}
