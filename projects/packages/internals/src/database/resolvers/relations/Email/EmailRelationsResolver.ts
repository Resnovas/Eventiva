import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { ContactAtAddress } from '../../../models/ContactAtAddress';
import { Domain } from '../../../models/Domain';
import { Email } from '../../../models/Email';
import { EmailAssociatedContactArgs } from './args/EmailAssociatedContactArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => Email)
export class EmailRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => [ContactAtAddress], {
    nullable: false,
  })
  async associatedContact(
    @TypeGraphQL.Root() email: Email,
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Args() args: EmailAssociatedContactArgs
  ): Promise<ContactAtAddress[]> {
    return getPrismaFromContext(ctx)
      .email.findUnique({
        where: {
          id: email.id,
        },
      })
      .associatedContact(args);
  }

  @TypeGraphQL.FieldResolver((_type) => Domain, {
    nullable: true,
  })
  async domain(
    @TypeGraphQL.Root() email: Email,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Domain | null> {
    return getPrismaFromContext(ctx)
      .email.findUnique({
        where: {
          id: email.id,
        },
      })
      .domain({});
  }

  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: true,
  })
  async account(
    @TypeGraphQL.Root() email: Email,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account | null> {
    return getPrismaFromContext(ctx)
      .email.findUnique({
        where: {
          id: email.id,
        },
      })
      .account({});
  }
}
