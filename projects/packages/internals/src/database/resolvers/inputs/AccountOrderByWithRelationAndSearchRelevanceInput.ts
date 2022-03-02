import * as TypeGraphQL from 'type-graphql';
import * as GraphQLScalars from 'graphql-scalars';
import { Prisma } from '@prisma/client';
import { DecimalJSScalar } from '../../scalars';
import { AccountOrderByRelevanceInput } from '../inputs/AccountOrderByRelevanceInput';
import { AddressOrderByRelationAggregateInput } from '../inputs/AddressOrderByRelationAggregateInput';
import { AddressOrderByWithRelationAndSearchRelevanceInput } from '../inputs/AddressOrderByWithRelationAndSearchRelevanceInput';
import { ApplicationOrderByRelationAggregateInput } from '../inputs/ApplicationOrderByRelationAggregateInput';
import { ContactAtAddressOrderByRelationAggregateInput } from '../inputs/ContactAtAddressOrderByRelationAggregateInput';
import { EmailOrderByRelationAggregateInput } from '../inputs/EmailOrderByRelationAggregateInput';
import { EmployersOnAccountOrderByRelationAggregateInput } from '../inputs/EmployersOnAccountOrderByRelationAggregateInput';
import { FilesOrderByRelationAggregateInput } from '../inputs/FilesOrderByRelationAggregateInput';
import { ManagersOnAccountOrderByRelationAggregateInput } from '../inputs/ManagersOnAccountOrderByRelationAggregateInput';
import { PhoneOrderByRelationAggregateInput } from '../inputs/PhoneOrderByRelationAggregateInput';
import { RTWOrderByRelationAggregateInput } from '../inputs/RTWOrderByRelationAggregateInput';
import { SIABadgeOrderByRelationAggregateInput } from '../inputs/SIABadgeOrderByRelationAggregateInput';
import { StatusOnAccountOrderByRelationAggregateInput } from '../inputs/StatusOnAccountOrderByRelationAggregateInput';
import { SubscriptionOnAccountOrderByRelationAggregateInput } from '../inputs/SubscriptionOnAccountOrderByRelationAggregateInput';
import { SubuserOnAccountOrderByRelationAggregateInput } from '../inputs/SubuserOnAccountOrderByRelationAggregateInput';
import { TokenOrderByRelationAggregateInput } from '../inputs/TokenOrderByRelationAggregateInput';
import { TransactionOrderByRelationAggregateInput } from '../inputs/TransactionOrderByRelationAggregateInput';
import { SortOrder } from '../../enums/SortOrder';

@TypeGraphQL.InputType('AccountOrderByWithRelationAndSearchRelevanceInput', {
  isAbstract: true,
})
export class AccountOrderByWithRelationAndSearchRelevanceInput {
  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  id?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  username?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  accountType?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  subsciption?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  employer?: EmployersOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(
    (_type) => EmployersOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  employees?: EmployersOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountOrderByRelationAggregateInput, {
    nullable: true,
  })
  accesses?: SubuserOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SubuserOnAccountOrderByRelationAggregateInput, {
    nullable: true,
  })
  subusers?: SubuserOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(
    (_type) => ManagersOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  accounts?: ManagersOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(
    (_type) => ManagersOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  managers?: ManagersOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  createdAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  updatedAt?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  lastLogin?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  applied?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  promoted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  retired?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  title?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  firstname?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  midname?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  lastname?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  Salutation?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  dob?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  sex?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  label?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  password?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  resetPasswordToken?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  resetPasswordExpires?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field((_type) => TokenOrderByRelationAggregateInput, {
    nullable: true,
  })
  apiToken?: TokenOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SortOrder, {
    nullable: true,
  })
  deleted?: 'asc' | 'desc' | undefined;

  @TypeGraphQL.Field(
    (_type) => AddressOrderByWithRelationAndSearchRelevanceInput,
    {
      nullable: true,
    }
  )
  primaryAddress?:
    | AddressOrderByWithRelationAndSearchRelevanceInput
    | undefined;

  @TypeGraphQL.Field((_type) => AddressOrderByRelationAggregateInput, {
    nullable: true,
  })
  addresses?: AddressOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => ContactAtAddressOrderByRelationAggregateInput, {
    nullable: true,
  })
  contactOfAddress?: ContactAtAddressOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => ApplicationOrderByRelationAggregateInput, {
    nullable: true,
  })
  application?: ApplicationOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => EmailOrderByRelationAggregateInput, {
    nullable: true,
  })
  emails?: EmailOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => FilesOrderByRelationAggregateInput, {
    nullable: true,
  })
  files?: FilesOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => PhoneOrderByRelationAggregateInput, {
    nullable: true,
  })
  phones?: PhoneOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => RTWOrderByRelationAggregateInput, {
    nullable: true,
  })
  rtw?: RTWOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => SIABadgeOrderByRelationAggregateInput, {
    nullable: true,
  })
  sia?: SIABadgeOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => StatusOnAccountOrderByRelationAggregateInput, {
    nullable: true,
  })
  Status?: StatusOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field(
    (_type) => SubscriptionOnAccountOrderByRelationAggregateInput,
    {
      nullable: true,
    }
  )
  subscription?: SubscriptionOnAccountOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => TransactionOrderByRelationAggregateInput, {
    nullable: true,
  })
  transactions?: TransactionOrderByRelationAggregateInput | undefined;

  @TypeGraphQL.Field((_type) => AccountOrderByRelevanceInput, {
    nullable: true,
  })
  _relevance?: AccountOrderByRelevanceInput | undefined;
}
