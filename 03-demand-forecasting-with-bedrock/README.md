# Phase 03 – Demand Forecasting with Amazon Bedrock

In this phase, we introduce a scheduled forecasting pipeline that predicts product demand for the next 7 days using historical sales data. This is where AI meets operations, running compute-heavy inference tasks using Bedrock on EC2.

## 🎯 Objective

Use AI to forecast product demand based on historical sales data, enabling proactive inventory planning and smarter stocking decisions.

---

## How It Works

1. An **EC2 instance** is provisioned with a **User Data script** that:

   - Pulls aggregated sales data from the **Gold zone (forecast_ready)**.
   - Sends it to **Amazon Bedrock** to predict the next 7-day demand.
   - Updates **DynamoDB** with forecasted values.
   - Automatically **terminates itself** at the end of execution to avoid costs.

2. An **EventBridge Rule** triggers this job **once every 24 hours**.
   - It invokes a **Lambda function** that starts the EC2 instance.
  
![Forecasting job on EC2 using Amazon Bedrock, triggered by EventBrdige and Lambda](https://github.com/user-attachments/assets/f604c387-a05d-4d1e-900d-214c1e413aac)

---

## Services Used

| Service                | Purpose                                                    |
| ---------------------- | ---------------------------------------------------------- |
| **Amazon EC2**         | Runs forecast job with Bedrock, terminated after execution |
| **Amazon Bedrock**     | Generates future demand predictions                        |
| **Amazon S3**          | Stores the pre-processed `forecast-ready/` dataset         |
| **Amazon DynamoDB**    | Stores forecasted demand per product                       |
| **AWS Lambda**         | Triggers EC2 instance startup                              |
| **Amazon EventBridge** | Runs Lambda daily on schedule                              |
| **AWS CDK**            | Provisions all infrastructure as code                      |

---

## Infrastructure Provisioned

- EC2 instance with auto-terminate user data
- EventBridge rule for daily execution
- Lambda function to start EC2 instance
- IAM roles for EC2 & Lambda to access Bedrock, S3, and DynamoDB

---

## Why This Matters

Demand forecasting is a core business need in retail and e-commerce. This pipeline enables:

- **Proactive inventory planning**
- **Reduced stockouts and overstocking**
- **Automated daily intelligence without human involvement**

---

## Example Output

Each product in DynamoDB gets a `forecasted_demand` field updated with predicted 7-day sales, based on time series patterns and sales velocity.

![Screenshot from 2025-05-23 11-32-40](https://github.com/user-attachments/assets/870675e9-704a-4530-9078-3a2f6ba6a748)


---

## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | AWS Cloud Engineer | AWS Community Builder | Serverless & IaC | Systems Design | Event-Driven Designs | GenAI | Agentic AI | Bedrock Agents | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
