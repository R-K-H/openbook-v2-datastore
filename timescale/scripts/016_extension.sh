#!/bin/bash
set -e

psql -U postgres -d openbookdata <<-EOSQL
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	CREATE EXTENSION IF NOT EXISTS "semver";
	CREATE EXTENSION IF NOT EXISTS "citext";
EOSQL