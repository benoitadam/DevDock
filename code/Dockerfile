FROM lscr.io/linuxserver/code-server

# 7zip pour deno
RUN apt-get update && \
    apt-get install -y curl wget git sudo build-essential 7zip && \
    rm -rf /var/lib/apt/lists/*

# Install Deno avec emplacement spécifié
ENV DENO_INSTALL=/opt/deno
RUN curl -fsSL https://deno.land/x/install/install.sh | bash && \
    ln -s ${DENO_INSTALL}/bin/deno /usr/bin/deno

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    npm install -g npm@latest && \
    npm install -g pnpm
