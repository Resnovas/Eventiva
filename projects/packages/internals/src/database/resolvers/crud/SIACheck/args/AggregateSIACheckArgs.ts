import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { SIACheckOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/SIACheckOrderByWithRelationAndSearchRelevanceInput';
import { SIACheckWhereInput } from '../../../inputs/SIACheckWhereInput';
import { SIACheckWhereUniqueInput } from '../../../inputs/SIACheckWhereUniqueInput';

@TypeGraphQL.ArgsType()
export class AggregateSIACheckArgs {
  @TypeGraphQL.Field((_type) => SIACheckWhereInput, {
    nullable: true,
  })
  where?: SIACheckWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [SIACheckOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: SIACheckOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => SIACheckWhereUniqueInput, {
    nullable: true,
  })
  cursor?: SIACheckWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;
}
