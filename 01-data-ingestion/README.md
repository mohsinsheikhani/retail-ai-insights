# Phase 01 – Data Ingestion

In this phase, we simulate a near real-time ingestion pipeline by streaming historical user interaction and sales data via Python scripts. The data is routed to two destinations:

- **Amazon S3 (Bronze Zone)** – for long-term, immutable storage.
- **Amazon DynamoDB** – for fast, low-latency access used by forecasting and recommendation engines.

## 🎯 Objective

Enable an event-driven ingestion pattern that mimics real-time user behavior (e.g. product views, purchases) , that lays the groundwork for both forecasting and recommendation systems.

---

## Architecture & Flow

1. A **Python script** streams batched records into **Amazon Kinesis Firehose**.
2. **Firehose** delivers events as newline-delimited JSON to the **S3 Bronze Bucket**.
3. A secondary script writes selected fields to **DynamoDB**, including:
   - `product_id`, `product_name`, `category`, `price`, `rating`
   - Plus: `current_stock` (randomly generated) and `forecasted_demand` (set to 0)
  
![phase01-data-ingestion](https://github.com/user-attachments/assets/de935a71-0d2c-4966-a060-3defe2c61e6a)

---

## Services Used

| Service              | Purpose                                               |
| -------------------- | ----------------------------------------------------- |
| **Kinesis Firehose** | Streams events to S3                                  |
| **Amazon S3**        | Stores raw data (Bronze Zone) for long-term analytics |
| **Amazon DynamoDB**  | Stores product metadata and inventory levels          |
| **AWS CDK**          | Infrastructure provisioning as code                   |
| **Python**           | Simulates event streaming and DynamoDB population     |

---

## Setup Instructions

```
git pull https://github.com/mohsinsheikhani/retail-ai-insights.git
cd retail-ai-insights/01-data-ingestion
npm i
cdk deploy
```

## Infrastructure Provisioned

- Brone S3 Bucket
- DynamoDB table
- Kinesis Firehose Stream

## Running the Pipeline

1. Stream sales events to Firehose (writes to S3):

```
cd ..
python3 ./scripts/stream_to_firehose.py --stream-name firehose-to-s3
```

2. Populate product metadata into DynamoDB:

```
python3 ./scripts/write_to_dynamodb.py
```

## Why This Matters

This ingestion pipeline:

- Simulates real-world eCommerce events
- Powers multiple AI workloads from a unified data source
- Sets the foundation for downstream ETL, forecasting, and personalization phases

---

## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | AWS Cloud Engineer | AWS Community Builder | Serverless & IaC | Systems Design | Event-Driven Designs | GenAI | Agentic AI | Bedrock Agents | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
