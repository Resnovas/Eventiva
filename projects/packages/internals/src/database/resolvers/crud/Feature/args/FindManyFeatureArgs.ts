import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { FeatureOrderByWithRelationAndSearchRelevanceInput } from '../../../inputs/FeatureOrderByWithRelationAndSearchRelevanceInput';
import { FeatureWhereInput } from '../../../inputs/FeatureWhereInput';
import { FeatureWhereUniqueInput } from '../../../inputs/FeatureWhereUniqueInput';
import { FeatureScalarFieldEnum } from '../../../../enums/FeatureScalarFieldEnum';

@TypeGraphQL.ArgsType()
export class FindManyFeatureArgs {
  @TypeGraphQL.Field((_type) => FeatureWhereInput, {
    nullable: true,
  })
  where?: FeatureWhereInput | undefined;

  @TypeGraphQL.Field(
    (_type) => [FeatureOrderByWithRelationAndSearchRelevanceInput],
    {
      nullable: true,
    }
  )
  orderBy?: FeatureOrderByWithRelationAndSearchRelevanceInput[] | undefined;

  @TypeGraphQL.Field((_type) => FeatureWhereUniqueInput, {
    nullable: true,
  })
  cursor?: FeatureWhereUniqueInput | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  take?: number | undefined;

  @TypeGraphQL.Field((_type) => TypeGraphQL.Int, {
    nullable: true,
  })
  skip?: number | undefined;

  @TypeGraphQL.Field((_type) => [FeatureScalarFieldEnum], {
    nullable: true,
  })
  distinct?:
    | Array<'id' | 'name' | 'type' | 'createdAt' | 'updatedAt' | 'deleted'>
    | undefined;
}
