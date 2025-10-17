import type { ReactNode } from "react";

interface TasksLayoutProps {
    children: ReactNode;
}

export default function TasksLayout({ children }: TasksLayoutProps) {
    return (
        <html lang="en">
            <body>
                <div className="min-h-screen bg-gray-50">
                    <header className="p-4 bg-white shadow-md">Tasks Section</header>
                    <main className="p-6">{children}</main>
                    <footer className="p-4 text-center text-sm text-gray-500">© 2025 My App</footer>
                </div>
            </body>
        </html>
    );
}
