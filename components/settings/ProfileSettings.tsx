"use client";

import { useUser } from "@/hooks/use-user";
import { useState, useEffect, useRef } from "react";
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
  Upload,
} from "lucide-react";

export function ProfileSettings() {
  const { user, updateUser, isUpdating } = useUser();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const isInitialized = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Only initialize once when user is loaded
    if (user && !isInitialized.current) {
      setFullName(user.fullName || "");
      setEmail(user.email || "");
      setProfilePic(user.profile_pic || "");
      isInitialized.current = true;
    }
  }, [user]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select an image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Image size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = localStorage.getItem("auth_token");
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to upload image");
      }

      const data = await response.json();
      setProfilePic(data.url);
      setUploadProgress(100);

      // Automatically save the profile picture URL
      updateUser({
        profile_pic: data.url,
      });

      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error: unknown) {
      const err = error as Error;
      setErrorMessage(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(false);
    setErrorMessage("");

    if (password && password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      updateUser({
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
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* Left Column: Avatar and Quick Info */}
      <div className="md:col-span-1 space-y-6">
        <Card className="overflow-hidden border-none shadow-md bg-linear-to-b from-purple-50 to-white">
          <CardContent className="pt-8 pb-8 flex flex-col items-center">
            <div className="relative group">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
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
              <button
                type="button"
                onClick={handleAvatarClick}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAvatarClick();
                  }
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer border-0 outline-none focus:opacity-100 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Upload profile picture"
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="text-white h-8 w-8 animate-spin" />
                ) : (
                  <Camera className="text-white h-8 w-8" />
                )}
              </button>
              {isUploading && (
                <div className="absolute -bottom-2 left-0 right-0">
                  <div className="h-1 bg-purple-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-2 text-center">
              Click avatar to upload
            </p>
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

                {/* <div className="space-y-2">
                  <Label htmlFor="profilePic">Profile Picture</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Camera className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        id="profilePic"
                        value={profilePic}
                        onChange={(e) => setProfilePic(e.target.value)}
                        className="pl-10 focus-visible:ring-purple-500"
                        placeholder="https://example.com/avatar.jpg or upload above"
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAvatarClick}
                      disabled={isUploading}
                      className="shrink-0"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Upload
                        </>
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500">
                    Upload an image or paste a URL. Max size: 5MB
                  </p>
                </div> */}

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
                      <Label htmlFor="confirmPassword">Confirm Password</Label>
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
  );
}
