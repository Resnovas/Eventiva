import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AddressCreateManyAccountInput } from '../inputs/AddressCreateManyAccountInput';

@TypeGraphQL.InputType('AddressCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class AddressCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [AddressCreateManyAccountInput], {
    nullable: false,
  })
  data!: AddressCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
