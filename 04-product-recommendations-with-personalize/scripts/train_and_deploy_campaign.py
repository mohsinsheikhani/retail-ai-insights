import boto3
import time

region = 'us-east-1'
dataset_group_arn = 'arn:aws:personalize:us-east-1:<ACCOUNT_ID>:dataset-group/RetailInventoryDatasetGroup'
solution_name = 'retail-recommendation-solution'
campaign_name = 'retail-recommendation-campaign'
recipe_arn = 'arn:aws:personalize:::recipe/aws-similar-items'

personalize = boto3.client('personalize', region_name=region)

# Create Solution
print("Creating solution...")
solution_response = personalize.create_solution(
    name=solution_name,
    datasetGroupArn=dataset_group_arn,
    recipeArn=recipe_arn,
    solutionConfig={}
)
solution_arn = solution_response['solutionArn']
print(f"Solution ARN: {solution_arn}")

# Create Solution Version (trains the model)
print("Training solution version (this may take time)...")
solution_version_response = personalize.create_solution_version(
    solutionArn=solution_arn
)
solution_version_arn = solution_version_response['solutionVersionArn']
print(f"Solution version ARN: {solution_version_arn}")

# Wait until training is complete
while True:
    status = personalize.describe_solution_version(solutionVersionArn=solution_version_arn)['solutionVersion']['status']
    print(f"SolutionVersion status: {status}")
    if status in ["ACTIVE", "CREATE FAILED"]:
        break
    time.sleep(60)

if status == "ACTIVE":
    print("Training complete. Creating campaign...")
    # Create Campaign
    campaign_response = personalize.create_campaign(
        name=campaign_name,
        solutionVersionArn=solution_version_arn,
        minProvisionedTPS=1
    )
    campaign_arn = campaign_response['campaignArn']
    print(f"Campaign created successfully: {campaign_arn}")
else:
    print("Solution version creation failed. Cannot create campaign.")
