#!/bin/bash
for f in /docker_entrypoint_sql.d/*.sql; do
	echo "Processing $f"
	psql openbookdata < $f
done