create or replace function get_random_pair(exclude_ids uuid[])
returns setof pairs as $$
  select * from pairs
  where active is true
    and (exclude_ids is null or id != all(exclude_ids))
  order by random()
  limit 1;
$$ language sql stable;
