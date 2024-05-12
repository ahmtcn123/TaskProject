FROM node:21

WORKDIR /usr/src/app

COPY package*.json ./
COPY yarn.lock ./

# Install dependencies
RUN yarn install

COPY . .

# Expose port 80
EXPOSE 80