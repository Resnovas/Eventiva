import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindFirstArrangementOfRoomArgs } from "./args/FindFirstArrangementOfRoomArgs";
import { ArrangementOfRoom } from "../../../models/ArrangementOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ArrangementOfRoom)
export class FindFirstArrangementOfRoomResolver {
  @TypeGraphQL.Query(_returns => ArrangementOfRoom, {
    nullable: true
  })
  async findFirstArrangementOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstArrangementOfRoomArgs): Promise<ArrangementOfRoom | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangementOfRoom.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
