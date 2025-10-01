# CreditCardRewardsMaximizer

README for Credit Card Maximizer

**Project Title**
Agentic Wallet: An Intelligent Expense Optimization Platform for Enterprises

**Objective**
- The primary objective is to build a prototype of an agentic software platform that intelligently assists employees in optimizing their spending. The system will leverage an AI agent to provide real-time, personalized recommendations on which credit card to use for a transaction, based on a user-selected goal such as maximizing cash back, points, or specific discounts.

**Problem Statement**
- Enterprises and their employees consistently miss out on significant savings and rewards due to the complexity of tracking credit card benefits. Manually choosing the optimal card for every transaction is impractical. This platform automates that decision-making process, providing clear, justifiable recommendations that reduce company costs and enhance employee benefits.


**Key Deliverables**
1. A deployed backend service with a secure API.
2. A web application built with React Native.
3. A functional AI agent that provides recommendations based on user-defined optimization goals.
4. Technical documentation, including the architecture, security model, and API specification.
5. A final project presentation and demo.

**Architecture and Technical Design (may change as development and planning progresses)**
The core architecture remains a decoupled, microservices-based system. The key update is the inclusion of the optimization_goal throughout the request lifecycle.

1. User Interface (React Native): A user inputs their purchase details and selects an optimization goal (e.g., "Maximize Cash Back," "Maximize Travel Points"). The React Native app sends this request to the backend.
2. Sub-Agents:
  - User Profile Agent: Fetches the user's registered cards from PostgreSQL.
  - Offer Intelligence Agent: Queries the mock "Offer API" and internal databases for relevant benefits.
3. Optimization Agent: This agent now receives the user's optimization_goal as a direct input. It uses this to dynamically adjust the weights in its value calculation. The value (V) for each card (c) is calculated as:
 Vc​=(w1​⋅CashBackc​)+(w2​⋅PointsValuec​)+(w3​⋅Discountc​)
  - If goal == 'cash_back', the weights might be w_1=1.0,w_2=0.1,w_3=0.5.
  - If goal == 'travel_points', the weights might be w_1=0.1,w_2=1.0,w_3=0.3. These weights are configured within the agent to reflect the chosen strategy.
4. Explanation & Response: The Coordinator Agent synthesizes the result into a natural language explanation and sends the final recommendation back to the user's interface.

**Technology Stack**
-Cloud Platform: AWS
-LLM/Agent Framework: Llama 3, orchestrated with LangChain
-Backend: FastAPI (Python)
-Frontend (Web & Android): React Native. This is an excellent choice as it allows you to maintain a single JavaScript/TypeScript codebase for both the web application and the Android mobile app, saving significant development time.
-Containerization: Docker
-Databases: PostgreSQL, Vector Database (ChromaDB), Redis


## 📅 Timeline (Sep 24 – Nov 10, 2025 tentatively) 

| Week | Dates          | Key Tasks & Goals                                        | Owner(s)    |
|------|---------------|----------------------------------------------------------|-------------|
| 1    | Sep 24 – Sep 30 | Planning & Design: finalize architecture, API spec, security model. Setup AWS. | All |
| 2    | Oct 1 – Oct 7  | Backend foundation: setup DB, Docker. Build JWT-secured auth endpoints. | Eugene, Irwin |
| 3    | Oct 8 – Oct 14 | Core Data Agents & Mock API.                             | Irwin, Atharva |
| 4    | Oct 15 – Oct 21 | Agent orchestration: develop Coordinator & Optimization agents with goal logic. | Eugene |
| 5    | Oct 22 – Oct 28 | Frontend dev (React Native): build screens, components, API integration. | Matt |
| 6    | Oct 29 – Nov 4  | End-to-end testing & deployment: deploy to AWS, test web & Android builds. | Atharva, All |
| 7    | Nov 5 – Nov 10  | Finalization & presentation prep: code freeze, docs, demo. | All |









ReadME for Preventative Utilities Maintenance 

# Preventative Utilities Maintenance

Objective

This project aims to build a **Preventative Utilities Maintenance System** that helps utility companies predict equipment failures before they occur. By analyzing logs, sensor data, and external climate factors, the system will prioritize maintenance tasks, reduce outages, and optimize crew routing.

---

Overview/Motivation

Utility equipment failures are costly, disruptive, and sometimes dangerous.  
This application provides a proactive solution by:

- Continuously ingesting **logs, sensor streams, and weather/climate data**.
- Running **risk assessment models** to predict potential failures.
- Producing an **optimized ranking of assets** that need attention.
- Generating **crew schedules and routing plans** to address issues efficiently.
- Delivering **reports** that explain rankings and decision-making.

The goal is to **save money, reduce downtime, and improve reliability** for utility companies.

---

Planned Features

- **Multiple Agents**  
  Independent monitoring and analysis agents for different data sources.

- **Data Ingest**  
  Collect logs, IoT sensor streams, and external weather/climate data.

- **Risk Assessment**  
  Evaluate equipment condition and predict likelihood of failure.

- **Optimization**  
  Rank assets by urgency and importance of maintenance.

- **Routing**  
  Generate optimal crew schedules to service high-risk equipment.

- **Reports**  
  Provide explainable outputs for asset ranking and crew assignment.

---

System Design/Architecture

- **Input Layer**: log collectors, sensor integrations, weather APIs  
- **Processing Layer**: data cleaning, risk assessment models  
- **Optimization Layer**: ranking algorithms & routing engine  
- **Output Layer**: dashboards, crew schedules, reports  

A UML diagram and system architecture will be added in the `docs/` folder.

---

Tech Stack

- **Programming Languages**: Python (data processing, ML), Java/Go (backend services)  
- **Data Storage**: PostgreSQL / TimescaleDB  
- **Streaming/Data Ingest**: Kafka / MQTT  
- **Optimization & Routing**: OR-Tools, linear programming  
- **Visualization**: React.js / D3.js for dashboards  

*(Tech stack may evolve during implementation.)*

---

## 📅 Roadmap

- ✅ Requirements gathering  
- ✅ Initial feature planning  
- ⬜ UML/System design  
- ⬜ Proof-of-concept data pipeline  
- ⬜ Risk assessment prototype  
- ⬜ Optimization & routing prototype  
- ⬜ Reporting module  
- ⬜ Integration & testing  

Other Notes:
Card Rewards Maximizer 
This application would pick the best credit card from your wallet for any purchase that would give you the most rewards.
This web application would allow the user to add their credit cards (excluding sensitive information) and the store/location they are shopping at (we will be inputting location since our initial plan is a web application)
Multiple agents 
Optimization: calculates potential value for each card in terms of rewards 
Offer intelligence: find relevant offers, benefits, rewards multiplier 
Coordinator: synthesizes result into natural language explanation and sends final recommendation back to the user’s interface 
QUESTION: are the inputting the location or is it automatic???
Inputting location
Preventative Utilities Maintenance 
This application would check equipment and prioritize which ones need attention before it fails based on data. 
This application allows utility companies to save money as it would keep their equipment up and running instead of having to deal with outages.
Multiple agents
data ingest: collect logs, sensor streams, and weather/climate data
Risk assessment: evaluate failure likelihood
Optimization: rank assets 
Routing: generates optimal crew schedules 
Report: explain rankings
