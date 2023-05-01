# Hetzner DNS API console IP updater

Use this to update certain domains
IP automatically with the current public
IP of your internet connection.

Basically a dynamic IP address updater.

## Development

Clone the repository:

```
git clone git@github.com:ochorocho/hetzner-dns.git
```

Run the command:

```
deno run --allow-env --allow-net --allow-read --check --allow-write main.ts {config|update|add|help}
```

Compile binary (Linux, see `deno compile --help`):

```
deno compile --allow-env --allow-net --allow-read --allow-write --target x86_64-unknown-linux-gnu main.ts -o hetzner-x86_64-unknown-linux-gnu
```
