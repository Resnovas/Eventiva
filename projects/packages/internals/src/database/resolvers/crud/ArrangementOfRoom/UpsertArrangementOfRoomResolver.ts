import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpsertArrangementOfRoomArgs } from "./args/UpsertArrangementOfRoomArgs";
import { ArrangementOfRoom } from "../../../models/ArrangementOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ArrangementOfRoom)
export class UpsertArrangementOfRoomResolver {
  @TypeGraphQL.Mutation(_returns => ArrangementOfRoom, {
    nullable: false
  })
  async upsertArrangementOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertArrangementOfRoomArgs): Promise<ArrangementOfRoom> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangementOfRoom.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
