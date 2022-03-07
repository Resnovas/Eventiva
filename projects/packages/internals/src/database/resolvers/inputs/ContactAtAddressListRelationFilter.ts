import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressWhereInput } from '../inputs/ContactAtAddressWhereInput';

@TypeGraphQL.InputType('ContactAtAddressListRelationFilter', {
  isAbstract: true,
})
export class ContactAtAddressListRelationFilter {
  @TypeGraphQL.Field((_type) => ContactAtAddressWhereInput, {
    nullable: true,
  })
  every?: ContactAtAddressWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressWhereInput, {
    nullable: true,
  })
  some?: ContactAtAddressWhereInput | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressWhereInput, {
    nullable: true,
  })
  none?: ContactAtAddressWhereInput | undefined;
}
