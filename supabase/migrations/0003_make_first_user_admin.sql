-- Makes the first registered account an admin. Run once, after you created your own account.
update public.profiles
set role = 'admin'
where id = (select id from auth.users order by created_at asc limit 1);
