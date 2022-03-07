import * as TypeGraphQL from 'type-graphql';

export enum AccountOrderByRelevanceFieldEnum {
  id = 'id',
  username = 'username',
  firstname = 'firstname',
  midname = 'midname',
  lastname = 'lastname',
  Salutation = 'Salutation',
  sex = 'sex',
  label = 'label',
  password = 'password',
  resetPasswordToken = 'resetPasswordToken',
}
TypeGraphQL.registerEnumType(AccountOrderByRelevanceFieldEnum, {
  name: 'AccountOrderByRelevanceFieldEnum',
  description: undefined,
});
