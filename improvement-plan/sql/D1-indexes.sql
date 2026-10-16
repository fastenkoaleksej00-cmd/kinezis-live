-- PROPOSED, NOT APPLIED. Purpose: indexes for the queries the app runs on every page and for the
-- anti-spam triggers. All are "if not exists" and safe to run at any time; on today's small tables the
-- gain is small, it matters once there are thousands of rows. Depends on: 0002, 0004, 0009, 0010, 0016, 0021.

-- Library and programmes: published + approved, newest first
create index if not exists workouts_public_idx on public.workouts (published_at desc) where published and review_status = 'approved';
create index if not exists courses_public_idx on public.courses (published_at desc) where published and review_status = 'approved';
create index if not exists workouts_author_idx on public.workouts (author_id);

-- Feed: published, not hidden, newest first
create index if not exists posts_feed_idx on public.posts (published_at desc) where published and not hidden;
create index if not exists posts_user_time_idx on public.posts (user_id, created_at desc) where user_id is not null;
create index if not exists posts_review_idx on public.posts (created_at desc) where needs_review;

-- Rate-limit triggers and data export look up by author and time
create index if not exists comments_user_time_idx on public.comments (user_id, created_at desc);
create index if not exists reports_reporter_time_idx on public.content_reports (reporter_id, created_at desc);
create index if not exists messages_sender_time_idx on public.messages (sender_id, created_at desc);

-- Lessons that reuse a library session (programme steps)
create index if not exists lessons_workout_idx on public.lessons (workout_id) where workout_id is not null;
