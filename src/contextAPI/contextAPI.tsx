'use client'
import { ReactNode, createContext, useState, Dispatch, SetStateAction } from "react"

interface ContextAPI {
    isToggled: boolean,
    setIsToggled: Dispatch<SetStateAction<boolean>>,
    
}
export const context = createContext({} as ContextAPI);

export default function ContextApp({ children }: { children: ReactNode }) {
    const [isToggled, setIsToggled] = useState(false);
    
    return <context.Provider value={{ isToggled, setIsToggled}}>
        {children}
    </context.Provider>
} 