# Deployment

Jarvis can run locally, on a VPS, or behind a custom domain. The current version is a static browser app served by a small Node server.

## Local Network Server

Run:

```powershell
npm start
```

By default, Jarvis runs at:

```text
http://localhost:3000
```

To choose a different port:

```powershell
$env:PORT="8080"
npm start
```

## Own Server With Docker

On your server, install:

- Git
- Docker
- Docker Compose

Then run:

```bash
git clone https://github.com/vedwebsites-eng/Jarvis.git
cd Jarvis
docker compose up -d --build
```

Jarvis will run on:

```text
http://YOUR_SERVER_IP:3000
```

## Custom Domain

You need a domain from a registrar such as Namecheap, Cloudflare, GoDaddy, or Google Domains/Squarespace Domains.

Point your domain DNS to the server:

```text
A record
Name: @
Value: YOUR_SERVER_IP

CNAME record
Name: www
Value: yourdomain.com
```

Then use a reverse proxy such as Caddy or Nginx to route domain traffic to the Jarvis app on port `3000`.

## Recommended Reverse Proxy: Caddy

Caddy is a good first choice because it can automatically set up HTTPS certificates.

Example `Caddyfile`:

```text
yourdomain.com {
  reverse_proxy localhost:3000
}

www.yourdomain.com {
  redir https://yourdomain.com{uri}
}
```

After DNS is pointing at your server, Caddy can serve Jarvis at:

```text
https://yourdomain.com
```

## Production Notes

- The current app stores memory in the browser using `localStorage`.
- Browser voice features may require HTTPS when used outside localhost.
- The next backend version should add a database and account-aware storage before this becomes a real multi-device assistant.
