# https://github.com/chudnyi/n8n-nodes-deno-code/blob/master/docker/n8n/Dockerfile

ARG N8N_VERSION=latest

FROM gcr.io/distroless/cc AS cc

FROM n8nio/n8n:${N8N_VERSION}

USER root

# PDF : poppler poppler-utils
# docker : docker-cli
RUN apk add --no-cache \
    ca-certificates \
    tzdata \
    libc6-compat \
    gcompat \
    poppler poppler-utils \
    postgresql-client \
    docker-cli

# from: https://github.com/denoland/deno_docker/blob/4d61d7da8e7350ee31862d1a5e6268993f4dd1ff/alpine.dockerfile#L22
COPY --from=cc --chown=root:root --chmod=755 /lib/*-linux-gnu/* /usr/local/lib/
COPY --from=cc --chown=root:root --chmod=755 /lib/ld-linux-* /lib/

RUN mkdir -p /lib64 \
    && ln -sf /usr/local/lib/ld-linux-* /lib64/ \
    && rm -f /usr/local/lib/libgcc_s.so.1

ENV LD_LIBRARY_PATH="/usr/local/lib"

USER node