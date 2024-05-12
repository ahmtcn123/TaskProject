FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./
COPY prisma ./prisma/

RUN yarn install

COPY . .

EXPOSE 3000