import * as TypeGraphQL from 'type-graphql';

export enum EmailOrderByRelevanceFieldEnum {
  id = 'id',
  domainId = 'domainId',
  email = 'email',
  accountId = 'accountId',
  path = 'path',
  imap_authUser = 'imap_authUser',
  imap_authPass = 'imap_authPass',
  imap_accessToken = 'imap_accessToken',
  imap_host = 'imap_host',
  imap_port = 'imap_port',
  imap_tslMinVersion = 'imap_tslMinVersion',
  smtp_authUser = 'smtp_authUser',
  smtp_authPass = 'smtp_authPass',
  smtp_accessToken = 'smtp_accessToken',
  smtp_host = 'smtp_host',
  smtp_port = 'smtp_port',
  smtp_tslMinVersion = 'smtp_tslMinVersion',
  oauth2_provider = 'oauth2_provider',
  oauth2_authUser = 'oauth2_authUser',
  oauth2_accessToken = 'oauth2_accessToken',
  oauth2_refreshToken = 'oauth2_refreshToken',
}
TypeGraphQL.registerEnumType(EmailOrderByRelevanceFieldEnum, {
  name: 'EmailOrderByRelevanceFieldEnum',
  description: undefined,
});
