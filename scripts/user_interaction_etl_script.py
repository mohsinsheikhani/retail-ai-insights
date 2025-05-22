import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from pyspark.sql.functions import col, udf
from pyspark.sql.types import LongType
from datetime import datetime

# Create Glue and Spark context
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'data_assets_bucket', 'gold_bucket'])
data_assets_bucket = args['data_assets_bucket']
gold_bucket = args['gold_bucket']

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)

job.init(args['JOB_NAME'], args)

# UDF to convert datetime string to Unix timestamp
def convert_to_unix(datetime_str):
    try:
        return int(datetime.strptime(datetime_str.strip(), "%Y-%m-%d %H:%M:%S.%f").timestamp())
    except:
        return None

convert_to_unix_udf = udf(convert_to_unix, LongType())


# Input and output paths
input_path = f"s3://{args['data_assets_bucket']}/dataset/events_with_metadata.csv"
output_path = f"s3://{args['gold_bucket']}/recommendations_ready/"

# Load input CSV file from S3
df = spark.read.option("header", True).csv(input_path)

# Clean and transform data
df_cleaned = (
    df.withColumn("USER_ID", col("user_id").cast("string"))
      .withColumn("ITEM_ID", col("product_id").cast("string"))
      .withColumn("EVENT_TYPE", col("event_type").cast("string"))
      .withColumn("TIMESTAMP", convert_to_unix_udf(col("timestamp")))
      .select("USER_ID", "ITEM_ID", "EVENT_TYPE", "TIMESTAMP")
      .dropna()
)

# Write output to S3 as CSV
df_cleaned.write.mode("overwrite").option("header", True).csv(output_path)

job.commit()
