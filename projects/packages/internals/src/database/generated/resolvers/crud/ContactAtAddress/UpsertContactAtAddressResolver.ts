import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UpsertContactAtAddressArgs } from "./args/UpsertContactAtAddressArgs";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ContactAtAddress)
export class UpsertContactAtAddressResolver {
  @TypeGraphQL.Mutation(_returns => ContactAtAddress, {
    nullable: false
  })
  async upsertContactAtAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: UpsertContactAtAddressArgs): Promise<ContactAtAddress> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).contactAtAddress.upsert({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
