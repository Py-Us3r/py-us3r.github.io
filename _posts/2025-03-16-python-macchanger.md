---
layout: single
title: Macchanger - Python
excerpt: "Macchanger Script."
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
import re
from termcolor import colored
import subprocess
import sys
import signal
import socket


def def_handler(sig,frame): 
  print(colored(f"\n[!] Saliendo del programa...\n","red"))
  sys.exit(1)

signal.signal(signal.SIGINT, def_handler) 

def get_arguments(): 

  parser= argparse.ArgumentParser(description="Herramienta para cambiar la dirección MAC de una interfaz de red")
  parser.add_argument("-i","--interface", dest="interface", help="Nombre de la interfaz de red", required=True) 
  parser.add_argument("-m","--mac",dest="mac_address", help="Nueva dirección MAC para la interfaz de red")
  parser.add_argument("-l","--list",dest="list_mac",action="store_true",help="Listar la dirección MAC actual") 
  
  return parser.parse_args() 


def is_valid_input(interface,mac_address): 
  is_valid_interface= re.match(r'^[e][n|t][s|h]\d{1,2}$', interface) 
  is_valid_mac_address = re.match(r'^([A-Fa-f0-9]{2}[:]){5}[A-Fa-f0-9]{2}$', mac_address) 

  return is_valid_interface and is_valid_mac_address 


def check_interface(interface):

  list_interfaces=socket.if_nameindex()
  for i in list_interfaces: 
    if interface in i: 
      return interface 


def list_mac(interface):
  print(colored("\n[+] Mostrando la direción MAC actual: \n", 'yellow'))
  subprocess.run(["macchanger", "-s", interface])


def change_mac_address(interface,mac_address):

  if is_valid_input(interface,mac_address) and check_interface(interface):
    subprocess.run(["ifconfig", interface, "down"])
    subprocess.run(["ifconfig",interface,"hw","ether", mac_address]) 
    subprocess.run(["ifconfig", interface, "up"])

    print(colored(f"\n[+] La MAC ha sido cambiada exitosamente\n",'green'))
    print(colored(f"\n[+] Mostrando nueva dirección MAC:\n",'yellow'))
    subprocess.run(["macchanger","-s", interface])
  else:
    print(colored("\n[!] Los datos introducidos son incorrectos", 'red'))



def main():

  if subprocess.check_output(["whoami"]).decode().strip() == 'root': 
    args= get_arguments() 
    if "-m" in sys.argv: 
      change_mac_address(args.interface,args.mac_address)
    elif "-l" in sys.argv: 
      list_mac(args.interface)
    elif len(sys.argv)== 3 :
      print(colored("\n[!] Es necesario especificar el parámetro -m o -l",'red'))

  else:
    print(colored(f"\n[!] Para ejecutar este script es necesario ser root.","red"))
    sys.exit(1)


if __name__ == '__main__':
  main()
```