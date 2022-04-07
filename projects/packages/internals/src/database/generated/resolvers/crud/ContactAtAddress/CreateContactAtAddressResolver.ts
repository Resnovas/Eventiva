import * as TypeGraphQL from "type-graphql";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { CreateContactAtAddressArgs } from "./args/CreateContactAtAddressArgs";
import { ContactAtAddress } from "../../../models/ContactAtAddress";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => ContactAtAddress)
export class CreateContactAtAddressResolver {
  @TypeGraphQL.Mutation(_returns => ContactAtAddress, {
    nullable: false
  })
  async createContactAtAddress(@TypeGraphQL.Ctx() ctx: any, @TypeGraphQL.Info() info: GraphQLResolveInfo, @TypeGraphQL.Args() args: CreateContactAtAddressArgs): Promise<ContactAtAddress> {
    const { _count } = transformFields(
      graphqlFields(info as any)
    );
    return getPrismaFromContext(ctx).contactAtAddress.create({
      ...args,
      ...(_count && transformCountFieldIntoSelectRelationsCount(_count)),
    });
  }
}
