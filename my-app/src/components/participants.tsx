"use client"
import { Dispatch, SetStateAction } from "react";
interface participantProps{
    isList:boolean;
    setIsList:Dispatch<SetStateAction<boolean>>;
}

export default function Participants({isList, setIsList}:participantProps){
    return (isList &&
        <div className="list"></div>
    )

}