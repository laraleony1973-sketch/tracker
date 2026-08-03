FROM node:22-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json ./

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --skip-generate && npx prisma db seed && npm start"]
