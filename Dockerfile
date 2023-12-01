FROM timescale/timescaledb-ha:pg14-latest AS base

FROM base AS build
ENV POSTGRES_PASSWORD=password
# TODO: ENV vars
USER root

COPY timescale/models/001_tables.up.sql /docker_entrypoint_sql.d/
COPY timescale/scripts/ /docker-entrypoint-initdb.d/

EXPOSE 5432

ENTRYPOINT ["/docker-entrypoint.sh"]

CMD ["postgres"]
