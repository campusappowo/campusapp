import { SidebarTrigger } from "./ui/sidebar"

export const Appbar = () => {
    return (
        <div className="flex justify-between w-full h-12 bg-black text-white">
            <div className="flex items-center justify-center pl-2">
                <SidebarTrigger className="pt-1 mr-5"/>
                Hello
            </div>
            <div className="flex justify-end items-center p-5">
                Bye
            </div>
        </div>
    )
}