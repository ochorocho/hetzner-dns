all: target_folder linux_x86_64 mac_x86_64 mac_aarch64

target_folder:
	mkdir -p bin

linux_x86_64:
	deno compile --allow-env --allow-net --allow-read --allow-write --target x86_64-unknown-linux-gnu main.ts -o bin/hetzner-x86_64-unknown-linux-gnu

mac_x86_64:
	deno compile --allow-env --allow-net --allow-read --allow-write --target x86_64-apple-darwin main.ts -o bin/hetzner-x86_64-apple-darwin

mac_aarch64:
	deno compile --allow-env --allow-net --allow-read --allow-write --target aarch64-apple-darwin main.ts -o bin/hetzner-aarch64-apple-darwin

clean:
	rm -Rf bin/
