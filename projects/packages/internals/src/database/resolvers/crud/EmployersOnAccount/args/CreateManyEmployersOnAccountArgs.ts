import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { EmployersOnAccountCreateManyInput } from '../../../inputs/EmployersOnAccountCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyEmployersOnAccountArgs {
  @TypeGraphQL.Field((_type) => [EmployersOnAccountCreateManyInput], {
    nullable: false,
  })
  data!: EmployersOnAccountCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
