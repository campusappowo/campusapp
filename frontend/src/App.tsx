import './App.css'
import { Appbar } from './components/Appbar'
import { AppSidebar } from './components/appSidebar'
import { SidebarProvider } from './components/ui/sidebar'
import { StudentHome } from './pages/StudentHome'

function App() {
  return (
    <>
      <SidebarProvider defaultOpen={true}>
        <AppSidebar/>
        <div className='flex flex-col w-full'>
        <Appbar/>
        <StudentHome/>
        </div>
        
      </SidebarProvider>

      
    </>
  )
}

export default App
