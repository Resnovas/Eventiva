import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailUpdateWithoutAccountInput } from '../inputs/EmailUpdateWithoutAccountInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailUpdateWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class EmailUpdateWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: false,
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmailUpdateWithoutAccountInput, {
    nullable: false,
  })
  data!: EmailUpdateWithoutAccountInput;
}
