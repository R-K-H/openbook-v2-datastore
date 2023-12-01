#!/bin/bash
set -e

psql -U postgres -d openbookdata <<-EOSQL
	GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO openbook;
	GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO openbook;
	GRANT postgres TO openbook;
EOSQL