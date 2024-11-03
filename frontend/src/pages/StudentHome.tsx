import { AppbarSidebar } from "@/components/AppbarSidebar"
import { StudentCards } from "@/components/StudentDetailsCard"

export const StudentHome = () => {

    return (
            <AppbarSidebar>
                <div className="flex">
                    <StudentCards />
                </div>
            </AppbarSidebar>
    )
}