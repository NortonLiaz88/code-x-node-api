FROM node:22 AS development

WORKDIR /app

COPY package.json yarn.lock ./
COPY prisma ./prisma/
RUN yarn install --frozen-lockfile && npx prisma generate

COPY . .
RUN yarn build

EXPOSE 8000

FROM node:22 AS production

ENV NODE_ENV=production
WORKDIR /app

COPY --from=development /app/ .

EXPOSE 8000
CMD ["node", "dist/main"]
