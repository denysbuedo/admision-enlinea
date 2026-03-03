CREATE TABLE `applications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`program_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`first_name` text,
	`last_name` text,
	`birth_date` integer,
	`nationality` text,
	`document_type` text,
	`document_number` text,
	`address` text,
	`city` text,
	`country` text,
	`phone` text,
	`email` text,
	`academic_info` text,
	`professional_experience` text,
	`complementary_info` text,
	`declaration_accepted` integer DEFAULT false,
	`data_processing_accepted` integer DEFAULT false,
	`digital_signature` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`review_notes` text,
	`score` real,
	`submitted_at` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`document_type` text NOT NULL,
	`file_name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_size` integer,
	`mime_type` text,
	`uploaded_at` integer
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`application_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`university_id` integer NOT NULL,
	`title` text NOT NULL,
	`program_type` text NOT NULL,
	`modality` text NOT NULL,
	`duration` text,
	`language` text DEFAULT 'Español' NOT NULL,
	`location` text,
	`credits` integer,
	`description` text,
	`open_date` integer,
	`deadline_date` integer,
	`results_date` integer,
	`start_date` integer,
	`min_degree` text,
	`min_gpa` real,
	`professional_experience` text,
	`language_requirements` text,
	`eligibility_notes` text,
	`required_documents` text,
	`total_cost` real,
	`currency` text DEFAULT 'USD',
	`payment_methods` text,
	`scholarships_available` integer DEFAULT false,
	`scholarships_info` text,
	`refund_policy` text,
	`selection_process` text,
	`has_interview` integer DEFAULT false,
	`has_exam` integer DEFAULT false,
	`privacy_policy` text,
	`terms_conditions` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `status_history` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`application_id` integer NOT NULL,
	`from_status` text,
	`to_status` text NOT NULL,
	`changed_by` integer NOT NULL,
	`notes` text,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `universities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`faculty` text,
	`country` text,
	`city` text,
	`website` text,
	`logo_url` text,
	`description` text,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`password` text NOT NULL,
	`role` text DEFAULT 'aspirant' NOT NULL,
	`university_id` integer,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);