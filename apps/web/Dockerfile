FROM node:24-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS build
ENV HUSKY=0
ENV NEXT_TELEMETRY_DISABLED=1
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm --filter @job-agent/contracts build
RUN pnpm --filter @job-agent/shared build
RUN pnpm --filter @job-agent/web build

FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
EXPOSE 3000
CMD ["pnpm", "--filter", "@job-agent/web", "start"]
