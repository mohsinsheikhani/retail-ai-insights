# Phase 04 – Product Recommendations with Amazon Personalize

This phase focuses on building an AI-powered recommendation engine that delivers personalized product suggestions based on user behavior.

Instead of limiting ourselves to basic ML experimentation, this step takes a production-ready approach using Amazon Personalize to generate real-time recommendations for customers—just like Netflix or Amazon.

## 🎯 Objective

Enable a recommendation system that:
- Learns from user interaction data (views, purchases, etc.)
- Uses Amazon Personalize to train and deploy a custom model
- Delivers recommendations through an API Gateway + Lambda integration
- Retrieves full product details from DynamoDB

---

## Architecture & Flow

1. Lambda queries Personalize with an `ITEM_ID`.
2. Personalize returns similar `ITEM_ID`'s
3. Lambda enriches results using DynamoDB
4. Response is returned via API Gateway
  
![retail-ai](https://github.com/user-attachments/assets/98e2e3ce-3987-4fff-959d-d370a443c7ea)

---

## Services Used

| Service              | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| **Amazon Personalize** | Train and host the recommendation model                                 |
| **Amazon S3**        | Stores training data (recommendation-ready CSV) in Gold Zone |
| **API Gateway**  | Stores product metadata and inventory levels          |
| **AWS Lambda**  | 	API handler to fetch recommendations          |
| **Amazon DynamoDB**          | Product catalog metadata for enrichment                   |
| **AWS CDK**          | 	Provisions the full infrastructure                   |

---

## Setup Instructions

```
git pull https://github.com/mohsinsheikhani/retail-ai-insights.git
cd retail-ai-insights/04-product-recommendations-with-personalize
npm i
cdk deploy
```

## Infrastructure Provisioned

- Amazon Personalize Resources
- Lambda Function
- API Gateway endpoint

## 🧠 Why This Matters

With Amazon Personalize and AWS Lambda, you can serve real-time recommendations at scale without training ML models manually or provisioning infrastructure for hosting.

This step brings AI to production, where your system learns from behavior and improves customer experience.

---

## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | AWS Cloud Engineer | AWS Community Builder | Serverless & IaC | Systems Design | Event-Driven Designs | GenAI | Agentic AI | Bedrock Agents | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
