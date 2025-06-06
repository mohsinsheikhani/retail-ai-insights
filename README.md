# Retail AI Insights: Demand Forecasting & Product Recommendations with AWS

This project builds a cloud-native, AI-powered retail intelligence system that predicts product demand and recommends items to users, all using serverless AWS services and scalable MLOps practices.

It is organized into 5 clear phases to demonstrate real-world infrastructure, AI integration, and automation.

---

## Project Objective

Retail businesses lose revenue due to:

- Overstocking or understocking inventory
- Missed cross-selling opportunities
- Manual forecasting processes that can’t scale

This solution uses **AWS Bedrock**, **Amazon Personalize**, and other cloud-native tools to:

- Forecast product demand based on sales patterns
- Recommend relevant products to users in real-time
- Maintain a scalable, automated, and secure backend

---

## Architecture Overview

![retail-ai](https://github.com/user-attachments/assets/c432e64f-9bfa-4a67-81cc-f3558bc26edd)

---

## Tech Stack

| Layer          | Services                                 |
| -------------- | ---------------------------------------- |
| Compute        | AWS Lambda, EC2                          |
| AI/ML          | Amazon Bedrock, Amazon Personalize       |
| Data Pipeline  | Amazon Kinesis Firehose, AWS Glue        |
| Storage        | Amazon S3 (Bronze/Silver/Gold), DynamoDB |
| Observability  | Amazon CloudWatch, SNS                   |
| Infrastructure | AWS CDK (TypeScript)                     |

---

## Project Structure

| Phase                                                                                        | Description                                                                                                                    |
| -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| [01-data-ingestion](./01-data-ingestion)                                                     | Stream raw sales data using Kinesis Firehose into the S3 Bronze zone                                                           |
| [02-data-preparation](./02-data-preparation)                                                 | Clean and structure data using AWS Glue; output to Silver & Gold zones                                                         |
| [03-demand-forecasting-with-bedrock](./03-demand-forecasting-with-bedrock)                   | Use Bedrock models on EC2 to generate daily inventory forecasts                                                                |
| [04-product-recommendations-with-personalize](./04-product-recommendations-with-personalize) | Recommend items via API using Amazon Personalize                                                                               |
| 05-security-and-observability                             | Ensuring IAM roles with least-privilege, running worklodas in private subnets, VPC endpoints, monitoring for the entire system |

---

## How to Deploy

Each phase directory contains its own setup guide using AWS CDK and scripts.
Ensure:

- You have AWS credentials configured
- CDK is bootstrapped in your region
- Python and Node.js dependencies are installed

---

## Why This Project Matters

This project reflects the real-world needs of modern cloud systems:

- Combines **AI + Serverless** for intelligent automation
- Demonstrates **MLOps best practices** in a practical context

---

## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | AWS Cloud Engineer | AWS Community Builder | Serverless & IaC | Systems Design | Event-Driven Designs | GenAI | Agentic AI | Bedrock Agents | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
