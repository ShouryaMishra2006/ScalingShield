<h1 align="center">ScalingShield</h1>
<p align="center">
</p>

[![Built at Hack36](https://raw.githubusercontent.com/nihal2908/Hack-36-Readme-Template/main/BUILT-AT-Hack36-9-Secure.png)](https://raw.githubusercontent.com/nihal2908/Hack-36-Readme-Template/main/BUILT-AT-Hack36-9-Secure.png)


## Introduction:
A next-generation security framework that blends deep behavioral analytics with LLM-powered query intelligence to detect insider risks, flag suspicious activity, and block malicious SQL operations in real time — ensuring your database stays one step ahead of every threat.

  
## Demo Video Link:
  <a href="https://drive.google.com/drive/folders/1BW6PjxNC1bhA9a6gbetEHCX_rtiwV0PT?usp=sharing">Video</a>
  
## Presentation Link:
  <a href="https://drive.google.com/drive/folders/1BW6PjxNC1bhA9a6gbetEHCX_rtiwV0PT?usp=sharing">PPT</a>
  
  
## Table of Contents:
1 Process Monitoring Module 
Monitor's employees background processes along with malicious domain access and sends the logs to Behavioral Analysis Engine

2 Behavioral Analysis Engine
takes the process logs and convert them into embeddings using sentence-BERT and feeds them to the FAISS database for realtime 
cosine similarity analysis and anomaly detection

3 Query Wrapper and Validation Layer
whenever the employee tries to run query in the company's database the query goes through the Wrapper that has layered security checks
going all the way from simple rule based checks to context aware LLM reasoning and decides to execute or to discard

| Section | Title                                | Description                                                                                                                                             |
| ------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**   | **Login & Roles**                    | Employee and Admin login functionality with role-based access.                                                                                          |
| **2**   | **Employee Dashboard**               | Displays the employee’s local credential theft alerts and real-time analysis through the simulator.                                                     |
| **3**   | **Admin Dashboard**                  | Shows real-time employee monitoring details, activity logs, and flagging system for suspicious users.                                                   |
| **4**   | **Process Monitoring Module**        | Monitors background processes and detects malicious domain access. Sends logs to the Behavioral Analysis Engine.                                        |
| **5**   | **Behavioral Analysis Engine**       | Converts process logs into embeddings using Sentence-BERT and stores them in FAISS for real-time cosine similarity analysis and anomaly detection.      |
| **6**   | **Query Wrapper & Validation Layer** | Intercepts and validates database queries. Safe queries execute; unsafe ones return possible reasoning for rejection using context-aware LLM reasoning. |
| **7**   | **Virtual Machine / WSL Monitoring** | Extends monitoring to virtual machines and WSL environments using lightweight endpoint agents.                                                          |
| **8**   | **Rate Limiting Mechanism**          | Prevents abuse by rate-limiting clients who attempt rapid or repeated query requests.  
|
<img width="6996" height="1936" alt="Mermaid Chart - Create complex, visual diagrams with text -2025-11-09-035033" src="https://github.com/user-attachments/assets/7b1da9f8-755b-47f8-a1e6-fb70b3b6a79c" />



## Technology Stack:
  1) Next.js
  2) Flask
  3) Node.js
  4) Machine Learning
  5) MongoDB

  

## Contributors:

Team Name: Overfit Illuminati

- [Shourya Mishra](https://github.com/ShouryaMishra2006)
- [Naman Agarwal](https://github.com/NamanAgarwal0905)
- [Chandan Yadav](https://github.com/alwaysahustler)
- [Divyansh Singh](https://github.com/divyanshsingh101)


### Made at:
[![Built at Hack36](https://raw.githubusercontent.com/nihal2908/Hack-36-Readme-Template/main/BUILT-AT-Hack36-9-Secure.png)](https://raw.githubusercontent.com/nihal2908/Hack-36-Readme-Template/main/BUILT-AT-Hack36-9-Secure.png)
