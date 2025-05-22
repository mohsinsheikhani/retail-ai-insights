import sys
from awsglue.transforms import *
from awsglue.utils import getResolvedOptions
from awsglue.job import Job
from pyspark.context import SparkContext
from pyspark.sql import functions as F
from pyspark.sql.session import SparkSession
from awsglue.context import GlueContext

# Get the job parameters (bronze and silver buckets)
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'silver_bucket', 'gold_bucket'])
silver_bucket = args['silver_bucket']
gold_bucket = args['gold_bucket']

# Initialize Spark and Glue Contexts
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)

job.init(args['JOB_NAME'], args)

# Input and output paths
input_path = f"s3://{args['silver_bucket']}/cleaned_data/"
output_path = f"s3://{args['gold_bucket']}/forecast_ready/"

# Load Silver data
df = spark.read.parquet(input_path)

print(f"Initial row count: {df.count()}")

# Filter only 'purchase' events (for demand forecasting)
df = df.filter(F.col("event_type") == "purchase")

# Feature engineering
df = df.withColumn("timestamp", F.to_timestamp("timestamp")) \
       .withColumn("day_of_week", F.dayofweek("timestamp")) \
       .withColumn("month", F.month("timestamp")) \
       .withColumn("price", F.col("price").cast("float")) \
       .withColumn("rating", F.col("rating").cast("float"))

print(f"Cleaned row count: {df.count()}")

# Optional aggregation: one row per product per day
df = df.groupBy("product_id", "event_date").agg(
    F.count("*").alias("daily_sales"),
    F.avg("price").alias("avg_price"),
    F.avg("rating").alias("avg_rating"),
    F.first("day_of_week").alias("day_of_week"),
    F.first("month").alias("month"),
    F.first("product_name").alias("product_name"),
    F.first("category").alias("category")
)

# Write to Gold zone
df.write.mode("overwrite").parquet(output_path)

job.commit()
