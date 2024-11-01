import { Home } from "lucide-react";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarMenuButton} from "./ui/sidebar";
import { SidebarContent } from "./ui/sidebar";

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon">
            <SidebarHeader>
                <SidebarMenuButton asChild>
                    <a href="#">
                        <Home/>
                        Home
                    </a>
                </SidebarMenuButton>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenuButton asChild>
                    <a href="#">
                        <Home    />
                        <span>Student Home</span>
                    </a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                    <a href="#">
                        <Home    />
                        <span>Class Details</span>
                    </a>
                </SidebarMenuButton>
                <SidebarMenuButton asChild>
                    <a href="#">
                        <Home    />
                        <span>Marketplace</span>
                    </a>
                </SidebarMenuButton>
            </SidebarContent>
            <SidebarFooter>
                <SidebarMenuButton asChild>
                    <a href="#">
                        <Home/>
                        Home
                    </a>
                </SidebarMenuButton>
            </SidebarFooter>
        </Sidebar>
    )
}