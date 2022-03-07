import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementUpdateInput } from '../../../inputs/ArrangementUpdateInput';
import { ArrangementWhereUniqueInput } from '../../../inputs/ArrangementWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class UpdateArrangementArgs {
  @TypeGraphQL.Field((_type) => ArrangementUpdateInput, {
    nullable: false,
  })
  data!: ArrangementUpdateInput;

  @TypeGraphQL.Field((_type) => ArrangementWhereUniqueInput, {
    nullable: false,
  })
  where!: ArrangementWhereUniqueInput;
}
