"use client";
import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { LoginData, loginSchema } from "@/schemas/auth.schema";
import { api } from "@/lib/axios";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

export default function LoginForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    try {
      const res = await api.post("/auth/login", data);

      if (res.data.status !== "success") {
        toast.error(res.data.message || "Login failed");
        reset();
        return;
      }

      // The API envelope is { status, message, data }, where `data` IS the user
      // object (the controller returns `apiResponse.success(user, ...)`), so the
      // role lives at res.data.data.role — not res.data.data.user.role.
      const user = res.data.data;
      toast.success("Login successful!");
      router.push(user.role === "ADMIN" ? "/admin" : "/");
    } catch (error: any) {
      const msg = error?.response?.data?.message || "Server error";
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
        {/* Chatbot Logo */}
        <div className="flex justify-center">
          <img
            src="/chatbot-logo.png"
            alt="Chatbot Logo"
            className="w-48 h-48"
          />
        </div>

        {/* Title */}
        <h2 className="text-center text-xl font-bold text-gray-800 mb-6">
          ຜູ້ເບິ່ງແຍງລະບົບ
        </h2>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="relative space-y-2">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="ທີ່ຢູ່ອີເມວ"
              className="w-full pl-10 pr-4 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <div className="relative space-y-4">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="ລະຫັດຜ່ານ"
              className="w-full pl-10 pr-10 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-sm">{errors.password.message}</p>
            )}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4" />
              ຈົດຈຳລະຫັດ
            </label>
            <a href="#" className="text-gray-600 hover:underline">
              ລືມລະຫັດຜ່ານ?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-gray-600 text-white py-2 rounded-md hover:bg-gray-700 transition"
            disabled={isSubmitting}
          >
            {isSubmitting ? "ກຳລັງເຂົ້າສູ່ລະບົບ..." : "ເຂົ້າສູ່ລະບົບ"}
          </button>
          {/* <p className="text-center text-sm">
            Don&apos;t have an account?{" "}
            <a href="/register" className="text-blue-600 hover:underline">
              Register
            </a>
          </p> */}
        </form>
      </div>
    </div>
  );
}
