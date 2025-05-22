import sys
from pyspark.context import SparkContext
from awsglue.context import GlueContext
from awsglue.job import Job
from awsglue.utils import getResolvedOptions
from pyspark.sql.types import StructType, StructField, StringType, FloatType, TimestampType
from pyspark.sql.functions import col, to_timestamp

# Get the job parameters (bronze and silver buckets)
args = getResolvedOptions(sys.argv, ['JOB_NAME', 'bronze_bucket', 'silver_bucket'])
bronze_bucket = args['bronze_bucket']
silver_bucket = args['silver_bucket']

# Initialize Spark and Glue Contexts
sc = SparkContext()
glueContext = GlueContext(sc)
spark = glueContext.spark_session
job = Job(glueContext)

job.init(args['JOB_NAME'], args)

# Define schema manually
schema = StructType([
    StructField("user_id", StringType(), True),
    StructField("product_id", StringType(), True),
    StructField("event_type", StringType(), True),
    StructField("timestamp", StringType(), True),
    StructField("event_date", StringType(), True),
    StructField("product_name", StringType(), True),
    StructField("category", StringType(), True),
    StructField("price", StringType(), True),
    StructField("rating", StringType(), True),
])

# Read raw JSON data from Bronze Zone with the defined schema
input_path = f"s3://{bronze_bucket}/dataset/2025/05/22/11/"
raw_df = spark.read.schema(schema).json(input_path)

# Data Cleaning and Type Casting
cleaned_df = raw_df.dropDuplicates(["user_id", "product_id", "timestamp"]) \
    .withColumn("price", col("price").cast("float")) \
    .withColumn("rating", col("rating").cast("float")) \
    .withColumn("timestamp", to_timestamp(col("timestamp"), "yyyy-MM-dd HH:mm:ss.SSSSSS")) \
    .withColumn("event_date", to_timestamp(col("event_date"), "yyyy-MM-dd"))

# Write to Silver Zone in Parquet format
output_path = f"s3://{silver_bucket}/cleaned_data/"
cleaned_df.write.mode("overwrite").parquet(output_path)

job.commit()
