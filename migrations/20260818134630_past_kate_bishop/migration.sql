CREATE TYPE "borrow_status" AS ENUM('BORROWED', 'RETURNED');--> statement-breakpoint
CREATE TYPE "role" AS ENUM('USER', 'ADMIN');--> statement-breakpoint
CREATE TYPE "status" AS ENUM('PENDING', 'APPROVED', 'REJECTED');--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() UNIQUE,
	"full_name" varchar(255) NOT NULL,
	"email" text NOT NULL UNIQUE,
	"university_id" integer NOT NULL UNIQUE,
	"password" text NOT NULL,
	"university_card" text NOT NULL,
	"status" "status" DEFAULT 'PENDING'::"status",
	"role" "role" DEFAULT 'USER'::"role",
	"last_activity_date" date DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
