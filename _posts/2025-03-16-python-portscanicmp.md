---
layout: single
title: ICMP Port Scanner - Python
excerpt: "Python ICMP Port Scanner Script."
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
import argparse 
import subprocess
import sys
import signal
import re
from termcolor import colored
from concurrent.futures import ThreadPoolExecutor


def def_handler(sig,frame): 
  print(colored(f"\n[!] Saliendo...\n","red"))
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler) 


def get_arguments(): 
  parser=argparse.ArgumentParser(description="Herramienta para descubrir host activos en una red (ICMP)")
  parser.add_argument("-t","--target",required=True,dest="target", help="Host o rango de red a escanear") 
  parser.add_argument("-th","--thread",dest="max_threads",help="Máximo de hilos al realizar el escaneo", type=int) 

  return parser.parse_args() 


def parse_target(target_str): 

  target_str_splitted=target_str.split('.') 
  first_three_octets='.'.join(target_str_splitted[:3]) 
  ip_total='.'.join(target_str_splitted[:4]) 
  ip_valid=re.match(r"^192\.168\.\d{1,3}\.\d{1,3}(-\d{1,3})?$", ip_total) 

  if len(target_str_splitted) == 4 and ip_valid: 
    if "-" in target_str_splitted[3]: 
      start,end=target_str_splitted[3].split('-')
      return [f"{first_three_octets}.{i}" for i in range(int(start), int(end)+1)] 
    else:
      return [target_str] 
  else:
    print(colored(f"\n[!] El formato de IP o rango de IP no es válido","red"))


def host_discovery(target): 
  try:
    ping= subprocess.run(["ping","-c","1",target], timeout=1, stdout=subprocess.DEVNULL) 
    if ping.returncode==0:
      print(colored(f"\n[+] La IP {target} está activa","green")) 
  except subprocess.TimeoutExpired:
    pass


def main():

  args=get_arguments()
  targets=parse_target(args.target)
  
  with ThreadPoolExecutor(max_workers=args.max_threads) as executor: 
    executor.map(host_discovery,targets) 

if __name__=='__main__':
  main()
```