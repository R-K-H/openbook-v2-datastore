#!/bin/bash
set -e

psql -U postgres <<-EOSQL
	CREATE DATABASE openbookdata;
	CREATE USER openbook;
	ALTER ROLE openbook SUPERUSER;
	ALTER USER openbook WITH PASSWORD 'example';
    GRANT ALL PRIVILEGES ON DATABASE openbook TO openbook;
EOSQL