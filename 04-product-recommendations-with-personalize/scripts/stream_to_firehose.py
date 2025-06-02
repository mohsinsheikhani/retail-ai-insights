import boto3
import csv
import json
import argparse

firehose_client = boto3.client('firehose', region_name='us-east-1')

parser = argparse.ArgumentParser(description='Send data to Firehose delivery stream')
parser.add_argument('--stream-name', required=True, help='Firehose delivery stream name')
args = parser.parse_args()

delivery_stream_name = args.stream_name
MAX_BATCH_SIZE = 500

with open('./dataset/events_with_metadata.csv', 'r') as file:
    reader = csv.DictReader(file)
    batch = []

    for row in reader:
        record = json.dumps(row) + "\n"
        batch.append({'Data': record.encode('utf-8')})

        if len(batch) == MAX_BATCH_SIZE:
            firehose_client.put_record_batch(
                DeliveryStreamName=delivery_stream_name,
                Records=batch
            )
            batch = []

    # Send remaining rows
    if batch:
        firehose_client.put_record_batch(
            DeliveryStreamName=delivery_stream_name,
            Records=batch
        )
