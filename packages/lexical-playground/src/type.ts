import type { Post } from '@ts-ghost/admin-api'
import type { getPage } from './utils/ghost'

type GetBlogPostSuccess = {
  success: true
  post: Post
}

type GetBlogPostFailure = {
  success: false
  errorMessage: string
}

export type GetBlogPostResponse = Promise<
  GetBlogPostSuccess | GetBlogPostFailure
>

type GetDataSuccess = {
  success: true
  data: unknown
}

type GetDataFailure = {
  success: false
  data: null
  errorMessage: string
}

export type GetDataResponse = Promise<GetDataSuccess | GetDataFailure>

export type Page = NonNullable<Awaited<ReturnType<typeof getPage>>['data']>

export type Type = 'post' | 'page'
