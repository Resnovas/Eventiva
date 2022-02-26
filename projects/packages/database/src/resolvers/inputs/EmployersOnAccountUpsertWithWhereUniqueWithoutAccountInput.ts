import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { EmployersOnAccountCreateWithoutAccountInput } from '../inputs/EmployersOnAccountCreateWithoutAccountInput';
import { EmployersOnAccountUpdateWithoutAccountInput } from '../inputs/EmployersOnAccountUpdateWithoutAccountInput';
import { EmployersOnAccountWhereUniqueInput } from '../inputs/EmployersOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput',
  {
    isAbstract: true,
  }
)
export class EmployersOnAccountUpsertWithWhereUniqueWithoutAccountInput {
  @TypeGraphQL.Field((_type) => EmployersOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: EmployersOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => EmployersOnAccountUpdateWithoutAccountInput, {
    nullable: false,
  })
  update!: EmployersOnAccountUpdateWithoutAccountInput;

  @TypeGraphQL.Field((_type) => EmployersOnAccountCreateWithoutAccountInput, {
    nullable: false,
  })
  create!: EmployersOnAccountCreateWithoutAccountInput;
}
