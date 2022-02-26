import * as TypeGraphQL from 'type-graphql';
import { Account } from '../../../models/Account';
import { SIABadge } from '../../../models/SIABadge';
import { SIACheck } from '../../../models/SIACheck';
import { SIABadgeSiaChecksArgs } from './args/SIABadgeSiaChecksArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => SIABadge)
export class SIABadgeRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => [SIACheck], {
    nullable: false,
  })
  async siaChecks(
    @TypeGraphQL.Root() sIABadge: SIABadge,
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Args() args: SIABadgeSiaChecksArgs
  ): Promise<SIACheck[]> {
    return getPrismaFromContext(ctx)
      .sIABadge.findUnique({
        where: {
          id: sIABadge.id,
        },
      })
      .siaChecks(args);
  }

  @TypeGraphQL.FieldResolver((_type) => Account, {
    nullable: true,
  })
  async account(
    @TypeGraphQL.Root() sIABadge: SIABadge,
    @TypeGraphQL.Ctx() ctx: any
  ): Promise<Account | null> {
    return getPrismaFromContext(ctx)
      .sIABadge.findUnique({
        where: {
          id: sIABadge.id,
        },
      })
      .account({});
  }
}
