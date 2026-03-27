# ==============================================================================
# Stage 1: Base Dependencies (系统级依赖，变动极少)
# ==============================================================================
FROM python:3.13-slim-bookworm AS base-deps

ENV DEBIAN_FRONTEND=noninteractive

# 1. 安装系统基础包和 NodeSource 依赖
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    ca-certificates \
    gnupg \
    git \
    && rm -rf /var/lib/apt/lists/*

# 2. 配置 NodeSource (使用 GPG 密钥更安全)
RUN mkdir -p /etc/apt/keyrings \
    && curl -fsSL https://deb.nodesource.com/gpgkey/nodesource.gpg.key | gpg --dearmor -o /etc/apt/keyrings/nodesource.gpg \
    && echo "deb [signed-by=/etc/apt/keyrings/nodesource.gpg] https://deb.nodesource.com/node_22.x bookworm main" > /etc/apt/sources.list.d/nodesource.list

# 3. 安装 Node.js
RUN apt-get update && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# 4. 安装 pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# 5. 安装 uv (从官方镜像复制二进制文件)
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# ==============================================================================
# Stage 2: Builder (构建阶段，包含所有开发依赖和构建工具)
# ==============================================================================
FROM base-deps AS builder

WORKDIR /app

# 环境变量：加速构建，跳过浏览器下载提示等
ENV UV_LINK_MODE=copy \
    PLAYWRIGHT_BROWSERS_PATH=0 \
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=false \
    PLAYWRIGHT_DOWNLOAD_HOST=https://npmmirror.com/mirrors/playwright \
    npm_config_registry=https://registry.npmmirror.com

# 1. 复制依赖定义文件 (利用 Docker 层缓存)
COPY pnpm-lock.yaml package.json ./
# 注意：如果是 Python 项目，这里还需要复制 pyproject.toml / requirements.txt

# 2. 安装依赖 (全量安装，包含 devDependencies)
RUN pnpm install --frozen-lockfile

# 3. 安装全局工具 (Playwright, uv tools)
# 这一步非常耗时，放在这里可以利用缓存，除非工具版本改变
RUN \
  # 安装 Playwright 浏览器及其系统依赖
  pnpm dlx playwright install --with-deps chrome && \
  # 安装 uv 工具
  uv tool install mcp-server-fetch && \
  # 安装 pnpm 全局包
  pnpm add -g @amap/amap-maps-mcp-server @playwright/mcp@latest tavily-mcp@latest @modelcontextprotocol/server-github @modelcontextprotocol/server-slack

# 4. 复制源代码
COPY . .

# 5. 执行构建 (编译前端等)
RUN pnpm frontend:build && pnpm build

# ==============================================================================
# Stage 3: Runtime (运行阶段，极致瘦身)
# ==============================================================================
FROM python:3.13-slim-bookworm AS runtime

WORKDIR /app

# 1. 安装运行时必需的系统依赖
# 注意：Playwright 运行需要一些特定的系统库 (如 libcups, libx11 等)
# 这里需要根据 playwright install --with-deps 实际安装的库进行精简复制
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    # Playwright 运行依赖 (根据实际报错补充，通常是这些)
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# 2. 从 Builder 阶段复制关键文件
# 复制 Node.js 和 pnpm (为了运行 MCP 服务)
COPY --from=builder /usr/local/share/pnpm /usr/local/share/pnpm
COPY --from=builder /usr/local/bin/node /usr/local/bin/node
COPY --from=builder /usr/local/bin/corepack /usr/local/bin/corepack
COPY --from=builder /usr/local/bin/pnpm /usr/local/bin/pnpm

# 复制 uv 和 uv 工具
COPY --from=builder /bin/uv /bin/uvx /bin/
COPY --from=builder /root/.local/share/uv /root/.local/share/uv

# 复制 Playwright 浏览器二进制文件 (体积较大，但必须)
# 默认路径通常在 /root/.cache/ms-playwright
COPY --from=builder /root/.cache/ms-playwright /root/.cache/ms-playwright

# 3. 复制应用代码和 node_modules
# 建议：如果是生产环境，可以在 builder 中先运行 pnpm install --prod，然后只复制 prod node_modules
# 这里为了简单直接复制全部，但去除了源码中的非构建产物
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
COPY --from=builder /app/src ./src # 如果运行时还需要源码

# 4. 设置环境变量
ENV PNPM_HOME=/usr/local/share/pnpm \
    PATH=/usr/local/share/pnpm:$PATH \
    PLAYWRIGHT_BROWSERS_PATH=/root/.cache/ms-playwright

# 5. 复制启动脚本
COPY entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["pnpm", "start"]
