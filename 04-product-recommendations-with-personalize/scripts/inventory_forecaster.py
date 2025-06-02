import boto3
import pandas as pd
import io
import pyarrow.parquet as pq
import json
import os
from datetime import datetime
from itertools import islice

# AWS clients
s3 = boto3.client('s3', region_name='us-east-1')
dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Configs from environment variables
gold_bucket = os.environ.get('GOLD_BUCKET')
forecast_table_name = os.environ.get('FORECAST_TABLE')

forecast_table = dynamodb.Table(forecast_table_name)

print("Loading gold data...")

# Read all matching parquet files under prefix
prefix = 'forecast_ready/'
response = s3.list_objects_v2(Bucket=gold_bucket, Prefix=prefix)
objects = response.get("Contents", [])

if not objects:
    raise Exception(f"No objects found in s3://{gold_bucket}/{prefix}")

all_dfs = []

for obj in objects:
    key = obj["Key"]
    if key.endswith(".parquet") or key.endswith(".snappy.parquet"):
        print(f"Reading: {key}")
        s3_obj = s3.get_object(Bucket=gold_bucket, Key=key)
        buffer = io.BytesIO(s3_obj["Body"].read())
        table = pq.read_table(buffer)
        df = table.to_pandas()
        all_dfs.append(df)

if not all_dfs:
    raise Exception("No valid parquet files found.")

df = pd.concat(all_dfs, ignore_index=True)

# Step 1: Sort the full dataframe by product_id
df_sorted = df.sort_values(by='product_id')

# Group by product for summarization
products = df.groupby('product_id')

print("Number of products:", len(products))

# Forecasting loop (uncomment when ready to run)
for product_id, group in islice(products, 4):
    product_name = group['product_name'].iloc[0]
    category = group['category'].iloc[0]
    recent_sales_count = group["daily_sales"].sum()

    prompt = (
        f"Product: {product_name}\n"
        f"Category: {category}\n"
        f"Recent Sales Count: {recent_sales_count}\n"
        f"\n"
        f"Based on the above data, predict how many units are likely to be sold in the next 7 days. Do the calculation, and only return the number of units to be sold, no explanation just unit count."
    )

    response = bedrock.invoke_model(
        modelId='us.anthropic.claude-3-7-sonnet-20250219-v1:0',
        body=json.dumps({
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 100
        }),
        accept='application/json',
        contentType='application/json'
    )

    result = json.loads(response['body'].read().decode())
    prediction = result['content'][0]['text'].strip()

    print("Product ID:", product_id, "| Name:", product_name, "| Prediction:", prediction)

    # Store in DynamoDB
    forecast_table.update_item(
        Key={
            'product_id': product_id
        },
        UpdateExpression='SET forecasted_demand = :prediction, #ts = :ts',
        ExpressionAttributeNames={
            '#ts': 'timestamp'
        },
        ExpressionAttributeValues={
            ':prediction': prediction,
            ':ts': datetime.utcnow().isoformat()
        }
    )

print("Forecasting complete.")
