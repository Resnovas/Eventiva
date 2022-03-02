import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { RTWCreateInput } from '../../../inputs/RTWCreateInput';
import { RTWUpdateInput } from '../../../inputs/RTWUpdateInput';
import { RTWWhereUniqueInput } from '../../../inputs/RTWWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpsertRTWArgs {
  @TypeGraphQL.Field((_type) => RTWWhereUniqueInput, {
    nullable: false,
  })
  where!: RTWWhereUniqueInput;

  @TypeGraphQL.Field((_type) => RTWCreateInput, {
    nullable: false,
  })
  create!: RTWCreateInput;

  @TypeGraphQL.Field((_type) => RTWUpdateInput, {
    nullable: false,
  })
  update!: RTWUpdateInput;
}
