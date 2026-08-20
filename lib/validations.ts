import { z } from "zod"; // Removed unused minLength import

export const signUpSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"), // [!code highlight] // Changed from fullname to fullName
    email: z.string().email("Invalid email address"),
    universityId: z.coerce.number({ invalid_type_error: "University ID must be a number" }),
    universityCard: z.string().min(1, "University Card is required"), // .nonempty() is deprecated in newer Zod versions, use .min(1)
    password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signInSchema = z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
});
