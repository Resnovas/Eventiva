import * as TypeGraphQL from 'type-graphql';
import { Address } from '../../../models/Address';
import { VenueStyle } from '../../../models/VenueStyle';
import { VenueStyleAddressArgs } from './args/VenueStyleAddressArgs';
import {
  transformFields,
  getPrismaFromContext,
  transformCountFieldIntoSelectRelationsCount,
} from '../../../helpers';

@TypeGraphQL.Resolver((_of) => VenueStyle)
export class VenueStyleRelationsResolver {
  @TypeGraphQL.FieldResolver((_type) => [Address], {
    nullable: false,
  })
  async address(
    @TypeGraphQL.Root() venueStyle: VenueStyle,
    @TypeGraphQL.Ctx() ctx: any,
    @TypeGraphQL.Args() args: VenueStyleAddressArgs
  ): Promise<Address[]> {
    return getPrismaFromContext(ctx)
      .venueStyle.findUnique({
        where: {
          id: venueStyle.id,
        },
      })
      .address(args);
  }
}
