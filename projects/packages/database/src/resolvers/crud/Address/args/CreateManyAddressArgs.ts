import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { AddressCreateManyInput } from '../../../inputs/AddressCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyAddressArgs {
  @TypeGraphQL.Field((_type) => [AddressCreateManyInput], {
    nullable: false,
  })
  data!: AddressCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
