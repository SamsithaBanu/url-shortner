import { redirect, useNavigate } from "react-router"
import { Button } from "../components/ui/button"
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { useState } from "react"
import { registerUser } from "../lib/api"
import { toast } from "react-toastify"

const SignupPage = () => {
    const navigate = useNavigate();
    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            await registerUser({
                email: email,
                name: name,
                password: password
            });
            toast.success('User Registration Successfully!')
            navigate('/login')

        } catch (err: any) {
            toast.error('User Registration Failed!')
            setError(err.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>Sign up to your account</CardTitle>
                <CardDescription>
                    Enter your email and name below to signup to your account
                </CardDescription>
                <CardAction>
                    <Button variant="link" onClick={() => navigate('/login')}>Sign in</Button>
                </CardAction>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col gap-6">

                        <div className="grid gap-2">
                            <Label htmlFor="name">User Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Enter your name"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="m@example.com"
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>

                    </div>

                    <CardFooter className="flex-col gap-2 mt-6 px-0">
                        <Button
                            type="submit"
                            className='w-full bg-[#0D1282] hover:bg-[#0D1282]/70 text-white'
                            disabled={loading}
                        >
                            {loading ? "Signing up..." : "Signup"}
                        </Button>
                    </CardFooter>
                </form>
            </CardContent>
        </Card>

    )
}
export default SignupPage;