import { type Post, TSGhostAdminAPI } from '@ts-ghost/admin-api'
import { message } from 'antd'
import { compressImage } from './image'

interface ImportMetaEnv {
  readonly VITE_GHOST_URL: string
  readonly VITE_GHOST_ADMIN_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

export const GHOST_URL =
  import.meta.env.VITE_GHOST_URL || 'https://localhost:5389'
const VITE_GHOST_ADMIN_API_KEY =
  import.meta.env.VITE_GHOST_ADMIN_API_KEY ||
  '6704cc47ee331bf5c8c06b43:1450c0c69713cc6ce3dffd27808fca9c0ac01287a238754cba8934c233401d9f'

const api = new TSGhostAdminAPI(GHOST_URL, VITE_GHOST_ADMIN_API_KEY, 'v5.91.0')

type UpdatePostData = {
  id: string
  updated_at: Date
  title?: string
  html?: string
  featureImage?: string
  featureImageAlt?: string
  metaTitle?: string
  metaDescription?: string
  tags?: Post['tags']
  slug?: Post['slug']
  featured?: Post['featured']
}

type AddPostData = Omit<UpdatePostData, 'id' | 'updated_at'> & {
  title: string
}

export async function getBlogPosts() {
  const response = await api.posts
    .browse({
      limit: 10,
    })
    .fields({
      title: true,
      slug: true,
      id: true,
      html: true,
      plaintext: true,
    })
    .formats({
      html: true,
      plaintext: true,
    })
    .fetch()
  if (!response.success) {
    throw new Error(response.errors.join(', '))
  }
  return response.data
}

export async function auth() {
  const response = await fetch('/ghost/api/admin/users/me/?include=roles', {
    credentials: 'include',
  })
  // 没有拿到数据就跳登录
  if (!response.ok) {
    window.location.href = '/ghost/#/signin'
  }

  const data = await response.json()
  return data.users[0]
}

export async function createPost(postData: AddPostData) {
  const { title, featureImage, metaTitle, metaDescription } = postData

  const response = await api.posts.add(
    {
      ...postData,
      status: 'draft',
      feature_image: featureImage,
      meta_title: metaTitle || title,
      meta_description: metaDescription,
    },
    {
      source: 'html',
    },
  )

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Saved successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function getBlogPost(id: string) {
  const response = await api.posts
    .read({
      id,
    })
    .formats({
      html: true,
    })
    .fetch()

  if (!response.success) {
    return handleError(response.errors)
  }

  return {
    success: true,
    data: response.data,
  }
}

export async function updatePost(postData: UpdatePostData) {
  const { id, title, featureImage, metaTitle, metaDescription } = postData

  const response = await api.posts.edit(
    id,
    {
      ...postData,
      feature_image: featureImage,
      meta_title: metaTitle || title,
      meta_description: metaDescription,
    },
    {
      source: 'html',
    },
  )

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Saved successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function publishPost({
  id,
  updated_at,
}: {
  id: string
  updated_at: Date
}) {
  const response = await api.posts.edit(id, { updated_at, status: 'published' })

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Published successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function publishPage({
  id,
  updated_at,
}: {
  id: string
  updated_at: Date
}) {
  const response = await api.pages.edit(id, { updated_at, status: 'published' })

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Published successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function unpublishPost({
  id,
  updated_at,
}: {
  id: string
  updated_at: Date
}) {
  const response = await api.posts.edit(id, { updated_at, status: 'draft' })

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Unpublished successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function unpublishPage({
  id,
  updated_at,
}: {
  id: string
  updated_at: Date
}) {
  const response = await api.pages.edit(id, { updated_at, status: 'draft' })

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Unpublished successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function getTags() {
  const response = await api.tags.browse().fetch()
  if (!response.success) {
    return handleError(response.errors)
  }

  return {
    success: true,
    tags: response.data,
  }
}

export async function deletePost(id: string) {
  const response = await api.posts.delete(id)
  if (!response.success) {
    return handleError(response.errors)
  }

  return {
    success: true,
  }
}

export async function getPage(id: string) {
  const response = await api.pages
    .read({
      id,
    })
    .formats({
      html: true,
    })
    .fetch()

  if (!response.success) {
    return handleError(response.errors)
  }

  return {
    success: true,
    data: response.data,
  }
}

export async function createPage(postData: AddPostData) {
  const { title, featureImage, metaTitle, metaDescription } = postData

  const response = await api.pages.add(
    {
      ...postData,
      status: 'draft',
      feature_image: featureImage,
      meta_title: metaTitle || title,
      meta_description: metaDescription,
    },
    {
      source: 'html',
    },
  )

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Saved successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function updatePage(postData: UpdatePostData) {
  const { id, title, featureImage, metaTitle, metaDescription } = postData

  const response = await api.pages.edit(
    id,
    {
      ...postData,
      feature_image: featureImage,
      meta_title: metaTitle || title,
      meta_description: metaDescription,
    },
    {
      source: 'html',
    },
  )

  if (!response.success) {
    return handleError(response.errors)
  }

  message.success('Saved successfully')
  return {
    success: true,
    data: response.data,
  }
}

export async function deletePage(id: string) {
  const response = await api.pages.delete(id)
  if (!response.success) {
    return handleError(response.errors)
  }

  return {
    success: true,
  }
}

export async function validateSlug(slug: string) {
  try {
    const response = await fetch(`/ghost/api/admin/slugs/post/${slug}`, {
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to fetch validate slug result')
    }

    const slugsResult = await response.json()
    return {
      success: true,
      data: slugsResult.slugs[0].slug as string,
    }
  } catch (error) {
    handleError([
      {
        message: error instanceof Error ? error.message : JSON.stringify(error),
        type: 'error',
      },
    ])
  }
}

export async function uploadImage(file: File) {
  try {
    const compressedFile = await compressImage(file)

    const formData = new FormData()
    formData.append('file', compressedFile)

    const response = await fetch('/ghost/api/admin/images/upload/', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    })

    if (!response.ok) {
      throw new Error('Failed to upload image')
    }

    const data = await response.json()
    return {
      success: true,
      data: data.images[0] as { url: string; ref: string },
    }
  } catch (error) {
    handleError([
      {
        message: error instanceof Error ? error.message : JSON.stringify(error),
        type: 'error',
      },
    ])
  }
}

export function isEmptyContent(lexicalHtml: string) {
  return lexicalHtml === '<p class="hoh-theme__paragraph"><br></p>'
}

export function convertHtmlForGhost(htmlString: string) {
  const htmlForGhost = `<!--kg-card-begin: html-->\n${htmlString}\n<!--kg-card-end: html-->`
  return htmlForGhost
}

/**
 * 判断 lexical 导出的 html 是否和 ghost 的 html 内容一致
 */
export function isContentSame(lexicalHtml: string, ghostHtml: string) {
  const htmlForGhost = convertHtmlForGhost(lexicalHtml)
  const replacedHtmlForGhost = htmlForGhost.replace(/\n/g, '')
  const replacedGhostHtml = ghostHtml.replace(/\n/g, '')
  const lexicalContent = document.createElement('div')
  lexicalContent.innerHTML = replacedHtmlForGhost
  const ghostContent = document.createElement('div')
  ghostContent.innerHTML = replacedGhostHtml

  return lexicalContent.isEqualNode(ghostContent)
}

function handleError(
  errors: {
    message: string
    type: string
    context?: string | null | undefined
  }[],
): {
  success: false
  data: null
  errorMessage: string
} {
  const errorMessage = errors.map((error) => error.message).join(', ')
  message.error(errorMessage)
  return {
    success: false,
    data: null,
    errorMessage,
  }
}
