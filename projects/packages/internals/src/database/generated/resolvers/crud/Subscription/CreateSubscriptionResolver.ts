import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateSubscriptionArgs } from "./args/CreateSubscriptionArgs";
import { Subscription } from "../../../models/Subscription";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Subscription)
export class CreateSubscriptionResolver {
  @TypeGraphQL.Mutation(_returns => Subscription, {
    nullable: false
  })
  async createSubscription(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateSubscriptionArgs): Promise<Subscription> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).subscription.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
