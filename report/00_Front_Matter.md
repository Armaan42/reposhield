<div align="center">

# CANDIDATE's DECLARATION

I hereby declare that the project report entitled **"RepoShield: An AI-Powered Automated Code Review Platform with Integrated Application Security Auditing"** submitted by me to the university in partial fulfillment of the requirements for the award of the degree of Bachelor of Technology is a record of bona fide project work carried out by me under the guidance of my supervisor.

I further declare that the work reported in this project has not been submitted and will not be submitted, either in part or in full, for the award of any other degree or diploma in this institute or any other institute or university.

<br><br>
**Signature of Candidate**<br>
Armaan<br>
Date: 25 May 2026

</div>

---

<div align="center">

# CERTIFICATE

This is to certify that the project report entitled **"RepoShield: An AI-Powered Automated Code Review Platform with Integrated Application Security Auditing"** submitted by Armaan is a record of bona fide project work carried out under my supervision and guidance.

This report satisfies the academic requirements in respect of project work prescribed for the said degree.

<br><br>
**Signature of Supervisor**<br>
Ms. Vishalika Sharma<br>
Date: 25 May 2026

</div>

---

# ABSTRACT

RepoShield is an intelligent, autonomous code review platform designed to support early-stage detection of security vulnerabilities, architectural flaws, and code quality issues in software development workflows. Traditional manual pull request reviews are often time-consuming, prone to human error, and struggle to scale with the rapid pace of modern Continuous Integration and Continuous Deployment (CI/CD) cycles. To address these limitations, RepoShield integrates an advanced Retrieval-Augmented Generation (RAG) pipeline into a unified, event-driven architecture, enabling context-aware automated code audits.

The system captures repository events via secure HMAC-validated GitHub webhooks, fetching pull request diffs using the Octokit REST API. Unlike standard code analysis tools, RepoShield possesses deep contextual awareness of the codebase by generating high-dimensional vector embeddings of the repository files using the Google Gemini model and storing them in a Pinecone vector database. Upon receiving a review request, asynchronous Inngest background workers query Pinecone to inject relevant architectural context into the prompt for the Google Gemini `gemma-4-31b-it` model.

Within seconds, the system generates and posts comprehensive markdown reviews directly to the GitHub pull request timeline. These reviews include file-by-file walkthroughs, Mermaid JS sequence diagrams, strength and issue analysis, and detailed vulnerability assessments. Additionally, RepoShield features a React-based developer insights dashboard using Recharts to visualize review metrics and a subscription tiering system powered by Polar.sh. Testing validates that RepoShield significantly reduces manual review overhead while enhancing the security posture of software repositories.

---

# TABLE OF CONTENTS

| Section | Page No. |
| :--- | :--- |
| Candidate's Declaration | i |
| Certificate | ii |
| Abstract | iii |
| Table of Contents | iv |
| List of Tables | v |
| List of Figures | vi |
| Abbreviations Used | vii |
| **Chapter 1 – Introduction** | 1 |
| **Chapter 2 – Literature Survey & Problem Formulation** | 10 |
| **Chapter 3 – System Design / Methodology** | 24 |
| **Chapter 4 – Implementation** | 42 |
| **Chapter 5 – Results & Discussion** | 65 |
| **Chapter 6 – Conclusion & Future Scope** | 78 |
| References | 82 |
| Appendix A – Package and Component List | 84 |
| Appendix B – Source Code Snippets | 85 |
| Appendix C – Environment Variables | 88 |

*(Note: Page numbers are indicative for the markdown structure and will adjust when exported to PDF/Word)*

---

# LIST OF TABLES

| Table No. | Caption | Page No. |
| :--- | :--- | :--- |
| 1.1 | Project Schedule and Phases | 2 |
| 1.2 | Scope of the Project (Inclusions vs Exclusions) | 8 |
| 2.1 | Summary of Existing Code Review Methodologies | 14 |
| 3.1 | Core Database Models and Relationships | 35 |
| 4.1 | API Rate Limiting Configuration | 45 |
| 4.2 | Core API Endpoints & Server Actions | 60 |
| 5.1 | Experimental Test Cases and Expected Outcomes | 66 |
| 5.2 | Comparison of Code Review Methodologies | 75 |
| 5.3 | System Latency Benchmarks | 70 |

---

# LIST OF FIGURES

| Figure No. | Caption | Page No. |
| :--- | :--- | :--- |
| 2.1 | The Bottleneck in Current CI/CD Workflows | 16 |
| 3.1 | High-level System Architecture Diagram | 25 |
| 3.2 | Event-Driven Inngest Background Pipeline | 28 |
| 3.3 | DFD Level 0 (Context Diagram) of RepoShield | 31 |
| 3.4 | Polar.sh Subscription Flow | 40 |
| 4.1 | RAG Pipeline Data Flow | 49 |
| 4.2 | Webhook HMAC Cryptographic Validation Flow | 55 |
| 4.3 | Repository Onboarding and Vector Indexing Sequence | 52 |
| 5.1 | GitHub Pull Request Review Output | 68 |
| 5.2 | Developer Insights Dashboard Activity Chart | 71 |

---

# ABBREVIATIONS USED

* **AI**: Artificial Intelligence
* **API**: Application Programming Interface
* **AST**: Abstract Syntax Tree
* **CI/CD**: Continuous Integration / Continuous Deployment
* **DB**: Database
* **DFD**: Data Flow Diagram
* **EDA**: Event-Driven Architecture
* **HMAC**: Hash-based Message Authentication Code
* **HTTP**: Hypertext Transfer Protocol
* **JS**: JavaScript
* **JSON**: JavaScript Object Notation
* **LLM**: Large Language Model
* **ORM**: Object-Relational Mapping
* **PR**: Pull Request
* **RAG**: Retrieval-Augmented Generation
* **REST**: Representational State Transfer
* **RSC**: React Server Components
* **SAST**: Static Application Security Testing
* **SDK**: Software Development Kit
* **SDLC**: Software Development Life Cycle
* **SQL**: Structured Query Language
* **TS**: TypeScript
* **UI/UX**: User Interface / User Experience
* **VCS**: Version Control System
* **XSS**: Cross-Site Scripting
