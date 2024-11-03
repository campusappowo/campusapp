import { Appbar } from "./AppbarwithSidebarTrigger"
import { AppSidebar } from "./appSidebar"
import { SidebarProvider } from "./ui/sidebar"

export const AppbarSidebar = ({ children }: { children: React.ReactNode }) => {
    return(
    <SidebarProvider defaultOpen={true}>
        <AppSidebar />
        <div className='flex flex-col w-full'>
            <Appbar />
            {children}
        </div>
    </SidebarProvider>
    );
}