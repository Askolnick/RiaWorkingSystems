import '../globals.css'
import { WithQueryClient } from '../providers/query-client'
export default function Layout({ children }: { children: React.ReactNode }){
  return <WithQueryClient>{children}</WithQueryClient>
}
