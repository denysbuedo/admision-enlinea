CREATE TABLE `institutional_reviews` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`reviewer_id` integer NOT NULL,
	`university_id` integer NOT NULL,
	`decision` text NOT NULL,
	`note` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
ALTER TABLE `users` ADD `institutional_status` text DEFAULT 'approved' NOT NULL;
--> statement-breakpoint
DROP TRIGGER users_security_revision;
--> statement-breakpoint
CREATE TRIGGER users_security_revision
AFTER UPDATE OF password, role, university_id, is_active, email, institutional_status ON users
WHEN OLD.password IS NOT NEW.password OR OLD.role IS NOT NEW.role
  OR OLD.university_id IS NOT NEW.university_id OR OLD.is_active IS NOT NEW.is_active OR OLD.email IS NOT NEW.email OR OLD.institutional_status IS NOT NEW.institutional_status
BEGIN
  UPDATE users SET session_revision = NEW.session_revision + 1 WHERE id = NEW.id;
END;
