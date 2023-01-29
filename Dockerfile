FROM node:16-alpine 
RUN npm install -g serve

WORKDIR /app
COPY ./ .
RUN npm ci
RUN npm run build
CMD [ "serve", "-s", "build", "-l", "3000" ]
