ARG NODE_VERSION=20.11
FROM node:${NODE_VERSION}-alpine
WORKDIR /usr/src/app
COPY . .
RUN npm i
CMD node main.js
