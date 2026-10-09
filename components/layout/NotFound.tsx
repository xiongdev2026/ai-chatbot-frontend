import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import Link from "next/link";
import { AlertTriangle } from "lucide-react";

export default async function NotFound() {
    const cookieStore = await cookies();

    const token = cookieStore.get("token")?.value;

    let role = "";

    if (token) {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET_KEY!
        ) as {
            role: string;
        };

        role = decoded.role;
    }

    return (
        <div className="flex min-h-screen items-center justify-center px-4">
            <div className="text-center">
                <AlertTriangle className="mx-auto h-16 w-16 text-red-500" />

                <h1 className="mt-6 text-6xl font-bold">404</h1>

                <h2 className="mt-4 text-2xl font-semibold">
                    Page Not Found
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Sorry, the page you are looking for does not exist.
                </p>

                <Link
                    href={role === "ADMIN" ? "/admin" : "/"}
                    className="mt-6 inline-flex rounded-lg bg-primary px-6 py-3 text-primary-foreground"
                >
                    Back to Home
                </Link>
            </div>
        </div>
    );
}