"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "SALES"]),
  storeIds: z.array(z.string()).optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface Store {
  id: string;
  name: string;
}

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserSaved: () => void;
  initialData?: {
    id: string;
    name: string | null;
    email: string;
    role: "ADMIN" | "SALES";
    stores: Array<{ store: { id: string; name: string } }>;
  };
  mode: "create" | "edit";
}

export function UserDialog({
  open,
  onOpenChange,
  onUserSaved,
  initialData,
  mode,
}: UserDialogProps) {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "SALES",
      storeIds: [],
    },
  });

  useEffect(() => {
    async function fetchStores() {
      try {
        const response = await fetch("/api/stores");
        if (!response.ok) throw new Error("Failed to fetch stores");
        const data = await response.json();
        setStores(data.stores);
      } catch (error) {
        console.error("Error fetching stores:", error);
      }
    }

    if (open) {
      fetchStores();
      if (initialData) {
        setValue("name", initialData.name || "");
        setValue("email", initialData.email);
        setValue("role", initialData.role);
        setValue(
          "storeIds",
          initialData.stores.map((s) => s.store.id)
        );
      } else {
        reset();
      }
    }
  }, [open, initialData, setValue, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      const url = mode === "create" ? "/api/users" : `/api/users/${initialData?.id}`;
      const method = mode === "create" ? "POST" : "PATCH";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Failed to ${mode} user`);
      }

      reset();
      onOpenChange(false);
      onUserSaved();
    } catch (error) {
      console.error(`Error ${mode}ing user:`, error);
      alert(error instanceof Error ? error.message : `Failed to ${mode} user`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add New User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {mode === "create"
              ? "Add a new user to the system. Fill in the user details below."
              : "Edit user details. Leave password empty to keep current password."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="User name"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="user@example.com"
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">
                Password {mode === "edit" && "(Leave empty to keep current)"}
              </Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••"
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...register("role")}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="SALES">Sales</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Assigned Stores</Label>
              <div className="grid grid-cols-2 gap-2">
                {stores.map((store) => (
                  <label
                    key={store.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      value={store.id}
                      {...register("storeIds")}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">{store.name}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? `${mode === "create" ? "Creating" : "Saving"}...` : mode === "create" ? "Create User" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
