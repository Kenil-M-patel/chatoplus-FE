"use client";
import RegisterForm from "@/sections/RegisterForm";
import Link from "next/link";
export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-lg p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center">
          <h1 className="text-3xl font-bold text-center text-gray-800">
            Create Your Account
          </h1>
          <p className="mt-1 text-sm text-center text-gray-600">
            Join our chat community today!
          </p>
        </div>

        <RegisterForm />

        <p className="mt-6 text-sm text-center text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
