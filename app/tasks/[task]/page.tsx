"use client"
import { useSearchParams } from "next/navigation"

export default function(){

    const { task } = useSearchParams()

    return(
        <>
        hola {task}
        </>
    )
}