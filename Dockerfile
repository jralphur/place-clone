FROM node:12-alphine

WORKDIR /frontend
COPY . .
RUN npm install