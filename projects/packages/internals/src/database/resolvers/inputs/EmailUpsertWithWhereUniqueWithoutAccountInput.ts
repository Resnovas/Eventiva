import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmailCreateWithoutAccountInput } from '../inputs/EmailCreateWithoutAccountInput';
import { EmailUpdateWithoutAccountInput } from '../inputs/EmailUpdateWithoutAccountInput';
import { EmailWhereUniqueInput } from '../inputs/EmailWhereUniqueInput';

@TypeGraphQL.InputType('EmailUpsertWithWhereUniqueWithoutAccountInput', {
  isAbstract: true,
})
export class EmailUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => EmailWhereUniqueInput, {
    nullable: false,
  })
  where!: EmailWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmailUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: EmailUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => EmailCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: EmailCreateWithoutAccountInput;
}
