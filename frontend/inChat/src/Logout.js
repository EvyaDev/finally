import { useContext } from 'react'
import { GeneralContext, socket } from './App'
import { FaPowerOff } from "react-icons/fa6"; import "./style/Logout.css"

export default function Logout() {
    const { userData, setIsLogged, setUserData } = useContext(GeneralContext);

    function logout() {
        if (!window.confirm('האם את/ה בטוח/ה שברצונך להתנתק?')) {
            return;
        }
        socket.emit("offline", userData.userName);
        localStorage.removeItem("token");
        setIsLogged(false);
        setUserData({});
    }

    return (
        <button onClick={logout} className='logout'> התנתק<FaPowerOff /></button>
    )
}