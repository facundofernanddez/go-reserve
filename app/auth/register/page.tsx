import { authClient } from "@/lib/auth-client"

export default async function RegisterPage(){
    const {data, error} = await authClient.signUp.email({
        email, password, name, image, callbackURL: "/dashboard"
    })
    return <div>Pagina de registro</div>
}
