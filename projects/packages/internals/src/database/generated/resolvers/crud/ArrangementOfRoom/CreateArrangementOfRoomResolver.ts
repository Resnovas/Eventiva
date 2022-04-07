import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateArrangementOfRoomArgs } from "./args/CreateArrangementOfRoomArgs";
import { ArrangementOfRoom } from "../../../models/ArrangementOfRoom";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ArrangementOfRoom)
export class CreateArrangementOfRoomResolver {
  @TypeGraphQL.Mutation(_returns => ArrangementOfRoom, {
    nullable: false
  })
  async createArrangementOfRoom(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateArrangementOfRoomArgs): Promise<ArrangementOfRoom> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).arrangementOfRoom.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
