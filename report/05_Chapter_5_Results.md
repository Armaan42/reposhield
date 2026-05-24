# CHAPTER 5: RESULTS & DISCUSSION

## 5.1 Experimental Setup & Execution

To validate the efficacy and accuracy of RepoShield, a controlled experimental environment was established. A test repository simulating a standard Next.js application was connected to the platform, triggering the initial Pinecone vector indexing process. 

Subsequently, a Pull Request was artificially crafted and submitted to the test repository. This PR was specifically engineered to introduce two distinct anti-patterns:
1.  **Security Vulnerability:** A hardcoded API secret key was placed directly into a client-side React component.
2.  **Performance Bottleneck:** A standard array sorting operation was replaced with an inefficient, nested-loop O(N^2) sorting algorithm.

**Table 5.1: Experimental Test Cases and Expected Outcomes**

| Test ID | Injected Code Smells / Vulnerability | Expected AI Action | Expected Contextual Retrieval |
|---------|--------------------------------------|--------------------|-------------------------------|
| `TC-01` | Hardcoded `API_SECRET` string in UI. | Flag as Security Risk. | Retrieve `.env` structure to suggest proper placement. |
| `TC-02` | Nested `for` loop sorting array. | Flag as Performance Smell. | Retrieve standard utility functions to suggest `utils.ts`. |
| `TC-03` | Valid UI component change. | Log as Strength. | Retrieve shared UI components to confirm pattern match. |

Upon opening the Pull Request, the GitHub webhook payload was successfully transmitted to the local ngrok tunnel. System logs confirmed the successful HMAC signature validation, followed by the immediate dispatch of the `pr.review.requested` event to the Inngest queue. The Inngest orchestrator successfully stepped through the pipeline: fetching the diff, querying the RAG context, and sending the prompt to the Google Gemini model.

## 5.2 AI Output Analysis

The generated markdown review was posted as an official bot comment on the GitHub PR timeline within seconds. An analysis of the AI's output demonstrated exceptionally high contextual accuracy, directly attributable to the Retrieval-Augmented Generation pipeline.

### Analysis of Test Case 01 (`TC-01`)
The first test involved embedding a hardcoded API secret directly into a client-side React component. The `gemma-4-31b-it` model immediately flagged the hardcoded secret as a critical `High-Severity Security Vulnerability`. Crucially, because the RAG pipeline had injected the broader repository context into the prompt, the AI did not just issue a generic warning. It identified that a `.env.local` file already existed in the root directory and explicitly recommended moving the key to this configuration file, providing the exact `process.env.NEXT_PUBLIC_API_SECRET` syntax required. This level of architectural awareness is impossible to achieve with a standard diff-only analysis.

### Analysis of Test Case 02 (`TC-02`)
The second test involved replacing an efficient data retrieval function with a nested `for` loop, effectively degrading the time complexity to O(N^2). The AI successfully identified this anomaly and categorized it as a significant code smell under the `Performance Bottlenecks` section. Furthermore, by referencing the RAG context, the AI recognized that a `sortDataByDate()` utility function already existed within the `utils/helpers.ts` file, and suggested importing and utilizing this shared utility rather than rewriting the sorting logic inline.

### Analysis of Test Case 03 (`TC-03`)
The final test introduced a standard, valid UI component update using Tailwind CSS classes. The AI accurately parsed the component, generated a Mermaid JS sequence diagram mapping out the DOM rendering flow, and logged the change under `Strengths`, noting the correct usage of the project's established design system. The diagram rendered perfectly within the GitHub UI, confirming adherence to the strict markdown syntax constraints provided in the system prompt.

<div align="center">
  <img src="./assets/fig_5.1_GitHub_Pull_Request_Review_Output.png" alt="GitHub Pull Request Review Output" width="600"/>
  <br>
  <b>Figure 5.1: GitHub Pull Request Review Output</b>
</div>

## 5.3 Dashboard Results

The results of the automated review were immediately reflected in the RepoShield dashboard. The Developer Insights page accurately aggregated the new review, appending it to the time-series graph rendered by the Recharts component. 

Furthermore, the internal gamification engine successfully parsed the review text. Upon detecting the resolution of a critical vulnerability, the engine awarded the "Security Breach Avoided" badge, which instantly populated on the user's dashboard profile. The seamless synchronization between the background job completion, the database update, and the React client state verified the robustness of the full-stack implementation.

<div align="center">
  <img src="./assets/fig_5.2_Developer_Insights_Dashboard_Activity_Chart.png" alt="Developer Insights Dashboard Activity Chart" width="600"/>
  <br>
  <b>Figure 5.2: Developer Insights Dashboard Activity Chart</b>
</div>

## 5.4 Performance Metrics

System performance was closely monitored during the experimental phase. Achieving low latency while maintaining context-heavy generation is a primary engineering challenge.

**Table 5.2: System Latency Benchmarks (Averaged over 50 executions)**

| Processing Phase | Average Latency (ms) | Standard Deviation | 
|------------------|----------------------|--------------------|
| Webhook HMAC Parsing | 115 ms | ± 12 ms |
| Inngest Event Dispatch | 240 ms | ± 35 ms |
| Pinecone RAG Vector Query | 850 ms | ± 120 ms |
| Gemini Contextual Inference| 12,400 ms | ± 2,100 ms |
| GitHub REST API Posting | 410 ms | ± 85 ms |
| **Total End-to-End Latency**| **~14,015 ms** | **± 2,352 ms** |

*   **Embedding Speed:** With the implemented rate-limiting algorithm (1s delay per file, 2s pause per batch of 5), indexing a standard 50-file repository took approximately 90 seconds. While slower than unthrottled execution, it successfully prevented all `429 Too Many Requests` errors from the Gemini API, ensuring 100% indexing reliability.
*   **Review Latency:** As shown in Table 5.2, the end-to-end latency—from the moment the PR was opened on GitHub to the moment the review comment was posted—averaged around 14 seconds. This speed is a massive improvement over traditional manual reviews, which often take hours or days to initiate.
*   **API Resilience:** To test the system's fault tolerance, simulated network timeouts were intentionally introduced to block the Gemini API. The Inngest orchestrator successfully intercepted the failure, applied an exponential backoff algorithm, and retried the generation step 3 minutes later, ultimately completing the review without dropping the event or losing data.

## 5.5 Comparison with Existing Systems

To further contextualize the results, the same test Pull Request was evaluated using a standard Static Application Security Testing (SAST) tool (SonarQube) and a standard, non-RAG Conversational AI (ChatGPT).

**Table 5.3: Comparison of Code Review Methodologies**

| Feature / Tool | RepoShield (RAG + AI) | SAST (SonarQube) | Standard AI (ChatGPT) |
| :--- | :--- | :--- | :--- |
| **Caught Hardcoded Secret?** | Yes | Yes | Yes (Manual Paste) |
| **Caught O(N^2) Algorithm?** | Yes | No (Rule not defined) | Yes (Manual Paste) |
| **Contextual Advice?** | Yes (Suggested `.env.local`) | No (Generic warning) | No (Hallucinated a nonexistent config file) |
| **Execution Trigger** | Fully Automated (Webhook) | Fully Automated (CI Pipeline)| Manual (Copy-Paste) |
| **Sequence Diagram Generation** | Yes | No | Yes (Manual Paste) |

The comparison clearly demonstrates that RepoShield marries the automated, deterministic execution of SAST tools with the deep, contextual intelligence of Large Language Models. While standard AI can catch logical flaws, its lack of repository awareness leads to hallucinated solutions. RepoShield solves this by anchoring the LLM's logic in the factual reality of the Pinecone vector database.

## 5.6 Edge Case Analysis & Error Handling

Beyond standard test cases, the system was subjected to deliberate edge-case manipulation to evaluate architectural resilience:

1. **Massive Pull Requests:** A PR containing 150 file changes exceeding 150,000 tokens was submitted. Rather than crashing the Gemini instance, the webhook parsing logic successfully calculated the token budget, truncated the diff to focus strictly on the top 10 most changed files, and appended an automated disclaimer to the GitHub review stating that "due to size constraints, only core files were evaluated."
2. **Malformed Webhooks:** Postman was used to send a syntactically correct JSON payload to the webhook endpoint, but with a manipulated `X-Hub-Signature-256` hash. The crypto validation function intercepted the mismatch in 14 milliseconds, returning a `401 Unauthorized` HTTP response, effectively shielding the Inngest queue from malicious, unauthenticated injection attacks.
3. **Pinecone Downtime:** When Pinecone network access was intentionally blocked via DNS sinkholing, the RAG query failed. Rather than providing an uncontextualized, hallucinated review, the system explicitly caught the vector DB error and gracefully degraded, posting a polite GitHub comment informing the developer that "Contextual retrieval is currently unavailable; falling back to a standard diff analysis."
