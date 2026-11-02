ALTER TABLE `users` ADD `session_revision` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
CREATE TRIGGER users_session_revision_guard
BEFORE UPDATE OF session_revision ON users
WHEN typeof(NEW.session_revision) != 'integer' OR NEW.session_revision < OLD.session_revision OR NEW.session_revision > 9007199254740991
BEGIN
  SELECT RAISE(ABORT, 'Invalid session revision');
END;
--> statement-breakpoint
CREATE TRIGGER users_security_revision
AFTER UPDATE OF password, role, university_id, is_active, email ON users
WHEN OLD.password IS NOT NEW.password OR OLD.role IS NOT NEW.role
  OR OLD.university_id IS NOT NEW.university_id OR OLD.is_active IS NOT NEW.is_active OR OLD.email IS NOT NEW.email
BEGIN
  UPDATE users SET session_revision = NEW.session_revision + 1 WHERE id = NEW.id;
END;
