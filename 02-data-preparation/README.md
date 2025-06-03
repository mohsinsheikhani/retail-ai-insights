# Phase 02 – Data Preparation

In this phase, we process raw event data into analytics- and AI-ready formats across **Bronze**, **Silver**, and **Gold** zones using AWS Glue. This step lays the foundation for our forecasting and recommendation workloads.

## 🎯 Objective

Transform raw data into structured, enriched, and purpose-specific datasets ready for machine learning models and analytics workflows.

---

## Architecture & Flow

| Zone   | Purpose                                                 | Output Format |
| ------ | ------------------------------------------------------- | ------------- |
| Bronze | Raw streamed event data from Firehose                   | JSON          |
| Silver | Cleaned & validated data via Glue ETL                   | Parquet       |
| Gold   | Purpose-specific data for Forecasting & Recommendations | Parquet/CSV   |

![phase02-data-preparation](https://github.com/user-attachments/assets/433962f6-b09b-4d2f-bae9-ceb8acf5d160)

---

## Setup Instructions

```
git pull https://github.com/mohsinsheikhani/retail-ai-insights.git
cd retail-ai-insights/02-data-preparation
npm i
cdk deploy
```

---

## Buckets Created

| Bucket Purpose                | Description                                          |
| ----------------------------- | ---------------------------------------------------- |
| **Bronze Zone**               | Stores raw JSON data from Firehose                   |
| **Silver Zone**               | Receives cleaned, structured data                    |
| **Gold Zone**                 | Stores data tailored for forecasting/personalization |
| **Scripts & Datasets Bucket** | Hosts Glue ETL scripts and source data files         |

---

## Glue Jobs Overview

| Job Name                   | Function                                                                                                                  |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `DataCleaningETLJob`       | Cleans Bronze data and writes structured output to Silver zone (Parquet)                                                  |
| `ForecastGoldETLJob`       | Aggregates daily sales, adds time-based features, writes to `forecast_ready/`                                             |
| `RecommendationGoldETLJob` | Extracts 4 required columns from the dataset and outputs a CSV for Amazon Personalize, writes to `recommendations_ready/` |

---

## Crawlers

| Crawler Name                 | Crawls Bucket Zone       | Creates Glue Table             |
| ---------------------------- | ------------------------ | ------------------------------ |
| `DataCrawlerBronze`          | Raw Firehose data        | `bronze_retail_ai_bronze_data` |
| `DataCrawlerSilver`          | Cleaned Parquet output   | `silver_cleaned_data`          |
| `DataCrawlerForecast`        | Forecast-ready directory | `gold_forecast_ready`          |
| `DataCrawlerRecommendations` | CSV for Personalize      | `gold_recommendations_ready`   |

---

## Athena Queries (Example)

Once crawlers are run and tables are created, you can query them with Athena, to check sample data after cleaning:

```sql
SELECT * FROM sales_data_db.bronze_retail_ai_bronze_data;
```

![12](https://github.com/user-attachments/assets/50df5028-6d97-4cf8-8bd8-1c53e7c4341c)

```sql
SELECT * FROM sales_data_db.silver_cleaned_data;
```

![13](https://github.com/user-attachments/assets/6c2389a6-ec85-4894-b48a-9b645ba3ea3d)

```sql
SELECT * FROM sales_data_db.gold_forecast_ready;
```

![14](https://github.com/user-attachments/assets/dfa87647-14a6-4e6f-9476-996ebd65372e)

```sql
SELECT * FROM sales_data_db.gold_recommendations_ready;
```

![15](https://github.com/user-attachments/assets/9a6d74de-d388-4a56-b9c5-7b322a59d128)

## Services Used

| Service        | Purpose                                        |
| -------------- | ---------------------------------------------- |
| **AWS Glue**   | Data cleaning, enrichment, and transformation  |
| **Amazon S3**  | Storage for all data zones and scripts         |
| **AWS Athena** | Query prepared datasets post-crawling          |
| **AWS CDK**    | Provisions Glue jobs, S3 buckets, and crawlers |

---

## 🙋‍♂️ Contact

Created by **Mohsin Sheikhani**  
From Code to Cloud | Hands-on Cloud Architect | AWS | Serverless & IaC | Systems Design | GenAI | AWS Community Builder | 3x AWS Certified

🚀 **Follow me on [LinkedIn](https://www.linkedin.com/in/mohsin-sheikhani/) for more AWS content!**
