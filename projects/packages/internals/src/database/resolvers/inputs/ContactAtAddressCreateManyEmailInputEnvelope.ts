import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateManyEmailInput } from '../inputs/ContactAtAddressCreateManyEmailInput';

@TypeGraphQL.InputType('ContactAtAddressCreateManyEmailInputEnvelope', {
  isAbstract: true,
})
export class ContactAtAddressCreateManyEmailInputEnvelope {
  @TypeGraphQL.Field((_type) => [ContactAtAddressCreateManyEmailInput], {
    nullable: false,
  })
  data!: ContactAtAddressCreateManyEmailInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
