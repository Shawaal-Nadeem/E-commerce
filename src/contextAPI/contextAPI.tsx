'use client'
import { ReactNode, createContext, useState, Dispatch, SetStateAction } from "react"

interface ContextAPI {
    data: any,
    setData: Dispatch<SetStateAction<any>>,
    
}
export const context = createContext({} as ContextAPI);

export default function ContextApp({ children }: { children: ReactNode }) {
    const [data, setData] = useState([]);
    
    return <context.Provider value={{ data, setData}}>
        {children}
    </context.Provider>
} 