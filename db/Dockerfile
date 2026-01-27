# =============== BASE ===============
FROM liquibase/liquibase:4.33-alpine AS base

WORKDIR /liquibase/changelog

COPY database/changelog.xml .
COPY database/migrations/ ./migrations/

ENV LIQUIBASE_CHANGELOG_FILE=changelog.xml

FROM base AS runner

ENV \
  API_PERSISTANCE_HOST=postgres \
  API_PERSISTANCE_PORT=5432 \
  API_PERSISTANCE_USERNAME=postgres \
  #API_PERSISTANCE_PASSWORD=postgres \
  API_PERSISTANCE_DATABASE=postgres \
  API_PERSISTANCE_CHANGELOG=_changelog \
  API_PERSISTANCE_CHANGELOG_LOCK=_changelog_lock \
  LIQUIBASE_TAG=latest

ENTRYPOINT ["bash", "-c"]
CMD ["liquibase \
  --url=jdbc:postgresql://${API_PERSISTANCE_HOST}:${API_PERSISTANCE_PORT}/${API_PERSISTANCE_DATABASE} \
  --changeLogFile=${LIQUIBASE_CHANGELOG_FILE} \
  --username=${API_PERSISTANCE_USERNAME} \
  --password=${API_PERSISTANCE_PASSWORD} \
  --databaseChangeLogTableName=${API_PERSISTANCE_CHANGELOG} \
  --databaseChangeLogLockTableName=${API_PERSISTANCE_CHANGELOG_LOCK} \
  updateToTag ${LIQUIBASE_TAG}"]
