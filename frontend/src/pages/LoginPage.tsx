import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useState } from "react";
import { loginUser } from "../lib/api";
import { toast } from "react-toastify";

const LoginPage = () => {
    const navigate = useNavigate();

    const [password, setPassword] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setError(null);
        setLoading(true);

        try {
            const data = await loginUser({
                username: email,
                password: password,
            });

            console.log("data", data);

            toast.success("Login successful!");

            navigate("/");
        } catch (err: any) {
            console.error(err);

            toast.error("Login failed!");

            setError(
                err.response?.data?.detail ||
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm flex-1 justify-center">

            <CardHeader>
                <CardTitle>
                    Login to your account
                </CardTitle>

                <CardDescription>
                    Enter your email below to login to your account
                </CardDescription>

                <CardAction>
                    <Button
                        variant="link"
                        onClick={() => navigate("/signup")}
                    >
                        Sign Up
                    </Button>
                </CardAction>
            </CardHeader>

            <CardContent>
                <form onSubmit={handleSubmit}>

                    <div className="flex flex-col gap-6">

                        <div className="grid gap-2">
                            <Label htmlFor="email">
                                Email
                            </Label>

                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={email}
                                onChange={(e) =>
                                    setEmail(e.target.value)
                                }
                                required
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                Password
                            </Label>

                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                required
                            />
                        </div>

                    </div>

                    <CardFooter className="flex-col gap-2 mt-6">
                        <Button
                            type="submit"
                            className=' w-full bg-[#0D1282] hover:bg-[#0D1282]/70 text-white'
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>
                    </CardFooter>

                </form>
            </CardContent>

        </Card>
    );
};

export default LoginPage;