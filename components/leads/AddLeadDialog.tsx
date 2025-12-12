"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useQueryClient } from "@tanstack/react-query";

// Define schema with Zod
const formSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address").or(z.literal("")),
    phone: z.string().min(5, "Phone number is too short").or(z.literal("")),
    source: z.string().min(2, "Source is required"),
    message: z.string().optional(),
  })
  .refine((data) => data.email || data.phone, {
    message: "Either email or phone is required",
    path: ["email"], // Path of error
  });

type FormData = z.infer<typeof formSchema>;

export function AddLeadDialog() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      source: "Manual Entry",
      message: "",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const body = {
        ...data,
        tenant_id: user?.tenantId,
      };
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        throw new Error("Failed to create lead");
      }

      setOpen(false);
      reset();
      queryClient.invalidateQueries({ queryKey: ["leads"] });
      // Optional: Add toast notification here
    } catch (error) {
      console.error("Error creating lead:", error);
      alert("Failed to create lead. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lead</DialogTitle>
          <DialogDescription>
            Manually add a potential lead to your pipeline. AI will
            automatically summarize their details if you provide a message.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              {...register("name")}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                {...register("email")}
                className={errors.email ? "border-red-500" : ""}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 234 567 890"
                {...register("phone")}
              />
            </div>
          </div>
          {errors.email?.message === "Either email or phone is required" && (
            <p className="text-sm text-red-500">
              Either email or phone is required
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="source">Source</Label>
            <Input
              id="source"
              placeholder="e.g. LinkedIn, Referral, Manual"
              {...register("source")}
              className={errors.source ? "border-red-500" : ""}
            />
            {errors.source && (
              <p className="text-sm text-red-500">{errors.source.message}</p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="message">Initial Message / Notes</Label>
            <Textarea
              id="message"
              placeholder="Paste any initial conversation or notes here for AI processing..."
              rows={4}
              {...register("message")}
            />
            <p className="text-xs text-muted-foreground">
              Provide this for automatic AI summarization (Budget, Timeline,
              etc).
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Add Lead"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
