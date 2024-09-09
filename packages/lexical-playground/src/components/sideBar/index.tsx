import './index.css'
import { usePostContext } from '../../context/PostContext'

export default function SideBar(): JSX.Element {
  const postContext = usePostContext()
  return (
    <>
      <div className='sidebar-post-data-title'>
        <div className='google-icon prefix-icon' />
        <div>Meta Data</div>
      </div>
    </>
  )
}
