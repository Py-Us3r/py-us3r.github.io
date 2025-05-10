---
layout: single
title: ARP Scanner - Python
excerpt: "ARP Scanner Script."
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
---

```python
import scapy.all as scapy
import argparse
import subprocess
from termcolor import colored


def root():
  if subprocess.check_output(["whoami"]).decode().strip() == 'root':
    return True


def get_arguments():
  parser= argparse.ArgumentParser(description="ARP Scanner")
  parser.add_argument("-t", "--target",required=True, dest="target",help="Host / IP Range to Scan")

  args=parser.parse_args()
  return args.target


def scan(ip):
  print("\n")
  arp_scan=scapy.arping(ip) # Realizamos el escaneo ARP


def main():
  if root():
    target = get_arguments()
    scan(target)
  else:
    print(colored("\n[!] Este script necesita ser ejecutado por el usuario root.","red"))

if __name__ == '__main__':
  main()
```