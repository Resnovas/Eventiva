import * as TypeGraphQL from "type-graphql";
import { Account } from "../../../models/Account";
import { Address } from "../../../models/Address";
import { Phone } from "../../../models/Phone";
import { transformFields, getPrismaFromContext, transformCountFieldIntoSelectRelationsCount } from "../../../helpers";

@TypeGraphQL.Resolver(_of => Phone)
export class PhoneRelationsResolver {
  @TypeGraphQL.FieldResolver(_type => Account, {
    nullable: false
  })
  async account(@TypeGraphQL.Root() phone: Phone, @TypeGraphQL.Ctx() ctx: any): Promise<Account> {
    return getPrismaFromContext(ctx).phone.findUnique({
      where: {
        id: phone.id,
      },
    }).account({});
  }

  @TypeGraphQL.FieldResolver(_type => Address, {
    nullable: false
  })
  async address(@TypeGraphQL.Root() phone: Phone, @TypeGraphQL.Ctx() ctx: any): Promise<Address> {
    return getPrismaFromContext(ctx).phone.findUnique({
      where: {
        id: phone.id,
      },
    }).address({});
  }
}
