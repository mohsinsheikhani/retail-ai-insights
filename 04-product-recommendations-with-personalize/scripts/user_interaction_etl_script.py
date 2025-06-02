import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.context import GlueContext
from awsglue.job import Job
from pyspark.context import SparkContext
from pyspark.sql.functions import col
from pyspark.sql.functions import unix_timestamp

# Create Glue and Spark context
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'silver_bucket', 'gold_bucket'])
silver_bucket = args['silver_bucket']
gold_bucket = args['gold_bucket']

sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)

job.init(args['JOB_NAME'], args)

# Input and output paths
input_path = f"s3://{args['silver_bucket']}/cleaned_data/"
output_path = f"s3://{args['gold_bucket']}/recommendations_ready/"

# Load Silver data
df = spark.read.parquet(input_path)

# Transform to Personalize compatible format
df_cleaned = (
    df.withColumn("USER_ID", col("user_id").cast("string"))
      .withColumn("ITEM_ID", col("product_id").cast("string"))
      .withColumn("EVENT_TYPE", col("event_type").cast("string"))
      .withColumn("TIMESTAMP", unix_timestamp(col("timestamp")))
      .select("USER_ID", "ITEM_ID", "EVENT_TYPE", "TIMESTAMP")
      .dropna()
)

# Write output to Gold Zone as CSV
df_cleaned \
    .coalesce(1) \
    .write.mode("overwrite") \
    .option("header", True) \
    .csv(output_path)

job.commit()
