"use client";

import { useUserData } from "@/app/components/queryhooks/useUserData";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Shield,
  ShoppingCart,
  UserPlus,
  Users,
  Loader2,
} from "lucide-react";
import { useState } from "react";
import { useFormStatus } from "react-dom";
import { addUser } from "./action";
import { useAuth } from "../(auth)/hooks/useAuth";

// Loading component
const LoadingSpinner = () => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      <p className="text-sm text-muted-foreground">
        Loading admin dashboard...
      </p>
    </div>
  </div>
);

export default function AdminDashboard() {
  // ✅ Only use auth for loading state - middleware handles the rest!
  const { loading } = useAuth();

  // Original component state
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const { user } = useUserData();

  // ✅ Show loading for auth (middleware handles authentication and authorization)
  if (loading) {
    return <LoadingSpinner />;
  }

  // Role-specific limits
  const MAX_ADMINS = 3;
  const MAX_SALESREP = 5;

  // Count users by role
  const admins = user?.filter((u) => u.role === "admin").length || 0;
  const salesrep = user?.filter((u) => u.role === "salesrep").length || 0;
  const totalUsers = user?.length || 0;

  const availableAdminSlots = MAX_ADMINS - admins;
  const availableSalesSlots = MAX_SALESREP - salesrep;
  const totalAvailableSlots = availableAdminSlots + availableSalesSlots;

  const handleSubmit = async (formData: FormData) => {
    setMessage(null);
    try {
      const result = await addUser(formData);
      if (result.error) {
        setMessage({ type: "error", text: result.error });
      } else {
        setMessage({
          type: "success",
          text: result.message || "User created successfully",
        });
        const form = document.querySelector("form") as HTMLFormElement;
        form?.reset();
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-accent/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Back Button & Page Title */}
        <div className="space-y-4">
          <Button
            variant="ghost"
            onClick={() => window.history.back()}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>

          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-accent rounded-full mb-4 shadow-lg">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              Admin Dashboard
            </h1>
            <p className="text-muted-foreground text-lg mt-2">
              Manage users and monitor system activity
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Total Users
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {totalUsers}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active staff members
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Admins
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Shield className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">{admins}</div>
              <p className="text-xs text-slate-500 mt-1">
                Max {MAX_ADMINS} allowed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Sales Staff
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {salesrep}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Max {MAX_SALESREP} allowed
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/70 backdrop-blur-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Available Slots
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <UserPlus className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-800">
                {totalAvailableSlots}
              </div>
              <p className="text-xs text-slate-500 mt-1">Can add more users</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Add User Form */}
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
              <CardDescription>
                Create a new admin or sales staff member. Admins are limited to
                3, sales staff to 5.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {message && (
                <Alert
                  variant={message.type === "error" ? "destructive" : "default"}
                >
                  {message.type === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              )}

              <form action={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter secure password"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="role" className="text-sm font-medium">
                    Role
                  </label>
                  <Select name="role" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">
                        <div className="flex items-center space-x-2">
                          <Shield className="h-4 w-4" />
                          <span>Admin</span>
                        </div>
                      </SelectItem>
                      <SelectItem value="salesrep">
                        <div className="flex items-center space-x-2">
                          <ShoppingCart className="h-4 w-4" />
                          <span>Sales Staff</span>
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <SubmitButton />
              </form>
            </CardContent>
          </Card>

          {/* Current Users */}
          <Card>
            <CardHeader>
              <CardTitle>Current Users</CardTitle>
              <CardDescription>
                Overview of existing staff members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {user?.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          u.role === "admin" ? "bg-primary/10" : "bg-blue-100"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4 text-primary" />
                        ) : (
                          <ShoppingCart className="h-4 w-4 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{u.email}</p>
                        <p className="text-xs text-muted-foreground">
                          {u.name || "Staff"}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={u.role === "admin" ? "secondary" : "outline"}
                    >
                      {u.role === "admin" ? "Admin" : "Sales"}
                    </Badge>
                  </div>
                ))}

                {(!user || user.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No users found</p>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Admins:</span>
                      <span className="font-medium">
                        {admins}/{MAX_ADMINS}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sales Staff:</span>
                      <span className="font-medium">
                        {salesrep}/{MAX_SALESREP}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
      disabled={pending}
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Creating User...
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-5 w-5" />
          Create User
        </>
      )}
    </Button>
  );
}
