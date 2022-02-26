import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { ContactAtAddressCreateManyAddressInput } from '../inputs/ContactAtAddressCreateManyAddressInput';

@TypeGraphQL.InputType('ContactAtAddressCreateManyAddressInputEnvelope', {
  isAbstract: true,
})
export class ContactAtAddressCreateManyAddressInputEnvelope {
  @TypeGraphQL.Field((_type) => [ContactAtAddressCreateManyAddressInput], {
    nullable: false,
  })
  data!: ContactAtAddressCreateManyAddressInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
