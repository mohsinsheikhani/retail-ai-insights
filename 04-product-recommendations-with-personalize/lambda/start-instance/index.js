import { EC2Client, StartInstancesCommand } from "@aws-sdk/client-ec2";

const ec2 = new EC2Client({});

exports.handler = async (event) => {
  console.info("Start Instance Lambda event", JSON.stringify(event, null, 2));

  const instanceId = process.env.INSTANCE_ID;

  try {
    const command = new StartInstancesCommand({
      InstanceIds: [instanceId],
    });

    await ec2.send(command);

    return { message: "Booting Instance command initiated" };
  } catch (error) {
    console.error("Failed to boot up the instance:", error);
    throw error;
  }
};
