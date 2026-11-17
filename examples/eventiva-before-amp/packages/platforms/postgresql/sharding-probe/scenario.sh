#!/bin/sh
# Two-runner sharding probe (EVE-18). See docs/parts/local-dev/cluster-sharding-probe.md.
#
# usage: scenario.sh <name> <term|kill>
#
# Starts runner A and runner B, starts a client, then at +15s sends SIGTERM or
# SIGKILL to runner B and restarts it after RESTART_AFTER seconds. Results land
# in $PROBE_OUT/<name>: timeline, logs and analysis.txt.
#
# Needs DB_HOST, DB_PORT, DB_USER, DB_PASSWORD and DB_DATABASE for a Postgres the
# probe may wipe: the script drops and recreates the public schema.
set -u
NAME=${1:?scenario name}
ACTION=${2:?term or kill}
: "${DB_HOST:?}" "${DB_PORT:?}" "${DB_USER:?}" "${DB_PASSWORD:?}" "${DB_DATABASE:?}"
export SHARDS_PER_GROUP=${SHARDS_PER_GROUP:-30}
export PGHOST=$DB_HOST PGPORT=$DB_PORT PGUSER=$DB_USER PGPASSWORD=$DB_PASSWORD PGDATABASE=$DB_DATABASE
HOST=${HOST:-127.0.0.1}
export HOST
RESTART_AFTER=${RESTART_AFTER:-20}
LONG=${PROBE_LONG_SECONDS:-25}
HERE=$(cd "$(dirname "$0")" && pwd)
ROOT=$(cd "$HERE/../../../.." && pwd)
OUT=${PROBE_OUT:-$ROOT/tmp/sharding-probe}/$NAME
rm -rf "$OUT"
mkdir -p "$OUT"
cd "$ROOT"
P="node --import tsx $HERE/probe.ts"
ts() { date +%H:%M:%S.%3N; }
psql -qAt -c "drop schema public cascade; create schema public;" 2>/dev/null
# Create the probe tables up front so the runners do not race on CREATE TABLE.
psql -qAt -c "create table eve18_received (entity text, seq int, kind text, runner text, shard text, at timestamptz default clock_timestamp())" \
  -c "create table eve18_sent (entity text, seq int, kind text, outcome text, at timestamptz default clock_timestamp())"
wait_listening() {
  i=0
  until grep -q "Listening on" "$1"; do
    i=$((i + 1))
    if [ $i -gt 120 ]; then echo "runner did not start: $1" >&2; exit 1; fi
    sleep 0.5
  done
}

PROBE_MODE=runner PORT=34431 $P > "$OUT/A.log" 2>&1 &
A=$!
wait_listening "$OUT/A.log"
PROBE_MODE=runner PORT=34432 $P > "$OUT/B.log" 2>&1 &
B=$!
wait_listening "$OUT/B.log"
sleep 4
echo "$(ts) runners up A=$A B=$B" >> "$OUT/timeline"
PROBE_MODE=client PORT=34439 PROBE_LONG_SECONDS=$LONG $P > "$OUT/client.log" 2>&1 &
C=$!
echo "$(ts) client start" >> "$OUT/timeline"
sleep 15
if [ "$ACTION" = kill ]; then kill -KILL $B; else kill -TERM $B; fi
echo "$(ts) $ACTION runner B" >> "$OUT/timeline"
sleep "$RESTART_AFTER"
PROBE_MODE=runner PORT=34432 $P > "$OUT/B2.log" 2>&1 &
B2=$!
echo "$(ts) runner B restarted" >> "$OUT/timeline"
wait $C
echo "$(ts) client exit" >> "$OUT/timeline"
kill -TERM $A $B2 2>/dev/null
sleep 5
kill -KILL $A $B2 2>/dev/null
psql -f "$HERE/analyse.sql" > "$OUT/analysis.txt" 2>&1
echo "results in $OUT"
