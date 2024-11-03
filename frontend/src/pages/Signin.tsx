import { Appbar } from "@/components/Appbar"
import axios from "axios";
import { useState } from "react"


export const Signin = () => {

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleClick() {
        try{
            const res = await axios.post("http://localhost:3000/signin", { userId : username, password : password })
            localStorage.setItem("token", "bearer "+res.data.jwt);
            alert("Successful sign in please go to home")
        }catch (err) {
            alert("Invalid details desu")
            console.log("Invalid details")
        }
        
        
    }

    return (
        <div>
            <Appbar/>
            <input type="text" placeholder="username" className="border-4" onChange={(e) => {
                setUsername(e.target.value);
            }}/>
            <input type="password" placeholder="password" className="border-4"  onChange={(e) => setPassword(e.target.value)}/>
            <button className="border-4" onClick={handleClick}>Sign up</button>
        </div>
    )
}