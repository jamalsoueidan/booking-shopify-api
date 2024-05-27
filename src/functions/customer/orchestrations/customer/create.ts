import { InvocationContext } from "@azure/functions";
import * as df from "durable-functions";
import { OrchestrationContext } from "durable-functions";
import { User } from "~/functions/user";
import { activityType } from "~/library/orchestration";
import { createCollection } from "./create/create-collection";
import { createUserMetaobject } from "./create/create-user-metaobject";
import { publishCollection } from "./create/publish-collection";
import { updateUser } from "./create/update-user";

const createCollectionName = "createCollection";
df.app.activity(createCollectionName, { handler: createCollection });

const createUserMetaobjectName = "createUserMetaobject";
df.app.activity(createUserMetaobjectName, { handler: createUserMetaobject });

const publishCollectionName = "publishCollection";
df.app.activity(publishCollectionName, { handler: publishCollection });

const updateUserName = "updateUser";
df.app.activity(updateUserName, { handler: updateUser });

const orchestrator: df.OrchestrationHandler = function* (
  context: OrchestrationContext
) {
  const user = context.df.getInput() as User;

  const collectionMetaobject: Awaited<ReturnType<typeof createCollection>> =
    yield context.df.callActivity(
      createCollectionName,
      activityType<typeof createCollection>({
        user,
      })
    );

  yield context.df.createTimer(
    new Date(context.df.currentUtcDateTime.getTime() + 1000)
  );

  const userMetaobject: Awaited<ReturnType<typeof createUserMetaobject>> =
    yield context.df.callActivity(
      createUserMetaobjectName,
      activityType<typeof createUserMetaobject>({
        user,
        collectionId: collectionMetaobject.id,
      })
    );

  yield context.df.createTimer(
    new Date(context.df.currentUtcDateTime.getTime() + 1000)
  );

  const publish: Awaited<ReturnType<typeof publishCollection>> =
    yield context.df.callActivity(
      publishCollectionName,
      activityType<typeof publishCollection>({
        collectionId: collectionMetaobject.id,
      })
    );

  yield context.df.createTimer(
    new Date(context.df.currentUtcDateTime.getTime() + 1000)
  );

  const userUpdated: Awaited<ReturnType<typeof updateUser>> =
    yield context.df.callActivity(
      updateUserName,
      activityType<typeof updateUser>({
        collectionMetaobjectId: collectionMetaobject.id,
        userId: user._id,
        userMetaobjectId: userMetaobject.id,
      })
    );

  return { collectionMetaobject, userMetaobject, publish, userUpdated };
};

df.app.orchestration("createUserShopify", orchestrator);

export const CustomerCreateOrchestration = async (
  input: User,
  context: InvocationContext
): Promise<string> => {
  const client = df.getClient(context);
  const instanceId: string = await client.startNew("createUserShopify", {
    input,
  });

  context.log(`Started orchestration with ID = '${instanceId}'.`);

  return instanceId;
};
