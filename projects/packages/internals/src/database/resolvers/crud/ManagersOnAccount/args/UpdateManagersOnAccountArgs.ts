import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ManagersOnAccountUpdateInput } from '../../../inputs/ManagersOnAccountUpdateInput';
import { ManagersOnAccountWhereUniqueInput } from '../../../inputs/ManagersOnAccountWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateManagersOnAccountArgs {
  @TypeGraphQL.Field((_type) => ManagersOnAccountUpdateInput, {
    nullable: false,
  })
  data!: ManagersOnAccountUpdateInput;

  @TypeGraphQL.Field((_type) => ManagersOnAccountWhereUniqueInput, {
    nullable: false,
  })
  where!: ManagersOnAccountWhereUniqueInput;
}
