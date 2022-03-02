import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ManagersOnAccountCreateManyInput } from '../../../inputs/ManagersOnAccountCreateManyInput';

@TypeGraphQL.ArgsType()
export class CreateManyManagersOnAccountArgs {
  @TypeGraphQL.Field((_type) => [ManagersOnAccountCreateManyInput], {
    nullable: false,
  })
  data!: ManagersOnAccountCreateManyInput[];

  @TypeGraphQL.Field((_type) => Boolean, {
    nullable: true,
  })
  skipDuplicates?: boolean | undefined;
}
