import { Login } from "./Login"
import { useContext } from 'react';
import { myContext } from '../../App';
import { getSessionStatus } from "../Manager/SessionsManager";
export const LoginPage = () => {
    const {user,vocabUrl} = useContext(myContext);
    return <div style={{background:"rgba(0,0,0,.2"}}>
        {user &&
        <h2 style={{textAlign:"center",paddingTop:'5rem'}}>You are logged in and can navigate to the rest of the site</h2>}
        <div style={{ height:"5rem",display:"flex",flexDirection:"column",justifyContent:"space-around",alignItems:"center"}}>
            <Login />
        </div>
    </div>
}