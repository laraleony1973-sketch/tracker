FROM node:20-slim

RUN corepack enable && corepack prepare pnpm@11.17.0 --activate

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile

COPY . .

RUN chmod +x entrypoint.sh

RUN pnpm exec prisma generate

RUN pnpm build

EXPOSE 3000

CMD ["./entrypoint.sh"]
