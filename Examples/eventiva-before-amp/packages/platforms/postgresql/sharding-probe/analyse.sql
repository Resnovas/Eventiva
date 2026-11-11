\echo == sends by kind/outcome
select kind, split_part(outcome,':',1) o, count(*) from eve18_sent group by 1,2 order by 1,2;
\echo == failures (sample)
select kind, left(outcome,110) o, count(*) from eve18_sent where outcome like 'fail%' group by 1,2 order by 3 desc limit 6;
\echo == deliveries by kind/runner
select kind, runner, count(*), count(distinct entity) entities, count(distinct shard) shards from eve18_received group by 1,2 order by 1,2;
\echo == persisted: sent messages never received, and duplicates
with s as (select distinct entity, seq from eve18_sent where kind='persisted'),
r as (select entity, seq, count(*) n from eve18_received where kind='persisted' group by 1,2)
select (select count(*) from s) sent_msgs,
       (select count(*) from s left join r using(entity,seq) where r.n is null) never_received,
       (select count(*) from r where n>1) duplicated_msgs,
       (select coalesce(sum(n-1),0) from r where n>1) extra_deliveries;
\echo == volatile: lost and duplicated
with s as (select distinct entity, seq from eve18_sent where kind='volatile'),
r as (select entity, seq, count(*) n from eve18_received where kind='volatile' group by 1,2)
select (select count(*) from s) sent_msgs,
       (select count(*) from s left join r using(entity,seq) where r.n is null) never_received,
       (select count(*) from r where n>1) duplicated_msgs;
\echo == per-entity ordering violations (persisted, by receipt time)
select count(*) out_of_order from (select entity, seq, lag(seq) over (partition by entity order by at) prev from eve18_received where kind='persisted') x where prev is not null and seq < prev;
\echo == long jobs
select entity, kind, runner, to_char(at,'HH24:MI:SS.MS') from eve18_received where kind like 'long%' order by entity, at;
select entity, left(outcome,100) from eve18_sent where kind='long';
\echo == max gap in persisted receipts (outage window)
select to_char(at,'HH24:MI:SS.MS') at, gap from (select at, at - lag(at) over (order by at) gap from eve18_received where kind='persisted') x where gap is not null order by gap desc limit 3;
\echo == runner placement per second window around the event
select to_char(date_trunc('second',at),'HH24:MI:SS') s, runner, count(*) from eve18_received where kind='persisted' group by 1,2 order by 1,2;
\echo == per-entity outage: entities with largest receipt gap (persisted)
select entity, max(gap) max_gap from (select entity, at - lag(at) over (partition by entity order by at) gap from eve18_received where kind='persisted') x group by 1 order by 2 desc limit 5;
\echo == first receipt on each runner for formerly-B entities after the event
select runner, to_char(min(at),'HH24:MI:SS.MS') first_at, count(distinct entity) from eve18_received where kind='persisted' and entity in (select distinct entity from eve18_received where runner='runner-34432') and at > (select min(at) from eve18_received) + interval '16 seconds' group by 1;
