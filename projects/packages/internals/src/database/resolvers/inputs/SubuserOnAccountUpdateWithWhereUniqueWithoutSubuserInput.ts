import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { SubuserOnAccountUpdateWithoutSubuserInput } from '../inputs/SubuserOnAccountUpdateWithoutSubuserInput';
import { SubuserOnAccountWhereUniqueInput } from '../inputs/SubuserOnAccountWhereUniqueInput';

@TypeGraphQL.InputType(
  'SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput',
  {
    isAbstract: true,
  }
)
export class SubuserOnAccountUpdateWithWhereUniqueWithoutSubuserInput {
  @TypeGraphQL.Field((_type) => SubuserOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: SubuserOnAccountWhereUniqueInput;

  @TypeGraphQL.Field((_type) => SubuserOnAccountUpdateWithoutSubuserInput, {
    nullable: false,
  })
  data!: SubuserOnAccountUpdateWithoutSubuserInput;
}
