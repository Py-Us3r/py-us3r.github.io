---
layout: single
title: Instagram - DoS via Unbounded Parameter
excerpt: "Denial of Service vulnerability in Instagram causing a specific message thread to become unusable. Out of scope for Meta’s bug bounty program due to available self-mitigation (e.g., deleting the thread)."
date: 2025-07-29
classes: wide
header:
  teaser: /img2/images/hackerone.png
  teaser_home_page: true
  icon: /img2/images/hackeronelogo.png
categories:
  - Bug Bounty
  - Web
tags:
  - Burpsuite
  - DoS
  - API
---


## Summary

A POST request to the endpoint '/api/v1/...' on Instagram accepts a 'max_number_to_display ' parameter with no apparent upper bound. By setting this parameter to an extremely large value (e.g., 9999999999), the server takes approximately 20 seconds to respond and returns a 560/566 Internal Server Error.

This behavior can be reliably reproduced and may lead to a resource exhaustion or logical Denial of Service (DoS) condition. An attacker could abuse this with minimal effort to degrade performance or stability of backend components.


## Observed Behavior

- The server takes ~20 seconds to respond.

- The response is a 560/566 Internal Server Error.

- The behavior is consistent and reproducible.

- Reducing the number to a reasonable value (e.g., 100) avoids the issue completely.

## Impact

- This vulnerability may allow an attacker to:

	- Generate sustained backend load with low effort.

	- Cause multiple concurrent slow requests that degrade service availability.

	- Perform a logical DoS without triggering WAFs or rate limits (assuming authenticated sessions).

- This also indicates a lack of proper input validation and resource control.

## Suggested Remediation

- Apply strict server-side validation for max_number_to_display to enforce reasonable upper bounds (e.g., max 500).

- Reject or clamp unusually high values to prevent backend overload.

- Log abuse patterns for this parameter to identify potential abuse at scale.

## Proof of Concept Script (bash)

- Proof of Concept

```bash
curl --path-as-is -i -s -k -X POST \
  -H 'Host: www.instagram.com' \
  -H 'User-Agent: Mozilla/5.0 (X11; Linux x86_64; rv:128.0) Gecko/20100101 Firefox/128.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
...
```

- Output 

![](/img2/Pasted%20image%2020250726235839.png)

## Proof of Concept BurpSuite

![](/img2/Pasted%20image%2020250729185334.png)

![](/img2/Pasted%20image%2020250729185456.png)