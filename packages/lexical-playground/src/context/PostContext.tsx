import type { Post } from '@ts-ghost/admin-api'
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getBlogPost } from '../utils/ghost'

type ContextShape = {
  post: Post
  updatePost: (updates: Partial<Post>) => void
  // 侧边栏展开
  isSidebarOpen: boolean
  // 切换侧边栏展开状态
  toggleSidebar: () => void
} | null

export const Context = createContext<ContextShape>(null)

export const PostContext = ({
  children,
}: {
  children: ReactNode
}): JSX.Element => {
  const [context, setContext] = useState<ContextShape>(null)

  useEffect(() => {
    // 从 url 取 id
    const id = new URLSearchParams(window.location.search).get('id')
    if (!id) {
      setContext({
        post: {
          title: '',
        } as unknown as any,
        updatePost,
        isSidebarOpen: false,
        toggleSidebar,
      })
      return
    }

    // 通过 id 获取文章
    const getPost = async () => {
      const postResponse = await getBlogPost(id)

      if (postResponse.success) {
        setContext({
          post: postResponse.post,
          updatePost,
          isSidebarOpen: false,
          toggleSidebar,
        })
      }
    }

    getPost()
  }, [])

  // 更新 post 对象的方法
  const updatePost = (updates: Partial<Post>) => {
    setContext((current) => {
      return current
        ? { ...current, post: { ...current.post, ...updates } }
        : null
    })
  }

  // 更新侧边栏展开状态
  const toggleSidebar = () => {
    setContext((current) =>
      current ? { ...current, isSidebarOpen: !current.isSidebarOpen } : null,
    )
  }

  return <Context.Provider value={context}>{children}</Context.Provider>
}

export const usePostContext = (): ContextShape => {
  return useContext(Context)
}
