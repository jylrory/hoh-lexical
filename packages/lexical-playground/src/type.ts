import type { Post } from '@ts-ghost/admin-api'

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
