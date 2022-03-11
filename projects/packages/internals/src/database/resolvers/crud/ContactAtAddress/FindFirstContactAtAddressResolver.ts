import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { FindFirstContactAtAddressArgs } from "./args/FindFirstContactAtAddressArgs";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ContactAtAddress)
export class FindFirstContactAtAddressResolver {
  @TypeGraphQL.Query(_returns => ContactAtAddress, {
    nullable: true
  })
  async findFirstContactAtAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: FindFirstContactAtAddressArgs): Promise<ContactAtAddress | null> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).contactAtAddress.findFirst({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
