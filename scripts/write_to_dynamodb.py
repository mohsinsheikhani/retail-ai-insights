import boto3
import csv
import json
import random
from decimal import Decimal

dynamodb = boto3.resource('dynamodb', region_name='us-east-1')
table = dynamodb.Table('RetailInventoryTable')

with open('./dataset/events_with_metadata.csv', 'r') as file:
    reader = csv.DictReader(file)

    seen_products = set()

    with table.batch_writer() as batch:
        for row in reader:
            product_id = row['product_id']

            if product_id not in seen_products:
                seen_products.add(product_id)

                item = {
                    'product_id': product_id,
                    'product_name': row['product_name'],
                    'category': row['category'],
                    'price': Decimal(row['price']),
                    'rating': Decimal(row['rating']),
                    'current_stock': random.randint(30, 70),
                    'forecasted_demand': 0
                }

                batch.put_item(Item=item)

print(f"Successfully uploaded {len(seen_products)} unique products to DynamoDB!")
