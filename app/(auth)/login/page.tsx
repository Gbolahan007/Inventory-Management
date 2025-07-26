"use client";

import type React from "react";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import nature from "@/app/public/nature.jpg";
import { handleSubmit } from "../action";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <Image
        src={nature}
        alt="forest background"
        fill
        className="object-cover"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 z-10" />

      {/* Login Card */}
      <Card className="relative z-20 w-full max-w-md bg-black/70 backdrop-blur-sm border-gray-700/50">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-semibold text-white">
            Login
          </CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-gray-300 text-sm">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="pl-10 bg-transparent border-b border-gray-600 border-t-0 border-l-0 border-r-0 rounded-none text-white placeholder:text-gray-400 focus:border-white focus:ring-0"
                  placeholder="Enter your email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-gray-300 text-sm">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pl-10 pr-10 bg-transparent border-b border-gray-600 border-t-0 border-l-0 border-r-0 rounded-none text-white placeholder:text-gray-400 focus:border-white focus:ring-0"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-gray-200 font-medium py-2.5 rounded-full transition-colors"
            >
              Login
              {/* {isLoading ? "Logging in..." : "Log In"} */}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
