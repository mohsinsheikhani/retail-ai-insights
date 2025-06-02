import boto3
import uuid

bucket = "retail-ai-gold-zone"
file_path = "recommendations_ready/part-00000-5e182df7-531e-4a99-8d7c-97f3be4bc0f4-c000.csv"
dataset_arn = "arn:aws:personalize:us-east-1:<ACCOUNT_ID>:dataset/RetailInventoryDatasetGroup/INTERACTIONS"
role_arn = "arn:aws:iam::<ACCOUNT_ID>:role/AmazonPersonalize-ExecutionRole"

personalize = boto3.client("personalize", region_name="us-east-1")

response = personalize.create_dataset_import_job(
    jobName=f"import-job-{uuid.uuid4()}",
    datasetArn=dataset_arn,
    dataSource={
        "dataLocation": f"s3://{bucket}/{file_path}"
    },
    roleArn=role_arn,
    importMode="FULL"
)

print("Dataset Import Job ARN:", response["datasetImportJobArn"])
