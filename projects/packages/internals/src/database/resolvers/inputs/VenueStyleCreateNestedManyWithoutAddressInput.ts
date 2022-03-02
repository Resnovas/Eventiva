import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { VenueStyleCreateOrConnectWithoutAddressInput } from '../inputs/VenueStyleCreateOrConnectWithoutAddressInput';
import { VenueStyleCreateWithoutAddressInput } from '../inputs/VenueStyleCreateWithoutAddressInput';
import { VenueStyleWhereUniqueInput } from '../inputs/VenueStyleWhereUniqueInput';

@TypeGraphQL.InputType('VenueStyleCreateNestedManyWithoutAddressInput', {
  isAbstract: true,
})
export class VenueStyleCreateNestedManyWithoutAddressInput {
  @TypeGraphQL.Field((_type) => [VenueStyleCreateWithoutAddressInput], {
    nullable: true,
  })
  create?: VenueStyleCreateWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field(
    (_type) => [VenueStyleCreateOrConnectWithoutAddressInput],
    {
      nullable: true,
    }
  )
  connectOrCreate?: VenueStyleCreateOrConnectWithoutAddressInput[] | undefined;

  @TypeGraphQL.Field((_type) => [VenueStyleWhereUniqueInput], {
    nullable: true,
  })
  connect?: VenueStyleWhereUniqueInput[] | undefined;
}
