import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { User } from "~/functions/user";
import { activityType } from "~/library/orchestration";
import { updateUserMetaobject } from "./update/update-user-metaobject";

const updateUserMetaobjectName = "updateUserMetaobject";
df.app.activity(updateUserMetaobjectName, {
  handler: updateUserMetaobject,
});

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const user = context.df.getInput() as User;

  const userField: Awaited<ReturnType<typeof updateUserMetaobject>> =
    yield context.df.callActivity(
      updateUserMetaobjectName,
      activityType<typeof updateUserMetaobject>({
        user,
      })
    );

  return {
    userField,
  };
};

df.app.orchestration("updateUserShopify", orchestrator);

export const CustomerUpdateOrchestration = async (
  input: User,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew("updateUserShopify", {
    input,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};
