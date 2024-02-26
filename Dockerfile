ARG NODE_VERSION=18.19.0
FROM node:${NODE_VERSION}-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm i
CMD node main.js
