import * as TypeGraphQL from 'type-graphql';

export enum FeatureScalarFieldEnum {
  id = 'id',
  name = 'name',
  type = 'type',
  createdAt = 'createdAt',
  updatedAt = 'updatedAt',
  deleted = 'deleted',
}
TypeGraphQL.registerEnumType(FeatureScalarFieldEnum, {
  name: 'FeatureScalarFieldEnum',
  description: undefined,
});
