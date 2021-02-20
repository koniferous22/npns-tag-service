# Copypasted from gateway base image
ARG IMAGE_TAG_TAG_SERVICE_ALPINE
ARG NODE_ENV
FROM node:$IMAGE_TAG_TAG_SERVICE_ALPINE AS base_node_alpine
RUN echo "Building tag service with NODE_ENV=\"${NODE_ENV}\""

WORKDIR /usr/src/tag-service
COPY package.json .
RUN npm install

# VERSION 1 of the image: npm start:dev
FROM base_node_alpine AS npns_production
ENV TAG_SERVICE_START_COMMAND=start
# Source code is copied and built in this image
COPY . /usr/src/tag-service
RUN npm run build

# VERSION 2 of the imamge npm start
FROM base_node_alpine AS npns_development
# Dev image will rely on bind mount to watch for file changes
# See top level [docker-compose.yml](https://github.com/koniferous22/npns/blob/master/docker-compose.yml)
ENV TAG_SERVICE_START_COMMAND=start:dev

FROM npns_${NODE_ENV} AS npns_img_final
EXPOSE 4000
# Workaround for injecting starting command via env
# Wait for databases here
CMD  ["sh", "-c", "npm run ${TAG_SERVICE_START_COMMAND}"]
