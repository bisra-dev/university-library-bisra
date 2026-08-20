"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  useForm,
  FieldValues,
  DefaultValues,
  SubmitHandler,
  Path,
} from "react-hook-form";
import { z, ZodType } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { FIELD_NAMES } from "@/constants";
import ImageUpload from "./ImageUpload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props<T extends FieldValues> {
  schema: ZodType<T>;
  defaultValues: T;
  onSubmit: (data: T) => Promise<{ success: boolean; error?: string }>;
  type: "SIGN_IN" | "SIGN_UP";
}

const AuthForm = <T extends FieldValues>({
  schema,
  type,
  defaultValues,
  onSubmit,
}: Props<T>) => {
  const router = useRouter();
  const form = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues: defaultValues as DefaultValues<T>,
  });

  const isSignIn = type === "SIGN_IN";

  const handleSubmit: SubmitHandler<T> = async (data) => {
    const toastId = toast.loading(isSignIn ? "Signing in..." : "Creating account...");

    try {
      const result = await onSubmit(data);
      toast.dismiss(toastId);

      if (!result.success) {
        toast.error(result.error || `Failed to ${isSignIn ? "sign in" : "sign up"}.`);
        return;
      }

      toast.success(isSignIn ? "Successfully signed in!" : "Successfully signed up!");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.dismiss(toastId);
      toast.error("An unexpected processing error occurred.");
    }
  };

  // FIXED: Pinpoint exactly which field failed your Zod rules
  const onInvalidSubmit = (formErrors: any) => {
    console.error("Zod Schema Validation Blocked Submission:", formErrors);
    
    // Grab the first visible validation error string to display in the toast
    const errorKeys = Object.keys(formErrors);
    if (errorKeys.length > 0) {
      const firstErrorField = errorKeys[0];
      const errorMessage = formErrors[firstErrorField]?.message;
      
      // Get readable label or fallback to field name
      const readableLabel = FIELD_NAMES[firstErrorField as keyof typeof FIELD_NAMES] || firstErrorField;
      toast.error(`${readableLabel}: ${errorMessage || "Invalid value"}`);
    } else {
      toast.error("Please fill out all required fields correctly.");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold text-white">
        {isSignIn ? "Welcome back to BookWise" : "Create your Library account"}
      </h1>
      <p className="text-light-100">
        {isSignIn 
          ? "Access the vast collection of resources, and stay updated" 
          : "Please complete all fields and upload a valid university ID to gain access to the library"}
      </p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, onInvalidSubmit)} className="space-y-6 w-full">
          {Object.keys(defaultValues).map((field) => (
            <FormField
              key={field}
              control={form.control}
              name={field as Path<T>}
              render={({ field: formField }) => (
                <FormItem>
                  <FormLabel className="capitalize">
                    {FIELD_NAMES[field as keyof typeof FIELD_NAMES] || field}
                  </FormLabel>
                  <FormControl>
                    {field === "universityCard" ? (
                      <ImageUpload onFileChange={(filePath) => formField.onChange(filePath)} />
                    ) : (
                      <Input
                        type={field === "password" ? "password" : "text"}
                        placeholder={
                          field === "email" ? "you@example.com" : `Enter your ${field}`
                        }
                        // FIXED: Spread formField properties AND force value sync to eliminate undefined states
                        {...formField}
                        value={formField.value ?? ""} // [!code highlight]
                      />
                    )}
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}

          <Button type="submit" className="w-full form-btn" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting 
              ? (isSignIn ? "Signing in..." : "Signing up...") 
              : (isSignIn ? "Sign in" : "Sign up")}
          </Button>
        </form>
      </Form>

      <p className="text-center text-base font-medium">
        {isSignIn ? "New to BookWise ? " : "Already have an account ? "}
        <Link href={isSignIn ? "/sign-up" : "/sign-in"} className="font-bold text-light-200">
          {isSignIn ? "Create an account" : "Sign In"}
        </Link>
      </p>
    </div>
  );
};

export default AuthForm;
