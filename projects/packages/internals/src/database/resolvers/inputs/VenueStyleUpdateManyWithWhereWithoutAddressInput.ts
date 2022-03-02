import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { VenueStyleScalarWhereInput } from '../inputs/VenueStyleScalarWhereInput';
import { VenueStyleUpdateManyMutationInput } from '../inputs/VenueStyleUpdateManyMutationInput';

@TypeGraphQL.InputType('VenueStyleUpdateManyWithWhereWithoutAddressInput', {
  isAbstract: true,
})
export class VenueStyleUpdateManyWithWhereWithoutAddressInput {
  @TypeGraphQL.Field((_type) => VenueStyleScalarWhereInput, {
    nullable: false,
  })
  where!: VenueStyleScalarWhereInput;

  @TypeGraphQL.Field((_type) => VenueStyleUpdateManyMutationInput, {
    nullable: false,
  })
  data!: VenueStyleUpdateManyMutationInput;
}
