import { useAtom } from "jotai"
import { activeSideBarItem } from "../app/configs/constants"

const useSidebar = () => {
    return useAtom(activeSideBarItem) 
}

export default useSidebar