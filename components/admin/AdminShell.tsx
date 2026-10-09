import { ReactNode } from "react";
import Navbar from "../layout/Navbar";

interface Props {
  children: ReactNode;
}

export default function AdminShell({
  children,
}: Props) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />

      <main className="p-6">
        <div className="mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}