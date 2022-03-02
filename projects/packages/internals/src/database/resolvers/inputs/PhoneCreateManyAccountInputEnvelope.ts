import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { PhoneCreateManyAccountInput } from '../inputs/PhoneCreateManyAccountInput';

@TypeGraphQL.InputType('PhoneCreateManyAccountInputEnvelope', {
  isAbstract: true,
})
export class PhoneCreateManyAccountInputEnvelope {
  @TypeGraphQL.Field((_type) => [PhoneCreateManyAccountInput], {
    nullable: false,
  })
  data!: PhoneCreateManyAccountInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
