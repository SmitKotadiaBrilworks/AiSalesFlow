"use client";

import { useUser } from "@/hooks/use-user";
import { useState, useEffect, useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  Mail,
  Lock,
  Camera,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, isUpdating } = useUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const isInitialized = useRef(false);
  const [_isPending, startTransition] = useTransition();

  useEffect(() => {
    // Only initialize once when user is loaded
    if (user && !isInitialized.current) {
      startTransition(() => {
        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setProfilePic(user.profile_pic || "");
      });
      isInitialized.current = true;
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    setErrorMessage("");

    if (password && password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await updateUser({
        full_name: fullName,
        email: email,
        profile_pic: profilePic,
        ...(password ? { password } : {}),
      });
      setIsSuccess(true);
      setPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      const err = error as Error;
      setErrorMessage(err.message || "Failed to update profile");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Profile Settings
        </h1>
        <p className="text-slate-500 mt-2">
          Manage your account information and preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Avatar and Quick Info */}
        <div className="md:col-span-1 space-y-6">
          <Card className="overflow-hidden border-none shadow-md bg-linear-to-b from-purple-50 to-white">
            <CardContent className="pt-8 pb-8 flex flex-col items-center">
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-xl">
                  <AvatarImage src={profilePic} alt={fullName} />
                  <AvatarFallback className="bg-purple-100 text-purple-700 text-3xl font-bold">
                    {fullName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="text-white h-8 w-8" />
                </div>
              </div>
              <h2 className="mt-4 text-xl font-bold text-slate-900">
                {fullName}
              </h2>
              <p className="text-slate-500 text-sm">
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </p>
              <div className="mt-6 w-full space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Company
                </div>
                <div className="text-sm font-medium text-slate-700 bg-white/50 p-2 rounded border border-purple-100">
                  {user.companyName}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Edit Form */}
        <div className="md:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  Update your name, email, and password.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-10 focus-visible:ring-purple-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 focus-visible:ring-purple-500"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="profilePic">Profile Picture URL</Label>
                    <div className="relative">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="profilePic"
                        value={profilePic}
                        onChange={(e) => setProfilePic(e.target.value)}
                        className="pl-10 focus-visible:ring-purple-500"
                        placeholder="https://example.com/avatar.jpg"
                      />
                    </div>
                  </div>

                  <div className="border-t pt-6 mt-2">
                    <h3 className="text-sm font-semibold text-slate-900 mb-4">
                      Security
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="pl-10 focus-visible:ring-purple-500"
                            placeholder="••••••••"
                            minLength={8}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Confirm Password
                        </Label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="pl-10 focus-visible:ring-purple-500"
                            placeholder="••••••••"
                            minLength={8}
                          />
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 mt-2 italic">
                      Leave blank to keep your current password.
                    </p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between items-center bg-slate-50/50 px-6 py-4 rounded-b-lg border-t">
                <div className="flex flex-col gap-1">
                  {isSuccess && (
                    <div className="flex items-center text-green-600 text-sm font-medium animate-in zoom-in-95">
                      <CheckCircle2 className="h-4 w-4 mr-2" />
                      All changes saved!
                    </div>
                  )}
                  {errorMessage && (
                    <div className="flex items-center text-red-600 text-sm font-medium animate-in zoom-in-95">
                      <AlertCircle className="h-4 w-4 mr-2" />
                      {errorMessage}
                    </div>
                  )}
                </div>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
}
