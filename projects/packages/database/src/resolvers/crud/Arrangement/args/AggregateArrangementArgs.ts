import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { ArrangementOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/ArrangementOrderByWithRelationAndSearchRelevanceInput';
import { ArrangementWhereInput } from '../../../inputs/ArrangementWhereInput';
import { ArrangementWhereUniqueInput } from '../../../inputs/ArrangementWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateArrangementArgs {
  @TypeGraphQL.Field((_type) => ArrangementWhereInput, {
    nullable: true,
  })
  where?: ArrangementWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [ArrangementOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: ArrangementOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => ArrangementWhereUniqueInput, {
    nullable: true,
  })
  cursor?: ArrangementWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
