import { useContext, useEffect } from "react"
import { AuthContext } from "../context/AuthContext"
import { setupApiClient } from "../services/api";
import { api } from "../services/apiClient";
import { withSSRAuth } from "../utils/withSSRAuth";

export default function Dashboard(){
    const {user} = useContext(AuthContext);

    useEffect(() => {
        api.get('/me').then(response => console.log(response))
        .catch(err => console.error(err));
    },[])

    return(
        <h1>Dashboard: {user?.email}</h1>
    )
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
    const apiAlient = setupApiClient(ctx);
    const response = await apiAlient.get('/me');
    console.log(response.data);
    return{
        props: {}
    }
})